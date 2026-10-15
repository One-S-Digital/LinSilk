import { money } from "./commission-emails"
import { renderHtml, type Block } from "./email-layout"
import { BODY_ZONES, LENGTH_ZONES } from "./measurements"

/* What the house sends when an order is placed: a confirmation to the client,
   and — for seasonal pieces — the order and its measurement sheet to the
   atelier. A commission's own payment is announced by commission-paid.ts, so
   its lines are told to the client here and left out of the atelier's mail. */

export type OrderLine = {
  title: string
  total: number | string
  /** True for a piece the house made for one commission. */
  commission: boolean
  metadata?: Record<string, unknown> | null
}

export type OrderRecord = {
  id: string
  display_id?: number | string | null
  email?: string | null
  currency_code: string
  item_total?: number | string | null
  /** The pieces before any discount. */
  original_item_total?: number | string | null
  /** What the promotion took off the pieces; `discount_total` also counts shipping. */
  item_discount_total?: number | string | null
  discount_total?: number | string | null
  /** Medusa's own word: "captured" once the money has been taken. */
  payment_status?: string | null
  shipping_total?: number | string | null
  total: number | string
  items: OrderLine[]
  shipping_methods?: { name?: string | null }[] | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    postal_code?: string | null
    city?: string | null
    country_code?: string | null
    phone?: string | null
  } | null
}

const ZONE_LABELS: Record<string, string> = Object.fromEntries(
  [...BODY_ZONES, ...Object.values(LENGTH_ZONES)].map((zone) => [zone.key, zone.label])
)

export const numberOf = (order: Pick<OrderRecord, "id" | "display_id">) =>
  order.display_id ? `no. ${order.display_id}` : order.id

export const nameOf = (order: Pick<OrderRecord, "shipping_address">) =>
  [order.shipping_address?.first_name, order.shipping_address?.last_name]
    .filter(Boolean)
    .join(" ")

/** The sheet as it travelled on the line: `measure_<zone>_cm`, always in cm. */
const sheetRows = (line: OrderLine): [string, string][] =>
  Object.entries(line.metadata ?? {}).flatMap(([key, value]) => {
    const zone = key.match(/^measure_(.+)_cm$/)?.[1]
    return zone ? [[ZONE_LABELS[zone] ?? zone, `${value} cm`] as [string, string]] : []
  })

const sheetOf = (line: OrderLine) =>
  sheetRows(line)
    .map(([label, value]) => `    ${label.padEnd(20)} ${value}`)
    .join("\n")

const lineText = (line: OrderLine, currency: string) => {
  const cloth = line.metadata?.fabric_name ? ` · ${String(line.metadata.fabric_name)}` : ""
  const head = `  ${line.title}${cloth} — ${money(line.total, currency)}`
  const sheet = line.commission ? "" : sheetOf(line)
  return sheet ? `${head}\n${sheet}` : head
}

const addressText = (order: OrderRecord) =>
  addressLines(order)
    .map((part) => `  ${part}`)
    .join("\n")

const figureRows = (order: OrderRecord): [string, string][] => {
  const currency = order.currency_code
  /* The discount on the pieces only: `discount_total` also counts a discount
     on shipping, which the shipping line already shows. */
  const discount = Number(order.item_discount_total ?? order.discount_total ?? 0)
  const shipping = order.shipping_methods?.[0]?.name
  const pieces =
    order.original_item_total ??
    (order.item_total != null ? Number(order.item_total) + discount : null)
  const rows: ([string, string] | null)[] = [
    pieces != null ? ["Pieces", money(pieces, currency)] : null,
    discount > 0 ? ["Discount", `−${money(discount, currency)}`] : null,
    order.shipping_total != null
      ? [
          "Shipping",
          `${Number(order.shipping_total) === 0 ? "included" : money(order.shipping_total, currency)}${
            shipping ? ` (${shipping})` : ""
          }`,
        ]
      : null,
    ["Total", money(order.total, currency)],
  ]
  return rows.filter((row): row is [string, string] => row !== null)
}

const figures = (order: OrderRecord) =>
  figureRows(order)
    .map(([label, value]) => `  ${label.padEnd(12)}${value}`)
    .join("\n")

const addressLines = (order: OrderRecord) => {
  const a = order.shipping_address
  if (!a) return ["not given"]
  return [
    nameOf(order),
    [a.address_1, a.address_2].filter(Boolean).join(", "),
    [a.postal_code, a.city].filter(Boolean).join(" "),
    a.country_code?.toUpperCase(),
    a.phone,
  ].filter((part): part is string => Boolean(part))
}

