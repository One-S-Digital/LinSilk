import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"
import type { Logger, ProviderSendNotificationDTO } from "@medusajs/framework/types"
import { Resend } from "resend"

type Options = { api_key: string; from: string }
type Injected = { logger: Logger }

/* Email through Resend. Medusa ships providers for SendGrid and for writing
   to the log, but not this one, so it is a few lines of our own against the
   notification module's interface — which is the point of the interface: the
   house is not tied to the vendor.

   The caller passes a rendered subject and body as `content`; templates live
   with the code that sends them, not in a vendor's dashboard. */
class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["api_key", "from"]) {
      if (!options[key]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Resend needs a ${key} option`)
      }
    }
  }

  private client: Resend
  private options: Options
  private logger: Logger

  constructor({ logger }: Injected, options: Options) {
    super()
    this.logger = logger
    this.options = options
    this.client = new Resend(options.api_key)
  }

  async send(notification: ProviderSendNotificationDTO) {
    const subject = notification.content?.subject
    const text = notification.content?.text
    if (!subject || !text) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Notification "${notification.template}" reached Resend without a subject and body`
      )
    }

    const { data, error } = await this.client.emails.send({
      from: notification.from || this.options.from,
      to: [notification.to],
      replyTo: (notification.provider_data?.reply_to as string) || undefined,
      subject,
      text,
      html: notification.content?.html || undefined,
    })

    if (error) {
      this.logger.error(`Resend refused "${subject}" to ${notification.to}: ${error.message}`)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message)
    }

    return { id: data?.id }
  }
}

export default ResendNotificationProviderService
