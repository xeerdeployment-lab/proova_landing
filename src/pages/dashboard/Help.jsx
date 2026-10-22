import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { faqs } from "../../data/content";
import { useDashboard } from "../../hooks/useDashboard";
import { ease } from "../../lib/motion";
import usePageTitle from "../../lib/usePageTitle";

const extra = [
  {
    id: "demo",
    question: "Why does the dashboard say demo data?",
    answer:
      "The ledger, team, ranks, and balances are sample records so the interface can be reviewed. They are not an account, and they are not money available to withdraw.",
  },
  {
    id: "formulas",
    question: "Which reward amounts are calculated?",
    answer:
      "The stake fee is 10%, with 90% remaining. Direct rewards use the stated 10% of a sample stake. Up/down scope, level triggers, withdrawal net payouts, and 3X–5X income limits are shown as rules that still need confirmation. Those amounts are not invented.",
  },
  {
    id: "support-send",
    question: "Does the support form send a message?",
    answer: "No. It checks the fields in the browser and then tells you that nothing was delivered.",
  },
];

const topics = ["Reading the dashboard", "A sample stake", "A sample withdrawal", "Something else"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Help() {
  usePageTitle("Help & Support");
  const reduce = useReducedMotion();
  const { pushToast } = useDashboard();
  const items = [...extra, ...faqs];
  const [open, setOpen] = useState(items[0].id);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [errors, setErrors] = useState({});

  const submit = (event) => {
    event.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your name.";
    if (!emailPattern.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (!form.topic) next.topic = "Choose a topic.";
    if (form.message.trim().length < 12) next.message = "Add a few more words so the request is clear.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setForm({ name: "", email: "", topic: "", message: "" });
    pushToast({ title: "Message was not sent", body: "Support is not connected in this preview." });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="dash-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold">Questions</h2>
        <div className="mt-4 divide-y divide-white/5">
          {items.map((item) => {
            const expanded = open === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium"
                  aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? "" : item.id)}
                >
                  {item.question}
                  <span className="text-gold">{expanded ? "–" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.p
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="overflow-hidden pb-4 text-sm leading-relaxed text-mist"
                    >
                      {item.answer}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
      <form className="dash-card h-fit p-5 sm:p-6" onSubmit={submit} noValidate>
        <h2 className="text-xl font-semibold">Contact preview</h2>
        <p className="mt-2 text-sm text-mist">Nothing typed here is delivered.</p>
        <label htmlFor="help-name" className="mt-5 block text-sm">
          Name
        </label>
        <input id="help-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="field mt-2" />
        {errors.name ? <p className="mt-2 text-sm text-danger">{errors.name}</p> : null}
        <label htmlFor="help-email" className="mt-4 block text-sm">
          Email
        </label>
        <input id="help-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field mt-2" />
        {errors.email ? <p className="mt-2 text-sm text-danger">{errors.email}</p> : null}
        <label htmlFor="help-topic" className="mt-4 block text-sm">
          Topic
        </label>
        <select id="help-topic" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="field mt-2">
          <option value="">Choose a topic</option>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
        {errors.topic ? <p className="mt-2 text-sm text-danger">{errors.topic}</p> : null}
        <label htmlFor="help-message" className="mt-4 block text-sm">
          Message
        </label>
        <textarea id="help-message" rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="field mt-2" />
        {errors.message ? <p className="mt-2 text-sm text-danger">{errors.message}</p> : null}
        <button type="submit" className="btn btn-primary mt-5">
          Submit preview
        </button>
      </form>
    </div>
  );
}
