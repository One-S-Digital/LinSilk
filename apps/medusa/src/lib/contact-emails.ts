import { z } from "@medusajs/framework/zod"
import { composeContent } from "./email-layout"

/* The contact form: a message from the site to the house. It goes to
   hello@bylinsilk.com (CONTACT_EMAIL overrides it), with the sender's address
   as reply-to so answering it answers them. */

export const CONTACT_EMAIL = "hello@bylinsilk.com"

/* Anything typed into the form ends up in a mail header (the subject, the
   reply-to) or its body. Line breaks and other control characters are what
   header injection is made of, so they are removed from every one-line field,
   and from the message all but its own line breaks and tabs. */
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u0085\u2028\u2029\u202a-\u202e\u2066-\u2069]/g
const oneLine = (value: string) => value.replace(CONTROL, "").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ")
const multiLine = (value: string) => value.replace(/\r\n?/g, "\n").replace(CONTROL, "")

export const contactSchema = z
  .object({
    name: z.string().transform(oneLine).pipe(z.string().trim().min(1).max(200)),
    email: z.string().trim().max(254).email().refine((e) => !/[\s<>,;"'()]/.test(e), "Not a plain address"),
    message: z.string().transform(multiLine).pipe(z.string().trim().min(1).max(5000)),
    /** A field a person never sees; a program fills it in. */
    website: z.string().max(2000).optional(),
  })
  .strict()

export type ContactMessage = z.infer<typeof contactSchema>

export function contactEmail({ name, email, message }: ContactMessage, to: string) {
  return {
    to,
    channel: "email",
    template: "contact-message",
    provider_data: { reply_to: email },
    content: composeContent(`Message from ${name} — LINSILK`, {
      heading: "A message from the site",
      preheader: `${name} <${email}> has written to the house.`,
      blocks: [
        { kind: "p", text: `${name} <${email}> wrote:` },
        { kind: "lines", lines: message.split(/\r?\n/) },
        { kind: "p", text: "Reply to this email to answer them." },
      ],
    }),
  }
}
