import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Table, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

/* The queue the bench works from: every brief waiting on a price, newest
   first. A commission is quoted by a person, so this list is the whole of the
   automation — it puts the brief in front of one. */

type Commission = {
  id: string
  status: string
  name: string
  email: string
  silhouette_title: string
  fabric: string
  estimate_amount: number | null
  quote_amount: number | null
  currency_code: string
  created_at: string
}

const TONE: Record<string, "green" | "orange" | "grey" | "blue" | "red"> = {
  submitted: "orange",
  reviewed: "blue",
  quoted: "blue",
  approved: "green",
  in_production: "green",
  shipped: "grey",
  declined: "red",
}

const money = (amount: number | null, currency: string) =>
  amount === null ? "—" : `${currency.toUpperCase()} ${Number(amount).toLocaleString("de-CH")}`

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/admin/commissions", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`)
        return response.json()
      })
      .then((body) => setCommissions(body.commissions))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Commissions</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          Briefs waiting on a price. Nothing is charged until the client agrees the
          figure a tailor sets.
        </Text>
      </div>

      <div className="px-6 py-4">
        {loading && <Text size="small">Reading the queue…</Text>}
        {error && <Text size="small">{error}</Text>}
        {!loading && !error && commissions.length === 0 && (
          <Text size="small" className="text-ui-fg-subtle">
            No commissions yet.
          </Text>
        )}
        {commissions.length > 0 && (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Client</Table.HeaderCell>
                <Table.HeaderCell>Silhouette</Table.HeaderCell>
                <Table.HeaderCell>Cloth</Table.HeaderCell>
                <Table.HeaderCell>Shown as</Table.HeaderCell>
                <Table.HeaderCell>Quoted</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {commissions.map((commission) => (
                <Table.Row key={commission.id}>
                  <Table.Cell>
                    <Link to={`/commissions/${commission.id}`}>
                      <Text weight="plus">{commission.name}</Text>
                    </Link>
                    <Text size="small" className="text-ui-fg-subtle">
                      {commission.email}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>{commission.silhouette_title}</Table.Cell>
                  <Table.Cell className="max-w-64 truncate">{commission.fabric}</Table.Cell>
                  <Table.Cell>
                    {money(commission.estimate_amount, commission.currency_code)}
                  </Table.Cell>
                  <Table.Cell>
                    {money(commission.quote_amount, commission.currency_code)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge size="2xsmall" color={TONE[commission.status] ?? "grey"}>
                      {commission.status.replace("_", " ")}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Commissions" })

export default CommissionsPage
