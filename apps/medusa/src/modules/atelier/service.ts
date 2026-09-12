import { MedusaService } from "@medusajs/framework/utils"
import { Commission } from "./models/commission"
import { FabricCatalogue } from "./models/fabric-catalogue"

class AtelierModuleService extends MedusaService({ Commission, FabricCatalogue }) {}

export default AtelierModuleService
