import {
  AutomationInstanceStatus,
  AutomationTemplateStatus,
  Prisma,
  ProvisioningAction,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/server/db/prisma";
import {
  activateN8nWorkflow,
  createN8nDataTable,
  createN8nWorkflow,
  deactivateN8nWorkflow,
  deleteN8nDataTable,
  deleteN8nWorkflow,
  getN8nDataTable,
  getN8nWorkflow,
  SALES_AGENT_CUSTOMERS_COLUMNS,
  updateN8nWorkflow,
  type N8nDataTable,
  type N8nWorkflowWritePayload,
} from "@/server/automation/n8n-management-client";

const SALES_AGENT_SERVICE_ID = "sales-agent";

const PLACEHOLDER_AUTOMATION_INSTANCE =
  "__BINIX_AUTOMATION_INSTANCE_ID__";

const PLACEHOLDER_WEBHOOK_INSTANCE =
  "__BINIX_INSTANCE_ID__";

const PLACEHOLDER_DATATABLE =
  "__BINIX_CUSTOMERS_DATATABLE_ID__";

const PLACEHOLDER_PROJECT =
  "__BINIX_N8N_PROJECT_ID__";

const FORBIDDEN_SECRET_PLACEHOLDERS = [
  "__BINIX_BALE_BOT_TOKEN__",
  "__BINIX_WOOCOMMERCE_STORE_URL__",
  "__BINIX_WOOCOMMERCE_CONSUMER_KEY__",
  "__BINIX_WOOCOMMERCE_CONSUMER_SECRET__",
];

type JsonRecord = Record<string, unknown>;

export type AutomationFactoryActivateResult = {
  automationInstanceId: string;
  n8nWorkflowId: string;
  dataTableId: string;
  projectId: string;
  status: AutomationInstanceStatus;
};

function asRecord(value: unknown): JsonRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return { ...(value as JsonRecord) };
  }

  return {};
}

function toPrismaJson(
  value: JsonRecord,
): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function safeErrorMessage(error: unknown): string {
  const source =
    error instanceof Error
      ? error.message
      : String(error ?? "Unknown automation factory error");

  return source
    .replace(/\b(?:ck|cs)_[A-Za-z0-9_-]+\b/g, "[credential]")
    .replace(/bot[A-Za-z0-9:_-]{12,}/gi, "bot[redacted]")
    .replace(
      /(consumer[_ -]?secret|api[_ -]?key|token|secret)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[redacted]",
    )
    .slice(0, 1000);
}

function replaceAllLiteral(
  value: string,
  search: string,
  replacement: string,
): string {
  return value.split(search).join(replacement);
}

function countLiteral(
  value: string,
  search: string,
): number {
  if (!search) {
    return 0;
  }

  return value.split(search).length - 1;
}

function buildCustomerWorkflowPayload(input: {
  template: {
    nodes: unknown[];
    connections: JsonRecord;
    settings: JsonRecord;
    nodeGroups?: unknown[];
  };
  automationInstanceId: string;
  dataTableId: string;
  projectId: string;
}): N8nWorkflowWritePayload {
  const source: N8nWorkflowWritePayload = {
    name: `BINIX - Sales Agent - ${input.automationInstanceId}`,
    nodes: input.template.nodes,
    connections: input.template.connections,
    settings: {
      ...input.template.settings,

      // Runtime Config contains transient decrypted credentials.
      // Never persist successful or failed execution data.
      saveDataSuccessExecution: "none",
      saveDataErrorExecution: "none",
    },

    // Never copy execution state or pinned data from mother template.
    staticData: null,
    pinData: null,

    ...(input.template.nodeGroups
      ? { nodeGroups: input.template.nodeGroups }
      : {}),

    // Keep workflow and its DataTable in the same n8n project.
    projectId: input.projectId,
  };

  let serialized = JSON.stringify(source);

  const expected = [
    PLACEHOLDER_AUTOMATION_INSTANCE,
    PLACEHOLDER_WEBHOOK_INSTANCE,
    PLACEHOLDER_DATATABLE,
    PLACEHOLDER_PROJECT,
  ];

  for (const placeholder of expected) {
    if (countLiteral(serialized, placeholder) === 0) {
      throw new Error(
        `Required template placeholder is missing: ${placeholder}`,
      );
    }
  }

  for (const forbidden of FORBIDDEN_SECRET_PLACEHOLDERS) {
    if (serialized.includes(forbidden)) {
      throw new Error(
        `Secret placeholder must not exist in runtime template: ${forbidden}`,
      );
    }
  }

  serialized = replaceAllLiteral(
    serialized,
    PLACEHOLDER_AUTOMATION_INSTANCE,
    input.automationInstanceId,
  );

  serialized = replaceAllLiteral(
    serialized,
    PLACEHOLDER_WEBHOOK_INSTANCE,
    input.automationInstanceId,
  );

  serialized = replaceAllLiteral(
    serialized,
    PLACEHOLDER_DATATABLE,
    input.dataTableId,
  );

  serialized = replaceAllLiteral(
    serialized,
    PLACEHOLDER_PROJECT,
    input.projectId,
  );

  if (serialized.includes("__BINIX_")) {
    const unresolved = Array.from(
      new Set(
        serialized.match(/__BINIX_[A-Z0-9_]+__/g) ?? [],
      ),
    );

    throw new Error(
      `Unresolved BINIX template placeholders: ${unresolved.join(", ")}`,
    );
  }

  return JSON.parse(
    serialized,
  ) as N8nWorkflowWritePayload;
}

