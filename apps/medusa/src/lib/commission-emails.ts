import { composeContent, renderHtml, type Block } from "./email-layout"
import { BODY_ZONES, LENGTH_ZONES } from "./measurements"

/* What the house sends when a commission arrives, and when a tailor has set
   a figure, in the house's voice, kept beside the code that sends it rather
   than in a vendor's dashboard. The mails to the client are plain text and
   HTML from one description (email-layout.ts). */

export type CommissionRecord = {
  id: string
  name: string
  email: string
  silhouette_title: string
  fabric: string
  note?: string | null
  measurements: Record<string, unknown>
  measurement_unit?: string | null
  length_kinds?: unknown
  references?: unknown
  estimate_amount?: number | string | null
  quote_amount?: number | string | null
  currency_code?: string | null
}

export const money = (amount: number | string, currency = "chf") =>
  `${currency.toUpperCase()} ${Number(amount).toLocaleString("de-CH")}`

const sheetRows = (commission: CommissionRecord): [string, string][] => {
  const kinds = Array.isArray(commission.length_kinds) ? (commission.length_kinds as string[]) : []
  const zones = [...BODY_ZONES, ...kinds.map((k) => LENGTH_ZONES[k]).filter(Boolean)]
  return zones.flatMap((zone) => {
    const value = commission.measurements?.[zone.key]
    return value === undefined ? [] : [[zone.label, `${value} cm`] as [string, string]]
  })
}

const sheetLines = (commission: CommissionRecord) =>
  sheetRows(commission)
    .map(([label, value]) => `  ${label.padEnd(20)} ${value}`)
    .join("\n")

const referenceNames = (commission: CommissionRecord) =>
  Array.isArray(commission.references)
    ? (commission.references as { filename: string }[]).map((f) => f.filename)
    : []

const referenceLines = (commission: CommissionRecord) => {
  const names = referenceNames(commission)
  return names.length ? names.map((name) => `  ${name}`).join("\n") : "  none"
}

/** To the house: a brief has arrived and someone must price it. */
export function commissionSubmittedEmail(commission: CommissionRecord, to: string) {
  const estimate = commission.estimate_amount
    ? money(commission.estimate_amount, commission.currency_code ?? "chf")
    : "none shown"

  const unit = commission.measurement_unit ?? "cm"
  const sheetTitle = `Measurement sheet (recorded in centimetres; the client was reading ${unit})`
  const names = referenceNames(commission)

  return {
    to,
    channel: "email",
    template: "commission-submitted",
    provider_data: { reply_to: commission.email },
    content: {
      subject: `Commission — ${commission.silhouette_title}, ${commission.name}`,
      html: renderHtml({
        heading: "New commission",
        preheader: `${commission.name} would like a ${commission.silhouette_title.toLowerCase()} in ${commission.fabric}.`,
        blocks: [
          { kind: "p", text: `${commission.name} <${commission.email}> has asked for a quote.` },
          {
            kind: "rows",
            rows: [
              ["Silhouette", commission.silhouette_title],
              ["Cloth", commission.fabric],
              ["Shown as", estimate],
            ],
          },
          { kind: "lines", title: "Their note", lines: (commission.note || "none").split(/\r?\n/) },
          { kind: "rows", title: sheetTitle, rows: sheetRows(commission) },
          { kind: "lines", title: "References", lines: names.length ? names : ["none"] },
          { kind: "p", text: `Open it in the admin: commissions / ${commission.id}` },
        ],
      }),
      text: [
        `${commission.name} <${commission.email}> has asked for a quote.`,
        "",
        `Silhouette   ${commission.silhouette_title}`,
        `Cloth        ${commission.fabric}`,
        `Shown as     ${estimate}`,
        "",
        "Their note",
        commission.note ? commission.note : "  none",
        "",
        sheetTitle,
        sheetLines(commission),
        "",
        "References",
        referenceLines(commission),
        "",
        `Open it in the admin: commissions / ${commission.id}`,
      ].join("\n"),
    },
  }
}

/** To the client: we have it, a person is reading it. */
export function commissionReceivedEmail(commission: CommissionRecord) {
  return {
    to: commission.email,
    channel: "email",
    template: "commission-received",
    content: composeContent("Your commission — LINSILK", {
      heading: "We have your brief",
      preheader: "A tailor will read it and write back with a price.",
      greeting: `Dear ${commission.name},`,
      blocks: [
        {
          kind: "p",
          text: `We have your brief for a ${commission.silhouette_title.toLowerCase()} in ${commission.fabric}.`,
        },
        {
          kind: "p",
          text: "A tailor reads every commission by hand before quoting it, so the price comes by email rather than from the page — usually within two working days. Nothing is charged, and nothing is cut, until you have agreed the figure in writing.",
        },
        {
          kind: "p",
          text: "If anything in the brief has changed, reply to this email and we will amend it before the tailor reads it.",
        },
      ],
    }),
  }
}

/** Where the client goes to accept a quote and pay for it. */
export const commissionPaymentUrl = (token: string) =>
  `${(process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")}/commission/${token}`

/** To the client: the tailor has read it, this is the price, here is the door. */
export function commissionQuotedEmail(commission: CommissionRecord & { access_token?: string | null }) {
  const figure = money(commission.quote_amount!, commission.currency_code ?? "chf")
  const accept: Block[] = commission.access_token
    ? [
        { kind: "link", label: "Accept and pay", url: commissionPaymentUrl(commission.access_token) },
        {
          kind: "p",
          text: "The link is yours alone — it carries your measurements — so please do not forward it. You choose where the piece is sent on that page.",
        },
      ]
    : [{ kind: "p", text: "Reply to this email to accept." }]

  return {
    to: commission.email,
    channel: "email",
    template: "commission-quoted",
    content: composeContent(`Your commission — ${figure}`, {
      heading: "Your commission is priced",
      preheader: `A tailor has read your brief. The price is ${figure}.`,
      greeting: `Dear ${commission.name},`,
      blocks: [
        {
          kind: "p",
          text: `A tailor has read your brief for a ${commission.silhouette_title.toLowerCase()} in ${commission.fabric}, and the price for it is ${figure}.`,
        },
        {
          kind: "p",
          text: "That figure includes the pattern drawn for your sheet, the cutting and the handwork at the bench. It does not change once you have agreed it.",
        },
        ...accept,
        {
          kind: "p",
          text: "Cutting begins once the payment has cleared; the piece takes two to four weeks from that point. If anything here is wrong, reply and it is amended before a pattern is drawn.",
        },
      ],
    }),
  }
}
