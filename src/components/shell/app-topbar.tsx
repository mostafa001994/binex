import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationButton } from "@/components/shell/notification-button";
import { UserMenu } from "@/components/shell/user-menu";
import { AppSearch } from "@/components/shell/app-search";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-subtle bg-background/85 px-4 backdrop-blur-xl md:px-6">
      <div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><div data-display-title="true" className="text-lg font-bold text-foreground">Binix</div></div><AppSearch /></div>
      <div className="flex items-center gap-1"><ThemeToggle /><NotificationButton /><UserMenu /></div>
    </header>
  );
}
