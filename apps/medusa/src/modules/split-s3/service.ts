import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import type { FileTypes, Logger, S3FileServiceOptions } from "@medusajs/framework/types"
import S3Provider from "@medusajs/medusa/file-s3"

type Options = S3FileServiceOptions & { private_bucket: string }
type Injected = { logger: Logger }
type S3 = AbstractFileProviderService & {
  getPresignedUploadUrl(
    file: FileTypes.ProviderGetPresignedUploadUrlDTO
  ): Promise<FileTypes.ProviderFileResultDTO>
}

const S3FileService = S3Provider.services[0] as new (
  deps: Injected,
  options: S3FileServiceOptions
) => S3

/* Every key in the private bucket starts with this, so a file's id — which
   Medusa's file module passes back to the provider as its key — is enough to
   say which bucket it lives in. */
export const PRIVATE_PREFIX = "private/"

/* Two buckets behind one provider. R2 has no per-object ACL: once a bucket
   has a public domain, every object in it is public, whatever the upload
   asked for. So catalogues and photography go to a bucket that can be
   public, and commission references — measurement sheets, photographs of
   the client — go to one that never has a domain, read back only through
   the signed links the admin mints per view.

   Medusa's file module takes exactly one provider, hence the wrapper: the
   stock S3 service does the work, twice, and this only routes. */
class SplitS3FileService extends AbstractFileProviderService {
  static identifier = "split-s3"

  static validateOptions(options: Record<string, unknown>) {
    if (!options.private_bucket) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "S3_PRIVATE_BUCKET is not set. Commission references need a bucket of their own " +
          "that is never given a public domain."
      )
    }
    if (options.private_bucket === options.bucket) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "S3_PRIVATE_BUCKET must differ from S3_BUCKET — sharing one makes references as public as the catalogue."
      )
    }
  }

  private public_: S3
  private private_: S3

  constructor(deps: Injected, { private_bucket, ...options }: Options) {
    super()
    this.public_ = new S3FileService(deps, options)
    this.private_ = new S3FileService(deps, {
      ...options,
      bucket: private_bucket,
      prefix: `${PRIVATE_PREFIX}${options.prefix ?? ""}`,
    })
  }

  private byAccess(access?: "public" | "private") {
    return access === "private" ? this.private_ : this.public_
  }

  private byKey(fileKey: string) {
    return fileKey.startsWith(PRIVATE_PREFIX) ? this.private_ : this.public_
  }

  upload(file: FileTypes.ProviderUploadFileDTO) {
    return this.byAccess(file.access).upload(file)
  }

  getUploadStream(file: FileTypes.ProviderUploadStreamDTO) {
    return this.byAccess(file.access).getUploadStream(file)
  }

  getPresignedUploadUrl(file: FileTypes.ProviderGetPresignedUploadUrlDTO) {
    return this.byAccess(file.access).getPresignedUploadUrl(file)
  }

  async delete(files: FileTypes.ProviderDeleteFileDTO | FileTypes.ProviderDeleteFileDTO[]) {
    const all = Array.isArray(files) ? files : [files]
    const hidden = all.filter((f) => f.fileKey.startsWith(PRIVATE_PREFIX))
    const shown = all.filter((f) => !f.fileKey.startsWith(PRIVATE_PREFIX))
    if (hidden.length) await this.private_.delete(hidden)
    if (shown.length) await this.public_.delete(shown)
  }

  getPresignedDownloadUrl(file: FileTypes.ProviderGetFileDTO) {
    return this.byKey(file.fileKey).getPresignedDownloadUrl(file)
  }

  getDownloadStream(file: FileTypes.ProviderGetFileDTO) {
    return this.byKey(file.fileKey).getDownloadStream(file)
  }

  getAsBuffer(file: FileTypes.ProviderGetFileDTO) {
    return this.byKey(file.fileKey).getAsBuffer(file)
  }
}

export default SplitS3FileService
