import { isOrderable, type GatedVariant } from "../archive"
import { cartRefusal, lineRefusals } from "../cart-rules"
import { BODY_ZONES, missingMeasurements } from "../measurements"

const autumn = { title: "Autumn — Collection IV", metadata: { status: "current" } }
const summer = { title: "Summer — Collection III", metadata: { status: "past" } }

type Collection = { title: string; metadata: Record<string, unknown> | null } | null

const piece = (title: string, collection: Collection, lengthKind?: string): GatedVariant => ({
  id: `variant_${title}`,
  product: { title, metadata: lengthKind ? { length_kind: lengthKind } : {}, collection },
})

/* A full sheet as the storefront's toLineItemMetadata() writes it. */
const sheet = (withLength = true, overrides: Record<string, unknown> = {}) => ({
  measurement_unit: "cm",
  ...Object.fromEntries(BODY_ZONES.map((z, i) => [`measure_${z.key}_cm`, String(30 + i)])),
  ...(withLength ? { measure_length_cm: "112" } : {}),
  ...overrides,
})

const coat = piece("Coat, Bảo Lộc silk", autumn, "top")
const tee = piece("Knit-neck tee, flax", autumn)
const shirtDress = piece("Shirt dress, flax", summer, "dress")

describe("isOrderable", () => {
  it("allows only a piece from the current collection, failing closed", () => {
    expect(isOrderable(coat)).toBe(true)
    expect(isOrderable(shirtDress)).toBe(false)
    expect(isOrderable(piece("Loose piece", null))).toBe(false)
    expect(isOrderable(piece("Unmarked", { title: "Unmarked season", metadata: null }))).toBe(false)
    expect(isOrderable({ id: "variant_bare" })).toBe(false)
  })
})

describe("missingMeasurements", () => {
  it("accepts a complete sheet", () => {
    expect(missingMeasurements(sheet(), "top")).toEqual([])
  })

  it("asks for the garment length only when the piece has one", () => {
    expect(missingMeasurements(sheet(false), null)).toEqual([])
    expect(missingMeasurements(sheet(false), "trouser")).toEqual(["Trouser length"])
  })

  it("names the missing and unusable measurements", () => {
    const partial = sheet(true, { measure_hipDepth_cm: undefined, measure_rise_cm: "0", measure_neck_cm: "abc" })
    expect(missingMeasurements(partial, "dress")).toEqual(["Neck", "Hip depth", "Rise"])
    expect(missingMeasurements(null, null)).toHaveLength(15)
  })

  it("does not refuse a value outside the usual range", () => {
    expect(missingMeasurements(sheet(true, { measure_bust_cm: "9.6" }), "top")).toEqual([])
  })
})

describe("lineRefusals", () => {
  it("accepts one open piece with a complete sheet", () => {
    expect(lineRefusals({ quantity: 1, metadata: sheet(), variant: coat })).toEqual([])
    expect(lineRefusals({ quantity: 1, metadata: sheet(false), variant: tee })).toEqual([])
  })

  it("refuses a closed piece on that ground alone", () => {
    expect(lineRefusals({ quantity: 3, metadata: null, variant: shirtDress })).toEqual([
      "Shirt dress, flax closed with Summer — Collection III and is not made again.",
    ])
  })

  it("refuses more than one of a piece", () => {
    expect(lineRefusals({ quantity: 2, metadata: sheet(), variant: coat })).toEqual([
      "Each piece is cut for one person, so Coat, Bảo Lộc silk is ordered one at a time.",
    ])
  })

  it("refuses a partial sheet, naming what is missing", () => {
    expect(lineRefusals({ quantity: 1, metadata: sheet(false), variant: coat })).toEqual([
      "The atelier cannot cut Coat, Bảo Lộc silk from a partial sheet: Desired length is missing.",
    ])
    const twoMissing = sheet(true, { measure_hip_cm: undefined, measure_rise_cm: undefined })
    expect(lineRefusals({ quantity: 1, metadata: twoMissing, variant: coat })[0]).toContain(
      "Hip and Rise are missing."
    )
  })

  it("leaves lines that are not seasonal pieces alone", () => {
    expect(lineRefusals({ quantity: 5, metadata: null })).toEqual([])
  })
})

describe("cartRefusal", () => {
  it("is null when the atelier can accept every line", () => {
    expect(cartRefusal([{ quantity: 1, metadata: sheet(), variant: coat }])).toBeNull()
    expect(cartRefusal([])).toBeNull()
  })

  it("gathers every refusal across the cart", () => {
    const refusal = cartRefusal([
      { quantity: 1, metadata: sheet(), variant: coat },
      { quantity: 1, metadata: sheet(), variant: shirtDress },
      { quantity: 2, metadata: sheet(false), variant: tee },
    ])
    expect(refusal).toBe(
      "Shirt dress, flax closed with Summer — Collection III and is not made again. " +
        "Each piece is cut for one person, so Knit-neck tee, flax is ordered one at a time."
    )
  })
})
