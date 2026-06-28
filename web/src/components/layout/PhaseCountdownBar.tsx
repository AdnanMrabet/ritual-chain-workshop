import { useEffect, useState } from "react";
import { Clock, Sprout, KeyRound, Sparkles, Trophy } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { livePhase } from "@/lib/stages";
import { formatCountdown, urgencyOf, type Urgency } from "@/lib/utils";
import type { Bounty } from "@/types";

const URGENCY_COLOR: Record<Urgency, string> = {
  safe: "var(--color-lime)",
  warning: "var(--color-clay)",
  critical: "var(--color-thorn)",
};

/**
 * Always-visible phase bar: shows where the bounty is in its lifecycle and the
 * live countdown to the next boundary (submission close → reveal close → judge).
 * The app auto-advances stages as these elapse (store.tick).
 */
export function PhaseCountdownBar() {
  const bounty = useBloomStore((s) => s.bounty);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!bounty) return null;

  const phase = livePhase(bounty, now);

  return (
    <div className="glass flex w-full flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-[var(--color-aqua)]" />
        <span className="text-[13px] uppercase tracking-[0.16em] text-[var(--color-mist)]/55">
          Bounty #{bounty.id.toString()}
        </span>
      </div>

      <CountItem
        icon={<Sprout size={15} />}
        label="Submission closes"
        target={bounty.submissionDeadline}
        now={now}
        active={phase === "commit"}
        passedLabel="Submission closed"
      />
      <CountItem
        icon={<KeyRound size={15} />}
        label="Reveal closes"
        target={bounty.revealDeadline}
        now={now}
        active={phase === "reveal"}
        passedLabel="Reveal closed"
      />

      <PhasePill phase={phase} bounty={bounty} />
    </div>
  );
}

function CountItem({
  icon,
  label,
  target,
  now,
  active,
  passedLabel,
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  now: number;
  active: boolean;
  passedLabel: string;
}) {
  const ended = now >= target;
  const color = ended ? "var(--color-mist)" : URGENCY_COLOR[urgencyOf(target, now)];

  return (
    <div className="flex items-center gap-2">
      <span style={{ color: ended ? "var(--color-mist)" : color }} className={active ? "cb-pulse-glow" : ""}>
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-[11px] uppercase tracking-wide text-[var(--color-mist)]/45">
          {ended ? passedLabel : label}
        </div>
        <div className="font-mono text-[15px] font-semibold" style={{ color: ended ? "var(--color-mist)/70" : color }}>
          {ended ? "—" : formatCountdown(target, now)}
        </div>
      </div>
    </div>
  );
}

function PhasePill({ phase, bounty }: { phase: Bounty["phase"]; bounty: Bounty }) {
  const map: Record<Bounty["phase"], { label: string; color: string; icon: React.ReactNode }> = {
    commit: { label: "Planting (Commit)", color: "var(--color-sealed)", icon: <Sprout size={14} /> },
    reveal: { label: "Sprouting (Reveal)", color: "var(--color-aqua)", icon: <KeyRound size={14} /> },
    judging: { label: "Ready to judge", color: "var(--color-orchid)", icon: <Sparkles size={14} /> },
    judged: { label: "Awaiting harvest", color: "var(--color-orchid)", icon: <Sparkles size={14} /> },
    finalized: { label: "Finalized", color: "var(--color-nectar)", icon: <Trophy size={14} /> },
  };
  const m = map[phase];
  void bounty;
  return (
    <div
      className="ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium"
      style={{
        color: m.color,
        borderColor: `color-mix(in srgb, ${m.color} 40%, transparent)`,
        background: `color-mix(in srgb, ${m.color} 10%, transparent)`,
      }}
    >
      {m.icon}
      {m.label}
    </div>
  );
}
