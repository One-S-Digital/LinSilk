import { useCallback, useEffect, useState } from "react"
import { Badge, Button, Container, Heading, Input, Text, Textarea, toast } from "@medusajs/ui"
import { useParams } from "react-router-dom"
import { BODY_ZONES, LENGTH_ZONES } from "../../../../lib/measurements"

/* One brief, as the bench reads it: the shape, the cloth in the client's own
   words, the note, the references, and the measurement sheet in both
   languages — the Vietnamese terms are what is written on the ticket in
   Hội An.

   Setting a figure and telling the client are two acts: quote first, then
   send, so a tailor can write by hand instead if the brief needs it. */

type Reference = { id: string; filename: string; mime_type: string; url: string | null }

type Commission = {
  id: string
  status: string
  name: string
  email: string
  silhouette_title: string
  fabric: string
  note: string | null
  measurements: Record<string, string | number>
  measurement_unit: string
  length_kinds: string[] | null
  references: Reference[] | null
  estimate_amount: number | null
  quote_amount: number | null
  currency_code: string
  internal_note: string | null
  created_at: string
}

const money = (amount: number | null, currency: string) =>
  amount === null ? "—" : `${currency.toUpperCase()} ${Number(amount).toLocaleString("de-CH")}`

const api = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, { credentials: "include", ...init })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }
  return response.json()
}

const CommissionPage = () => {
  const { id } = useParams()
  const [commission, setCommission] = useState<Commission | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [quote, setQuote] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      const { commission } = await api(`/admin/commissions/${id}`)
      setCommission(commission)
      setQuote(commission.quote_amount ? String(commission.quote_amount) : "")
      setInternalNote(commission.internal_note ?? "")
    } catch (e) {
      setError((e as Error).message)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const save = async (notify: boolean) => {
    const amount = Number(quote)
    if (notify && !(amount > 0)) {
      toast.error("Set a figure before telling the client.")
      return
    }

    setSaving(true)
    try {
      await api(`/admin/commissions/${id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(amount > 0 ? { quote_amount: amount } : {}),
          internal_note: internalNote.trim() || null,
          notify,
        }),
      })
      toast.success(notify ? "The client has the figure" : "Saved")
      await load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <Container className="p-6">
        <Text>{error}</Text>
      </Container>
    )
  }

  if (!commission) {
    return (
      <Container className="p-6">
        <Text size="small">Reading the brief…</Text>
      </Container>
    )
  }

  const zones = [
    ...BODY_ZONES,
    ...(commission.length_kinds ?? []).map((kind) => LENGTH_ZONES[kind]).filter(Boolean),
  ]

  return (
    <div className="flex flex-col gap-3">
      <Container className="divide-y p-0">
        <div className="flex items-start justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">
              {commission.silhouette_title} for {commission.name}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              <a href={`mailto:${commission.email}`}>{commission.email}</a> ·{" "}
              {new Date(commission.created_at).toLocaleDateString("en-CH")}
            </Text>
          </div>
          <Badge size="2xsmall">{commission.status.replace("_", " ")}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Cloth, in the client's words
            </Text>
            <Text>{commission.fabric}</Text>
          </div>
          <div>
            <Text size="small" className="text-ui-fg-subtle">
              Shown as
            </Text>
            <Text>{money(commission.estimate_amount, commission.currency_code)}</Text>
          </div>
        </div>

        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            Their note
          </Text>
          <Text className="whitespace-pre-wrap">{commission.note || "No note written."}</Text>
        </div>

        {commission.references && commission.references.length > 0 && (
          <div className="px-6 py-4">
            <Text size="small" className="text-ui-fg-subtle">
              References
            </Text>
            <div className="mt-2 flex flex-col gap-1">
              {commission.references.map((file) => (
                <a
                  key={file.id}
                  href={file.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Text size="small">{file.filename}</Text>
                </a>
              ))}
            </div>
          </div>
        )}
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Measurement sheet</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Centimetres, always. The client was reading {commission.measurement_unit}.
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-x-8 px-6 py-4">
          {zones.map((zone) => (
            <div key={zone.key} className="flex justify-between border-b py-1.5">
              <Text size="small">
                {zone.label}{" "}
                <span className="text-ui-fg-muted" lang="vi">
                  {zone.vi}
                </span>
              </Text>
              <Text size="small" weight="plus">
                {commission.measurements?.[zone.key] ?? "—"} cm
              </Text>
            </div>
          ))}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">The price</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            What the bench reckons this takes. Saving records it; sending writes to the
            client, who agrees it before anything is cut.
          </Text>
        </div>
        <div className="flex flex-col gap-3 px-6 py-4">
          <Input
            type="number"
            min={0}
            placeholder={`Figure in ${commission.currency_code.toUpperCase()}`}
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
          <Textarea
            placeholder="A note for the house — never shown to the client."
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => save(false)} isLoading={saving}>
              Save
            </Button>
            <Button onClick={() => save(true)} isLoading={saving}>
              Save and send the figure
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default CommissionPage
