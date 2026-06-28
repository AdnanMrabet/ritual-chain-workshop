import { useEffect, useState } from "react";
import { formatCountdown, urgencyOf, type Urgency } from "@/lib/utils";

const URGENCY_COLOR: Record<Urgency, string> = {
  safe: "var(--color-lime)",
  warning: "var(--color-clay)",
  critical: "var(--color-thorn)",
};

/**
 * A draining "time drop": a vertical glass droplet whose liquid level falls as
 * the deadline approaches. Bio Lime when safe, Clay Orange on warning, Thorn
 * Red when critical. Ritual deadlines are in ms, so we tick in real time.
 */
export function TimeDropCountdown({
  label,
  deadlineMs,
  startMs,
}: {
  label: string;
  deadlineMs: number;
  startMs?: number;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const urgency = urgencyOf(deadlineMs, now);
  const color = URGENCY_COLOR[urgency];
  const start = startMs ?? deadlineMs - 60 * 60 * 1000;
  const span = Math.max(1, deadlineMs - start);
  const remaining = Math.max(0, deadlineMs - now);
  const fillPct = Math.max(4, Math.min(100, (remaining / span) * 100));
  const ended = remaining <= 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-9 overflow-hidden rounded-[40%_40%_50%_50%/55%_55%_45%_45%] border border-[var(--color-mist)]/15 bg-black/30">
        <div
          className="absolute inset-x-0 bottom-0 transition-[height,background] duration-1000 ease-linear"
          style={{
            height: `${fillPct}%`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 70%, transparent), ${color})`,
            boxShadow: `0 0 18px -2px ${color}`,
          }}
        />
        <div className="absolute inset-0 rounded-[40%_40%_50%_50%/55%_55%_45%_45%] ring-1 ring-inset ring-white/10" />
      </div>
      <div className="leading-tight">
        <div className="text-[13px] uppercase tracking-wide text-[var(--color-mist)]/55">
          {label}
        </div>
        <div
          className="font-mono text-[18px] font-semibold"
          style={{ color }}
        >
          {ended ? "ended" : formatCountdown(deadlineMs, now)}
        </div>
      </div>
    </div>
  );
}
