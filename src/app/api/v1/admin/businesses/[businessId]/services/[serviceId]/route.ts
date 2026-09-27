import type { NextRequest } from "next/server";
import { apiSuccess } from "@/server/core/api-response";
import { withApiHandler } from "@/server/core/route-handler";
import {
  AUTH_COOKIE_NAME,
  getAuthenticatedUser,
} from "@/server/auth/auth-service";
import {
  assignAdminBusinessService,
  removeAdminBusinessService,
  updateAdminBusinessServiceStatus,
} from "@/server/admin/admin-service";
import type { BusinessService } from "@/server/business/business-types";
import { ValidationApiError } from "@/server/core/api-error";

const allowedStatuses: BusinessService["status"][] = [
  "setup",
  "active",
  "paused",
  "coming-soon",
];

export async function POST(
  request: NextRequest,
  routeContext: {
    params: Promise<{
      businessId: string;
      serviceId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const {
        businessId,
        serviceId,
      } =
        await routeContext.params;

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const service =
        await assignAdminBusinessService(
          user,
          {
            businessId,
            serviceId,
          },
        );

      return apiSuccess(
        { service },
        { status: 201 },
      );
    },
  )(request);
}

export async function PATCH(
  request: NextRequest,
  routeContext: {
    params: Promise<{
      businessId: string;
      serviceId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const {
        businessId,
        serviceId,
      } =
        await routeContext.params;

      const body =
        await req
          .json()
          .catch(() => ({}));

      const status =
        body.status as BusinessService["status"];

      if (
        !allowedStatuses.includes(
          status,
        )
      ) {
        throw new ValidationApiError(
          "وضعیت سرویس معتبر نیست.",
        );
      }

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      const service =
        await updateAdminBusinessServiceStatus(
          user,
          {
            businessId,
            serviceId,
            status,
          },
        );

      return apiSuccess({
        service,
      });
    },
  )(request);
}

export async function DELETE(
  request: NextRequest,
  routeContext: {
    params: Promise<{
      businessId: string;
      serviceId: string;
    }>;
  },
) {
  return withApiHandler(
    async (req: NextRequest) => {
      const {
        businessId,
        serviceId,
      } =
        await routeContext.params;

      const user =
        await getAuthenticatedUser(
          req.cookies.get(
            AUTH_COOKIE_NAME,
          )?.value,
        );

      await removeAdminBusinessService(
        user,
        {
          businessId,
          serviceId,
        },
      );

      return apiSuccess({
        deleted: true,
      });
    },
  )(request);
}
