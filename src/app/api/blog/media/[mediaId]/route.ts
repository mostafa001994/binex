import { NextResponse } from "next/server";
import { getPrismaClient } from "@/server/db/prisma";
import {
  blogMediaPublicUrl,
  getBlogMediaObject,
} from "@/server/blog/blog-object-storage";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const id = (await context.params).mediaId;
  if (!UUID.test(id)) return new NextResponse(null, { status: 404 });
  const item = await getPrismaClient().blogMediaAsset.findUnique({
    where: { id },
    select: {
      data: true,
      storageDriver: true,
      storageKey: true,
      mimeType: true,
      checksumSha256: true,
      byteSize: true,
    },
  });
  if (!item) return new NextResponse(null, { status: 404 });
  const etag = `"${item.checksumSha256}"`;
  if (request.headers.get("if-none-match") === etag)
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  if (item.storageDriver === "s3" && item.storageKey) {
    const publicUrl = blogMediaPublicUrl(item.storageKey);
    if (publicUrl) return NextResponse.redirect(publicUrl, 307);
  }
  const bytes =
    item.storageDriver === "s3" && item.storageKey
      ? await getBlogMediaObject(item.storageKey)
      : item.data;
  if (!bytes) return new NextResponse(null, { status: 404 });
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": item.mimeType,
      "Content-Length": String(item.byteSize),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