/** The same message as the plain text below, laid out for the HTML version. */
const confirmationBlocks = (order: OrderRecord, paid: boolean, seasonal: boolean): Block[] => [
  {
    kind: "p",
    text: paid
      ? "Thank you. Your order is paid for."
      : "Thank you. We have your order, and will write again once your payment is confirmed.",
  },
  {
    kind: "p",
    text: seasonal
      ? "Nothing is cut until the atelier has read your measurement sheet and written back to confirm it — usually within two working days. If anything on the sheet is wrong, reply to this email and it is amended before a pattern is drawn. A piece takes two to four weeks from the confirmed sheet."
      : "The bench has your commission. A pattern is drawn to your sheet before anything is cut, and a piece takes two to four weeks from that point.",
  },
  {
    kind: "rows",
    title: `Order ${numberOf(order)}`,
    rows: order.items.map((line): [string, string] => [
      `${line.title}${line.metadata?.fabric_name ? ` · ${String(line.metadata.fabric_name)}` : ""}`,
      money(line.total, order.currency_code),
    ]),
  },
  ...order.items.flatMap((line): Block[] => {
    const rows = line.commission ? [] : sheetRows(line)
    return rows.length ? [{ kind: "rows", title: `Measurements — ${line.title}`, rows }] : []
  }),
  { kind: "rows", rows: figureRows(order) },
  { kind: "lines", title: "Sent to", lines: addressLines(order) },
]

/** To the client: it is paid, and what happens next. */
export function orderConfirmationEmail(order: OrderRecord) {
  const paid = order.payment_status === "captured"
  const seasonal = order.items.some((line) => !line.commission)
  const who = nameOf(order)

  return {
    to: order.email ?? "",
    channel: "email",
    template: "order-confirmation",
    /* Remembered so that the separate "payment received" mail is not sent to a
       client who has already been told, here, that the order is paid for. */
    data: { paid },
    content: {
      subject: `Your order ${numberOf(order)} — LinSilk`,
      html: renderHtml({
        heading: "Your order",
        greeting: who ? `Dear ${who},` : "Hello,",
        blocks: confirmationBlocks(order, paid, seasonal),
      }),
      text: [
        who ? `Dear ${who},` : "Hello,",
        "",
        paid
          ? "Thank you. Your order is paid for."
          : "Thank you. We have your order, and will write again once your payment is confirmed.",
        "",
        ...(seasonal
          ? [
              "Nothing is cut until the atelier has read your measurement sheet and",
              "written back to confirm it — usually within two working days. If",
              "anything on the sheet is wrong, reply to this email and it is amended",
              "before a pattern is drawn. A piece takes two to four weeks from the",
              "confirmed sheet.",
            ]
          : [
              "The bench has your commission. A pattern is drawn to your sheet before",
              "anything is cut, and a piece takes two to four weeks from that point.",
            ]),
        "",
        `Order ${numberOf(order)}`,
        ...order.items.map((line) => lineText(line, order.currency_code)),
        "",
        figures(order),
        "",
        "Sent to",
        addressText(order),
        "",
        "LinSilk",
        "Geneva, Switzerland",
      ].join("\n"),
    },
  }
}

/** To the house: a seasonal order has been paid, and here is what to cut. */
export function orderPlacedEmail(order: OrderRecord, to: string) {
  const lines = order.items.filter((line) => !line.commission)
  const paid = order.payment_status === "captured"
  const mixed = lines.length < order.items.length

  return {
    to,
    channel: "email",
    template: "order-placed",
    provider_data: order.email ? { reply_to: order.email } : undefined,
    content: {
      subject: `Order ${numberOf(order)} — ${lines.map((l) => l.title).join(", ")}`,
      text: [
        `${nameOf(order) || "A client"}${order.email ? ` <${order.email}>` : ""} ${
          paid ? "has paid for an order." : "has placed an order."
        }`,
        ...(paid
          ? []
          : [
              "",
              `Payment is not yet confirmed as taken (status: ${order.payment_status ?? "unknown"}).`,
              "Check it in the admin before starting.",
            ]),
        "",
        "To read the sheet and write back to confirm it, within two working days.",
        "",
        `Order ${numberOf(order)}`,
        ...lines.map((line) => lineText(line, order.currency_code)),
        "",
        figures(order),
        ...(mixed ? ["  (These figures are for the whole order, which also includes a commission.)"] : []),
        "",
        "Sent to",
        addressText(order),
        "",
        `Open it in the admin: orders / ${order.id}`,
      ].join("\n"),
    },
  }
}
