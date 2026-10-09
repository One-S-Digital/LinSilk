import { isOrderable, type GatedVariant } from "../archive"
import { cartRefusal, lineRefusals } from "../cart-rules"
import { BODY_ZONES, LENGTH_ZONES, missingMeasurements } from "../measurements"

const autumn = { title: "Autumn — Collection IV", metadata: { status: "current" } }
const summer = { title: "Summer — Collection III", metadata: { status: "past" } }

type Collection = { title: string; metadata: Record<string, unknown> | null } | null

const piece = (title: string, collection: Collection, ...lengthKinds: string[]): GatedVariant => ({
  id: `variant_${title}`,
  product: { title, metadata: { length_kinds: lengthKinds }, collection },
})

/* A full sheet as the storefront's toLineItemMetadata() writes it, for a
   garment asking for the given lengths. */
const sheet = (kinds: string[] = ["top"], overrides: Record<string, unknown> = {}) => ({
  measurement_unit: "cm",
  ...Object.fromEntries(BODY_ZONES.map((z, i) => [`measure_${z.key}_cm`, String(30 + i)])),
  ...Object.fromEntries(kinds.map((k) => [`measure_${LENGTH_ZONES[k].key}_cm`, "112"])),
  ...overrides,
})

const coat = piece("Coat, autumn silk", autumn, "top")
const scarf = piece("Scarf, burgundy", autumn)
const sleepSet = piece("Sleep set, cream silk", autumn, "top", "trouser")
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
    expect(missingMeasurements(sheet(), ["top"])).toEqual([])
  })

  it("asks for the garment length only when the piece has one", () => {
    expect(missingMeasurements(sheet([]))).toEqual([])
    expect(missingMeasurements(sheet([]), ["trouser"])).toEqual(["Trouser length"])
  })

  it("asks a set for both of its lengths, and keeps them apart", () => {
    expect(missingMeasurements(sheet(["top", "trouser"]), ["top", "trouser"])).toEqual([])
    expect(missingMeasurements(sheet(["top"]), ["top", "trouser"])).toEqual(["Trouser length"])
  })

  it("names the missing and unusable measurements", () => {
    const partial = sheet(["dress"], {
      measure_hipDepth_cm: undefined,
      measure_rise_cm: "0",
      measure_neck_cm: "abc",
    })
    expect(missingMeasurements(partial, ["dress"])).toEqual(["Neck", "Hip depth", "Rise"])
    expect(missingMeasurements(null)).toHaveLength(15)
  })

  it("does not refuse a value outside the usual range", () => {
    expect(missingMeasurements(sheet(["top"], { measure_bust_cm: "9.6" }), ["top"])).toEqual([])
  })
})

describe("lineRefusals", () => {
  it("accepts one open piece with a complete sheet", () => {
    expect(lineRefusals({ quantity: 1, metadata: sheet(), variant: coat })).toEqual([])
    expect(lineRefusals({ quantity: 1, metadata: sheet([]), variant: scarf })).toEqual([])
    expect(
      lineRefusals({ quantity: 1, metadata: sheet(["top", "trouser"]), variant: sleepSet })
    ).toEqual([])
  })

  it("refuses a set that is missing one of its two lengths", () => {
    expect(lineRefusals({ quantity: 1, metadata: sheet(["top"]), variant: sleepSet })).toEqual([
      "The atelier cannot cut Sleep set, cream silk from a partial sheet: Trouser length is missing.",
    ])
  })

  it("refuses a silhouette as a commission, not as an archived piece", () => {
    const silhouette = piece(
      "Dress",
      { title: "Commission silhouettes", metadata: { status: "silhouettes" } },
      "dress"
    )
    expect(lineRefusals({ quantity: 1, metadata: sheet(["dress"]), variant: silhouette })).toEqual([
      "Dress is a commission: a tailor reads the brief and writes back with a price, so it cannot be bought from the page.",
    ])
  })

  describe("a commission piece", () => {
    const commissioned = piece(
      "Commission — jacket, Alan Turing",
      { title: "Commissions", metadata: { status: "commission" } },
      "top"
    )
    const line = (commission?: { status: string; paid_at?: unknown } | null) => ({
      quantity: 1,
      metadata: sheet(),
      variant: commissioned,
      commission,
    })

    it("is accepted while its commission is quoted or approved", () => {
      expect(lineRefusals(line({ status: "quoted", paid_at: null }))).toEqual([])
      expect(lineRefusals(line({ status: "approved", paid_at: null }))).toEqual([])
    })

    it("is refused once its commission has been declined, whatever else is still standing", () => {
      expect(lineRefusals(line({ status: "declined", paid_at: null }))).toEqual([
        "This commission is declined; it is not one a payment can be made on.",
      ])
    })

    it("is refused for a status the list does not know, and for one already paid", () => {
      expect(lineRefusals(line({ status: "reviewed" }))).toHaveLength(1)
      expect(lineRefusals(line({ status: "quoted", paid_at: new Date() }))).toEqual([
        "This commission is already paid for.",
      ])
    })

    it("is refused when no commission can be found for it", () => {
      expect(lineRefusals(line(undefined))).toEqual(["No commission answers to this piece."])
      expect(lineRefusals(line(null))).toEqual(["No commission answers to this piece."])
    })

    it("does not change what a seasonal piece is asked", () => {
      expect(
        lineRefusals({ quantity: 1, metadata: sheet(), variant: coat, commission: { status: "declined" } })
      ).toEqual([])
    })
  })

  it("refuses a closed piece on that ground alone", () => {
    expect(lineRefusals({ quantity: 3, metadata: null, variant: shirtDress })).toEqual([
      "Shirt dress, flax closed with Summer — Collection III and is not made again.",
    ])
  })

  it("refuses more than one of a piece", () => {
    expect(lineRefusals({ quantity: 2, metadata: sheet(), variant: coat })).toEqual([
      "Each piece is cut for one person, so Coat, autumn silk is ordered one at a time.",
    ])
  })

  it("refuses a partial sheet, naming what is missing", () => {
    expect(lineRefusals({ quantity: 1, metadata: sheet([]), variant: coat })).toEqual([
      "The atelier cannot cut Coat, autumn silk from a partial sheet: Desired length is missing.",
    ])
    const twoMissing = sheet(["top"], { measure_hip_cm: undefined, measure_rise_cm: undefined })
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
      { quantity: 2, metadata: sheet([]), variant: scarf },
    ])
    expect(refusal).toBe(
      "Shirt dress, flax closed with Summer — Collection III and is not made again. " +
        "Each piece is cut for one person, so Scarf, burgundy is ordered one at a time."
    )
  })
})
