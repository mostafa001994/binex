import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { NextResponse } from "next/server";

import {
  ProvisioningJobStatus,
  ProvisioningStatus,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CallbackEvent =
  | "provisioning.processing"
  | "provisioning.completed"
  | "provisioning.failed";

type CallbackBody = {
  contractVersion?: string;
  event?: CallbackEvent;
  timestamp?: string;
  data?: {
    provisioningJobId?: string;
    subscriptionId?: string;
    n8nExecutionId?: string;
    error?: string;
  };
};

function unauthorized(message = "Invalid signature") {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 },
  );
}

function badRequest(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 400 },
  );
}

function conflict(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 409 },
  );
}

function verifySignature(
  rawBody: string,
  signature: string | null,
) {
  const secret =
    process.env.N8N_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  if (
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    secret,
  )
    .update(rawBody)
    .digest();

  const received =
    Buffer.from(signature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

function safeError(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  return value
    .replace(
      /(token|password|authorization|secret|api[-_]?key)(\s*[:=]\s*)([^\s,;]+)/gi,
      "$1$2***",
    )
    .slice(0, 2000);
}

function safeExecutionId(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  return value.trim().slice(0, 160);
}

export async function POST(
  request: Request,
) {
  const rawBody = await request.text();

  const signature =
    request.headers.get(
      "x-binix-signature",
    );

  if (
    !verifySignature(
      rawBody,
      signature,
    )
  ) {
    return unauthorized();
  }

  let body: CallbackBody;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return badRequest(
      "Invalid JSON body",
    );
  }

  if (
    body.contractVersion &&
    body.contractVersion !== "1"
  ) {
    return badRequest(
      "Unsupported contract version",
    );
  }

  const event = body.event;
  const data = body.data;

  if (
    event !==
      "provisioning.processing" &&
    event !==
      "provisioning.completed" &&
    event !==
      "provisioning.failed"
  ) {
    return badRequest(
      "Unsupported callback event",
    );
  }

  const provisioningJobId =
    data?.provisioningJobId;

  if (
    !provisioningJobId ||
    !UUID_PATTERN.test(
      provisioningJobId,
    )
  ) {
    return badRequest(
      "Invalid provisioningJobId",
    );
  }

  if (
    data?.subscriptionId &&
    !UUID_PATTERN.test(
      data.subscriptionId,
    )
  ) {
    return badRequest(
      "Invalid subscriptionId",
    );
  }

  const n8nExecutionId =
    safeExecutionId(
      data?.n8nExecutionId,
    );

  const error =
    safeError(data?.error);

  const prisma =
    getPrismaClient();

  const result =
    await prisma.$transaction(
      async (tx) => {
        const job =
          await tx.provisioningJob.findUnique(
            {
              where: {
                id: provisioningJobId,
              },
              select: {
                id: true,
                subscriptionId: true,
                status: true,
                n8nExecutionId: true,
              },
            },
          );

        if (!job) {
          return {
            kind: "not-found" as const,
          };
        }

        if (
          data?.subscriptionId &&
          data.subscriptionId !==
            job.subscriptionId
        ) {
          return {
            kind: "subscription-mismatch" as const,
          };
        }

        if (
          event ===
          "provisioning.processing"
        ) {
          if (
            job.status ===
              ProvisioningJobStatus.SUCCEEDED ||
            job.status ===
              ProvisioningJobStatus.FAILED ||
            job.status ===
              ProvisioningJobStatus.CANCELED
          ) {
            return {
              kind: "terminal" as const,
              status: job.status,
            };
          }

          await tx.provisioningJob.update(
            {
              where: {
                id: job.id,
              },
              data: {
                status:
                  ProvisioningJobStatus.PROCESSING,
                lockedAt: new Date(),
                nextAttemptAt: null,
                n8nExecutionId:
                  n8nExecutionId ??
                  job.n8nExecutionId,
                lastError: null,
              },
            },
          );

          await tx.subscription.update(
            {
              where: {
                id: job.subscriptionId,
              },
              data: {
                provisioningStatus:
                  ProvisioningStatus.IN_PROGRESS,
              },
            },
          );

          return {
            kind: "updated" as const,
            status:
              ProvisioningJobStatus.PROCESSING,
          };
        }

        if (
          event ===
          "provisioning.completed"
        ) {
          if (
            job.status ===
            ProvisioningJobStatus.SUCCEEDED
          ) {
            return {
              kind: "idempotent" as const,
              status:
                ProvisioningJobStatus.SUCCEEDED,
            };
          }

          if (
            job.status ===
              ProvisioningJobStatus.FAILED ||
            job.status ===
              ProvisioningJobStatus.CANCELED
          ) {
            return {
              kind: "terminal" as const,
              status: job.status,
            };
          }

          await tx.provisioningJob.update(
            {
              where: {
                id: job.id,
              },
              data: {
                status:
                  ProvisioningJobStatus.SUCCEEDED,
                n8nExecutionId:
                  n8nExecutionId ??
                  job.n8nExecutionId,
                lastError: null,
                lockedAt: null,
                nextAttemptAt: null,
                completedAt: new Date(),
              },
            },
          );

          await tx.subscription.update(
            {
              where: {
                id: job.subscriptionId,
              },
              data: {
                provisioningStatus:
                  ProvisioningStatus.READY,
              },
            },
          );

          return {
            kind: "updated" as const,
            status:
              ProvisioningJobStatus.SUCCEEDED,
          };
        }

        if (
          job.status ===
          ProvisioningJobStatus.FAILED
        ) {
          return {
            kind: "idempotent" as const,
            status:
              ProvisioningJobStatus.FAILED,
          };
        }

        if (
          job.status ===
            ProvisioningJobStatus.SUCCEEDED ||
          job.status ===
            ProvisioningJobStatus.CANCELED
        ) {
          return {
            kind: "terminal" as const,
            status: job.status,
          };
        }

        await tx.provisioningJob.update(
          {
            where: {
              id: job.id,
            },
            data: {
              status:
                ProvisioningJobStatus.FAILED,
              n8nExecutionId:
                n8nExecutionId ??
                job.n8nExecutionId,
              lastError:
                error ??
                "Provisioning failed",
              lockedAt: null,
              completedAt: new Date(),
            },
          },
        );

        await tx.subscription.update(
          {
            where: {
              id: job.subscriptionId,
            },
            data: {
              provisioningStatus:
                ProvisioningStatus.FAILED,
            },
          },
        );

        return {
          kind: "updated" as const,
          status:
            ProvisioningJobStatus.FAILED,
        };
      },
    );

  if (
    result.kind === "not-found"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Provisioning job not found",
      },
      { status: 404 },
    );
  }

  if (
    result.kind ===
    "subscription-mismatch"
  ) {
    return conflict(
      "Subscription does not match provisioning job",
    );
  }

  if (
    result.kind === "terminal"
  ) {
    return conflict(
      `Provisioning job is already in terminal status ${result.status}`,
    );
  }

  return NextResponse.json({
    success: true,
    received: true,
    idempotent:
      result.kind === "idempotent",
    provisioningJobId,
    status: result.status
      .toLowerCase()
      .replaceAll("_", "-"),
  });
}
