import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

/* Reference images for a commission, and the cloth catalogues the house
   publishes, arrive as multipart. Files are held in memory and handed to the
   file module, which decides where they actually live.

   Because they are held in memory, the limit is set here as well as in the
   routes: a route can only weigh a file once multer has already read all of
   it, which is too late to be a limit. The figures match the ones the routes
   refuse on, so the wording a client sees is still the house's own. */
const commissionReferences = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10 },
})

const fabricCatalogue = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/commissions",
      method: "POST",
      middlewares: [commissionReferences.array("references", 10)],
    },
    {
      matcher: "/admin/fabric-catalogues",
      method: "POST",
      middlewares: [fabricCatalogue.single("file")],
    },
  ],
})
