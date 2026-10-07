import { model } from "@medusajs/framework/utils"

/* A cloth catalogue the house publishes for Design Your Own: a PDF or an
   image the client can open and read before writing down the cloth they want.
   The file itself lives in the file module (a local folder in development,
   object storage in production); this record is the title, the order it is
   shown in, and whether it is published. */
export const FabricCatalogue = model
  .define("fabric_catalogue", {
    id: model.id({ prefix: "fabcat" }).primaryKey(),

    title: model.text(),
    description: model.text().nullable(),

    /** The file module's id, so the file can be deleted with the record. */
    file_id: model.text(),
    url: model.text(),
    mime_type: model.text(),
    size: model.number().nullable(),

    rank: model.number().default(0),
    published: model.boolean().default(true),
  })
  .indexes([{ on: ["rank"] }])
