import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui"

/* Change your own password, on the profile page. Medusa's profile has no form
   for it. The checks here only save a round trip; the server makes them again. */

const MIN_LENGTH = 12

const ChangePassword = () => {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const mistake =
    next.length > 0 && next.length < MIN_LENGTH
      ? `At least ${MIN_LENGTH} characters.`
      : confirm.length > 0 && confirm !== next
        ? "The two new passwords do not match."
        : null

  const ready = current.length > 0 && next.length >= MIN_LENGTH && confirm === next && !saving

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!ready) return
    setSaving(true)
    setProblem(null)
    try {
      const response = await fetch("/admin/account/password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: current, new_password: next }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.message ?? `Request failed (${response.status})`)
      }
      setCurrent("")
      setNext("")
      setConfirm("")
      toast.success("Password changed", {
        description: "Use the new one the next time you sign in.",
      })
    } catch (error) {
      setProblem((error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Password</Heading>
        <Text size="small" className="text-ui-fg-subtle mt-1">
          Change the password you sign in with.
        </Text>
      </div>

      <form onSubmit={submit} className="flex max-w-md flex-col gap-4 px-6 py-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="current-password" size="small">Current password</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value)
              setProblem(null)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="new-password" size="small">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value)
              setProblem(null)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="confirm-password" size="small">Repeat the new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value)
              setProblem(null)
            }}
          />
        </div>

        {(mistake || problem) && (
          <Text size="small" className="text-ui-fg-error">{problem ?? mistake}</Text>
        )}

        <div>
          <Button type="submit" disabled={!ready} isLoading={saving}>
            Change password
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "profile.details.after",
})

export default ChangePassword
