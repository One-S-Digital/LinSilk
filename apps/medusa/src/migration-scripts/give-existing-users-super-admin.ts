import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/* Every admin user who existed before roles were switched on becomes a Super
   Admin, so turning roles on locks nobody out of their own house.

   Medusa ships a script that does this, but it checks whether the role
   module is installed at a moment when — with the flag set in
   medusa-config.ts — it is not yet, skips itself, and is then recorded as
   done. This one does the same job and runs once, after the role module has
   loaded. A user who already holds any role is left as they are. Users
   created from now on get their role from `medusa user` or from their
   invite. */
export default async function giveExistingUsersSuperAdmin({
  container,
}: {
  container: MedusaContainer
}) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email", "rbac_roles.id"],
  })
  const roleless = (users as { id: string; email: string; rbac_roles?: unknown[] }[]).filter(
    (user) => !user.rbac_roles?.length
  )
  if (!roleless.length) {
    return
  }

  await link.create(
    roleless.map((user) => ({
      [Modules.USER]: { user_id: user.id },
      [Modules.RBAC]: { rbac_role_id: "role_super_admin" },
    }))
  )
  logger.info(`Super Admin given to ${roleless.map((user) => user.email).join(", ")}.`)
}
