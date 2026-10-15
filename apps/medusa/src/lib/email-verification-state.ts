import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/* Whether a customer has proved the address is theirs. Kept on the auth
   identity's app_metadata, which only the backend writes — a customer's own
   metadata is theirs to edit through the Store API, so a flag there would be
   a flag anyone could set. */

/** The secret links are signed with: the same one Medusa signs sessions with. */
export const verificationSecret = (container: MedusaContainer) =>
  container.resolve(ContainerRegistrationKeys.CONFIG_MODULE).projectConfig.http.jwtSecret as string

const KEY = "email_verified_at"

type Identity = { id: string; app_metadata?: Record<string, unknown> | null }

export const isVerifiedIdentity = (identity: Identity | null | undefined) =>
  typeof identity?.app_metadata?.[KEY] === "string"

export async function findIdentityByEmail(container: MedusaContainer, email: string) {
  const auth = container.resolve(Modules.AUTH)
  const [identity] = await auth.listAuthIdentities({
    provider_identities: { entity_id: email.toLowerCase(), provider: "emailpass" },
  })
  return identity ?? null
}

export async function markVerified(container: MedusaContainer, identity: Identity) {
  const auth = container.resolve(Modules.AUTH)
  await auth.updateAuthIdentities({
    id: identity.id,
    app_metadata: { ...(identity.app_metadata ?? {}), [KEY]: new Date().toISOString() },
  })
}

export async function isSessionVerified(container: MedusaContainer, authIdentityId: string | undefined) {
  if (!authIdentityId) return false
  const auth = container.resolve(Modules.AUTH)
  return isVerifiedIdentity(await auth.retrieveAuthIdentity(authIdentityId))
}
