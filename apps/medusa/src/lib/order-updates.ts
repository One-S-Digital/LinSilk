import { money } from "./commission-emails"
import { composeContent, type Block } from "./email-layout"
import { nameOf, numberOf, type OrderRecord } from "./order-emails"

/* What the client is told after the order is placed, as it moves on: the
   payment arrives, the atelier confirms the measurement sheet, the piece is
   sent and delivered, or the order is cancelled or refunded. The confirmation
   at placement is in order-emails.ts. Each is plain text and HTML from one
   description (email-layout.ts), in the house's voice. */

/** What these mails need of an order: who, which, and how much. */
export type OrderNotice = Pick<
  OrderRecord,
  "id" | "display_id" | "email" | "currency_code" | "total" | "shipping_address"
> & { items: { title: string }[] }

export type Parcel = {
  tracking_number?: string | null
  tracking_url?: string | null
}

const greeting = (order: OrderNotice) => {
  const who = nameOf(order)
  return who ? `Dear ${who},` : "Hello,"
}

const itemsBlock = (order: OrderNotice): Block => ({
  kind: "lines",
  title: `Order ${numberOf(order)}`,
  lines: order.items.map((line) => line.title),
})

const email = (
  order: OrderNotice,
  template: string,
  subject: string,
  heading: string,
  blocks: Block[]
) => ({
  to: order.email ?? "",
  channel: "email",
  template,
  content: composeContent(subject, { heading, greeting: greeting(order), blocks }),
})

/** The money has been taken. `amount` is what this payment was for. */
export function paymentReceivedEmail(order: OrderNotice, amount: number | string) {
  return email(
    order,
    "payment-received",
    `Payment received — order ${numberOf(order)}`,
    "Payment received",
    [
      {
        kind: "p",
        text: `Thank you. We have received your payment of ${money(amount, order.currency_code)} for order ${numberOf(order)}.`,
      },
      itemsBlock(order),
      { kind: "p", text: "We will write again as your order moves on." },
    ]
  )
}

/** The atelier has read the measurement sheet and confirmed it. */
export function orderConfirmedEmail(order: OrderNotice) {
  return email(
    order,
    "order-confirmed",
    `Your order ${numberOf(order)} is confirmed — LINSILK`,
    "Your order is confirmed",
    [
      {
        kind: "p",
        text: `The tailor has read your measurement sheet for order ${numberOf(order)} and confirmed it.`,
      },
      {
        kind: "p",
        text: "A pattern is drawn to your sheet before anything is cut, and a piece takes two to four weeks from today. If anything on the sheet is wrong, reply to this email at once.",
      },
      itemsBlock(order),
    ]
  )
}

/** The piece has left the atelier. */
export function orderShippedEmail(order: OrderNotice, parcel: Parcel = {}) {
  const rows: [string, string][] = parcel.tracking_number
    ? [["Tracking", parcel.tracking_number]]
    : []
  return email(
    order,
    "order-shipped",
    `Your order ${numberOf(order)} has been sent — LINSILK`,
    "Your order has been sent",
    [
      { kind: "p", text: `Order ${numberOf(order)} has left the tailor and is on its way to you.` },
      ...(rows.length ? [{ kind: "rows", title: "Parcel", rows } as Block] : []),
      ...(parcel.tracking_url
        ? [{ kind: "link", label: "Follow your parcel", url: parcel.tracking_url } as Block]
        : []),
      itemsBlock(order),
    ]
  )
}

/** The parcel has arrived. */
export function orderDeliveredEmail(order: OrderNotice) {
  return email(
    order,
    "order-delivered",
    `Your order ${numberOf(order)} has arrived — LINSILK`,
    "Your order has arrived",
    [
      { kind: "p", text: `Order ${numberOf(order)} is marked as delivered.` },
      {
        kind: "p",
        text: "If anything is not as it should be, reply to this email and we will put it right.",
      },
      itemsBlock(order),
    ]
  )
}

/** The order will not be made. */
export function orderCanceledEmail(order: OrderNotice) {
  return email(
    order,
    "order-canceled",
    `Your order ${numberOf(order)} has been cancelled — LINSILK`,
    "Your order has been cancelled",
    [
      { kind: "p", text: `Order ${numberOf(order)} has been cancelled, and nothing will be made.` },
      {
        kind: "p",
        text: "If you had already paid, the payment goes back to the method you used; how soon it shows is up to your bank. If you were not expecting this, reply to this email.",
      },
      itemsBlock(order),
    ]
  )
}

/** Money has gone back. `amount` is what this refund returned, not the order total. */
export function paymentRefundedEmail(order: OrderNotice, amount: number | string) {
  return email(
    order,
    "payment-refunded",
    `Refund for order ${numberOf(order)} — LINSILK`,
    "Your refund",
    [
      {
        kind: "p",
        text: `We have refunded ${money(amount, order.currency_code)} for order ${numberOf(order)} to the method you paid with.`,
      },
      {
        kind: "p",
        text: "Banks differ in how soon a refund shows. If it has not appeared after several working days, reply to this email and we will look into it.",
      },
      itemsBlock(order),
    ]
  )
}
