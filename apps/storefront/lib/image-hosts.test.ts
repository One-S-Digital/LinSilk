import { afterEach, describe, expect, it, vi } from 'vitest';

async function load(env: Record<string, string>) {
  vi.resetModules();
  vi.unstubAllEnvs();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import('./image-hosts');
}

afterEach(() => vi.unstubAllEnvs());

const photo = 'https://files.example.com/products/a%20b.jpg';

describe('image hosts', () => {
  it('reads the host from S3_FILE_URL on the server', async () => {
    const m = await load({ S3_FILE_URL: 'https://files.example.com' });
    expect(m.FILE_HOST).toBe('files.example.com');
    expect(m.canOptimise(photo)).toBe(true);
    expect(m.canOptimise('https://elsewhere.test/a.jpg')).toBe(false);
  });

  it('reads the host the bundle was given when S3_FILE_URL is absent (browser)', async () => {
    const m = await load({ S3_FILE_URL: '', NEXT_PUBLIC_FILE_HOST: 'files.example.com' });
    expect(m.canOptimise(photo)).toBe(true);
  });

  it('keeps the Cloudflare route off until it is switched on', async () => {
    const m = await load({ S3_FILE_URL: 'https://files.example.com' });
    expect(m.onCloudflare(photo)).toBe(false);
  });

  it('uses Cloudflare only for the bucket host once switched on', async () => {
    const m = await load({ S3_FILE_URL: 'https://files.example.com', NEXT_PUBLIC_CF_IMAGES: '1' });
    expect(m.onCloudflare(photo)).toBe(true);
    expect(m.onCloudflare('https://abc.r2.dev/a.jpg')).toBe(false);
    expect(m.onCloudflare('/images/door-men.webp')).toBe(false);
  });

  it('builds a Cloudflare resize URL that keeps the object path', async () => {
    const m = await load({});
    expect(m.cloudflareLoader({ src: photo, width: 828 })).toBe(
      'https://files.example.com/cdn-cgi/image/width=828,quality=75,fit=scale-down,format=auto/products/a%20b.jpg',
    );
    expect(m.cloudflareLoader({ src: photo, width: 640, quality: 60 })).toContain('width=640,quality=60,');
  });
});
