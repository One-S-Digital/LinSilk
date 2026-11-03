import { createHmac } from "crypto"
import { money } from "./commission-emails"
import { composeContent } from "./email-layout"
import { nameOf, numberOf, type OrderRecord } from "./order-emails"

/* The first-order offer: a client's first order earns 20% of its pieces back
   as credit, issued once the order is delivered.

   The credit is a single-use promotion code of a fixed amount in the order's
   own currency. It sits on the pieces of a later order like any code, is not
   combinable with another (checkout takes one code at a time), and lapses
   after a year. The base is the pieces after any discount, without tax:
   shipping and duties earn nothing. */

export const CREDIT_PERCENT = 20
export const CREDIT_VALID_MONTHS = 12

/** 20% of the pieces, in whole centimes, rounded down. */
export const creditAmount = (pieces: number) => Math.floor(pieces * CREDIT_PERCENT) / 100

export type PriorOrder = {
  id: string
  status?: string | null
  customer_id?: string | null
  email?: string | null
  shipping_address?: AddressKey | null
}

export type AddressKey = {
  address_1?: string | null
  postal_code?: string | null
  country_code?: string | null
}

const squash = (value?: string | null) => (value ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")

/** One address, whatever its spacing, case or punctuation. Empty when too little is known. */
export const addressKey = (a?: AddressKey | null) => {
  const key = [squash(a?.address_1), squash(a?.postal_code), squash(a?.country_code)]
  return key.every(Boolean) ? key.join("|") : ""
}

/** Whether an earlier order, not cancelled, was the same account, the same
    email or went to the same address. */
export function hasEarlierOrder(
  order: Pick<PriorOrder, "id" | "customer_id" | "email" | "shipping_address">,
  earlier: PriorOrder[]
) {
  const email = (order.email ?? "").trim().toLowerCase()
  const address = addressKey(order.shipping_address)
  return earlier.some(
    (other) =>
      other.id !== order.id &&
      other.status !== "canceled" &&
      ((order.customer_id && other.customer_id === order.customer_id) ||
        (email && (other.email ?? "").trim().toLowerCase() === email) ||
        (address && addressKey(other.shipping_address) === address))
  )
}

/** The code for an order. Derived from a secret, so the same order always gets
    the same code (a repeated event issues nothing twice) and nobody can work
    one out from an order number. */
export function creditCode(orderId: string, secret: string) {
  const digest = createHmac("sha256", secret).update(`first-order-credit:${orderId}`).digest()
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const chars = Array.from(digest.subarray(0, 10), (byte) => alphabet[byte % alphabet.length])
  return `LINSILK-${chars.slice(0, 5).join("")}-${chars.slice(5).join("")}`
}

export const expiryFrom = (from: Date) => {
  const end = new Date(from)
  end.setUTCMonth(end.getUTCMonth() + CREDIT_VALID_MONTHS)
  return end
}

/** To the client: the credit their first order has earned, and its code. */
export function firstOrderCreditEmail(
  order: OrderRecord,
  { code, amount, expires }: { code: string; amount: number; expires: Date }
) {
  const who = nameOf(order)
  const worth = money(amount, order.currency_code)
  const until = expires.toISOString().slice(0, 10)
  const subject = `${worth} for your next order — LINSILK`
  const spec = {
    heading: "A credit for your next order",
    greeting: who ? `Dear ${who},` : "Hello,",
    blocks: [
      {
        kind: "p" as const,
        text: `Order ${numberOf(order)} has arrived, and as it was your first, ${CREDIT_PERCENT}% of its pieces comes back to you: ${worth}.`,
      },
      { kind: "rows" as const, rows: [["Your code", code], ["Worth", worth], ["Valid until", until]] as [string, string][] },
      {
        kind: "p" as const,
        text: "Enter the code in the promo field at checkout. It can be used once, on any later order, and not together with another code.",
      },
    ],
  }
  return {
    to: order.email ?? "",
    channel: "email",
    template: "first-order-credit",
    content: composeContent(subject, spec),
  }
}
