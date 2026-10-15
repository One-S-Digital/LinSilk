/* What the house sends when someone asks to reset a password. Plain text, in
   the house's voice, kept beside the code that sends it rather than in a
   vendor's dashboard. Mirrors commission-emails.ts. */

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
    content: {
      subject: "Confirm your email — LinSilk",
      text: [
        "Welcome to LinSilk.",
        "",
        "To confirm this is your address, open this link within a day:",
        emailVerificationUrl(token),
        "",
        "If you did not open an account, ignore this email.",
        "",
        "LinSilk",
        "Geneva, Switzerland",
      ].join("\n"),
    },
  }
}

/** To the client or the staff member: someone asked to reset this account's password. */
export function passwordResetEmail(email: string, token: string, actor: ResetActor = "customer") {
  return {
    to: email,
    channel: "email",
    template: actor === "user" ? "admin-password-reset" : "password-reset",
    content: {
      subject: actor === "user" ? "Reset your admin password — LinSilk" : "Reset your password — LinSilk",
      text: [
        "A password reset was requested for this account.",
        "",
        "To choose a new one, open this link within fifteen minutes:",
        passwordResetUrl(email, token, actor),
        "",
        "If you did not ask for this, ignore this email — nothing changes",
        "unless the link above is opened.",
        "",
        "LinSilk",
        "Geneva, Switzerland",
      ].join("\n"),
    },
  }
}
