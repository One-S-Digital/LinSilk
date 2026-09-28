import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import SplitS3FileService from "./service"

export default ModuleProvider(Modules.FILE, {
  services: [SplitS3FileService],
})
