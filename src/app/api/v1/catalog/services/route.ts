import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import { listPublicServices } from "@/server/services/services-service";

export const dynamic = "force-dynamic";

export const GET =
  withApiHandler(async () => {
    const services =
      await listPublicServices();

    return apiSuccess({
      services,
    });
  });
