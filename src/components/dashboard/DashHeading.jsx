export default function DashHeading({ kicker, title, lede, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker ? <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-electric uppercase">{kicker}</p> : null}
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-snow sm:text-2xl">{title}</h2>
        {lede ? <div className="mt-2 text-sm leading-relaxed text-mist">{lede}</div> : null}
      </div>
      {action}
    </div>
  );
}
