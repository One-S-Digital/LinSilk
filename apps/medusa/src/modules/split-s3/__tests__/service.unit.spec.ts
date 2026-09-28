import SplitS3FileService, { PRIVATE_PREFIX } from "../service"

const OPTIONS = {
  file_url: "https://files.linsilk.test",
  access_key_id: "test-key",
  secret_access_key: "test-secret",
  region: "auto",
  bucket: "catalogue",
  private_bucket: "references",
  endpoint: "https://account.r2.cloudflarestorage.com",
}

const logger = { error: jest.fn() } as any

/* The S3 client never leaves the process: each bucket's send() is swapped
   for a recorder, so the test sees exactly which bucket every command names. */
const build = () => {
  const service = new SplitS3FileService({ logger }, OPTIONS)
  const sent: { bucket: string; input: any }[] = []
  for (const inner of [(service as any).public_, (service as any).private_]) {
    inner.client_.send = async (command: any) => {
      sent.push({ bucket: command.input.Bucket, input: command.input })
      return {}
    }
  }
  return { service, sent }
}

const file = (access: "public" | "private") => ({
  filename: "measurement-sheet.jpg",
  mimeType: "image/jpeg",
  content: Buffer.from("x").toString("base64"),
  access,
})

describe("SplitS3FileService", () => {
  it("puts a private upload in the private bucket, under the private prefix", async () => {
    const { service, sent } = build()
    const result = await service.upload(file("private"))

    expect(sent).toHaveLength(1)
    expect(sent[0].bucket).toBe("references")
    expect(result.key.startsWith(PRIVATE_PREFIX)).toBe(true)
  })

  it("puts a public upload in the public bucket, addressable at the file URL", async () => {
    const { service, sent } = build()
    const result = await service.upload(file("public"))

    expect(sent[0].bucket).toBe("catalogue")
    expect(result.key.startsWith(PRIVATE_PREFIX)).toBe(false)
    expect(result.url).toBe(`https://files.linsilk.test/${result.key}`)
  })

  it("signs a private key against the private bucket, and a public key against the public one", async () => {
    const { service } = build()
    const hidden = await service.getPresignedDownloadUrl({ fileKey: `${PRIVATE_PREFIX}sheet-01.jpg` })
    const shown = await service.getPresignedDownloadUrl({ fileKey: "gown-01.jpg" })

    expect(new URL(hidden).hostname.startsWith("references.")).toBe(true)
    expect(hidden).toContain("X-Amz-Signature")
    expect(new URL(shown).hostname.startsWith("catalogue.")).toBe(true)
  })

  it("deletes each key from the bucket that holds it", async () => {
    const { service, sent } = build()
    await service.delete([{ fileKey: `${PRIVATE_PREFIX}sheet-01.jpg` }, { fileKey: "gown-01.jpg" }])

    const keys = (bucket: string) =>
      sent
        .filter((s) => s.bucket === bucket)
        .flatMap((s) => s.input.Delete?.Objects?.map((o: any) => o.Key) ?? [s.input.Key])
    expect(keys("references")).toEqual([`${PRIVATE_PREFIX}sheet-01.jpg`])
    expect(keys("catalogue")).toEqual(["gown-01.jpg"])
  })

  it("refuses to start without a private bucket, or with the public one reused", () => {
    const { private_bucket, ...rest } = OPTIONS
    expect(() => SplitS3FileService.validateOptions(rest)).toThrow("S3_PRIVATE_BUCKET")
    expect(() =>
      SplitS3FileService.validateOptions({ ...OPTIONS, private_bucket: OPTIONS.bucket })
    ).toThrow("must differ")
  })
})
