import {
  Activity,
  BarChart3,
  Bell,
  BellRing,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileSearch,
  FileSpreadsheet,
  FileWarning,
  Gauge,
  Home,
  LayoutDashboard,
  LayoutGrid,
  KeyRound,
  LineChart,
  ListChecks,
  MessageSquareMore,
  MessageSquareText,
  PackageCheck,
  PackageSearch,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UploadCloud,
  UserRound,
  Users,
  WalletCards,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type IconKey =
  | "activity"
  | "bar-chart"
  | "bell"
  | "bell-ring"
  | "book"
  | "bot"
  | "calendar"
  | "calendar-days"
  | "check-circle"
  | "clock"
  | "credit-card"
  | "dashboard"
  | "file-search"
  | "file-spreadsheet"
  | "file-warning"
  | "gauge"
  | "home"
  | "layout-grid"
  | "key"
  | "line-chart"
  | "list-checks"
  | "message"
  | "message-more"
  | "package"
  | "package-search"
  | "search"
  | "settings"
  | "shopping-bag"
  | "cart"
  | "sparkles"
  | "upload"
  | "user"
  | "users"
  | "wallet"
  | "zap";

export const iconRegistry: Record<IconKey, LucideIcon> = {
  activity: Activity,
  "bar-chart": BarChart3,
  bell: Bell,
  "bell-ring": BellRing,
  book: BookOpenCheck,
  bot: Bot,
  calendar: CalendarClock,
  "calendar-days": CalendarDays,
  "check-circle": CheckCircle2,
  clock: Clock3,
  "credit-card": CreditCard,
  dashboard: LayoutDashboard,
  "file-search": FileSearch,
  "file-spreadsheet": FileSpreadsheet,
  "file-warning": FileWarning,
  gauge: Gauge,
  home: Home,
  "layout-grid": LayoutGrid,
  key: KeyRound,
  "line-chart": LineChart,
  "list-checks": ListChecks,
  message: MessageSquareText,
  "message-more": MessageSquareMore,
  package: PackageCheck,
  "package-search": PackageSearch,
  search: Search,
  settings: Settings,
  "shopping-bag": ShoppingBag,
  cart: ShoppingCart,
  sparkles: Sparkles,
  upload: UploadCloud,
  user: UserRound,
  users: Users,
  wallet: WalletCards,
  zap: Zap,
};

export function resolveIcon(key: IconKey) {
  return iconRegistry[key];
}
