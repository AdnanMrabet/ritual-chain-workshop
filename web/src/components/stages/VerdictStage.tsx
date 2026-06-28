import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OpenBloom } from "@/components/visual/GardenGlyphs";
import { shortAddress } from "@/lib/utils";

/** Stage 7 — Oracle's Recommendation. Ranked blooms; AI pick glows orchid. */
export function VerdictStage() {
  const { verdict, submissions, setStage } = useBloomStore();

  if (!verdict) {
    return (
      <StageScaffold scene="Stage 7" title="Oracle's Recommendation" intro="Run batch judging first to receive the AI recommendation." accent="var(--color-orchid)">
        <p className="text-[15px] text-[var(--color-mist)]/55">No verdict yet.</p>
      </StageScaffold>
    );
  }

  const byIndex = new Map(submissions.map((s) => [s.index, s]));

  return (
    <StageScaffold
      scene="Stage 7"
      title="Oracle's Recommendation"
      intro="The AI has recommended a winner. This is not final yet — the owner must confirm the payout."
      accent="var(--color-orchid)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {verdict.ranking.map((r, i) => {
            const sub = byIndex.get(r.index);
            const isPick = r.index === verdict.recommendedIndex;
            return (
              <motion.div
                key={r.index}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 rounded-2xl border p-3.5"
                style={{
                  borderColor: isPick ? "color-mix(in srgb, var(--color-orchid) 55%, transparent)" : "rgba(238,243,232,0.1)",
                  background: isPick ? "color-mix(in srgb, var(--color-orchid) 9%, transparent)" : "rgba(255,255,255,0.02)",
                  boxShadow: isPick ? "0 0 28px -8px var(--color-orchid)" : "none",
                }}
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black/30 font-mono text-[15px] text-[var(--color-mist)]/70">
                  {i + 1}
                </div>
                <OpenBloom size={48} petal={isPick ? "var(--color-orchid)" : "var(--color-aqua)"} core={isPick ? "var(--color-orchid)" : "var(--color-lime)"} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-[var(--color-mist)]/70">{sub ? shortAddress(sub.participant) : `#${r.index}`}</span>
                    {isPick && <Badge color="var(--color-orchid)"><Sparkles size={12} /> AI Pick</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-[var(--color-mist)]/60">{r.reason}</p>
                </div>
                <div className="text-right">
                  <div className="text-[18px] font-semibold text-[var(--color-orchid)]">{r.score}</div>
                  <div className="text-[11px] text-[var(--color-mist)]/45">score</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-[var(--color-orchid)]/25 bg-black/20 p-5">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--color-orchid)] cb-orchid-rhythm" />
              <span className="text-[15px] font-semibold text-[var(--color-orchid)]">AI summary</span>
              <Badge color="var(--color-orchid)">{verdict.confidence} confidence</Badge>
            </div>
            <p className="text-[15px] leading-relaxed text-[var(--color-mist)]/80">{verdict.summary}</p>
          </div>

          <div className="rounded-2xl border border-[var(--color-nectar)]/25 bg-[var(--color-nectar)]/6 p-4">
            <p className="text-[14px] text-[var(--color-mist)]/80">
              <b className="text-[var(--color-nectar)]">AI recommends. Human decides.</b> The owner must finalize the winner before any reward is paid.
            </p>
          </div>

          <Button variant="nectar" size="lg" onClick={() => setStage("finalize")}>
            Go to harvest <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    </StageScaffold>
  );
}
