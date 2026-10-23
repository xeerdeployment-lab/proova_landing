export const navLinks = [
  { id: "about", label: "About", to: "/#about" },
  { id: "platform", label: "Platform", to: "/#platform" },
  { id: "network", label: "Network", to: "/#network" },
  { id: "opportunity", label: "Opportunity", to: "/#opportunity" },
  { id: "compensation", label: "Compensation Plan", to: "/#compensation" },
  { id: "faq", label: "FAQ", to: "/#faq" },
];

export const principles = [
  {
    title: "Clarity before commitment",
    body: "The opportunity, the requirements, and the plan should be readable before anyone is asked to join.",
  },
  {
    title: "Activity, not assurances",
    body: "Any future reward depends on real work, real demand, and published terms. Nothing here is promised.",
  },
  {
    title: "A calmer standard",
    body: "proova is designed to feel precise and trustworthy, with room for the facts instead of pressure.",
  },
];

export const features = [
  {
    id: "community",
    title: "Community-Driven Growth",
    body: "People learn beside one another, share context, and build relationships with care. Community is a place to practice the model, not a guarantee of results.",
    icon: "Users",
    featured: true,
  },
  {
    id: "structure",
    title: "Transparent Business Structure",
    body: "Participation rules will be written in plain language: who may join, what is offered, and what the plan actually pays for.",
    icon: "ShieldCheck",
  },
  {
    id: "digital",
    title: "Modern Digital Experience",
    body: "A quiet, precise interface for reading the opportunity, following updates, and staying oriented as details are published.",
    icon: "MonitorSmartphone",
  },
  {
    id: "learning",
    title: "Learning and Development",
    body: "Education comes first. Understand the model, the products or services once they are named, and how to represent them accurately.",
    icon: "GraduationCap",
    wide: true,
  },
];

export const steps = [
  {
    number: "01",
    title: "Join the Community",
    body: "Read the disclosures, review the published terms, and decide whether the opportunity fits. Enrollment opens only when those terms are ready.",
  },
  {
    number: "02",
    title: "Learn and Build",
    body: "Study how the business works, practice the skills the community teaches, and stay with what can be stated accurately.",
  },
  {
    number: "03",
    title: "Grow Your Network",
    body: "Collaborate with people you invite into a real opportunity. A larger network is not, by itself, income.",
  },
];

export const checklist = [
  "Eligibility and where participation is available",
  "Any enrollment cost, and what it pays for",
  "The products or services being offered",
  "Qualifying activity under the plan",
  "Payout rules, timing, and fees, if rewards exist",
];

export const highlights = [
  {
    value: 4,
    label: "Standards stated up front",
    detail: "Community, structure, experience, and learning.",
  },
  {
    value: 3,
    label: "Steps in the introduction",
    detail: "Join with context, learn the model, then grow relationships.",
  },
  {
    value: 0,
    label: "Income guarantees",
    detail: "A standing rule of this site, not a performance figure.",
  },
];

export const unpublishedMetrics = [
  { label: "Member community", note: "Unpublished" },
  { label: "Rewards paid", note: "Unpublished" },
  { label: "Growth rate", note: "Unpublished" },
];

export const faqs = [
  {
    id: "register",
    question: "How do I register?",
    answer:
      "Registration is not open on this preview. When it launches, the steps, eligibility, and any cost will be shown before an account is created. The Get Started form on this site does not submit your details anywhere.",
  },
  {
    id: "products",
    question: "What products or services does proova offer?",
    answer:
      "They have not been published yet. Before anyone is asked to buy or recommend an offer, this site will name it, explain what it does, and state what a participant actually receives.",
  },
  {
    id: "compensation",
    question: "How does the compensation structure work?",
    answer:
      "It will be a written plan: the activity that qualifies, how a reward is calculated, and what is excluded. Until that document exists, proova does not quote percentages, ranks, or example earnings. Recruitment by itself is not income.",
  },
  {
    id: "guaranteed",
    question: "Are earnings guaranteed?",
    answer:
      "No. Any reward depends on individual effort, customer demand, the official plan, and applicable rules. A person can participate and earn nothing. Nothing on this website is a promise of income.",
  },
  {
    id: "withdrawals",
    question: "How do withdrawals work, if the plan includes them?",
    answer:
      "If the published plan includes withdrawals, it will state the methods, timing, fees, and any identity checks. Those terms are not available yet, and this site does not promise a payout schedule.",
  },
  {
    id: "support",
    question: "How can I get support?",
    answer:
      "Support channels will be listed in the footer when they are staffed. Until then, treat every form on this preview as a design sample. Messages are not delivered.",
  },
];

export const heroAssurances = [
  { label: "No income guarantees", icon: "ShieldCheck" },
  { label: "Plan published before enrollment", icon: "FileText" },
  { label: "Sample data always labeled", icon: "Tag" },
];

export const platformViews = [
  {
    id: "overview",
    label: "Overview",
    to: "/dashboard",
    title: "One calm view of your account.",
    body: "Stake, rewards, team, and recent activity sit together on a single page. Lines that depend on an unconfirmed rule are marked “not calculated” instead of being estimated.",
    points: ["Financial summary and statistics", "Account and referral link panel", "Recent ledger activity"],
  },
  {
    id: "network",
    label: "Network",
    to: "/dashboard/network",
    title: "Your structure, record by record.",
    body: "Upline and downline relationships are shown as a tree, with the verification status of every record beside it. A position in the tree is a relationship, not a payout.",
    points: ["Interactive network tree", "Direct referral list", "Verification status per record"],
  },
  {
    id: "ledger",
    label: "Ledger",
    to: "/dashboard/transactions",
    title: "Every line has a category and a status.",
    body: "Stakes, rewards, fees, and withdrawals are listed as individual entries — pending, completed, rejected, or failed — and can be filtered and exported to CSV.",
    points: ["Category and status filters", "CSV export", "Paginated history"],
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    to: "/dashboard/withdrawals",
    title: "Stated lines, shown one at a time.",
    body: "Each stated withdrawal line is listed on its own. Until the formula connecting them is confirmed, the preview does not calculate a net payout.",
    points: ["Withdrawal request form", "Each stated line listed separately", "No invented net figure"],
  },
];
