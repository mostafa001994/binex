"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Database,
  KeyRound,
  ServerCog,
  ShieldCheck,
} from "lucide-react";
import { getAdminSystemApi } from "@/lib/api-client/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminSystemPage() {
  const [data, setData] =
    useState<Awaited<
      ReturnType<
        typeof getAdminSystemApi
      >
    > | null>(null);
  const [error, setError] =
    useState("");

  useEffect(() => {
    getAdminSystemApi()
      .then(setData)
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "وضعیت سیستم قابل دریافت نیست.",
        ),
      );
  }, []);

  if (error) {
    return (
      <Card>
        <p className="font-ui text-sm text-error">
          {error}
        </p>
      </Card>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-card bg-surface-raised"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="وضعیت سیستم"
        description="اطلاعات عملیاتی محیط اجرا بدون نمایش Secretها."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={<ServerCog size={18} />}
          label="Environment"
          value={data.environment}
        />
        <StatusCard
          icon={<Database size={18} />}
          label="Data Driver"
          value={data.dataDriver}
        />
        <StatusCard
          icon={<ShieldCheck size={18} />}
          label="Repository"
          value={data.repositoryMode}
        />
        <StatusCard
          icon={<KeyRound size={18} />}
          label="Credential Encryption"
          value={
            data.credentialsEncryptionConfigured
              ? "configured"
              : "not configured"
          }
          ok={
            data.credentialsEncryptionConfigured
          }
        />
      </div>

      <Card>
        <h2
          data-display-title="true"
          className="text-lg font-bold"
        >
          جزئیات Runtime
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Row
            label="App version"
            value={data.version}
          />
          <Row
            label="OTP driver"
            value={data.otpDriver}
          />
          <Row
            label="API check"
            value={data.checks.api}
          />
          <Row
            label="Repository check"
            value={
              data.checks.repository
            }
          />
          <Row
            label="Server time"
            value={new Date(
              data.serverTime,
            ).toLocaleString(
              "fa-IR",
            )}
          />
        </div>
      </Card>
    </div>
  );
}

function StatusCard({
  icon,
  label,
  value,
  ok = true,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-primary/20">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-ui text-xs text-foreground-muted">
          {label}
        </span>
      </div>
      <div className="mt-3">
        <Badge
          variant={
            ok ? "success" : "warning"
          }
        >
          {value}
        </Badge>
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-control border border-border-subtle bg-surface-raised/40 p-3">
      <div className="font-ui text-[10px] text-foreground-subtle">
        {label}
      </div>
      <div
        dir="ltr"
        className="mt-1 break-all text-right font-ui text-xs"
      >
        {value}
      </div>
    </div>
  );
}
