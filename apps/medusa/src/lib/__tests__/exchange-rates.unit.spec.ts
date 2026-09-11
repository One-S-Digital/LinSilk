import { fetchChfRates, parseEcbDaily } from "../exchange-rates"

/* Trimmed from the real feed of 10 September 2026. */
const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope xmlns:gesmes="http://www.gesmes.org/xml/2002-08-01" xmlns="http://www.ecb.int/vocabulary/2002-08-01/eurofxref">
  <Cube>
    <Cube time='2026-09-10'>
      <Cube currency='USD' rate='1.1712'/>
      <Cube currency='GBP' rate='0.85915'/>
      <Cube currency='CHF' rate='0.9432'/>
    </Cube>
  </Cube>
</gesmes:Envelope>`

describe("parseEcbDaily", () => {
  it("derives the franc's rates from the per-euro quotes", () => {
    const rates = parseEcbDaily(FEED)
    expect(rates.date).toBe("2026-09-10")
    expect(rates.eur).toBeCloseTo(1 / 0.9432, 10)
    expect(rates.gbp).toBeCloseTo(0.85915 / 0.9432, 10)
  })

  it("refuses a feed without a franc rate rather than pricing from nothing", () => {
    expect(() => parseEcbDaily(FEED.replace(/<Cube currency='CHF'[^>]*>/, ""))).toThrow("CHF")
  })

  it("refuses a feed without a date", () => {
    expect(() => parseEcbDaily(FEED.replace("time='2026-09-10'", ""))).toThrow("date")
  })
})

describe("fetchChfRates", () => {
  it("reports an HTTP failure instead of parsing an error page", async () => {
    const failing = (async () => new Response("down", { status: 503 })) as typeof fetch
    await expect(fetchChfRates(failing)).rejects.toThrow("503")
  })

  it("returns the parsed rates", async () => {
    const ok = (async () => new Response(FEED)) as typeof fetch
    await expect(fetchChfRates(ok)).resolves.toMatchObject({ date: "2026-09-10" })
  })
})
