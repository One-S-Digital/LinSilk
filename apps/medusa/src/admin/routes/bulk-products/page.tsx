import { useCallback, useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Checkbox, Container, Heading, Input, Select, Text, toast, usePrompt } from "@medusajs/ui"

/* Bulk actions the built-in product list does not have: tick products, then
   publish, set to draft, move to (or out of) a collection, or delete. All of
   it goes through Medusa's own POST /admin/products/batch. The selection is
   kept while you page and search. */

type Product = {
  id: string
  title: string
  status: string
  collection?: { id: string; title: string } | null
}

type Collection = { id: string; title: string }

const PAGE_SIZE = 50
const NO_COLLECTION = "__none__"

const api = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }
  return response.json()
}

const statusColor = (status: string) =>
  status === "published" ? "green" : status === "draft" ? "grey" : "orange"

const BulkProductsPage = () => {
  const prompt = usePrompt()
  const [products, setProducts] = useState<Product[]>([])
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [collections, setCollections] = useState<Collection[]>([])
  const [target, setTarget] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
        order: "title",
        fields: "id,title,status,collection.id,collection.title",
      })
      if (query) params.set("q", query)
      if (statusFilter !== "all") params.set("status", statusFilter)
      const data = await api(`/admin/products?${params}`)
      setProducts(data.products)
      setCount(data.count)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [offset, query, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    api("/admin/collections?limit=200&fields=id,title")
      .then((data) => setCollections(data.collections))
      .catch((error) => toast.error((error as Error).message))
  }, [])

  const pageIds = products.map((product) => product.id)
  const allOnPage = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someOnPage = pageIds.some((id) => selected.has(id))

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const togglePage = () =>
    setSelected((current) => {
      const next = new Set(current)
      pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)))
      return next
    })

  const run = async (body: object, done: string) => {
    setWorking(true)
    try {
      await api("/admin/products/batch", { method: "POST", body: JSON.stringify(body) })
      toast.success(done)
      setSelected(new Set())
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setWorking(false)
    }
  }

  const ids = [...selected]
  const n = ids.length

  const setStatus = (status: "published" | "draft") =>
    run(
      { update: ids.map((id) => ({ id, status })) },
      `${n} product${n === 1 ? "" : "s"} set to ${status}`
    )

  const moveToCollection = () => {
    if (!target) return
    const collection_id = target === NO_COLLECTION ? null : target
    run(
      { update: ids.map((id) => ({ id, collection_id })) },
      collection_id ? `${n} moved to the collection` : `${n} removed from their collection`
    )
  }

  const remove = async () => {
    const confirmed = await prompt({
      title: `Delete ${n} product${n === 1 ? "" : "s"}?`,
      description: "They are removed from the shop. This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })
    if (confirmed) await run({ delete: ids }, `${n} deleted`)
  }

  const lastPage = offset + PAGE_SIZE >= count

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Bulk products</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {n} selected · {count} products
        </Text>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setOffset(0)
            setQuery(search.trim())
          }}
        >
          <Input
            size="small"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button size="small" variant="secondary" type="submit">
            Search
          </Button>
        </form>
        <div className="w-36">
          <Select
            size="small"
            value={statusFilter}
            onValueChange={(value) => {
              setOffset(0)
              setStatusFilter(value)
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All statuses</Select.Item>
              <Select.Item value="published">Published</Select.Item>
              <Select.Item value="draft">Draft</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-ui-bg-subtle px-6 py-3">
        <Button size="small" disabled={!n || working} onClick={() => setStatus("published")}>
          Publish
        </Button>
        <Button
          size="small"
          variant="secondary"
          disabled={!n || working}
          onClick={() => setStatus("draft")}
        >
          Set to draft
        </Button>
        <div className="w-56">
          <Select size="small" value={target} onValueChange={setTarget} disabled={!n || working}>
            <Select.Trigger>
              <Select.Value placeholder="Collection…" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NO_COLLECTION}>— No collection —</Select.Item>
              {collections.map((collection) => (
                <Select.Item key={collection.id} value={collection.id}>
                  {collection.title}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Button
          size="small"
          variant="secondary"
          disabled={!n || !target || working}
          onClick={moveToCollection}
        >
          Apply collection
        </Button>
        <Button size="small" variant="danger" disabled={!n || working} onClick={remove}>
          Delete
        </Button>
        {n > 0 && (
          <Button size="small" variant="transparent" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-4 border-b px-6 py-2">
          <Checkbox
            checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
            onCheckedChange={togglePage}
          />
          <Text size="small" weight="plus">
            Select this page
          </Text>
        </div>
        {loading ? (
          <Text className="px-6 py-4 text-ui-fg-subtle">Loading…</Text>
        ) : products.length === 0 ? (
          <Text className="px-6 py-4 text-ui-fg-subtle">No products match.</Text>
        ) : (
          products.map((product) => (
            <label
              key={product.id}
              className="flex cursor-pointer items-center gap-4 border-b px-6 py-2 last:border-0 hover:bg-ui-bg-base-hover"
            >
              <Checkbox
                checked={selected.has(product.id)}
                onCheckedChange={() => toggle(product.id)}
              />
              <Text className="flex-1">{product.title}</Text>
              <Text size="small" className="w-48 truncate text-ui-fg-subtle">
                {product.collection?.title ?? "—"}
              </Text>
              <Badge size="2xsmall" color={statusColor(product.status)}>
                {product.status}
              </Badge>
              <a
                href={`/app/products/${product.id}`}
                onClick={(event) => event.stopPropagation()}
                className="text-ui-fg-interactive text-small"
              >
                Open
              </a>
            </label>
          ))
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        <Text size="small" className="text-ui-fg-subtle">
          {count === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, count)} of {count}
        </Text>
        <div className="flex gap-2">
          <Button
            size="small"
            variant="secondary"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            Previous
          </Button>
          <Button
            size="small"
            variant="secondary"
            disabled={lastPage}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            Next
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Bulk products" })

export default BulkProductsPage
