import { useEffect, useMemo, useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"
import menGuide from "../assets/men.png"
import womenGuide from "../assets/women.png"
import { BODY_ZONES, LENGTH_ZONES } from "../../lib/measurements"

/* On an order: confirm the client's measurement sheet. The confirmation email
   promises that nothing is cut until the atelier has read it and written back;
   this is the writing back. It stamps the order and emails the client, once —
   pressing it again changes nothing the client has already been sent. */

/* The sheet itself, read from each line item's `measure_<key>_cm` metadata
   (centimetres, always) and laid out in the order the bench reads it. Export
   is plain text first — it pastes into WhatsApp or an email as it is — with
   CSV and a printable page (save as PDF) for the file. */

type SheetItem = {
  title: string
  group: "women" | "men"
  rows: { label: string; cm: string }[]
}

type OrderForSheet = {
  display_id?: number
  created_at?: string
  email?: string | null
  shipping_address?: { first_name?: string | null; last_name?: string | null; phone?: string | null } | null
  items?: { product_id?: string | null; title?: string; product_title?: string; variant_title?: string; metadata?: Record<string, unknown> | null }[]
}

const ZONES = [...BODY_ZONES, ...Object.values(LENGTH_ZONES)]

const readSheet = (order: OrderForSheet, groups: Record<string, string>): SheetItem[] =>
  (order.items ?? [])
    .map((item) => {
      const metadata = item.metadata ?? {}
      const known = ZONES.filter((zone) => metadata[`measure_${zone.key}_cm`] != null)
      const knownKeys = new Set(known.map((zone) => `measure_${zone.key}_cm`))
      const extra = Object.keys(metadata)
        .filter((key) => /^measure_.+_cm$/.test(key) && !knownKeys.has(key))
        .map((key) => ({ key, label: key.replace(/^measure_|_cm$/g, "") }))
      return {
        title: item.product_title ?? item.title ?? "Piece",
        group: (item.product_id && groups[item.product_id] === "men" ? "men" : "women") as SheetItem["group"],
        rows: [...known, ...extra].map((zone) => ({
          label: zone.label,
          cm: String(metadata[`measure_${zone.key}_cm`]),
        })),
      }
    })
    .filter((item) => item.rows.length > 0)

const clientName = (order: OrderForSheet) =>
  [order.shipping_address?.first_name, order.shipping_address?.last_name].filter(Boolean).join(" ")

const sheetText = (order: OrderForSheet, sheet: SheetItem[]) =>
  [
    `LINSILK measurement sheet, order #${order.display_id ?? ""}`,
    ...(clientName(order) ? [`Client: ${clientName(order)}`] : []),
    "All measurements in centimetres.",
    ...sheet.flatMap((item) => ["", item.title, ...item.rows.map((r) => `${r.label}: ${r.cm} cm`)]),
  ].join("\n")

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`

const sheetCsv = (sheet: SheetItem[]) =>
  ["Piece,Measurement,Centimetres", ...sheet.flatMap((i) => i.rows.map((r) => [i.title, r.label, r.cm].map(csvCell).join(",")))].join("\n")

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const printPage = (order: OrderForSheet, sheet: SheetItem[]) => {
  const win = window.open("", "_blank")
  if (!win) {
    toast.error("Pop-up blocked", { description: "Allow pop-ups for this page to print the sheet." })
    return
  }
  const body = sheet
    .map(
      (item) =>
        `<h2>${escapeHtml(item.title)}</h2><table>${item.rows
          .map((r) => `<tr><td>${escapeHtml(r.label)}</td><td>${escapeHtml(r.cm)} cm</td></tr>`)
          .join("")}</table>`
    )
    .join("")
  win.document.write(
    `<!doctype html><title>Measurement sheet #${order.display_id ?? ""}</title>
<style>body{font:14px Georgia,serif;margin:40px;color:#111}h1{font-size:20px;margin:0}p{color:#555}
h2{font-size:15px;margin:24px 0 6px}table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ddd;padding:6px 0}
td+td{text-align:right}</style>
<h1>LINSILK measurement sheet, order #${order.display_id ?? ""}</h1>
<p>${escapeHtml(clientName(order))}${clientName(order) ? " · " : ""}All measurements in centimetres.</p>${body}`
  )
  win.document.close()
  win.focus()
  win.print()
}

const download = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/* The image form: the same guide plate the client measured from, with the
   sheet written beside it, one picture per piece. Drawn in the browser. */
const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const drawForm = async (order: OrderForSheet, item: SheetItem): Promise<Blob> => {
  const W = 1600
  const H = 1230
  const ink = "#1c1a16"
  const mute = "#786c64"
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!
  const serif = (size: number, style = "") => `${style} ${size}px Georgia, "Times New Roman", serif`.trim()
  const text = (value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = "left") => {
    ctx.font = font
    ctx.fillStyle = color
    ctx.textAlign = align
    ctx.textBaseline = "middle"
    ctx.fillText(value, x, y)
  }
  const rule = (y: number, color: string, width: number) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(60, y)
    ctx.lineTo(W - 60, y)
    ctx.stroke()
  }

  ctx.fillStyle = "#f4eee2"
  ctx.fillRect(0, 0, W, H)
  text("LINSILK", 60, 72, serif(44, "bold"), ink)
  text("Measurement sheet", 60, 120, serif(26, "italic"), mute)
  text(`Order #${order.display_id ?? ""}`, W - 60, 72, serif(30, "bold"), ink, "right")
  if (clientName(order)) text(`Client: ${clientName(order)}`, W - 60, 114, serif(24), mute, "right")
  if (order.created_at) {
    text(
      `Placed ${new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
      W - 60, 148, serif(24), mute, "right"
    )
  }
  rule(180, ink, 2)
  text(item.title, 60, 218, serif(32, "bold"), ink)
  text("All measurements in centimetres", 60, 256, serif(22, "italic"), mute)

  const plate = await loadImage(item.group === "men" ? menGuide : womenGuide)
  const plateH = 800
  const plateW = Math.round((plate.width * plateH) / plate.height)
  ctx.drawImage(plate, 60, 290, plateW, plateH)

  const x0 = 60 + plateW + 60
  const x1 = W - 60
  const rowH = Math.min(50, plateH / item.rows.length)
  item.rows.forEach((row, i) => {
    const y = 290 + i * rowH
    text(row.label, x0, y + rowH / 2, serif(26), ink)
    text(`${row.cm} cm`, x1, y + rowH / 2, serif(28, "bold"), ink, "right")
    ctx.strokeStyle = "#d2c8b8"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x0, y + rowH)
    ctx.lineTo(x1, y + rowH)
    ctx.stroke()
  })

  rule(1150, "#d2c8b8", 1)
  text("Nothing is cut until the atelier has confirmed this sheet in writing.", 60, 1180, serif(20, "italic"), mute)

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not draw the image"))), "image/png")
  )
}

const saveBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const ConfirmSheet = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [confirmedAt, setConfirmedAt] = useState<string | null>(
    (order.metadata?.sheet_confirmed_at as string | undefined) ?? null
  )
  const [saving, setSaving] = useState(false)
  const [full, setFull] = useState<OrderForSheet | null>(null)
  const [groups, setGroups] = useState<Record<string, string>>({})

  /* The order a widget is handed carries no line-item metadata, so the sheet
     is fetched with it asked for. */
  useEffect(() => {
    fetch(
      `/admin/orders/${order.id}?fields=display_id,created_at,email,+items.metadata,+items.product_id,+items.product_title,+shipping_address.first_name,+shipping_address.last_name,+shipping_address.phone`,
      { credentials: "include" }
    )
      .then((response) => (response.ok ? response.json() : null))
      .then(async (body) => {
        if (!body) return
        setFull(body.order)
        /* Menswear or womenswear picks the guide plate; it lives on the product. */
        const ids = [...new Set((body.order.items ?? []).map((i: { product_id?: string }) => i.product_id).filter(Boolean))] as string[]
        const found = await Promise.all(
          ids.map((id) =>
            fetch(`/admin/products/${id}?fields=id,metadata`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : null))
              .then((b) => [id, b?.product?.metadata?.group as string | undefined] as const)
              .catch(() => [id, undefined] as const)
          )
        )
        setGroups(Object.fromEntries(found.filter(([, g]) => g)) as Record<string, string>)
      })
      .catch(() => null)
  }, [order.id])

  const sheet = useMemo(() => (full ? readSheet(full, groups) : []), [full, groups])
  const text = full ? sheetText(full, sheet) : ""
  const phone = full?.shipping_address?.phone?.replace(/[^\d]/g, "")

  const downloadImages = async () => {
    if (!full) return
    try {
      for (const [index, item] of sheet.entries()) {
        const suffix = sheet.length > 1 ? `-${index + 1}` : ""
        saveBlob(`measurement-sheet-order-${full.display_id ?? order.id}${suffix}.png`, await drawForm(full, item))
      }
    } catch (error) {
      toast.error("Could not make the image", { description: (error as Error).message })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied", { description: "Paste it into WhatsApp or an email." })
    } catch {
      toast.error("Could not copy", { description: "Select the text and copy it by hand." })
    }
  }

  const confirm = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/admin/orders/${order.id}/confirm-sheet`, {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message ?? `Request failed (${response.status})`)
      }
      const body = await response.json()
      setConfirmedAt(body.confirmed_at)
      toast.success("Sheet confirmed", { description: "The client has been told by email." })
    } catch (error) {
      toast.error("Not confirmed", { description: (error as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Measurement sheet</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          {confirmedAt
            ? `Confirmed on ${new Date(confirmedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}. The client has been told.`
            : "Once you have read the sheet and it is right, confirm it. The client is told by email that the pattern can be drawn. Not for commissions, which have their own sheet."}
        </Text>
      </div>
      {full && sheet.length === 0 && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            No measurements on this order.
          </Text>
        </div>
      )}
      {sheet.length > 0 && (
        <div className="flex flex-col gap-4 px-6 py-4">
          {sheet.map((item, index) => (
            <div key={index}>
              <Text size="small" weight="plus" className="mb-1">
                {item.title}
              </Text>
              {item.rows.map((row) => (
                <div key={row.label} className="flex justify-between border-b py-1">
                  <Text size="small">{row.label}</Text>
                  <Text size="small" weight="plus">
                    {row.cm} cm
                  </Text>
                </div>
              ))}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={copy}>
              Copy
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() =>
                window.open(`https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`, "_blank", "noopener")
              }
            >
              WhatsApp
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                window.location.href = `mailto:${full?.email ?? ""}?subject=${encodeURIComponent(
                  `Your LINSILK measurement sheet, order #${full?.display_id ?? ""}`
                )}&body=${encodeURIComponent(text)}`
              }}
            >
              Email
            </Button>
            <Button size="small" variant="secondary" onClick={downloadImages}>
              Download image
            </Button>
            <Button size="small" variant="secondary" onClick={() => full && printPage(full, sheet)}>
              Print / PDF
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => download(`measurements-order-${full?.display_id ?? order.id}.csv`, sheetCsv(sheet), "text/csv")}
            >
              CSV
            </Button>
          </div>
        </div>
      )}
      {!confirmedAt && (
        <div className="px-6 py-4">
          <Button onClick={confirm} isLoading={saving} disabled={order.status === "canceled"}>
            Confirm sheet and tell the client
          </Button>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default ConfirmSheet
