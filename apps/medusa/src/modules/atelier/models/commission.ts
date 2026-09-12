import { model } from "@medusajs/framework/utils"

/* A commission is a request for a quote, not a purchase. The client describes
   what they want, names the cloth they chose from the house's catalogues, and
   sends their measurement sheet; a tailor reads the brief and writes back with
   a price. Nothing is charged until that figure is agreed.

   `estimate_amount` is the opening figure the client saw when they sent the
   brief, kept so the house can see what was promised. `quote_amount` is what
   the tailor actually set. */
export const Commission = model
  .define("commission", {
    id: model.id({ prefix: "com" }).primaryKey(),

    status: model
      .enum(["submitted", "reviewed", "quoted", "approved", "declined", "in_production", "shipped"])
      .default("submitted"),

    name: model.text(),
    email: model.text(),

    silhouette: model.text(),
    silhouette_title: model.text(),

    /** What the client wrote in the cloth box, in their own words. */
    fabric: model.text(),
    note: model.text().nullable(),

    /** Measurements in centimetres, keyed as the sheet writes them. */
    measurements: model.json(),
    /** The unit the client was reading; the figures above are always metric. */
    measurement_unit: model.text().default("cm"),
    length_kinds: model.json().nullable(),

    /** Reference images and documents: { id, url, filename, mime_type }. */
    references: model.json().nullable(),

    estimate_amount: model.bigNumber().nullable(),
    quote_amount: model.bigNumber().nullable(),
    currency_code: model.text().default("chf"),
    quoted_at: model.dateTime().nullable(),

    /** Written by the house, never shown to the client. */
    internal_note: model.text().nullable(),
  })
  .indexes([{ on: ["status"] }, { on: ["email"] }])
