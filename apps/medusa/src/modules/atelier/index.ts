import { Module } from "@medusajs/framework/utils"
import AtelierModuleService from "./service"

/* The house's own records, the ones commerce has no model for: commissions
   waiting on a quote, and the cloth catalogues the client reads before
   choosing. */
export const ATELIER_MODULE = "atelier"

export default Module(ATELIER_MODULE, { service: AtelierModuleService })
