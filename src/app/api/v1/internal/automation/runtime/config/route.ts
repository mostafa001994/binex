import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { NextResponse } from "next/server";

import {
  AutomationInstanceStatus,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import { decryptSecret } from "@/server/security/secret-crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_AGENT_SERVICE_ID = "sales-agent";
const DEFAULT_INSTANCE_KEY = "default";

const BALE_TOKEN_KIND = "bale_bot_token";
const WOO_STORE_URL_KIND =
  "woocommerce_store_url";
const WOO_CONSUMER_KEY_KIND =
  "woocommerce_consumer_key";
const WOO_CONSUMER_SECRET_KIND =
  "woocommerce_consumer_secret";

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "cache-control":
          "no-store, max-age=0",
      },
    },
  );
}

function isUuid(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function verifySignature(
  canonicalValue: string,
  signature: string | null,
): boolean {
  const secret =
    process.env.N8N_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error(
      "N8N_WEBHOOK_SECRET is not configured.",
    );
  }

  if (
    !signature ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    secret,
  )
    .update(canonicalValue)
    .digest("hex");

  const expectedBuffer =
    Buffer.from(expected, "hex");

  const providedBuffer =
    Buffer.from(
      signature.toLowerCase(),
      "hex",
    );

  return (
    expectedBuffer.length ===
      providedBuffer.length &&
    timingSafeEqual(
      expectedBuffer,
      providedBuffer,
    )
  );
}

function decryptOptional(
  encryptedValue:
    | string
    | null
    | undefined,
): string | null {
  if (!encryptedValue) {
    return null;
  }

  return decryptSecret(encryptedValue);
}

export async function POST(
  request: Request,
) {
  try {
    const rawBody =
      await request.text();

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonError(
        "Invalid JSON body.",
        400,
      );
    }

    if (
      !body ||
      typeof body !== "object"
    ) {
      return jsonError(
        "Invalid request body.",
        400,
      );
    }

    const input =
      body as Record<
        string,
        unknown
      >;

    const automationInstanceId =
      input.automationInstanceId;

    if (
      !isUuid(
        automationInstanceId,
      )
    ) {
      return jsonError(
        "Invalid automationInstanceId.",
        400,
      );
    }

    const signature =
      request.headers.get(
        "x-binix-signature",
      );

    /*
     * Sign the canonical instance UUID,
     * not the serialized JSON body.
     *
     * n8n signs:
     * HMAC-SHA256(
     *   automationInstanceId,
     *   N8N_WEBHOOK_SECRET
     * )
     */
    if (
      !verifySignature(
        automationInstanceId,
        signature,
      )
    ) {
      return jsonError(
        "Invalid signature.",
        401,
      );
    }

    const prisma =
      getPrismaClient();

    const instance =
      await prisma.automationInstance.findUnique({
        where: {
          id: automationInstanceId,
        },
        select: {
          id: true,
          businessId: true,
          subscriptionId: true,
          serviceId: true,
          templateVersion: true,
          n8nWorkflowId: true,
          status: true,
        },
      });

    if (!instance) {
      return jsonError(
        "Automation instance not found.",
        404,
      );
    }

    if (
      instance.serviceId !==
      SALES_AGENT_SERVICE_ID
    ) {
      return jsonError(
        "Unsupported service.",
        403,
      );
    }

    /*
     * CREATING is intentionally allowed.
     *
     * During activation n8n may start
     * accepting webhook traffic immediately
     * before BINIX finishes changing the
     * database row from CREATING to ACTIVE.
     */
    if (
      instance.status !==
        AutomationInstanceStatus.ACTIVE &&
      instance.status !==
        AutomationInstanceStatus.CREATING
    ) {
      return jsonError(
        "Automation instance is not active.",
        409,
      );
    }

    const credentials =
      await prisma.serviceCredential.findMany({
        where: {
          businessId:
            instance.businessId,
          serviceId:
            SALES_AGENT_SERVICE_ID,
          instanceKey:
            DEFAULT_INSTANCE_KEY,
          kind: {
            in: [
              BALE_TOKEN_KIND,
              WOO_STORE_URL_KIND,
              WOO_CONSUMER_KEY_KIND,
              WOO_CONSUMER_SECRET_KIND,
            ],
          },
        },
        select: {
          kind: true,
          encryptedValue: true,
        },
      });

    const byKind =
      new Map(
        credentials.map(
          (credential) => [
            credential.kind,
            credential.encryptedValue,
          ],
        ),
      );

    const baleBotToken =
      decryptOptional(
        byKind.get(
          BALE_TOKEN_KIND,
        ),
      );

    const woocommerceStoreUrl =
      decryptOptional(
        byKind.get(
          WOO_STORE_URL_KIND,
        ),
      );

    const woocommerceConsumerKey =
      decryptOptional(
        byKind.get(
          WOO_CONSUMER_KEY_KIND,
        ),
      );

    const woocommerceConsumerSecret =
      decryptOptional(
        byKind.get(
          WOO_CONSUMER_SECRET_KIND,
        ),
      );

    const baleConfigured =
      Boolean(baleBotToken);

    const woocommerceConfigured =
      Boolean(
        woocommerceStoreUrl &&
          woocommerceConsumerKey &&
          woocommerceConsumerSecret,
      );

    return NextResponse.json(
      {
        success: true,
        contractVersion: "1",

        automationInstance: {
          id: instance.id,
          subscriptionId:
            instance.subscriptionId,
          serviceId:
            instance.serviceId,
          templateVersion:
            instance.templateVersion,
          status:
            instance.status.toLowerCase(),
        },

        credentials: {
          bale: {
            configured:
              baleConfigured,
            token:
              baleBotToken,
          },

          woocommerce: {
            configured:
              woocommerceConfigured,
            storeUrl:
              woocommerceStoreUrl,
            consumerKey:
              woocommerceConsumerKey,
            consumerSecret:
              woocommerceConsumerSecret,
          },
        },
      },
      {
        headers: {
          "cache-control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Automation runtime config request failed:",
      error instanceof Error
        ? error.message
        : "Unknown error",
    );

    return jsonError(
      "Unable to load runtime configuration.",
      500,
    );
  }
}
