import { Minus, Plus } from "lucide-react";
import cx from "../../lib/cx";
import { centsToInput, formatCents } from "../../lib/money";

export default function AmountField({
  id,
  label,
  raw,
  onRaw,
  cents,
  error,
  presets = [],
  presetLabel = (preset) => formatCents(preset.cents),
  minCents,
  maxCents,
  stepCents,
  slider = false,
  disabled = false,
  hint,
}) {
  const setCents = (value) => onRaw(centsToInput(value));
  const step = (direction) => {
    const base = cents ?? minCents;
    const next = cents == null ? minCents : Math.round((base + direction * stepCents) / stepCents) * stepCents;
    setCents(Math.min(maxCents, Math.max(minCents, next)));
  };
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-snow">
        {label}
      </label>
      <div
        className={cx(
          "mt-2 flex items-center gap-2 rounded-2xl border bg-canvas/60 p-2 transition-[border-color,box-shadow] focus-within:border-accent/60 focus-within:shadow-[0_0_0_4px_rgba(57,217,138,0.12)]",
          error ? "border-danger/50" : "border-white/10",
          disabled && "opacity-60",
        )}
      >
        {stepCents ? (
          <button type="button" className="icon-btn h-11 w-11 shrink-0" onClick={() => step(-1)} disabled={disabled || (cents != null && cents <= minCents)} aria-label={`Decrease by ${formatCents(stepCents)}`}>
            <Minus size={16} />
          </button>
        ) : null}
        <span className="font-display-num pl-1 text-2xl font-semibold text-mist sm:text-3xl" aria-hidden="true">
          $
        </span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={raw}
          disabled={disabled}
          onChange={(event) => onRaw(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${errorId} ${hint ? hintId : ""}`.trim()}
          className="amount-input min-w-0 flex-1 py-2 text-3xl sm:text-4xl"
          placeholder="0"
        />
        {stepCents ? (
          <button type="button" className="icon-btn h-11 w-11 shrink-0" onClick={() => step(1)} disabled={disabled || (cents != null && cents >= maxCents)} aria-label={`Increase by ${formatCents(stepCents)}`}>
            <Plus size={16} />
          </button>
        ) : null}
      </div>
      <p id={errorId} className="mt-2 min-h-5 text-sm text-danger" role="alert">
        {error ?? ""}
      </p>
      {hint ? (
        <p id={hintId} className="text-xs text-mist">
          {hint}
        </p>
      ) : null}

      {presets.length ? (
        <div className={cx("mt-3 grid gap-2 sm:grid-cols-6", presets.length % 4 === 0 ? "grid-cols-4" : "grid-cols-3")} role="group" aria-label="Preset amounts">
          {presets.map((preset) => (
            <button
              key={preset.key ?? preset.cents}
              type="button"
              className="preset"
              aria-pressed={cents === preset.cents}
              disabled={disabled || preset.cents < minCents || preset.cents > maxCents}
              onClick={() => setCents(preset.cents)}
            >
              {presetLabel(preset)}
            </button>
          ))}
        </div>
      ) : null}

      {slider ? (
        <div className="mt-5">
          <label htmlFor={`${id}-slider`} className="sr-only">
            {label} slider
          </label>
          <input
            id={`${id}-slider`}
            type="range"
            min={minCents / 100}
            max={maxCents / 100}
            step={stepCents / 100}
            value={cents != null && cents >= minCents && cents <= maxCents ? cents / 100 : minCents / 100}
            disabled={disabled}
            onChange={(event) => setCents(Number(event.target.value) * 100)}
            aria-valuetext={cents != null ? formatCents(cents) : "No amount"}
            className="w-full accent-[#39D98A]"
          />
          <div className="mt-1 flex justify-between text-xs text-mist">
            <span className="num">{formatCents(minCents)}</span>
            <span className="num">{formatCents(maxCents)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
