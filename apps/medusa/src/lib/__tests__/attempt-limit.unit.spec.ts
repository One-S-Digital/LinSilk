import { createAttemptLimit } from "../attempt-limit"

describe("createAttemptLimit", () => {
  let clock = 0
  const limit = () => createAttemptLimit({ max: 3, windowMs: 1000, now: () => clock })
  beforeEach(() => {
    clock = 0
  })

  it("lets a key try until it has failed the allowed number of times", () => {
    const l = limit()
    l.fail("a")
    l.fail("a")
    expect(l.waitSeconds("a")).toBe(0)
    l.fail("a")
    expect(l.waitSeconds("a")).toBe(1)
  })

  it("keeps one key's failures from locking another", () => {
    const l = limit()
    for (let i = 0; i < 3; i++) l.fail("a")
    expect(l.waitSeconds("b")).toBe(0)
  })

  it("lets a key back in when the window has passed", () => {
    const l = limit()
    for (let i = 0; i < 3; i++) l.fail("a")
    clock = 1000
    expect(l.waitSeconds("a")).toBe(0)
    l.fail("a")
    expect(l.waitSeconds("a")).toBe(0)
  })

  it("forgets the failures once the right password is given", () => {
    const l = limit()
    l.fail("a")
    l.fail("a")
    l.clear("a")
    l.fail("a")
    l.fail("a")
    expect(l.waitSeconds("a")).toBe(0)
  })
})
