import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { ATELIER_MODULE } from "../../../modules/atelier"
import type AtelierModuleService from "../../../modules/atelier/service"
import { createFabricCatalogueWorkflow } from "../../../workflows/atelier/fabric-catalogues"

/* The cloth catalogues the house publishes for Design Your Own. A catalogue
   is a PDF or an image the client opens and reads; they then write down the
   cloth they chose, in their own words. */

const MAX_BYTES = 50 * 1024 * 1024
const ACCEPTED = /^(image\/|application\/pdf$)/

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const atelier: AtelierModuleService = req.scope.resolve(ATELIER_MODULE)
  const [fabric_catalogues, count] = await atelier.listAndCountFabricCatalogues(
    {},
    { order: { rank: "ASC", created_at: "ASC" } }
  )
  res.json({ fabric_catalogues, count })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const file = req.file as Express.Multer.File | undefined
  const body = req.body as { title?: string; description?: string; rank?: string }

  if (!file) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No catalogue was uploaded")
  }
  if (!ACCEPTED.test(file.mimetype)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "A catalogue is a PDF or an image")
  }
  if (file.size > MAX_BYTES) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "A catalogue is 50 MB at most")
  }

  const { result: uploaded } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("base64"),
          access: "public" as const,
        },
      ],
    },
  })

  const { result: fabric_catalogue } = await createFabricCatalogueWorkflow(req.scope).run({
    input: {
      title: body.title?.trim() || file.originalname,
      description: body.description?.trim() || null,
      file_id: uploaded[0].id,
      url: uploaded[0].url,
      mime_type: file.mimetype,
      size: file.size,
      rank: Number(body.rank ?? 0),
    },
  })

  res.status(201).json({ fabric_catalogue })
}
