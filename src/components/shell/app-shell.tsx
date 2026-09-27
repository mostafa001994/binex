import type { ReactNode } from "react";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { AppTopbar } from "@/components/shell/app-topbar";
import { MobileNav } from "@/components/shell/mobile-nav";
import { AuthGate } from "@/components/auth/auth-gate";
import { BusinessGate } from "@/components/business/business-gate";
import { DemoEnvironmentBanner } from "@/components/business/demo-environment-banner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AuthGate>
        <BusinessGate>
          <div className="flex min-h-screen">
            <AppSidebar />

            <div className="min-w-0 flex-1">
              <AppTopbar />
              <DemoEnvironmentBanner />

              <main
                id="main-content"
                className="px-4 py-6 pb-24 md:px-6 md:py-8 lg:pb-8"
              >
                {children}
              </main>
            </div>
          </div>

          <MobileNav />
        </BusinessGate>
      </AuthGate>
    </div>
  );
}
