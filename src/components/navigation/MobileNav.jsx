import { motion, useReducedMotion } from "motion/react";
import { NavLink } from "react-router";
import { dashboardNav, mobileNav } from "../../data/navigation";
import cx from "../../lib/cx";
import { ease } from "../../lib/motion";

/** Bottom tab bar for phones and tablets. Every other page stays one tap away in the header menu. */
export default function MobileNav() {
  const reduce = useReducedMotion();
  const items = mobileNav.map((to) => dashboardNav.find((item) => item.to === to));

  return (
    <nav
      aria-label="Primary"
      className="glass-panel fixed inset-x-3 z-50 mx-auto grid max-w-md grid-cols-5 gap-0.5 rounded-2xl p-1.5 shadow-2xl lg:hidden"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cx(
                "relative isolate flex min-h-13 min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[0.68rem] font-medium transition-colors active:scale-[0.96] motion-reduce:active:scale-100",
                isActive ? "text-mint" : "text-mist hover:text-snow",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-accent/12 ring-1 ring-accent/20"
                    transition={{ duration: reduce ? 0 : 0.3, ease }}
                    aria-hidden="true"
                  />
                ) : null}
                <Icon size={19} aria-hidden="true" />
                <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
