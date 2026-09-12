import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { z } from "@medusajs/framework/zod"
import { SILHOUETTE_COLLECTION } from "../../../lib/commission-catalogue"
import { missingMeasurements } from "../../../lib/measurements"
import { createCommissionWorkflow } from "../../../workflows/atelier/commissions"

/* A commission is a request for a quote. Nothing is charged here and nothing
   enters a cart: the brief is stored, the house is told, and a tailor writes
   back with a price.

   Reference files arrive as multipart on the same request, so a client sends
   their brief once. They are stored privately — they are the client's own
   property, and so is the measurement sheet that travels with them. */

const MAX_FILES = 10
const MAX_BYTES = 20 * 1024 * 1024
const ACCEPTED = /^(image\/|application\/pdf$)/

/* `prices` is a link field: query resolves it, the entity types do not
   declare it. */
type Priced = { prices?: { amount: number; currency_code: string }[] }

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  silhouette: z.string().trim().min(1),
  fabric: z.string().trim().min(1).max(500),
  note: z.string().trim().max(2000).optional(),
  measurement_unit: z.enum(["cm", "in"]).default("cm"),
  measurements: z.record(z.string(), z.union([z.string(), z.number()])),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  /* Multipart sends every field as a string; `measurements` arrives as JSON. */
  const body = req.body as Record<string, unknown>
  const parsed = schema.safeParse({
    ...body,
    measurements:
      typeof body.measurements === "string" ? JSON.parse(body.measurements) : body.measurements,
  })
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ")
    )
  }
  const brief = parsed.data

  /* The silhouette must be one the house offers, and it decides which
     finished lengths the sheet has to carry. */
  const { data: silhouettes } = await query.graph({
    entity: "product",
    fields: [
      "title",
      "metadata",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: { collection: { handle: SILHOUETTE_COLLECTION } },
  })
  const silhouette = silhouettes.find((s) => s.metadata?.silhouette === brief.silhouette)
  if (!silhouette) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `The house does not cut a "${brief.silhouette}".`
    )
  }

  const lengthKinds = (silhouette.metadata?.length_kinds as string[]) ?? []
  const sheet = Object.fromEntries(
    Object.entries(brief.measurements).map(([key, value]) => [`measure_${key}_cm`, String(value)])
  )
  const missing = missingMeasurements(sheet, lengthKinds)
  if (missing.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `The atelier cannot quote from a partial sheet: ${missing.join(", ")} missing.`
    )
  }

  const uploads = (req.files as Express.Multer.File[] | undefined) ?? []
  if (uploads.length > MAX_FILES) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Ten reference files at most.`)
  }
  for (const file of uploads) {
    if (!ACCEPTED.test(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${file.originalname} is not an image or a PDF.`
      )
    }
    if (file.size > MAX_BYTES) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `${file.originalname} is over 20 MB.`)
    }
  }

  let references: { id: string; url: string; filename: string; mime_type: string }[] = []
  if (uploads.length) {
    const { result } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: uploads.map((file) => ({
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("base64"),
          access: "private" as const,
        })),
      },
    })
    references = result.map((file, i) => ({
      id: file.id,
      url: file.url,
      filename: uploads[i].originalname,
      mime_type: uploads[i].mimetype,
    }))
  }

  /* The opening figure the client was shown, kept with the brief so the
     house can see what was promised before the tailor set a price. */
  const prices = ((silhouette.variants?.[0] as unknown as Priced)?.prices ?? []) as {
    amount: number
    currency_code: string
  }[]
  const estimate = prices.find((p) => p.currency_code === "chf")?.amount ?? null

  const { result: commission } = await createCommissionWorkflow(req.scope).run({
    input: {
      name: brief.name,
      email: brief.email,
      silhouette: brief.silhouette,
      silhouette_title: silhouette.title,
      fabric: brief.fabric,
      note: brief.note ?? null,
      measurements: brief.measurements,
      measurement_unit: brief.measurement_unit,
      /* Medusa types a json column as an object; these two hold arrays, which
         Postgres is perfectly happy with. Everything that reads them back
         checks with Array.isArray. */
      length_kinds: lengthKinds as unknown as Record<string, unknown>,
      references: references as unknown as Record<string, unknown>,
      estimate_amount: estimate,
      currency_code: "chf",
    },
  })

  res.status(201).json({
    commission: { id: commission.id, status: commission.status },
  })
}
