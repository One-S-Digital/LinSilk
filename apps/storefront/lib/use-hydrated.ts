import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/* False on the server and for the hydration render that has to match it; true
   on every client render after that, including the first render of anything
   mounted later. State read from localStorage waits for it, so the server
   markup and the first client paint agree. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
