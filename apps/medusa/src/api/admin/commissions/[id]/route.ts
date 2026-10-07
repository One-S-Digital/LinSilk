import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { ATELIER_MODULE } from "../../../../modules/atelier"
import type AtelierModuleService from "../../../../modules/atelier/service"
import { updateCommissionWorkflow } from "../../../../workflows/atelier/commissions"

const schema = z.object({
  status: z
    .enum(["submitted", "reviewed", "quoted", "approved", "declined", "in_production", "shipped"])
    .optional(),
  quote_amount: z.number().positive().optional(),
  internal_note: z.string().max(4000).nullable().optional(),
  /* Setting a price and telling the client are separate acts, and the house
     may want to write by hand instead. */
  notify: z.boolean().default(false),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)
  const fileModule = req.scope.resolve(Modules.FILE)
  const commission = await atelier.retrieveCommission(req.params.id)

  /* Reference files are the client's own property and are stored privately,
     so the bench gets a fresh signed link each time it opens the brief. */
  const stored = Array.isArray(commission.references)
    ? (commission.references as { id: string; filename: string; mime_type: string }[])
    : []
  const references = await Promise.all(
    stored.map(async (file) => {
      try {
        const { url } = await fileModule.retrieveFile(file.id)
        return { ...file, url }
      } catch {
        return { ...file, url: null }
      }
    })
  )

  res.json({ commission: { ...commission, references } })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ")
    )
  }
  const { notify, ...update } = parsed.data

  if (notify && update.quote_amount === undefined) {
    const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)
    const current = await atelier.retrieveCommission(req.params.id)
    if (!current.quote_amount) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "There is no figure to send yet.")
    }
  }

  const { result: commission } = await updateCommissionWorkflow(req.scope).run({
    input: { id: req.params.id, ...update, notify },
  })

  res.json({ commission })
}
