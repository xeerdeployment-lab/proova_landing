import {
  ArrowDownToLine,
  Award,
  Bell,
  CalendarClock,
  Coins,
  HandHeart,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Receipt,
  RefreshCcw,
  Settings,
  Sparkles,
  UserPlus,
} from "lucide-react";

export const dashboardNav = [
  { group: "Portfolio", to: "/dashboard", label: "Overview", short: "Home", end: true, icon: LayoutDashboard },
  { group: "Portfolio", to: "/dashboard/stake", label: "Stake", icon: Coins },
  { group: "Portfolio", to: "/dashboard/rewards", label: "My Rewards", short: "Rewards", icon: Sparkles },
  { group: "Portfolio", to: "/dashboard/daily-income", label: "Daily Income", icon: CalendarClock },
  { group: "Portfolio", to: "/dashboard/restake", label: "Restake", icon: RefreshCcw },
  { group: "Network", to: "/dashboard/referrals", label: "Direct Referrals", short: "Referrals", icon: UserPlus },
  { group: "Network", to: "/dashboard/team", label: "Team Network", short: "Team", icon: Network },
  { group: "Network", to: "/dashboard/ranks", label: "Rank Rewards", icon: Award },
  { group: "Funds", to: "/dashboard/withdrawals", label: "Withdrawal", icon: ArrowDownToLine },
  { group: "Funds", to: "/dashboard/transactions", label: "Transaction History", short: "Transactions", icon: Receipt },
  { group: "Funds", to: "/dashboard/community-fund", label: "Community Fund", icon: HandHeart },
  { group: "Account", to: "/dashboard/profile", label: "Profile & Settings", short: "Profile", icon: Settings },
  { group: "Account", to: "/dashboard/help", label: "Help & Support", short: "Help", icon: LifeBuoy },
  { group: "Account", to: "/dashboard/notifications", label: "Notifications", icon: Bell, hidden: true },
];

export const dashboardGroups = ["Portfolio", "Network", "Funds", "Account"];

/** Primary destinations for the mobile bottom bar. */
export const mobileNav = ["/dashboard", "/dashboard/stake", "/dashboard/rewards", "/dashboard/team", "/dashboard/profile"];

export function matchNav(pathname) {
  return (
    dashboardNav.find((item) => (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`))) ??
    dashboardNav[0]
  );
}
