/* A small limit on wrong guesses: after `max` failures inside `windowMs`, a key
   is locked until the window that began with the first one has passed. Held in
   this process's memory, so it holds one server to account, and a restart
   clears it — enough to stop someone at an open browser from guessing a
   password at speed, which is what it is for. */

export function createAttemptLimit({
  max = 5,
  windowMs = 15 * 60 * 1000,
  now = () => Date.now(),
}: { max?: number; windowMs?: number; now?: () => number } = {}) {
  const failures = new Map<string, { count: number; since: number }>()

  const live = (key: string) => {
    const entry = failures.get(key)
    if (entry && now() - entry.since >= windowMs) {
      failures.delete(key)
      return undefined
    }
    return entry
  }

  return {
    /** Seconds until this key may try again; 0 when it may try now. */
    waitSeconds(key: string) {
      const entry = live(key)
      return entry && entry.count >= max ? Math.ceil((entry.since + windowMs - now()) / 1000) : 0
    },
    fail(key: string) {
      const entry = live(key)
      failures.set(key, { count: (entry?.count ?? 0) + 1, since: entry?.since ?? now() })
    },
    clear(key: string) {
      failures.delete(key)
    },
  }
}
