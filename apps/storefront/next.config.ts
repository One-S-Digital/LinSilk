import type { NextConfig } from "next";
import { FILE_HOST, IMAGE_HOSTS } from "./lib/image-hosts";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  /* S3_FILE_URL is server-only; the bundle needs the host to match the server. */
  env: { NEXT_PUBLIC_FILE_HOST: FILE_HOST ?? '' },
  /* The storefront shares a 512 MB Render instance with Payload's admin, and
     this process resizes every product photograph on first request. WebP only:
     AVIF took ~4x longer to encode and came out larger in a measured test, and
     on that instance it overran the 7 s optimiser timeout and memory limit.
     One resize at a time, nothing held in libvips' operation cache, and the
     result kept for a month so a photograph is encoded once, not per visit. */
  experimental: {
    imgOptConcurrency: 1,
    imgOptOperationCache: false,
    imgOptSequentialRead: true,
  },
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1080, 1200, 1920],
    remotePatterns: IMAGE_HOSTS.map((h) => ({
      protocol: 'https' as const,
      hostname: h.startsWith('*.') ? `**.${h.slice(2)}` : h,
    })),
  },
  async headers() {
    return [
      {
        source: '/:dir(images|brand|measure|swatches)/:file*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};

export default withPayload(nextConfig);