async function resolveCustomerDataTable(input: {
  automationInstanceId: string;
  metadata: JsonRecord;
}): Promise<{
  table: N8nDataTable;
  metadata: JsonRecord;
  createdNow: boolean;
}> {
  const existingId =
    typeof input.metadata.dataTableId === "string"
      ? input.metadata.dataTableId
      : null;

  if (existingId) {
    try {
      const existing =
        await getN8nDataTable(existingId);

      if (!existing.id) {
        throw new Error(
          "Existing n8n DataTable has no id",
        );
      }

      if (!existing.projectId) {
        throw new Error(
          "Existing n8n DataTable has no projectId",
        );
      }

      return {
        table: existing,
        metadata: {
          ...input.metadata,
          dataTableId: existing.id,
          projectId: existing.projectId,
        },
        createdNow: false,
      };
    } catch {
      // The stored resource no longer exists or is inaccessible.
      // Recreate it below.
    }
  }

  const created = await createN8nDataTable({
    name: `binix-sales-agent-${input.automationInstanceId}`,
    columns: SALES_AGENT_CUSTOMERS_COLUMNS,
  });

  if (!created.id) {
    throw new Error(
      "n8n DataTable creation returned no id",
    );
  }

  if (!created.projectId) {
    try {
      const fetched =
        await getN8nDataTable(created.id);

      if (!fetched.projectId) {
        throw new Error(
          "n8n DataTable response returned no projectId",
        );
      }

      return {
        table: fetched,
        metadata: {
          ...input.metadata,
          dataTableId: fetched.id,
          projectId: fetched.projectId,
        },
        createdNow: true,
      };
    } catch (error) {
      try {
        await deleteN8nDataTable(created.id);
      } catch {
        // Cleanup is best-effort.
      }

      throw error;
    }
  }

  return {
    table: created,
    metadata: {
      ...input.metadata,
      dataTableId: created.id,
      projectId: created.projectId,
    },
    createdNow: true,
  };
}

