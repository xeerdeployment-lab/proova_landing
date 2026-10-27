import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { faqs } from "../../data/content";
import { useDashboard } from "../../hooks/useDashboard";
import { ease } from "../../lib/motion";
import usePageTitle from "../../lib/usePageTitle";

const extra = [
  {
    id: "capability",
    question: "What is reward capability?",
    answer:
      "Each stake can earn up to 3x its amount in counted rewards (direct, up/down, daily income and rank rewards). Ten direct referrals within 10 days of your first stake raise this to 4x for life, fifteen to 5x. Once the cap is reached, a restake of at least your last stake amount is required.",
  },
  {
    id: "withdrawal",
    question: "How is a withdrawal split?",
    answer:
      "A 10% deduction is taken first. The remainder is split 50% to you and 50% to up/down income. The community fund (10%) and the rank pools (4%, 3%, 3%) are carved out of the deduction, so the lines always add up exactly to what you requested. The full breakdown is shown before you confirm.",
  },
  {
    id: "daily",
    question: "How is daily income calculated?",
    answer:
      "It is a fixed amount per eligible active user at each of your 10 levels — $0.01 at level 1 up to $0.05 from level 5. You can claim once every 24 hours; the server checks the time, so claims cannot be repeated.",
  },
  {
    id: "demo",
    question: "Why do I see a Demo label?",
    answer:
      "In development builds without a connected API, the dashboard runs on a local development ledger. Every figure carrying the Demo label is generated test data, not a real balance or payout.",
  },
];

const topics = ["Staking", "Withdrawals", "Rewards & ranks", "Account & wallet", "Something else"];
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
    pushToast({ title: "Support inbox not connected", body: "Your message was checked but not sent. Support messaging is not wired up in this build yet." });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="dash-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Frequently asked questions</h2>
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
                  <span className="text-mint">{expanded ? "–" : "+"}</span>
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
        <h2 className="text-lg font-semibold">Contact support</h2>
        <p className="mt-2 text-sm text-mist">Never include your seed phrase or private key.</p>
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
          Send message
        </button>
      </form>
    </div>
  );
}
