/* The commission silhouettes the seed provisions.
 *
 * These are settings rather than catalogue: an opening figure the house edits
 * in the admin, and the finished lengths the commission sheet asks for. The
 * client is quoted properly once a tailor has read the brief.
 *
 * No season and no piece is written down here. The house's own pieces arrive
 * through the admin or the ingestion route and live in Medusa from then on —
 * the storefront reads them back out of the store API.
 */

export type LengthKind = "dress" | "skirt" | "trouser" | "top" | "robe"

export type Silhouette = {
  key: string
  name: string
  note: string
  /** Whole Swiss francs, tracking bench hours — a half-canvassed jacket is
      roughly forty, a shirt closer to eight. */
  estimate: number
  lengthKinds: LengthKind[]
}

export const SILHOUETTES: Silhouette[] = [
  { key: "shirt", name: "Shirt", note: "Set sleeve, one-piece collar.", estimate: 1200, lengthKinds: ["top"] },
  { key: "trouser", name: "Trouser", note: "Flat or pleated front.", estimate: 1450, lengthKinds: ["trouser"] },
  { key: "dress", name: "Dress", note: "Bias or straight cut.", estimate: 2200, lengthKinds: ["dress"] },
  { key: "jacket", name: "Jacket", note: "Half-canvassed, two button.", estimate: 3200, lengthKinds: ["top"] },
]
