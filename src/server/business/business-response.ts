import type {
  CurrentBusinessContext,
} from "@/server/business/business-types";
import { getServiceCatalogRepository } from "@/server/repositories/repository-provider";
import type { IconKey } from "@/constants/icon-registry";

export type CurrentBusinessServiceView = {
  id: string;
  businessId: string;
  serviceId: string;
  status:
    | "setup"
    | "active"
    | "paused"
    | "coming-soon";
  setupCompleted: boolean;
  createdAt: string;
  service: {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    category: string;
    description: string;
    appHref: string | null;
    marketingHref: string;
    availability:
      | "available"
      | "coming-soon";
    visibility:
      | "public"
      | "private";
    accent: string;
    iconKey: IconKey;
    sortOrder: number;
    features: string[];
  };
};

export type CurrentBusinessApiResponse =
  Omit<
    CurrentBusinessContext,
    "services"
  > & {
    services:
      CurrentBusinessServiceView[];
  };

export async function buildCurrentBusinessApiResponse(
  context: CurrentBusinessContext,
): Promise<CurrentBusinessApiResponse> {
  const catalog =
    await getServiceCatalogRepository().list();

  const definitions = new Map(
    catalog
      .filter(
        (service) =>
          service.status === "active",
      )
      .map((service) => [
        service.id,
        service,
      ]),
  );

  const services =
    context.services.flatMap(
      (assignment) => {
        const definition =
          definitions.get(
            assignment.serviceId,
          );

        if (!definition) {
          return [];
        }

        return [
          {
            ...assignment,
            service: {
              id: definition.id,
              slug:
                definition.slug,
              name:
                definition.name,
              shortName:
                definition.shortName,
              category:
                definition.category,
              description:
                definition.description,
              appHref:
                definition.appHref,
              marketingHref:
                definition.marketingHref,
              availability:
                definition.availability,
              visibility:
                definition.visibility,
              accent:
                definition.accent,
              iconKey:
                definition.iconKey,
              sortOrder:
                definition.sortOrder,
              features: [
                ...definition.features,
              ],
            },
          },
        ];
      },
    )
    .sort(
      (a, b) =>
        a.service.sortOrder -
        b.service.sortOrder,
    );

  return {
    ...context,
    services,
  };
}
