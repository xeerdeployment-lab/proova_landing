import { useCallback, useMemo, useState } from "react";
import { demoNotifications } from "../data/demoData";
import { DashboardContext } from "./dashboard-context";
const sidebarKey = "proova.dash.sidebar";
const nameKey = "proova.dash.displayName";
const prefsKey = "proova.dash.prefs";
const readsKey = "proova.dash.reads";

const defaultPrefs = {
  rewards: true,
  withdrawals: true,
  team: true,
  announcements: true,
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function DashboardProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(sidebarKey) === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dataMode, setDataMode] = useState("sample");
  const [readIds, setReadIds] = useState(() => new Set(readJson(readsKey, [])));
  const [displayName, setDisplayName] = useState(() => readJson(nameKey, ""));
  const [prefs, setPrefs] = useState(() => ({ ...defaultPrefs, ...readJson(prefsKey, {}) }));
  const [toasts, setToasts] = useState([]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(sidebarKey, next ? "1" : "0");
      return next;
    });
  }, []);

  const persistReads = (next) => {
    localStorage.setItem(readsKey, JSON.stringify([...next]));
  };

  const markRead = useCallback((id) => {
    setReadIds((current) => {
      const next = new Set(current);
      next.add(id);
      persistReads(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      demoNotifications.forEach((item) => next.add(item.id));
      persistReads(next);
      return next;
    });
  }, []);

  const saveDisplayName = useCallback((name) => {
    const trimmed = name.trim();
    setDisplayName(trimmed);
    localStorage.setItem(nameKey, JSON.stringify(trimmed));
  }, []);

  const updatePref = useCallback((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      localStorage.setItem(prefsKey, JSON.stringify(next));
      return next;
    });
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, tone: "info", ...toast }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const notifications = useMemo(
    () => demoNotifications.map((item) => ({ ...item, read: readIds.has(item.id) })),
    [readIds],
  );

  const value = useMemo(
    () => ({
      collapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      searchOpen,
      setSearchOpen,
      dataMode,
      setDataMode,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markRead,
      markAllRead,
      displayName,
      saveDisplayName,
      prefs,
      updatePref,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      collapsed,
      toggleCollapsed,
      mobileOpen,
      searchOpen,
      dataMode,
      notifications,
      markRead,
      markAllRead,
      displayName,
      saveDisplayName,
      prefs,
      updatePref,
      toasts,
      pushToast,
      dismissToast,
    ],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
