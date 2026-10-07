import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';

/* A backend that accepts the connection and never answers is what a service
   that is still starting — or stuck — looks like from a build on Render. With
   no limit the read waits on it, every page waits on the read, and the build
   dies of Next's 60-second page limit instead of rendering what it has. */

let server: Server | undefined;

afterEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unstubAllEnvs();
  server?.closeAllConnections();
  await new Promise((done) => server?.close(done));
  server = undefined;
});

describe('medusaGet', () => {
  it('gives up on a backend that never answers and reads as unreachable', async () => {
    server = createServer(() => {
      /* Never responds. */
    });
    await new Promise<void>((done) => server!.listen(0, '127.0.0.1', done));
    vi.stubEnv(
      'NEXT_PUBLIC_MEDUSA_BACKEND_URL',
      `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    );

    /* Whatever limit the read sets, shorten it so the test does not wait out
       the real one. */
    const real = AbortSignal.timeout.bind(AbortSignal);
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => real(50));

    const { medusaGet } = await import('./medusa');
    await expect(medusaGet('/store/collections')).resolves.toBeNull();
  }, 3000);
});
