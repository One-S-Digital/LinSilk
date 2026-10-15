/* The house's email, drawn once. A message is described as a few blocks and
   rendered twice — as plain text, the voice every earlier mail was written in,
   and as HTML in the storefront's own colours — so the two cannot drift apart.

   Email clients ignore stylesheets and web fonts, so the HTML is a single
   centred table with inline styles and a Georgia stack standing in for the
   site's serif. The palette is the storefront's (globals.css). */

export type Block =
  | { kind: "p"; text: string }
  /** Label and value pairs: the lines of an order, its figures. */
  | { kind: "rows"; title?: string; rows: [string, string][] }
  /** Free lines, one under another: an address. */
  | { kind: "lines"; title?: string; lines: string[] }
  | { kind: "link"; label: string; url: string }

export type EmailSpec = {
  heading: string
  greeting?: string
  blocks: Block[]
}

const SIGN_OFF = ["LinSilk", "Geneva, Switzerland"]

const INK = "#2a2620"
const INK_BODY = "#4a4438"
const INK_MUTED = "#6e6555"
const BONE = "#ede6d9"
const GOLD = "#9c7a44"
const SERIF = "Georgia, 'Times New Roman', serif"

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
    ? `<p style="margin:26px 0 8px;font:12px/1.4 ${SERIF};letter-spacing:.14em;text-transform:uppercase;color:${GOLD};">${escapeHtml(title)}</p>`
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
              `padding:9px 12px 9px 0;border-bottom:1px solid #d9cbb3;font:15px/1.5 ${SERIF};color:${INK_MUTED};`,
              escapeHtml(label)
            )}${cell(
              `padding:9px 0;border-bottom:1px solid #d9cbb3;font:15px/1.5 ${SERIF};color:${INK};text-align:right;`,
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
      return url
        ? `<p style="margin:8px 0 22px;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:13px 26px;background:${INK};color:${BONE};font:14px ${SERIF};letter-spacing:.08em;text-decoration:none;">${escapeHtml(block.label)}</a></p>`
        : paragraph(`${block.label}: ${block.url}`)
    }
  }
}

export function renderHtml(spec: EmailSpec): string {
  const body = [
    spec.greeting ? paragraph(spec.greeting) : "",
    ...spec.blocks.map(renderBlock),
  ].join("")

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(spec.heading)}</title></head>
<body style="margin:0;padding:0;background:${BONE};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BONE};"><tr><td align="center" style="padding:36px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 0 22px;border-bottom:1px solid ${GOLD};font:22px ${SERIF};letter-spacing:.32em;color:${INK};">LINSILK</td></tr>
<tr><td style="padding:30px 0 6px;">
<h1 style="margin:0 0 22px;font:400 26px/1.25 ${SERIF};color:${INK};">${escapeHtml(spec.heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:22px 0 0;border-top:1px solid ${GOLD};font:13px/1.6 ${SERIF};color:${INK_MUTED};">${SIGN_OFF.map(escapeHtml).join("<br>")}</td></tr>
</table></td></tr></table></body></html>`
}

/** Both renderings, in the shape the notification module wants as `content`. */
export const composeContent = (subject: string, spec: EmailSpec) => ({
  subject,
  text: renderText(spec),
  html: renderHtml(spec),
})
