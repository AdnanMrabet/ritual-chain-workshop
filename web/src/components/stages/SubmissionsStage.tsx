import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { SubmissionBloomCard } from "@/components/visual/SubmissionBloomCard";
import { Badge } from "@/components/ui/Badge";

/** Stage 9 — Submission Garden. Every seed, sprout and bloom as a visual card. */
export function SubmissionsStage() {
  const { submissions } = useBloomStore();

  const counts = {
    sealed: submissions.filter((s) => s.status === "sealed" || s.status === "dormant").length,
    blooms: submissions.filter((s) => s.eligible).length,
    winner: submissions.filter((s) => s.status === "winner").length,
  };

  return (
    <StageScaffold
      scene="Stage 9"
      title="Submission Garden"
      intro="Every submission, shown as a living object. Sealed seeds hide their answer; revealed blooms open; the winner glows gold."
      accent="var(--color-lime)"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge color="var(--color-sealed)">{counts.sealed} sealed</Badge>
        <Badge color="var(--color-aqua)">{counts.blooms} eligible blooms</Badge>
        {counts.winner > 0 && <Badge color="var(--color-nectar)" dot>winner harvested</Badge>}
      </div>

      {submissions.length === 0 ? (
        <p className="text-[15px] text-[var(--color-mist)]/55">No seeds planted yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {submissions.map((s) => (
            <SubmissionBloomCard key={s.index} submission={s} />
          ))}
        </div>
      )}
    </StageScaffold>
  );
}
