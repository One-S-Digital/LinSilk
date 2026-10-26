'use client';

import { useEffect } from 'react';
import { track, type EventName } from '@/lib/analytics';

/* Fires one analytics event when it mounts. `once` names a sessionStorage key
   for events that must not repeat on a refresh (an order is one sale). */
export function TrackEvent({
  name,
  data,
  once,
}: {
  name: EventName;
  data?: Record<string, string | number>;
  once?: string;
}) {
  const payload = JSON.stringify(data ?? {});
  useEffect(() => {
    if (once) {
      try {
        if (sessionStorage.getItem(once)) return;
        sessionStorage.setItem(once, '1');
      } catch {
        /* Storage blocked: send it, a rare double count beats a lost sale. */
      }
    }
    track(name, JSON.parse(payload));
  }, [name, payload, once]);
  return null;
}
