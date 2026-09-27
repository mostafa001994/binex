import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminFormValidation } from "@/components/admin/admin-form-validation";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <AdminFormValidation />
      <AdminShell>{children}</AdminShell>
    </>
  );
}
