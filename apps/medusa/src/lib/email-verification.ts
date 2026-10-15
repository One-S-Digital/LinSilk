import { createHmac, timingSafeEqual } from "node:crypto"

/* The link in a verification email. Signed with the house's JWT secret rather
   than stored: nothing to look up, nothing to clean up, and a token for one
   customer and one address cannot be bent into another. It carries the email
   it was sent to, so a link outlives neither a change of address nor a day. */

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000

type Claims = { c: string; e: string; x: number }

const sign = (body: string, secret: string) => createHmac("sha256", secret).update(body).digest("base64url")

export function createVerificationToken(
  customerId: string,
  email: string,
  secret: string,
  now: number = Date.now()
): string {
  const body = Buffer.from(
    JSON.stringify({ c: customerId, e: email.toLowerCase(), x: now + VERIFICATION_TTL_MS } satisfies Claims)
  ).toString("base64url")
  return `${body}.${sign(body, secret)}`
}

/** The customer and address a token was issued for, or null if it is forged,
    mangled or past its day. */
export function readVerificationToken(
  token: string,
  secret: string,
  now: number = Date.now()
): { customerId: string; email: string } | null {
  const [body, signature, extra] = token.split(".")
  if (!body || !signature || extra !== undefined) return null

  const expected = Buffer.from(sign(body, secret))
  const given = Buffer.from(signature)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  try {
    const claims = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<Claims>
    if (typeof claims.c !== "string" || typeof claims.e !== "string" || typeof claims.x !== "number") return null
    if (claims.x <= now) return null
    return { customerId: claims.c, email: claims.e }
  } catch {
    return null
  }
}
