import { CHF_RATES, fromChf } from "../pricing"

describe("fromChf", () => {
  it("leaves the franc price untouched", () => {
    expect(fromChf(1980, "chf")).toBe(1980)
    expect(fromChf(1985, "chf")).toBe(1985)
  })

  it("rounds converted prices to the nearest ten", () => {
    for (const chf of [260, 340, 1640, 1980, 2140, 3200]) {
      expect(fromChf(chf, "eur") % 10).toBe(0)
      expect(fromChf(chf, "gbp") % 10).toBe(0)
    }
  })

  it("stays within five of the exact conversion", () => {
    for (const chf of [260, 1980, 3200]) {
      expect(Math.abs(fromChf(chf, "eur") - chf * CHF_RATES.eur)).toBeLessThanOrEqual(5)
      expect(Math.abs(fromChf(chf, "gbp") - chf * CHF_RATES.gbp)).toBeLessThanOrEqual(5)
    }
  })

  it("keeps an included price at zero", () => {
    expect(fromChf(0, "eur")).toBe(0)
    expect(fromChf(0, "gbp")).toBe(0)
  })
})
