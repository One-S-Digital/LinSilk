import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/* A piece was created or edited: the storefront is asked to announce its
   page to search engines through IndexNow (apps/storefront/app/api/indexnow).
   The storefront owns the public address, so only the handle is sent. Off
   unless both STOREFRONT_URL and INDEXNOW_SECRET are set, and a failure only
   means the next crawl picks the change up. */
export default async function productChangedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const base = process.env.STOREFRONT_URL?.replace(/\/$/, "")
  const secret = process.env.INDEXNOW_SECRET
  if (!base || !secret) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const { data: [product] } = await query.graph({
    entity: "product",
    fields: ["handle"],
    filters: { id: event.data.id },
  })
  if (!product?.handle) return

  try {
    await fetch(`${base}/api/indexnow`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-indexnow-secret": secret },
      body: JSON.stringify({ handles: [product.handle] }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (error) {
    logger.warn(`IndexNow: could not reach the storefront for ${product.handle}: ${(error as Error).message}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated"],
}