export async function activateAutomationForProvisioningJob(
  provisioningJobId: string,
): Promise<AutomationFactoryActivateResult> {
  const prisma = getPrismaClient();

  const job = await prisma.provisioningJob.findUnique({
    where: {
      id: provisioningJobId,
    },
  });

  if (!job) {
    throw new Error(
      "Provisioning job not found",
    );
  }

  if (job.action !== ProvisioningAction.ACTIVATE) {
    throw new Error(
      `Automation Factory ACTIVATE cannot process action ${job.action}`,
    );
  }

  if (job.serviceId !== SALES_AGENT_SERVICE_ID) {
    throw new Error(
      `Automation Factory does not support service ${job.serviceId}`,
    );
  }

  const template =
    await prisma.automationTemplate.findFirst({
      where: {
        serviceId: job.serviceId,
        status: AutomationTemplateStatus.ACTIVE,
      },
      orderBy: {
        version: "desc",
      },
    });

  if (!template) {
    throw new Error(
      `No ACTIVE automation template found for ${job.serviceId}`,
    );
  }

  let instance =
    await prisma.automationInstance.findUnique({
      where: {
        subscriptionId: job.subscriptionId,
      },
    });

  if (
    instance?.status ===
      AutomationInstanceStatus.ACTIVE &&
    instance.n8nWorkflowId
  ) {
    const metadata = asRecord(instance.metadata);

    const dataTableId =
      typeof metadata.dataTableId === "string"
        ? metadata.dataTableId
        : null;

    const projectId =
      typeof metadata.projectId === "string"
        ? metadata.projectId
        : null;

    if (dataTableId && projectId) {
      return {
        automationInstanceId: instance.id,
        n8nWorkflowId: instance.n8nWorkflowId,
        dataTableId,
        projectId,
        status: instance.status,
      };
    }
  }

  if (!instance) {
    instance =
      await prisma.automationInstance.create({
        data: {
          businessId: job.businessId,
          subscriptionId: job.subscriptionId,
          serviceId: job.serviceId,
          templateId: template.id,
          templateVersion: template.version,
          status:
            AutomationInstanceStatus.CREATING,
          metadata: {},
        },
      });
  } else {
    instance =
      await prisma.automationInstance.update({
        where: {
          id: instance.id,
        },
        data: {
          businessId: job.businessId,
          serviceId: job.serviceId,
          templateId: template.id,
          templateVersion: template.version,
          status:
            AutomationInstanceStatus.CREATING,
          lastError: null,
          suspendedAt: null,
          deletedAt: null,
        },
      });
  }

  let metadata = asRecord(instance.metadata);

  let createdDataTableNow = false;
  let dataTableId: string | null = null;
  let projectId: string | null = null;

  let workflowId =
    instance.n8nWorkflowId ?? null;

  try {
    const tableResult =
      await resolveCustomerDataTable({
        automationInstanceId: instance.id,
        metadata,
      });

    createdDataTableNow =
      tableResult.createdNow;

    metadata = tableResult.metadata;

    dataTableId = tableResult.table.id;
    projectId =
      tableResult.table.projectId ?? null;

    if (!dataTableId || !projectId) {
      throw new Error(
        "Automation DataTable id/projectId is missing",
      );
    }

    // Persist infrastructure ids immediately.
    // If a later step fails, a retry can reconcile the same resources.
    await prisma.automationInstance.update({
      where: {
        id: instance.id,
      },
      data: {
        metadata: toPrismaJson(metadata),
        status:
          AutomationInstanceStatus.CREATING,
        lastError: null,
      },
    });

    const mother =
      await getN8nWorkflow(
        template.n8nTemplateWorkflowId,
      );

    if (mother.active) {
      throw new Error(
        "Mother automation template must remain inactive",
      );
    }

    const workflowPayload =
      buildCustomerWorkflowPayload({
        template: {
          nodes: mother.nodes,
          connections: mother.connections,
          settings: mother.settings,
          nodeGroups: mother.nodeGroups,
        },
        automationInstanceId: instance.id,
        dataTableId,
        projectId,
      });

    let workflow;

    if (workflowId) {
      // Retry/reconciliation path:
      // update the same workflow instead of cloning another one.
      workflow =
        await updateN8nWorkflow(
          workflowId,
          workflowPayload,
        );
    } else {
      workflow =
        await createN8nWorkflow(
          workflowPayload,
        );

      workflowId = workflow.id;

      if (!workflowId) {
        throw new Error(
          "n8n workflow creation returned no id",
        );
      }

      // Save workflow id before activation so failures are retryable
      // without creating another customer workflow.
      await prisma.automationInstance.update({
        where: {
          id: instance.id,
        },
        data: {
          n8nWorkflowId: workflowId,
          metadata: toPrismaJson(metadata),
          status:
            AutomationInstanceStatus.CREATING,
          lastError: null,
        },
      });
    }

    await activateN8nWorkflow(
      workflowId,
      workflow.versionId,
    );

    const activatedAt = new Date();

    await prisma.automationInstance.update({
      where: {
        id: instance.id,
      },
      data: {
        n8nWorkflowId: workflowId,
        templateId: template.id,
        templateVersion: template.version,
        metadata: toPrismaJson(metadata),
        status:
          AutomationInstanceStatus.ACTIVE,
        lastError: null,
        activatedAt,
        suspendedAt: null,
        deletedAt: null,
      },
    });

    return {
      automationInstanceId: instance.id,
      n8nWorkflowId: workflowId,
      dataTableId,
      projectId,
      status:
        AutomationInstanceStatus.ACTIVE,
    };
  } catch (error) {
    const safeMessage =
      safeErrorMessage(error);

    // Only remove a DataTable created by this attempt if no workflow
    // was ever created. Once a workflow exists, preserve both resources
    // so a retry can reconcile rather than clone duplicates.
    if (
      createdDataTableNow &&
      dataTableId &&
      !workflowId
    ) {
      try {
        await deleteN8nDataTable(
          dataTableId,
        );

        metadata = {
          ...metadata,
          dataTableId: null,
          projectId: null,
        };
      } catch {
        // Cleanup is best-effort.
      }
    }

    try {
      await prisma.automationInstance.update({
        where: {
          id: instance.id,
        },
        data: {
          status:
            AutomationInstanceStatus.FAILED,
          lastError: safeMessage,
          metadata: toPrismaJson(metadata),
          ...(workflowId
            ? {
                n8nWorkflowId:
                  workflowId,
              }
            : {}),
        },
      });
    } catch {
      // Preserve the original provisioning error.
    }

    throw new Error(
      `Automation Factory ACTIVATE failed: ${safeMessage}`,
    );
  }
}

