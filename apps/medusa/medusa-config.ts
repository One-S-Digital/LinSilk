import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/* Configuration comes from the environment the host provides — Render's
   environment groups in production, apps/medusa/.env in development. A .env
   file is never read in preference to a real environment variable, so the
   host always wins and no secret needs to live in the repo.
   
   What the house cannot run without is checked here rather than discovered
   at the first request. */
const inProduction = process.env.NODE_ENV === 'production'

const required = (key: string) => {
  const value = process.env[key]
  if (!value && inProduction) {
    throw new Error(
      `${key} is not set. In production it comes from the host's environment ` +
        `(on Render, the service's environment group), not from a file.`
    )
  }
  return value
}

for (const key of ['DATABASE_URL', 'JWT_SECRET', 'COOKIE_SECRET', 'STORE_CORS', 'ADMIN_CORS', 'AUTH_CORS']) {
  required(key)
}

/* Server and worker are separate processes in production, so the event bus,
   the workflow engine and the lock they share have to live outside either of
   them. Without Redis, Medusa keeps all three in memory — fine for one
   process on a laptop, silently wrong for two on Render. */
const redisUrl = process.env.REDIS_URL
if (!redisUrl && inProduction) {
  throw new Error(
    'REDIS_URL is not set. The server and the worker share an event bus, a ' +
      'workflow engine and a lock through it; in memory, each process would keep its own.'
  )
}

const redisModules = redisUrl
  ? [
      { resolve: '@medusajs/medusa/event-bus-redis', options: { redisUrl } },
      { resolve: '@medusajs/medusa/workflow-engine-redis', options: { redis: { redisUrl } } },
      { resolve: '@medusajs/medusa/cache-redis', options: { redisUrl } },
      { resolve: '@medusajs/medusa/locking', options: { providers: [
        { resolve: '@medusajs/medusa/locking-redis', id: 'redis', is_default: true, options: { redisUrl } },
      ] } },
    ]
  : []

/* Files: cloth catalogues the house publishes, and the reference images a
   client attaches to a commission. Those references are the client's own
   property and are stored privately; catalogues are public.

   Development writes to ./static. Production uses object storage — anything
   with an S3 API, Cloudflare R2 by default (see docs/BACKEND-RENDER.md §8.5).
   Render's disks do not survive a deploy, so this is not optional there.

   Two buckets, because R2 cannot make one object in a bucket private while
   another is public: S3_BUCKET may be given a public domain, S3_PRIVATE_BUCKET
   never is (src/modules/split-s3). */
const fileProviders = process.env.S3_BUCKET
  ? [
      {
        resolve: './src/modules/split-s3',
        id: 's3',
        options: {
          file_url: process.env.S3_FILE_URL,
          access_key_id: process.env.S3_ACCESS_KEY_ID,
          secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
          region: process.env.S3_REGION || 'auto',
          bucket: process.env.S3_BUCKET,
          private_bucket: process.env.S3_PRIVATE_BUCKET,
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
          payment_description: 'LinSilk',
        },
      },
    ]
  : []

module.exports = defineConfig({
  /* Roles. Every admin route checks what the caller's role allows, rather than
     any signed-in person or key being allowed everything. Set here rather
     than in the environment so no deploy can come up without it. The house's
     own routes declare their permissions in src/policies and
     src/api/middlewares.ts; docs/BACKEND-RENDER.md §8.6 has the model. */
  featureFlags: { rbac: true },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as 'server' | 'worker' | 'shared') || 'shared',
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    /* The role module, named explicitly. defineConfig decides its default
       modules while this file is still being evaluated — before the
       `featureFlags` above are registered — so left to the default list it
       stays disabled while the routes check roles anyway, and every admin
       request is refused. */
    { resolve: '@medusajs/medusa/rbac' },
    ...redisModules,
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
