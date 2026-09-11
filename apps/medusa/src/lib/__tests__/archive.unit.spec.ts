import { archiveRefusal, isOrderable, type GatedVariant } from "../archive"

const piece = (title: string, collection?: { title: string; status?: string }): GatedVariant => ({
  id: `variant_${title}`,
  product: {
    title,
    collection: collection
      ? { title: collection.title, metadata: collection.status ? { status: collection.status } : null }
      : null,
  },
})

const autumn = { title: "Autumn — Collection IV", status: "current" }
const summer = { title: "Summer — Collection III", status: "past" }

describe("isOrderable", () => {
  it("allows a piece from the current collection", () => {
    expect(isOrderable(piece("Coat, Bảo Lộc silk", autumn))).toBe(true)
  })

  it("refuses a piece from a past collection", () => {
    expect(isOrderable(piece("Shirt dress, flax", summer))).toBe(false)
  })

  it("fails closed without a collection or a status", () => {
    expect(isOrderable(piece("Loose piece"))).toBe(false)
    expect(isOrderable(piece("Unmarked", { title: "Unmarked season" }))).toBe(false)
    expect(isOrderable({ id: "variant_bare" })).toBe(false)
  })
})

describe("archiveRefusal", () => {
  it("says nothing when every piece is open", () => {
    expect(archiveRefusal([piece("Coat, Bảo Lộc silk", autumn)])).toBeNull()
    expect(archiveRefusal([])).toBeNull()
  })

  it("names the closed piece and its season", () => {
    expect(archiveRefusal([piece("Coat, Bảo Lộc silk", autumn), piece("Shirt dress, flax", summer)])).toBe(
      "Shirt dress, flax closed with Summer — Collection III and is not made again."
    )
  })
})
