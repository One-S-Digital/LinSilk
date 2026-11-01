/* The house's email, drawn once. A message is described as a few blocks and
   rendered twice — as plain text, the voice every earlier mail was written in,
   and as HTML in the storefront's own colours — so the two cannot drift apart.

   Email clients ignore stylesheets and web fonts, so the HTML is nested tables
   with inline styles and a Georgia stack standing in for the site's serif: a
   centred wordmark, one paper-coloured card on the bone ground, a sign-off
   beneath. A link is drawn as a button, with its address written out under it
   for the client whose mail app strips buttons. The palette is the
   storefront's (globals.css). */

export type Block =
  | { kind: "p"; text: string }
  /** Label and value pairs: the lines of an order, its figures. */
  | { kind: "rows"; title?: string; rows: [string, string][] }
  /** Free lines, one under another: an address. */
  | { kind: "lines"; title?: string; lines: string[] }
  | { kind: "link"; label: string; url: string }

export type EmailSpec = {
  heading: string
  /** What the inbox shows beside the subject. Defaults to the first paragraph. */
  preheader?: string
  greeting?: string
  blocks: Block[]
}

const SIGN_OFF = ["LINSILK", "Geneva, Switzerland"]

const INK = "#2a2620"
const INK_BODY = "#4a4438"
const INK_MUTED = "#6e6555"
const BONE = "#ede6d9"
const PAPER = "#f7f3ea"
const SAND = "#d9cbb3"
const GOLD = "#9c7a44"
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

/** Only http(s) links are drawn as links; anything else would be a way to put
    `javascript:` in a client's inbox. */
const safeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : null)

export function renderText(spec: EmailSpec): string {
  const lines: string[] = []
  if (spec.greeting) lines.push(spec.greeting, "")
  for (const block of spec.blocks) {
    switch (block.kind) {
      case "p":
        lines.push(block.text)
        break
      case "rows":
        if (block.title) lines.push(block.title)
        lines.push(...block.rows.map(([label, value]) => `  ${label.padEnd(12)}${value}`))
        break
      case "lines":
        if (block.title) lines.push(block.title)
        lines.push(...block.lines.map((line) => `  ${line}`))
        break
      case "link":
        lines.push(`${block.label}:`, block.url)
        break
    }
    lines.push("")
  }
  return [...lines, ...SIGN_OFF].join("\n")
}

const cell = (style: string, html: string) => `<td style="${style}">${html}</td>`

const paragraph = (text: string) =>
  `<p style="margin:0 0 18px;font:16px/1.65 ${SERIF};color:${INK_BODY};">${escapeHtml(text)}</p>`

const caption = (title?: string) =>
  title
    ? `<p style="margin:28px 0 8px;font:12px/1.4 ${SERIF};letter-spacing:.14em;text-transform:uppercase;color:${GOLD};">${escapeHtml(title)}</p>`
    : ""

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "p":
      return paragraph(block.text)
    case "rows":
      return `${caption(block.title)}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border-top:1px solid ${GOLD};">${block.rows
        .map(
          ([label, value]) =>
            `<tr>${cell(
              `padding:10px 14px 10px 0;border-bottom:1px solid ${SAND};font:15px/1.5 ${SERIF};color:${INK_MUTED};vertical-align:top;`,
              escapeHtml(label)
            )}${cell(
              /* A figure never breaks across two lines; a long cloth name may. */
              `padding:10px 0;border-bottom:1px solid ${SAND};font:15px/1.5 ${SERIF};color:${INK};text-align:right;vertical-align:top;${value.length <= 24 ? "white-space:nowrap;" : ""}`,
              escapeHtml(value)
            )}</tr>`
        )
        .join("")}</table>`
    case "lines":
      return `${caption(block.title)}<p style="margin:0 0 18px;font:15px/1.6 ${SERIF};color:${INK_BODY};">${block.lines
        .map(escapeHtml)
        .join("<br>")}</p>`
    case "link": {
      const url = safeUrl(block.url)
      if (!url) return paragraph(`${block.label}: ${block.url}`)
      /* The button is a table cell with the colour on it, so a client that
         ignores padding on a link still draws a button. */
      return (
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0 14px;"><tr>` +
        `<td bgcolor="${INK}" style="background:${INK};border-radius:2px;">` +
        `<a href="${escapeHtml(url)}" style="display:inline-block;padding:16px 36px;font:600 13px/1.4 ${SANS};letter-spacing:.14em;text-align:center;text-transform:uppercase;text-decoration:none;color:${BONE};">${escapeHtml(block.label)}</a>` +
        `</td></tr></table>` +
        `<p style="margin:0 0 24px;font:13px/1.55 ${SERIF};color:${INK_MUTED};">If the button does not work, copy this address into your browser:<br>` +
        `<span style="word-break:break-all;color:${INK_BODY};">${escapeHtml(url)}</span></p>`
      )
    }
  }
}

/** The first paragraph, cut to what an inbox has room to show. */
const previewOf = (spec: EmailSpec) => {
  const first = spec.blocks.find((block) => block.kind === "p")
  const text = (spec.preheader ?? (first?.kind === "p" ? first.text : spec.heading)).replace(/\s+/g, " ").trim()
  return text.length > 110 ? `${text.slice(0, 109).trimEnd()}…` : text
}

export function renderHtml(spec: EmailSpec): string {
  const body = [
    spec.greeting ? paragraph(spec.greeting) : "",
    ...spec.blocks.map(renderBlock),
  ].join("")
  const [house, place] = SIGN_OFF

  /* The invisible padding after the preview keeps the mail app from filling the
     rest of the line with the first words of the body. */
  const preview =
    `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;mso-hide:all;">` +
    `${escapeHtml(previewOf(spec))}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>`

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${escapeHtml(spec.heading)}</title></head>
<body style="margin:0;padding:0;background:${BONE};">
${preview}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${BONE}" style="background:${BONE};"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" style="padding:0 0 28px;font:22px/1 ${SERIF};letter-spacing:.42em;color:${INK};">${escapeHtml(house)}</td></tr>
<tr><td bgcolor="${PAPER}" style="background:${PAPER};border:1px solid ${SAND};border-top:3px solid ${GOLD};padding:38px 32px 18px;">
<h1 style="margin:0 0 22px;font:400 28px/1.25 ${SERIF};color:${INK};">${escapeHtml(spec.heading)}</h1>
${body}
</td></tr>
<tr><td align="center" style="padding:28px 16px 0;font:13px/1.7 ${SERIF};color:${INK_MUTED};"><span style="letter-spacing:.32em;color:${INK};">${escapeHtml(house)}</span><br>${escapeHtml(place)}</td></tr>
</table></td></tr></table></body></html>`
}

/** Both renderings, in the shape the notification module wants as `content`. */
export const composeContent = (subject: string, spec: EmailSpec) => ({
  subject,
  text: renderText(spec),
  html: renderHtml(spec),
})
