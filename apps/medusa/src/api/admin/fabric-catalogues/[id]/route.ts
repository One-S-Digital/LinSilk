import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import {
  deleteFabricCatalogueWorkflow,
  updateFabricCatalogueWorkflow,
} from "../../../../workflows/atelier/fabric-catalogues"

/* Correcting a catalogue: its wording, where it sits in the order, and
   whether the storefront shows it. Every field is optional — the admin sends
   only what the person changed — but each one is checked, because `rank`
   reaches a sort clause and an unread one arrives there as NaN. */
const schema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  rank: z.coerce.number().int().min(0).max(10_000).optional(),
  published: z.boolean().optional(),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ")
    )
  }

  const { result: fabric_catalogue } = await updateFabricCatalogueWorkflow(req.scope).run({
    input: { id: req.params.id, ...parsed.data },
  })

  res.json({ fabric_catalogue })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  await deleteFabricCatalogueWorkflow(req.scope).run({ input: req.params.id })
  res.json({ id: req.params.id, object: "fabric_catalogue", deleted: true })
}
