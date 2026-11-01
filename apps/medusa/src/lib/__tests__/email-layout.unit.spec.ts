import { escapeHtml, renderHtml, renderText, type EmailSpec } from "../email-layout"

const spec: EmailSpec = {
  heading: "Your order",
  greeting: "Dear Ada,",
  blocks: [
    { kind: "p", text: "Thank you." },
    { kind: "rows", title: "Order no. 12", rows: [["Total", "CHF 129"]] },
    { kind: "lines", title: "Sent to", lines: ["Rue du Rhône 1", "1204 Geneva"] },
    { kind: "link", label: "Follow your parcel", url: "https://track.example.com/abc" },
  ],
}

describe("renderText", () => {
  it("writes the blocks in the house's plain voice and signs off", () => {
    expect(renderText(spec)).toBe(
      [
        "Dear Ada,",
        "",
        "Thank you.",
        "",
        "Order no. 12",
        "  Total       CHF 129",
        "",
        "Sent to",
        "  Rue du Rhône 1",
        "  1204 Geneva",
        "",
        "Follow your parcel:",
        "https://track.example.com/abc",
        "",
        "LINSILK",
        "Geneva, Switzerland",
      ].join("\n")
    )
  })
})

describe("renderHtml", () => {
  it("carries the same words, in the house colours", () => {
    const html = renderHtml(spec)
    for (const word of ["Your order", "Dear Ada,", "Thank you.", "Total", "CHF 129", "1204 Geneva", "Geneva, Switzerland"]) {
      expect(html).toContain(word)
    }
    expect(html).toContain('href="https://track.example.com/abc"')
    expect(html).toContain("#ede6d9")
  })

  it("draws a link as a button, with the address written out under it", () => {
    const html = renderHtml({
      heading: "x",
      blocks: [{ kind: "link", label: "Confirm my email", url: "https://example.com/verify?token=a&b=c" }],
    })
    expect(html).toContain('<a href="https://example.com/verify?token=a&amp;b=c"')
    expect(html).toContain(">Confirm my email</a>")
    expect(html).toContain("If the button does not work, copy this address into your browser")
    expect(html).toContain('<span style="word-break:break-all;color:#4a4438;">https://example.com/verify?token=a&amp;b=c</span>')
  })

  it("puts a hidden preview line ahead of the card, the first paragraph unless told otherwise", () => {
    const first = renderHtml({ heading: "Head", blocks: [{ kind: "p", text: "Thank you for  your\norder." }] })
    expect(first).toMatch(/display:none[^>]*>Thank you for your order\./)
    const told = renderHtml({ heading: "Head", preheader: "One step left.", blocks: [{ kind: "p", text: "Body." }] })
    expect(told).toMatch(/display:none[^>]*>One step left\./)
    expect(told.indexOf("One step left.")).toBeLessThan(told.indexOf("<h1"))
  })

  it("cuts a long preview to what an inbox can show", () => {
    const html = renderHtml({ heading: "Head", blocks: [{ kind: "p", text: "word ".repeat(60) }] })
    expect(html).toMatch(/display:none[^>]*>(word ){1,}word…/)
  })

  it("escapes anything a client typed", () => {
    const html = renderHtml({
      heading: "x",
      blocks: [{ kind: "lines", lines: ['<script>alert("hi")</script> & co'] }],
    })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &amp; co")
  })

  it("never draws a link that is not http(s)", () => {
    const html = renderHtml({
      heading: "x",
      blocks: [{ kind: "link", label: "Track", url: "javascript:alert(1)" }],
    })
    expect(html).not.toContain("<a ")
    expect(html).toContain("Track: javascript:alert(1)")
  })
})

describe("escapeHtml", () => {
  it("escapes the five characters that matter", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;'&amp;'&lt;/a&gt;")
  })
})
