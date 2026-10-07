/* What the house sends when someone asks to reset a password. Plain text, in
   the house's voice, kept beside the code that sends it rather than in a
   vendor's dashboard. Mirrors commission-emails.ts. */

const storefrontUrl = () => (process.env.STOREFRONT_URL || "http://localhost:3000").replace(/\/$/, "")

/** Where the link in the email leads: the client sets a new password there.
    The token is only good for fifteen minutes — see generateResetPasswordTokenWorkflow. */
export const passwordResetUrl = (email: string, token: string) =>
  `${storefrontUrl()}/account/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

/** To the client: someone asked to reset this account's password. */
export function passwordResetEmail(email: string, token: string) {
  return {
    to: email,
    channel: "email",
    template: "password-reset",
    content: {
      subject: "Reset your password — LinSilk",
      text: [
        "A password reset was requested for this account.",
        "",
        "To choose a new one, open this link within fifteen minutes:",
        passwordResetUrl(email, token),
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
