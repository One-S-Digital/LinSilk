'use client';

/* Lenis smooth scrolling.
 *
 * The whole site is built on scroll-linked motion — parallax frames, the hero
 * settle, rules drawing in — and native wheel stepping makes all of it read as
 * jitter. Lenis interpolates the scroll position so those effects resolve
 * smoothly.
 *
 * Turned off entirely under `prefers-reduced-motion`, where hijacking the
 * scroll would be actively hostile.
 */

import { ReactLenis } from 'lenis/react';
import { useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

export function SmoothScroll({ children }: { children: ReactNode }) {
  const still = useReducedMotion();

  if (still) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        // Slightly longer and softer than the default: the house reads as
        // unhurried, and the hero's 2.2s settle needs room to breathe.
        lerp: 0.09,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.6,
        // Touch devices already scroll well; smoothing them fights the OS.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
