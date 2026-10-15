import type { NextConfig } from "next";
import { IMAGE_HOSTS } from "./lib/image-hosts";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
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
