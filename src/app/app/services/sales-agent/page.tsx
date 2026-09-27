import { SalesAgentConsole } from "@/components/sales-agent/sales-agent-console";
import { ServiceWorkspace } from "@/components/app/service-workspace";

export default function SalesAgentAppPage() {
  return (
    <ServiceWorkspace
      service="sales-agent"
      description="تنظیم اتصال فروشنده هوشمند."
      stateDescription="در این مرحله فقط توکن بات بله و توکن ووکامرس ثبت می‌شوند."
      modules={[]}
    >
      <SalesAgentConsole />
    </ServiceWorkspace>
  );
}
