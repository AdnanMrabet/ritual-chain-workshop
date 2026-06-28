import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { TimeDropCountdown } from "@/components/visual/TimeDropCountdown";
import { Badge } from "@/components/ui/Badge";
import { shortAddress, formatReward } from "@/lib/utils";
import type { BountyPhase } from "@/types";

const PHASE_META: Record<BountyPhase, { label: string; color: string; copy: string }> = {
  commit: { label: "Commit", color: "var(--color-sealed)", copy: "Commit phase: answers stay hidden." },
  reveal: { label: "Reveal", color: "var(--color-aqua)", copy: "Reveal phase: valid answers become public." },
  judging: { label: "Judging", color: "var(--color-orchid)", copy: "Judging phase: AI evaluates all revealed answers together." },
  judged: { label: "Judged", color: "var(--color-orchid)", copy: "AI verdict ready — awaiting human finalization." },
  finalized: { label: "Finalized", color: "var(--color-nectar)", copy: "Finalized: winner paid." },
};

function Stat({ label, value, color = "var(--color-mist)" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-mist)]/10 bg-white/[0.02] p-4">
      <div className="text-[13px] uppercase tracking-wide text-[var(--color-mist)]/50">{label}</div>
      <div className="mt-1 text-[18px] font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}

/** Stage 2 — Growth State. Current phase + the two draining time drops. */
export function StatusStage() {
  const { bounty, submissions } = useBloomStore();
  if (!bounty) return null;

  const meta = PHASE_META[bounty.phase];
  const revealed = submissions.filter((s) => s.eligible).length;

  return (
    <StageScaffold
      scene="Stage 2"
      title="Growth State"
      intro={meta.copy}
      accent={meta.color}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={meta.color} dot>{meta.label} phase</Badge>
            <Badge color="var(--color-nectar)">bounty #{bounty.id.toString()}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Reward locked" value={formatReward(bounty.reward, bounty.rewardSymbol)} color="var(--color-nectar)" />
            <Stat label="Owner" value={shortAddress(bounty.owner)} />
            <Stat label="Submissions" value={String(submissions.length)} color="var(--color-lime)" />
            <Stat label="Eligible blooms" value={String(revealed)} color="var(--color-aqua)" />
          </div>

          <div className="rounded-2xl border border-[var(--color-mist)]/10 bg-black/20 p-4">
            <div className="text-[14px] font-medium text-[var(--color-mist)]/80">Rubric</div>
            <p className="mt-1 text-[15px] leading-relaxed text-[var(--color-mist)]/65">{bounty.rubric}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-3xl border border-[var(--color-mist)]/10 bg-black/20 p-5">
          <div className="text-[14px] uppercase tracking-wide text-[var(--color-mist)]/55">Time drops</div>
          <TimeDropCountdown label="Submission" deadlineMs={bounty.submissionDeadline} />
          <TimeDropCountdown label="Reveal" deadlineMs={bounty.revealDeadline} startMs={bounty.submissionDeadline} />
          <p className="text-[13px] leading-snug text-[var(--color-mist)]/50">
            When a drop empties it falls into the garden and the phase advances.
          </p>
        </div>
      </div>
    </StageScaffold>
  );
}
