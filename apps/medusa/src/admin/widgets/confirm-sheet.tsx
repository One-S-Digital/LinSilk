import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Text, toast } from "@medusajs/ui"

/* On an order: confirm the client's measurement sheet. The confirmation email
   promises that nothing is cut until the atelier has read it and written back;
   this is the writing back. It stamps the order and emails the client, once —
   pressing it again changes nothing the client has already been sent. */

const ConfirmSheet = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const [confirmedAt, setConfirmedAt] = useState<string | null>(
    (order.metadata?.sheet_confirmed_at as string | undefined) ?? null
  )
  const [saving, setSaving] = useState(false)

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
