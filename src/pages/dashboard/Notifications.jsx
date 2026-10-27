import { Bell, CheckCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EmptyState } from "../../components/ui/States";
import { useDashboard } from "../../hooks/useDashboard";
import { formatDate } from "../../lib/dates";
import { ease } from "../../lib/motion";
import usePageTitle from "../../lib/usePageTitle";

const labels = {
  announcement: "Announcement",
  stake: "Stake",
  reward: "Reward",
  withdrawal: "Withdrawal",
  rank: "Rank",
  referral: "Referral",
};

export default function Notifications() {
  usePageTitle("Notifications");
  const { notifications, markRead, markAllRead } = useDashboard();
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const reduce = useReducedMotion();
  const visible = notifications.filter((item) => filter === "all" || !item.read);

  return (
    <div className="space-y-5">
      <section className="dash-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">Notification center</h2>
            <p className="mt-2 text-sm text-mist">Updates about your stakes, rewards, withdrawals and team.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <CheckCheck size={15} aria-hidden="true" />
            Mark all read
          </button>
        </div>
        <div className="mt-4 flex gap-2" role="tablist" aria-label="Notification filter">
          {[
            ["all", "All"],
            ["unread", "Unread"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-sm ${filter === id ? "bg-white/10 text-snow" : "text-mist"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
      {visible.length === 0 ? (
        <div className="dash-card">
          <EmptyState icon={Bell} title="No notifications" body="Nothing in this filter. New account updates will appear here." />
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id} className="dash-card overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => {
                    markRead(item.id);
                    setOpenId(open ? null : item.id);
                  }}
                >
                  {!item.read ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" /> : <span className="mt-2 h-2 w-2 shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-snow">{item.title}</span>
                      <span className="text-[0.68rem] tracking-[0.14em] text-mist uppercase">{labels[item.type]}</span>
                    </span>
                    <span className="mt-1 block text-xs text-mist">{formatDate(item.at, true)}</span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-mist">{item.body}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
