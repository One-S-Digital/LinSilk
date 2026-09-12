import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/* Files: cloth catalogues the house publishes, and the reference images a
   client attaches to a commission. Those references are the client's own
   property and are stored privately; catalogues are public.

   Development writes to ./static. Production uses object storage — anything
   with an S3 API, Cloudflare R2 by default (see docs/BACKEND-RENDER.md §8.5).
   Render's disks do not survive a deploy, so this is not optional there. */
const fileProviders = process.env.S3_BUCKET
  ? [
      {
        resolve: '@medusajs/medusa/file-s3',
        id: 's3',
        options: {
          file_url: process.env.S3_FILE_URL,
          access_key_id: process.env.S3_ACCESS_KEY_ID,
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.S3_REGION || 'auto',
          bucket: process.env.S3_BUCKET,
          endpoint: process.env.S3_ENDPOINT,
          prefix: process.env.S3_PREFIX || '',
        },
      },
    ]
  : [{ resolve: '@medusajs/medusa/file-local', id: 'local' }]

/* Email. Without a Resend key the notification module writes to the log, so
   the house can run locally without sending anything to a real address. */
const notificationProviders = process.env.RESEND_API_KEY
  ? [
      {
        resolve: './src/modules/resend',
        id: 'resend',
        options: {
          channels: ['email'],
          api_key: process.env.RESEND_API_KEY,
          from: process.env.RESEND_FROM,
        },
      },
    ]
  : [
      {
        resolve: '@medusajs/medusa/notification-local',
        id: 'local',
        options: { channels: ['email'] },
      },
    ]

/* Payment. Card, TWINT, Apple and Google Pay and Klarna are switched on in
   the Stripe dashboard, not here: `automatic_payment_methods` asks Stripe for
   whatever that account offers for the currency and the amount, so adding a
   method later needs no deploy.

   Without a key the store falls back to Medusa's system provider, which
   authorises without charging — enough to work on checkout, never enough to
   take money. */
const paymentProviders = process.env.STRIPE_API_KEY
  ? [
      {
        resolve: '@medusajs/medusa/payment-stripe',
        id: 'stripe',
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          /* The atelier cuts to order, so the money is taken when the client
             pays rather than held and captured later. */
          capture: true,
          automatic_payment_methods: true,
          payment_description: 'Maison Ayla',
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    { resolve: './src/modules/atelier' },
    { resolve: '@medusajs/medusa/file', options: { providers: fileProviders } },
    {
      resolve: '@medusajs/medusa/notification',
      options: { providers: notificationProviders },
    },
    ...(paymentProviders.length
      ? [{ resolve: '@medusajs/medusa/payment', options: { providers: paymentProviders } }]
      : []),
  ],
})
