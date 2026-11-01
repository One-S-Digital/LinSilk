import { composeContent } from "./email-layout"

/* What the house sends to open an account and to reset a password, in the
   house's voice, kept beside the code that sends it rather than in a vendor's
   dashboard. Each is plain text and HTML from one description
   (email-layout.ts); the link is a button in the HTML. */

const storefrontUrl = () => (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")

/* Where the admin dashboard lives, for staff reset links. It is served by the
   backend itself, under /app. */
const adminUrl = () => (process.env.ADMIN_URL || "http://localhost:9000/app").replace(/\/$/, "")

/** Who asked: a client of the house, or a member of staff. */
export type ResetActor = "customer" | "user"

/** Where the link in the email leads: the client, or the staff member, sets a
    new password there. The token is only good for fifteen minutes — see
    generateResetPasswordTokenWorkflow. */
export const passwordResetUrl = (email: string, token: string, actor: ResetActor = "customer") =>
  `${actor === "user" ? `${adminUrl()}/reset-password` : `${storefrontUrl()}/account/reset-password`}` +
  `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

/** Where the link in a verification email leads: the storefront confirms it. */
export const emailVerificationUrl = (token: string) =>
  `${storefrontUrl()}/account/verify-email?token=${encodeURIComponent(token)}`

/** To a new client: confirm this address is theirs. */
export function emailVerificationEmail(email: string, token: string) {
  return {
    to: email,
    channel: "email",
    template: "email-verification",
    content: composeContent("Confirm your email — LINSILK", {
      heading: "Confirm your email",
      preheader: "One step left to finish opening your account.",
      greeting: "Welcome to LINSILK.",
      blocks: [
        { kind: "p", text: "Please confirm that this is your address. The link works for one day." },
        { kind: "link", label: "Confirm my email", url: emailVerificationUrl(token) },
        { kind: "p", text: "If you did not open an account, you can ignore this email." },
      ],
    }),
  }
}

/** To the client or the staff member: someone asked to reset this account's password. */
export function passwordResetEmail(email: string, token: string, actor: ResetActor = "customer") {
  return {
    to: email,
    channel: "email",
    template: actor === "user" ? "admin-password-reset" : "password-reset",
    content: composeContent(
      actor === "user" ? "Reset your admin password — LINSILK" : "Reset your password — LINSILK",
      {
        heading: actor === "user" ? "Reset your admin password" : "Reset your password",
        preheader: "The link works for fifteen minutes.",
        blocks: [
          { kind: "p", text: "A password reset was requested for this account." },
          {
            kind: "link",
            label: "Reset my password",
            url: passwordResetUrl(email, token, actor),
          },
          {
            kind: "p",
            text: "The link works for fifteen minutes. If you did not ask for this, ignore this email — nothing changes unless the link is opened.",
          },
        ],
      }
    ),
  }
}
