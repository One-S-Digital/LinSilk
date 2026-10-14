#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

/* The catalogue, as an agent reaches it.
 *
 * Every rule lives in the backend (apps/medusa/src/api/admin/catalogue).
 * Nothing here decides anything: it carries a call across, and carries the
 * house's own refusal back in the house's own words, because an agent that is
 * told "winter-v has 1 piece(s), none of them published" can act on it, and
 * one told "400" cannot.
 *
 * There is deliberately no tool that publishes. A piece goes live when a
 * person says so, in the admin (docs/CATALOGUE-INGESTION.md §2).
 */

const MEDUSA_URL = process.env.MEDUSA_URL ?? "http://localhost:9000"

/* The key travels with every request, so it only goes over https — plain http
   is for a backend on this machine. */
{
  const { protocol, hostname } = new URL(MEDUSA_URL)
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(hostname)
  if (protocol !== "https:" && !local) {
    console.error(`MEDUSA_URL must be https, or localhost for development (got ${MEDUSA_URL}).`)
    process.exit(1)
  }
}
const API_KEY = process.env.MEDUSA_ADMIN_API_KEY

if (!API_KEY) {
  console.error(
    "MEDUSA_ADMIN_API_KEY is not set. Make a secret API key for the agent in " +
      "the Medusa admin (Settings → API key management) and pass it in the " +
      "environment. It is the agent's own credential, not a person's."
  )
  process.exit(1)
}

/* Secret API keys authenticate over HTTP Basic, with the key as the username
   and no password — sent as a Bearer token Medusa refuses them. */
const authorization = `Basic ${Buffer.from(`${API_KEY}:`).toString("base64")}`

