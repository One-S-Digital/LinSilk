import { fromChf, rederive, type ChfRates } from "../pricing"

const rates: ChfRates = { eur: 1.06, gbp: 0.91 }

describe("fromChf", () => {
  it("leaves the franc price untouched", () => {
    expect(fromChf(1980, "chf", rates)).toBe(1980)
    expect(fromChf(1985, "chf", rates)).toBe(1985)
  })

  it("rounds converted prices to the nearest ten", () => {
    for (const chf of [260, 340, 1640, 1980, 2140, 3200]) {
      expect(fromChf(chf, "eur", rates) % 10).toBe(0)
      expect(fromChf(chf, "gbp", rates) % 10).toBe(0)
    }
  })

  it("stays within five of the exact conversion", () => {
    for (const chf of [260, 1980, 3200]) {
      expect(Math.abs(fromChf(chf, "eur", rates) - chf * rates.eur)).toBeLessThanOrEqual(5)
      expect(Math.abs(fromChf(chf, "gbp", rates) - chf * rates.gbp)).toBeLessThanOrEqual(5)
    }
  })

  it("follows the rate it is given", () => {
    expect(fromChf(1980, "eur", { eur: 1.06, gbp: 0.91 })).toBe(2100)
    expect(fromChf(1980, "eur", { eur: 1.1, gbp: 0.91 })).toBe(2180)
  })

  it("keeps an included price at zero", () => {
    expect(fromChf(0, "eur", rates)).toBe(0)
    expect(fromChf(0, "gbp", rates)).toBe(0)
  })
})

describe("rederive", () => {
  const set = [
    { id: "p_chf", currency_code: "chf", amount: 1980 },
    { id: "p_eur", currency_code: "eur", amount: 2120 },
    { id: "p_gbp", currency_code: "gbp", amount: 1840 },
  ]

  it("re-derives euro and sterling from the franc, keeping every price id", () => {
    expect(rederive(set, rates)).toEqual([
      { id: "p_chf", currency_code: "chf", amount: 1980 },
      { id: "p_eur", currency_code: "eur", amount: 2100 },
      { id: "p_gbp", currency_code: "gbp", amount: 1800 },
    ])
  })

  it("returns null when the prices already match the rate", () => {
    const current = rederive(set, rates)!
    expect(rederive(current, rates)).toBeNull()
  })

  it("adds a missing currency when asked to", () => {
    const onlyChf = [{ id: "p_chf", currency_code: "chf", amount: 1980 }]
    expect(rederive(onlyChf, rates)).toBeNull()
    expect(rederive(onlyChf, rates, ["eur", "gbp"])).toEqual([
      { id: "p_chf", currency_code: "chf", amount: 1980 },
      { currency_code: "eur", amount: 2100 },
      { currency_code: "gbp", amount: 1800 },
    ])
  })

  it("does nothing without a franc price to derive from", () => {
    expect(rederive([{ id: "p_eur", currency_code: "eur", amount: 0 }], rates, ["gbp"])).toBeNull()
  })

  it("leaves currencies the house does not derive alone", () => {
    const withUsd = [...set, { id: "p_usd", currency_code: "usd", amount: 999 }]
    expect(rederive(withUsd, rates)).toContainEqual({ id: "p_usd", currency_code: "usd", amount: 999 })
  })
})
