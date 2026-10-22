import { formatDuration } from "../../lib/dates";
import useIllustrativeWindow from "../../hooks/useIllustrativeWindow";

export default function RankWindowNote() {
  const clock = useIllustrativeWindow();
  return (
    <p className="m-0">
      {clock.remaining
        ? `Illustrative window: ${formatDuration(clock.remaining)} remaining. `
        : "The illustrative 72-hour window in this preview has elapsed. "}
      This clock is not a verified first-stake time, and no rank is confirmed.
    </p>
  );
}
