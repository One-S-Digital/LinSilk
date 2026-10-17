/* Hosts next/image may fetch from. Product photographs live in Cloudflare R2:
   either on the bucket's public domain (S3_FILE_URL, the same value Medusa
   uses) or on an r2.dev address. Shared by next.config.ts and ShotFrame so a
   photograph from any other host falls back to a plain <img> instead of
   failing.

   The browser cannot read S3_FILE_URL, so next.config.ts hands the host to the
   bundle as NEXT_PUBLIC_FILE_HOST; client components (the piece gallery) then
   reach the same verdict as the server. */

export const FILE_HOST: string | null =
  process.env.NEXT_PUBLIC_FILE_HOST ||
  (() => {
    try {
      return process.env.S3_FILE_URL ? new URL(process.env.S3_FILE_URL).hostname : null;
    } catch {
      return null;
    }
  })();

export const IMAGE_HOSTS = [...(FILE_HOST ? [FILE_HOST] : []), '*.r2.dev'];

export function canOptimise(src: string): boolean {
  if (src.startsWith('/')) return true;
  try {
    const { hostname } = new URL(src);
    return IMAGE_HOSTS.some((h) =>
      h.startsWith('*.') ? hostname.endsWith(h.slice(1)) : hostname === h,
    );
  } catch {
    return false;
  }
}

/* Cloudflare Image Transformations: the bucket's own domain sits on a
   Cloudflare zone, so a photograph can be resized at the edge
   (`/cdn-cgi/image/<options>/<path>`) instead of by this Node process, which
   shares a small Render instance with Payload's admin. Off until
   NEXT_PUBLIC_CF_IMAGES=1, because the zone's Transformations must be switched
   on first; an r2.dev host is not on the zone, so it stays on /_next/image. */
const CLOUDFLARE = process.env.NEXT_PUBLIC_CF_IMAGES === '1';

export function onCloudflare(src: string): boolean {
  if (!CLOUDFLARE || !FILE_HOST) return false;
  try {
    return new URL(src).hostname === FILE_HOST;
  } catch {
    return false;
  }
}

export function cloudflareLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const { origin, pathname, search } = new URL(src);
  return `${origin}/cdn-cgi/image/width=${width},quality=${quality ?? 75},fit=scale-down,format=auto${pathname}${search}`;
}
