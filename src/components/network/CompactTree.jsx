import { ChevronRight } from "lucide-react";
import { useState } from "react";
import StatusBadge from "../ui/StatusBadge";
import { EmptyState } from "../ui/States";

function Node({ node, depth = 0 }) {
  const children = node.children ?? [];
  const [open, setOpen] = useState(depth < 1);
  const you = node.verification === "self";

  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.04]"
        onClick={() => {
          if (children.length) setOpen((value) => !value);
        }}
        aria-expanded={children.length ? open : undefined}
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${you ? "bg-gold shadow-[0_0_0_4px_rgba(220,197,139,0.14)]" : "bg-royal shadow-[0_0_0_4px_rgba(118,103,255,0.16)]"}`}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-snow">{node.alias}</span>
          <span className="block truncate text-xs text-mist">{node.id}</span>
        </span>
        <StatusBadge status={you ? "self" : node.verification} />
        {children.length ? (
          <ChevronRight size={14} className={`shrink-0 text-mist transition-transform duration-300 ${open ? "rotate-90" : ""}`} aria-hidden="true" />
        ) : (
          <span className="w-3.5" />
        )}
      </button>
      {open && children.length ? (
        <ul className="mt-1 ml-[1.15rem] border-l border-royal/40 pl-3">
          {children.map((child) => (
            <Node key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function flatten(node, depth = 0, acc = []) {
  acc.push({ ...node, depth });
  (node.children ?? []).forEach((child) => flatten(child, depth + 1, acc));
  return acc;
}

export default function CompactTree({ root, upline }) {
  const people = [...upline.map((node) => ({ ...node, depth: 0 })), ...flatten(root)].filter(
    (person) => person.verification !== "self",
  );

  return (
    <div className="dash-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold tracking-[-0.02em]">Network</h3>
        <p className="text-xs text-mist">IDs and status only</p>
      </div>
      <div className="md:hidden">
        {people.length === 0 ? (
          <EmptyState title="No sample team records" body="Direct referrals and team members will appear here as demo records." />
        ) : (
          <ul className="space-y-2">
            {people.map((person) => (
              <li key={`${person.depth}-${person.id}`} className="rounded-xl border border-white/[0.08] px-3 py-3">
                <p className="text-sm font-medium text-snow">{person.alias}</p>
                <p className="mt-0.5 text-xs text-mist">{person.id}</p>
                <div className="mt-2">
                  <StatusBadge status={person.verification} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="hidden md:block">
        {upline.map((node) => (
          <div key={node.id} className="relative mb-1 pb-2">
            <ul>
              <Node node={{ ...node, children: [] }} />
            </ul>
            <span className="absolute bottom-0 left-[1.15rem] h-2 w-px bg-royal/50" aria-hidden="true" />
          </div>
        ))}
        <ul>
          <Node node={root} />
        </ul>
        {people.length === 0 ? (
          <p className="px-2 pt-3 text-sm text-mist">No sample upline or downline is attached in this view.</p>
        ) : null}
      </div>
    </div>
  );
}
