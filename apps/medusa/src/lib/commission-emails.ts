import { BODY_ZONES, LENGTH_ZONES } from "./measurements"

/* What the house sends when a commission arrives, and when a tailor has set
   a figure. Plain text, in the house's voice, kept beside the code that sends
   it rather than in a vendor's dashboard. */

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

const sheetLines = (commission: CommissionRecord) => {
  const kinds = Array.isArray(commission.length_kinds) ? (commission.length_kinds as string[]) : []
  const zones = [...BODY_ZONES, ...kinds.map((k) => LENGTH_ZONES[k]).filter(Boolean)]
  return zones
    .map((zone) => {
      const value = commission.measurements?.[zone.key]
      return value === undefined ? null : `  ${zone.label.padEnd(20)} ${value} cm`
    })
    .filter(Boolean)
    .join("\n")
}

const referenceLines = (commission: CommissionRecord) => {
  const files = Array.isArray(commission.references)
    ? (commission.references as { filename: string }[])
    : []
  return files.length
    ? files.map((f) => `  ${f.filename}`).join("\n")
    : "  none"
}

/** To the house: a brief has arrived and someone must price it. */
export function commissionSubmittedEmail(commission: CommissionRecord, to: string) {
  const estimate = commission.estimate_amount
    ? money(commission.estimate_amount, commission.currency_code ?? "chf")
    : "none shown"

  return {
    to,
    channel: "email",
    template: "commission-submitted",
    provider_data: { reply_to: commission.email },
    content: {
      subject: `Commission — ${commission.silhouette_title}, ${commission.name}`,
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
        `Measurement sheet (recorded in centimetres; the client was reading ${
          commission.measurement_unit ?? "cm"
        })`,
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
    content: {
      subject: "Your commission — LINSILK",
      text: [
        `Dear ${commission.name},`,
        "",
        `We have your brief for a ${commission.silhouette_title.toLowerCase()} in ${commission.fabric}.`,
        "",
        "A tailor reads every commission by hand before quoting it, so the price",
        "comes by email rather than from the page — usually within two working days.",
        "Nothing is charged, and nothing is cut, until you have agreed the figure",
        "in writing.",
        "",
        "If anything in the brief has changed, reply to this email and we will",
        "amend it before the tailor reads it.",
        "",
        "LINSILK",
        "Geneva, Switzerland",
      ].join("\n"),
    },
  }
}

/** Where the client goes to accept a quote and pay for it. */
export const commissionPaymentUrl = (token: string) =>
  `${(process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")}/commission/${token}`

/** To the client: the tailor has read it, this is the price, here is the door. */
export function commissionQuotedEmail(commission: CommissionRecord & { access_token?: string | null }) {
  const figure = money(commission.quote_amount!, commission.currency_code ?? "chf")

  return {
    to: commission.email,
    channel: "email",
    template: "commission-quoted",
    content: {
      subject: `Your commission — ${figure}`,
      text: [
        `Dear ${commission.name},`,
        "",
        `A tailor has read your brief for a ${commission.silhouette_title.toLowerCase()}`,
        `in ${commission.fabric}, and the price for it is ${figure}.`,
        "",
        "That figure includes the pattern drawn for your sheet, the cutting and",
        "the handwork at the bench. It does not change once you have agreed it.",
        "",
        ...(commission.access_token
          ? [
              "To accept it, pay here:",
              commissionPaymentUrl(commission.access_token),
              "",
              "The link is yours alone — it carries your measurements — so please do",
              "not forward it. You choose where the piece is sent on that page.",
            ]
          : ["Reply to this email to accept."]),
        "",
        "Cutting begins once the payment has cleared; the piece takes two to four",
        "weeks from that point. If anything here is wrong, reply and it is amended",
        "before a pattern is drawn.",
        "",
        "LINSILK",
        "Geneva, Switzerland",
      ].join("\n"),
    },
  }
}
