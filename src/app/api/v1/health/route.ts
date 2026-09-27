import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { getHealthPayload } from "@/server/system/system-service";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async () => {
  const health = await getHealthPayload();

  return apiSuccess(health);
});
