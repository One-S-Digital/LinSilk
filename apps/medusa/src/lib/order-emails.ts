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

/** A line with no sheet to confirm, such as a tie, which is ordered by colour
    alone: the storefront writes `zone_count` 0 on it. */
const noSheet = (line: OrderLine) => !line.commission && Number(line.metadata?.zone_count) === 0

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

/** The order itself, for the HTML versions: its lines, the sheet on each
    seasonal line, the figures, and where it is going. */
const detailBlocks = (order: OrderRecord, lines: OrderLine[]): Block[] => [
  {
    kind: "rows",
    title: `Order ${numberOf(order)}`,
    rows: lines.map((line): [string, string] => [
      `${line.title}${line.metadata?.fabric_name ? ` · ${String(line.metadata.fabric_name)}` : ""}`,
      money(line.total, order.currency_code),
    ]),
  },
  ...lines.flatMap((line): Block[] => {
    const rows = line.commission ? [] : sheetRows(line)
    return rows.length ? [{ kind: "rows", title: `Measurements — ${line.title}`, rows }] : []
  }),
  { kind: "rows", rows: figureRows(order) },
  { kind: "lines", title: "Sent to", lines: addressLines(order) },
]

const COLOUR_ONLY =
  "Nothing is made until the tailor has written back to confirm your colour — usually within two working days. If it is not the colour you meant, reply to this email and it is amended before the tie is made."

/** The same message as the plain text below, laid out for the HTML version. */
const confirmationBlocks = (
  order: OrderRecord,
  paid: boolean,
  seasonal: boolean,
  colourOnly: boolean
): Block[] => [
  {
    kind: "p",
    text: paid
      ? "Thank you. Your order is paid for."
      : "Thank you. We have your order, and will write again once your payment is confirmed.",
  },
  {
    kind: "p",
    text: colourOnly
      ? COLOUR_ONLY
      : seasonal
      ? "Nothing is cut until the tailor has read your measurement sheet and written back to confirm it — usually within two working days. If anything on the sheet is wrong, reply to this email and it is amended before a pattern is drawn. A piece takes two to four weeks from the confirmed sheet."
      : "The bench has your commission. A pattern is drawn to your sheet before anything is cut, and a piece takes two to four weeks from that point.",
  },
  ...detailBlocks(order, order.items),
]

/** To the client: it is paid, and what happens next. */
export function orderConfirmationEmail(order: OrderRecord) {
  const paid = order.payment_status === "captured"
  const seasonal = order.items.some((line) => !line.commission)
  const colourOnly = seasonal && order.items.filter((line) => !line.commission).every(noSheet)
  const who = nameOf(order)

  return {
    to: order.email ?? "",
    channel: "email",
    template: "order-confirmation",
    /* Remembered so that the separate "payment received" mail is not sent to a
       client who has already been told, here, that the order is paid for. */
    data: { paid },
    content: {
      subject: `Your order ${numberOf(order)} — LINSILK`,
      html: renderHtml({
        heading: "Your order",
        greeting: who ? `Dear ${who},` : "Hello,",
        blocks: confirmationBlocks(order, paid, seasonal, colourOnly),
      }),
      text: [
        who ? `Dear ${who},` : "Hello,",
        "",
        paid
          ? "Thank you. Your order is paid for."
          : "Thank you. We have your order, and will write again once your payment is confirmed.",
        "",
        ...(colourOnly
          ? [
              "Nothing is made until the tailor has written back to confirm your colour",
              "— usually within two working days. If it is not the colour you meant,",
              "reply to this email and it is amended before the tie is made.",
            ]
          : seasonal
          ? [
              "Nothing is cut until the tailor has read your measurement sheet and",
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
        "LINSILK",
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
  const toConfirm = lines.every(noSheet)
    ? "To write back and confirm the colour, within two working days."
    : "To read the sheet and write back to confirm it, within two working days."

  return {
    to,
    channel: "email",
    template: "order-placed",
    provider_data: order.email ? { reply_to: order.email } : undefined,
    content: {
      subject: `Order ${numberOf(order)} — ${lines.map((l) => l.title).join(", ")}`,
      html: renderHtml({
        heading: "New order",
        preheader: `${nameOf(order) || "A client"} ${paid ? "has paid for" : "has placed"} order ${numberOf(order)}.`,
        blocks: [
          {
            kind: "p",
            text: `${nameOf(order) || "A client"}${order.email ? ` <${order.email}>` : ""} ${
              paid ? "has paid for an order." : "has placed an order."
            }`,
          },
          ...(paid
            ? []
            : [
                {
                  kind: "p",
                  text: `Payment is not yet confirmed as taken (status: ${order.payment_status ?? "unknown"}). Check it in the admin before starting.`,
                } as Block,
              ]),
          { kind: "p", text: toConfirm },
          ...(mixed
            ? [
                {
                  kind: "p",
                  text: "This order also includes a commission, so the figures below are for the whole order.",
                } as Block,
              ]
            : []),
          ...detailBlocks(order, lines),
          { kind: "p", text: `Open it in the admin: orders / ${order.id}` },
        ],
      }),
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
        toConfirm,
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
