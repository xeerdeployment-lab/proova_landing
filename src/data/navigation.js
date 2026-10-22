import {
  ArrowDownToLine,
  Award,
  Bell,
  LayoutDashboard,
  LifeBuoy,
  Network,
  Receipt,
  Shield,
  Sparkles,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";

export const dashboardNav = [
  {
    group: "Portfolio",
    to: "/dashboard",
    label: "Overview",
    end: true,
    icon: LayoutDashboard,
  },
  { group: "Portfolio", to: "/dashboard/stake", label: "My Stake", icon: WalletCards },
  { group: "Portfolio", to: "/dashboard/rewards", label: "Rewards & Earnings", icon: Sparkles },
  { group: "Network", to: "/dashboard/team", label: "My Team", icon: Users },
  { group: "Network", to: "/dashboard/referrals", label: "Direct Referrals", icon: UserPlus },
  { group: "Network", to: "/dashboard/network", label: "Network Tree", icon: Network },
  { group: "Network", to: "/dashboard/ranks", label: "Rank & Achievements", icon: Award },
  { group: "Ledger", to: "/dashboard/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
  { group: "Ledger", to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { group: "Account", to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { group: "Account", to: "/dashboard/profile", label: "Profile & Security", icon: Shield },
  { group: "Account", to: "/dashboard/help", label: "Help & Support", icon: LifeBuoy },
];

export const dashboardGroups = ["Portfolio", "Network", "Ledger", "Account"];

export function matchNav(pathname) {
  return (
    dashboardNav.find((item) => (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`))) ??
    dashboardNav[0]
  );
}
