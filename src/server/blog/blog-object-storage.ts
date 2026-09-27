import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

type ObjectStorageConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  publicBaseUrl: string | null;
};

let client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

export function objectStorageEnabled() {
  return process.env.BINIX_MEDIA_STORAGE_DRIVER === "s3";
}

function config(): ObjectStorageConfig {
  const endpoint = process.env.BINIX_S3_ENDPOINT?.trim();
  const bucket = process.env.BINIX_S3_BUCKET?.trim();
  const accessKeyId = process.env.BINIX_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.BINIX_S3_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey)
    throw new Error("تنظیمات Object Storage کامل نیست.");
  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region: process.env.BINIX_S3_REGION?.trim() || "us-east-1",
    forcePathStyle: process.env.BINIX_S3_FORCE_PATH_STYLE !== "false",
    publicBaseUrl:
      process.env.BINIX_MEDIA_PUBLIC_BASE_URL?.trim().replace(/\/$/, "") ||
      null,
  };
}

function s3() {
  if (!client) {
    const settings = config();
    client = new S3Client({
      endpoint: settings.endpoint,
      region: settings.region,
      forcePathStyle: settings.forcePathStyle,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    });
  }
  return client;
}

export async function ensureBlogMediaBucket() {
  if (!objectStorageEnabled()) return;
  if (!bucketReady)
    bucketReady = (async () => {
      const settings = config();
      try {
        await s3().send(new HeadBucketCommand({ Bucket: settings.bucket }));
      } catch (error) {
        const status = (error as { $metadata?: { httpStatusCode?: number } })
          .$metadata?.httpStatusCode;
        const name = (error as { name?: string }).name;
        if (status !== 404 && name !== "NotFound" && name !== "NoSuchBucket")
          throw error;
        await s3().send(new CreateBucketCommand({ Bucket: settings.bucket }));
      }
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  await bucketReady;
}

export function blogMediaObjectKey(checksum: string, fileName: string) {
  const safeName =
    fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-180) || "image";
  return `blog/${checksum.slice(0, 2)}/${checksum}-${safeName}`;
}

export async function putBlogMediaObject(input: {
  key: string;
  bytes: Uint8Array;
  mimeType: string;
  checksum: string;
}) {
  const settings = config();
  await ensureBlogMediaBucket();
  const result = await s3().send(
    new PutObjectCommand({
      Bucket: settings.bucket,
      Key: input.key,
      Body: input.bytes,
      ContentType: input.mimeType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: { sha256: input.checksum },
    }),
  );
  const verified = await s3().send(
    new HeadObjectCommand({ Bucket: settings.bucket, Key: input.key }),
  );
  if (
    verified.ContentLength !== input.bytes.byteLength ||
    verified.Metadata?.sha256 !== input.checksum
  )
    throw new Error("تأیید فایل آپلودشده در Object Storage ناموفق بود.");
  return result.ETag?.replaceAll('"', "") ?? null;
}

export async function getBlogMediaObject(key: string) {
  const settings = config();
  const result = await s3().send(
    new GetObjectCommand({ Bucket: settings.bucket, Key: key }),
  );
  if (!result.Body) throw new Error("فایل Object Storage خالی است.");
  return new Uint8Array(await result.Body.transformToByteArray());
}

export async function deleteBlogMediaObject(key: string) {
  const settings = config();
  await s3().send(
    new DeleteObjectCommand({ Bucket: settings.bucket, Key: key }),
  );
}

export function blogMediaPublicUrl(key: string) {
  const base = config().publicBaseUrl;
  return base
    ? `${base}/${key.split("/").map(encodeURIComponent).join("/")}`
    : null;
}
