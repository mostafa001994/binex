import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { getPublicServiceBySlug } from "@/server/services/services-service";

export const dynamic =
  "force-dynamic";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      slug: string;
    }>;
  },
) {
  return withApiHandler(
    async () => {
      const { slug } =
        await context.params;

      const service =
        await getPublicServiceBySlug(
          slug,
        );

      return apiSuccess({
        service,
      });
    },
  )(request);
}
