import { useEffect, useRef, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Input, Text, Textarea, toast } from "@medusajs/ui"

/* The cloth catalogues Design Your Own shows. Upload a PDF or a plate, give
   it a title, and the client reads it before writing down the cloth they
   want. Unpublished catalogues stay here and are not shown to anyone. */

type Catalogue = {
  id: string
  title: string
  description: string | null
  url: string
  mime_type: string
  size: number | null
  rank: number
  published: boolean
}

const readableSize = (bytes: number | null) =>
  bytes ? `${(bytes / 1048576).toFixed(1)} MB` : "—"

const api = async (path: string, init?: RequestInit) => {
  const response = await fetch(path, { credentials: "include", ...init })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? `Request failed (${response.status})`)
  }
  return response.json()
}

const FabricCataloguesPage = () => {
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const { fabric_catalogues } = await api("/admin/fabric-catalogues")
      setCatalogues(fabric_catalogues)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const upload = async () => {
    const file = fileInput.current?.files?.[0]
    if (!file) {
      toast.error("Choose a PDF or an image first.")
      return
    }

    setUploading(true)
    const form = new FormData()
    form.set("file", file)
    if (title.trim()) form.set("title", title.trim())
    if (description.trim()) form.set("description", description.trim())
    form.set("rank", String(catalogues.length))

    try {
      await api("/admin/fabric-catalogues", { method: "POST", body: form })
      toast.success("Catalogue published")
      setTitle("")
      setDescription("")
      if (fileInput.current) fileInput.current.value = ""
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const setPublished = async (catalogue: Catalogue, published: boolean) => {
    try {
      await api(`/admin/fabric-catalogues/${catalogue.id}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ published }),
      })
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const remove = async (catalogue: Catalogue) => {
    if (!window.confirm(`Delete "${catalogue.title}"? The file goes with it.`)) return
    try {
      await api(`/admin/fabric-catalogues/${catalogue.id}`, { method: "DELETE" })
      toast.success("Catalogue deleted")
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Cloth catalogues</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          What a client reads on Design Your Own before naming the cloth they want. PDFs
          and images, largest 50 MB.
        </Text>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4">
        <Input
          placeholder="Title — Autumn silks"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="A line about what is in it — for example, silk in plain, jacquard and brocade weaves."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" ref={fileInput} accept="application/pdf,image/*" />
        <div>
          <Button onClick={upload} isLoading={uploading}>
            Publish catalogue
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="small">Reading the shelf…</Text>
        ) : catalogues.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            Nothing published yet. Until a catalogue is here, Design Your Own asks the
            client to write the cloth from memory.
          </Text>
        ) : (
          <div className="flex flex-col gap-3">
            {catalogues.map((catalogue) => (
              <div
                key={catalogue.id}
                className="flex items-start justify-between gap-4 border-b pb-3 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <a href={catalogue.url} target="_blank" rel="noopener noreferrer">
                      <Text weight="plus">{catalogue.title}</Text>
                    </a>
                    <Badge size="2xsmall" color={catalogue.published ? "green" : "grey"}>
                      {catalogue.published ? "published" : "hidden"}
                    </Badge>
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {catalogue.description || "No description"} · {catalogue.mime_type} ·{" "}
                    {readableSize(catalogue.size)}
                  </Text>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => setPublished(catalogue, !catalogue.published)}
                  >
                    {catalogue.published ? "Hide" : "Publish"}
                  </Button>
                  <Button size="small" variant="danger" onClick={() => remove(catalogue)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Cloth catalogues" })

export default FabricCataloguesPage
