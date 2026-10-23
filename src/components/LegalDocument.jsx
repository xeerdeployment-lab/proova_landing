import PageEnter from "./PageEnter";

export default function LegalDocument({ title, children }) {
  return (
    <PageEnter>
      <article className="mx-auto w-full max-w-3xl px-5 pt-32 pb-24 sm:px-8">
        <p className="eyebrow">Draft</p>
        <h1 className="heading-hud mt-6 text-4xl leading-[0.95] sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-mist">Placeholder for legal review. Not a finished policy.</p>
        <div className="mt-8 border border-amber-300/30 bg-amber-300/[0.06] px-4 py-3 text-sm leading-relaxed text-snow">
          Have qualified counsel replace this draft before launch. It does not create legal
          rights or describe a live service.
        </div>
        <div className="mt-10 space-y-8 text-sm leading-relaxed text-mist sm:text-base">{children}</div>
      </article>
    </PageEnter>
  );
}
