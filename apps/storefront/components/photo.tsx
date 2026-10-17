'use client';

import Image, { type ImageProps } from 'next/image';
import { cloudflareLoader, onCloudflare } from '@/lib/image-hosts';

/* next/image, except that a bucket photograph is resized by Cloudflare when
   that is switched on (lib/image-hosts.ts). A loader is a function, so it has
   to be chosen here, in a client component, not passed down from a server one. */
export function Photo({ src, ...props }: Omit<ImageProps, 'loader'> & { src: string }) {
  return <Image src={src} loader={onCloudflare(src) ? cloudflareLoader : undefined} {...props} />;
}
