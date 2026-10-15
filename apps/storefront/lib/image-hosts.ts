/* Hosts next/image may fetch from. Product photographs live in Cloudflare R2:
   either on the bucket's public domain (S3_FILE_URL, the same value Medusa
   uses) or on an r2.dev address. Shared by next.config.ts and ShotFrame so a
   photograph from any other host falls back to a plain <img> instead of
   failing. */

const fileHost = (() => {
  try {
    return process.env.S3_FILE_URL ? new URL(process.env.S3_FILE_URL).hostname : null;
  } catch {
    return null;
  }
})();

export const IMAGE_HOSTS = [...(fileHost ? [fileHost] : []), '*.r2.dev'];

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
