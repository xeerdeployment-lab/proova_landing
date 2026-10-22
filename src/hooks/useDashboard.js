import { useContext } from "react";
import { DashboardContext } from "../context/dashboard-context";

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside the dashboard.");
  return context;
}