export async function suspendAutomationForProvisioningJob(
  provisioningJobId: string,
): Promise<void> {
  const prisma = getPrismaClient();

  const job = await prisma.provisioningJob.findUnique({
    where: {
      id: provisioningJobId,
    },
  });

  if (!job) {
    throw new Error(
      `Provisioning job ${provisioningJobId} was not found.`,
    );
  }

  if (job.action !== ProvisioningAction.SUSPEND) {
    throw new Error(
      `Automation Factory SUSPEND cannot process action ${job.action}`,
    );
  }

  const instance =
    await prisma.automationInstance.findUnique({
      where: {
        subscriptionId: job.subscriptionId,
      },
    });

  if (!instance) {
    throw new Error(
      "Automation instance not found for subscription",
    );
  }

  if (
    instance.status ===
      AutomationInstanceStatus.SUSPENDED
  ) {
    return;
  }

  if (
    instance.status ===
      AutomationInstanceStatus.DELETED
  ) {
    return;
  }

  if (instance.n8nWorkflowId) {
    await deactivateN8nWorkflow(
      instance.n8nWorkflowId,
    );
  }

  await prisma.automationInstance.update({
    where: {
      id: instance.id,
    },
    data: {
      status:
        AutomationInstanceStatus.SUSPENDED,
      lastError: null,
      suspendedAt: new Date(),
    },
  });
}

export async function cancelAutomationForProvisioningJob(
  provisioningJobId: string,
): Promise<void> {
  const prisma = getPrismaClient();

  const job = await prisma.provisioningJob.findUnique({
    where: {
      id: provisioningJobId,
    },
  });

  if (!job) {
    throw new Error(
      `Provisioning job ${provisioningJobId} was not found.`,
    );
  }

  if (job.action !== ProvisioningAction.CANCEL) {
    throw new Error(
      `Automation Factory CANCEL cannot process action ${job.action}`,
    );
  }

  const instance =
    await prisma.automationInstance.findUnique({
      where: {
        subscriptionId: job.subscriptionId,
      },
    });

  if (!instance) {
    return;
  }

  if (
    instance.status ===
      AutomationInstanceStatus.DELETED
  ) {
    return;
  }

  await prisma.automationInstance.update({
    where: {
      id: instance.id,
    },
    data: {
      status:
        AutomationInstanceStatus.DELETING,
      lastError: null,
    },
  });

  const metadata =
    asRecord(instance.metadata);

  const dataTableId =
    typeof metadata.dataTableId === "string"
      ? metadata.dataTableId
      : null;

  try {
    if (instance.n8nWorkflowId) {
      try {
        await deactivateN8nWorkflow(
          instance.n8nWorkflowId,
        );
      } catch {
        // Continue to DELETE. DELETE is authoritative.
      }

      await deleteN8nWorkflow(
        instance.n8nWorkflowId,
      );
    }

    if (dataTableId) {
      await deleteN8nDataTable(
        dataTableId,
      );
    }

    await prisma.automationInstance.update({
      where: {
        id: instance.id,
      },
      data: {
        status:
          AutomationInstanceStatus.DELETED,
        n8nWorkflowId: null,
        lastError: null,
        deletedAt: new Date(),
        metadata: toPrismaJson({
          ...metadata,
          deletedDataTableId:
            dataTableId ?? null,
          dataTableId: null,
          projectId: null,
        }),
      },
    });
  } catch (error) {
    const safeMessage =
      safeErrorMessage(error);

    await prisma.automationInstance.update({
      where: {
        id: instance.id,
      },
      data: {
        status:
          AutomationInstanceStatus.FAILED,
        lastError: safeMessage,
      },
    });

    throw new Error(
      `Automation Factory CANCEL failed: ${safeMessage}`,
    );
  }
}
