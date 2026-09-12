import { defineMiddlewares } from "@medusajs/framework/http"
import multer from "multer"

/* Reference images for a commission, and the cloth catalogues the house
   publishes, arrive as multipart. Files are held in memory and handed to the
   file module, which decides where they actually live. */
const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/commissions",
      method: "POST",
      middlewares: [upload.array("references", 10)],
    },
    {
      matcher: "/admin/fabric-catalogues",
      method: "POST",
      middlewares: [upload.single("file")],
    },
  ],
})