async function house(path: string, init: { method?: string; body?: unknown } = {}) {
  const response = await fetch(`${MEDUSA_URL}${path}`, {
    method: init.method ?? "GET",
    /* A redirect would carry the key to wherever it points. */
    redirect: "error",
    headers: {
      authorization,
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
  }).catch((error: Error) => {
    throw new Error(`The house could not be reached at ${MEDUSA_URL}: ${error.message}`)
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = (body as { message?: string } | null)?.message
    throw new Error(message ?? `The house refused that (${response.status}).`)
  }
  return body
}

/* A tool result is text an agent reads, so refusals come back as text too
   rather than as a transport error it cannot see the reason for. */
const answer = async (work: () => Promise<unknown>) => {
  try {
    return { content: [{ type: "text" as const, text: JSON.stringify(await work(), null, 2) }] }
  } catch (error) {
    return {
      content: [{ type: "text" as const, text: (error as Error).message }],
      isError: true,
    }
  }
}

const image = z.object({
  url: z.string().url().describe("A URL the house is allowed to fetch from"),
  alt: z.string().max(200).optional(),
})

const server = new McpServer({ name: "linsilk-catalogue", version: "0.0.1" })

server.registerTool(
  "list_seasons",
  {
    title: "List seasons",
    description:
      "Every season with its status — pending (not yet open, invisible to the site), " +
      "current (open and orderable) or past (archived) — and its pieces counted, " +
      "published and draft apart.",
    inputSchema: {},
  },
  () => answer(() => house("/admin/catalogue/seasons"))
)

server.registerTool(
  "list_pieces",
  {
    title: "List pieces",
    description:
      "The pieces in the catalogue, newest season first. Says which are still drafts " +
      "waiting for a person to publish them, and carries each one's photograph URLs — " +
      "the ones attach_images' remove takes.",
    inputSchema: {
      collection: z.string().optional().describe("A season's handle, to read just that one"),
    },
  },
  ({ collection }) =>
    answer(() =>
      house(
        `/admin/catalogue/pieces${collection ? `?collection=${encodeURIComponent(collection)}` : ""}`
      )
    )
)

server.registerTool(
  "upsert_piece",
  {
    title: "Add or correct a piece",
    description:
      "Adds a piece to a season, or corrects one that is already there. Keyed on the " +
      "handle, so sending the same piece twice is safe. A new piece needs title, " +
      "material, cloth, collection, group and price_chf; an existing one can be corrected a " +
      "field at a time. It arrives as a DRAFT and is invisible to the site until a " +
      "person publishes it in the admin. A published piece's price cannot be moved here.",
    inputSchema: {
      handle: z.string().describe("The piece's own id and URL, e.g. 'w4' or 'coat-sand'"),
      title: z.string().optional().describe("The piece's name. Never a colour, and never 'satin': the house sells silk and linen"),
      material: z.string().optional().describe("Cloth and construction, shown under the name"),
      cloth: z
        .enum(["silk", "linen"])
        .optional()
        .describe("Silk or linen: decides which colour swatches the client chooses from. Required for a new piece"),
      collection: z.string().optional().describe("The handle of a season that already exists"),
      group: z.enum(["women", "men"]).optional(),
      price_chf: z.number().int().optional().describe("Whole Swiss francs; euro and sterling are derived"),
      length_kinds: z
        .array(z.enum(["dress", "skirt", "trouser", "top", "robe"]))
        .optional()
        .describe("Which finished lengths the measurement sheet asks for. A scarf asks for none"),
      shot: z.string().optional().describe("Art direction, drawn as a placeholder until photographed"),
      sleep: z.boolean().optional().describe("True for sleepwear, which has its own rail"),
      run_size: z.number().int().optional().describe("The season's capped run for this piece"),
      images: z
        .array(image)
        .optional()
        .describe(
          "Photograph URLs to fetch, which become the piece's whole set — anything already " +
            "there and not repeated here is dropped. Left out, photography is untouched. To " +
            "add to what is there, or take a photograph off, use attach_images instead."
        ),
    },
  },
  (piece) => answer(() => house("/admin/catalogue/pieces", { method: "POST", body: piece }))
)

server.registerTool(
  "attach_images",
  {
    title: "Add, replace or remove photography",
    description:
      "Changes a piece's photography, one action at a time. `add` (the default) fetches " +
      "the given URLs and adds them to what the piece already carries. `replace` fetches " +
      "them and makes them the whole set, dropping anything not listed. `remove` takes " +
      "photographs off the piece — pass the piece's own URLs, as list_pieces reports them " +
      "back, not new ones to fetch. The first photograph left standing becomes the piece's " +
      "thumbnail; with none left, it has none. Until a piece has photography the site draws " +
      "a placeholder weave from its art direction, so `add` or `replace` is what replaces it.",
    inputSchema: {
      handle: z.string(),
      images: z
        .array(image)
        .min(1)
        .describe("URLs to fetch (add, replace), or the piece's own stored URLs (remove)"),
      action: z.enum(["add", "replace", "remove"]).default("add"),
    },
  },
  ({ handle, images, action }) =>
    answer(() =>
      house("/admin/catalogue/pieces", {
        method: "POST",
        body: { handle, images, images_action: action },
      })
    )
)

server.registerTool(
  "create_season",
  {
    title: "Create a season",
    description:
      "Creates a season, or corrects the wording of one that exists. A new season is " +
      "PENDING: it can be cut for, and the site shows nothing of it. Its status is " +
      "never set here — use open_season. Correcting an archived season's wording is " +
      "safe and does not reopen it.",
    inputSchema: {
      handle: z.string().describe("e.g. 'autumn-iv'"),
      title: z.string().describe("Full display title, e.g. 'Autumn — Collection IV'"),
      season: z.string().describe("The season's name on its own, e.g. 'Autumn'"),
      number: z.number().int().describe("The collection's number; the house shows it in Roman"),
      note: z.string().optional().describe("The cloth the season was built on"),
      closes: z.string().optional().describe("When it closes, e.g. 'February'"),
    },
  },
  (season) => answer(() => house("/admin/catalogue/seasons", { method: "POST", body: season }))
)

server.registerTool(
  "open_season",
  {
    title: "Open a season",
    description:
      "Opens a pending season onto the site and archives the one that was open, in the " +
      "same breath. This is the house's biggest single act: what is archived is never " +
      "made again, and what is open is what can be bought. It is refused unless the " +
      "season has at least one PUBLISHED piece. Confirm with the person before calling it.",
    inputSchema: { handle: z.string() },
  },
  ({ handle }) =>
    answer(() =>
      house(`/admin/catalogue/seasons/${encodeURIComponent(handle)}/open`, { method: "POST" })
    )
)

await server.connect(new StdioServerTransport())
