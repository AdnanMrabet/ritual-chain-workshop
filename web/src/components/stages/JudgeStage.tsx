import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OracleFlower, OpenBloom, SealedSeed } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useRitualWallet } from "@/hooks/useRitualWallet";

const LOADING_STEPS = [
  "Collecting revealed answers",
  "Excluding unrevealed submissions",
  "Building batch input",
  "Applying rubric",
  "Generating AI recommendation",
  "Preparing verdict",
];

/** Stage 6 — Bloom Review. All eligible blooms judged together in ONE batch.
    No chatbot, no one-by-one judging. */
export function JudgeStage() {
  const { submissions, judgeAll, busy } = useBloomStore();
  const { status: walletStatus } = useRitualWallet();
  const funded = walletStatus?.ready === true;
  const [confirm, setConfirm] = useState(false);
  const [step, setStep] = useState(-1);

  const eligible = submissions.filter((s) => s.eligible);
  const excluded = submissions.filter((s) => !s.eligible);

  useEffect(() => {
    if (!busy) {
      setStep(-1);
      return;
    }
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(LOADING_STEPS.length - 1, s + 1)), 280);
    return () => clearInterval(t);
  }, [busy]);

  async function run() {
    setConfirm(false);
    await judgeAll();
  }

  return (
    <StageScaffold
      scene="Stage 6"
      title="Bloom Review"
      intro="All revealed answers are judged together in one batch. No one-by-one judging. AI recommends. Human finalizes."
      accent="var(--color-orchid)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* botanical review table */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-orchid)]/20 bg-black/25 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[14px] uppercase tracking-wide text-[var(--color-mist)]/55">Review table</span>
            <Badge color="var(--color-aqua)">{eligible.length} eligible</Badge>
          </div>

          {/* AI light wash while processing */}
          {busy && (
            <motion.div
              className="pointer-events-none absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.35, 0.1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(215,168,255,0.35), transparent 70%)" }}
            />
          )}

          <div className="relative flex flex-wrap gap-4">
            {eligible.map((s) => (
              <motion.div key={s.index} layout className="flex flex-col items-center gap-1">
                <OpenBloom size={72} petal="var(--color-aqua)" />
                <span className="font-mono text-[12px] text-[var(--color-mist)]/55">#{s.index}</span>
              </motion.div>
            ))}
            {eligible.length === 0 && (
              <p className="text-[14px] text-[var(--color-mist)]/55">No eligible blooms — nothing to judge yet.</p>
            )}
          </div>

          {excluded.length > 0 && (
            <div className="mt-5 border-t border-[var(--color-mist)]/10 pt-4">
              <div className="mb-2 text-[13px] text-[var(--color-mist)]/45">Excluded — not revealed</div>
              <div className="flex flex-wrap gap-3 opacity-40">
                {excluded.map((s) => (
                  <div key={s.index} className="flex flex-col items-center gap-1">
                    <SealedSeed size={52} />
                    <span className="font-mono text-[11px] text-[var(--color-mist)]/45">#{s.index}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* oracle + action */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--color-mist)]/10 bg-black/20 p-5">
          <OracleFlower size={170} openness={1} processing={busy} />
          {busy ? (
            <div className="w-full space-y-1.5">
              {LOADING_STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2 text-[13px]" style={{ color: i <= step ? "var(--color-orchid)" : "rgba(238,243,232,0.35)" }}>
                  <span className="grid h-4 w-4 place-items-center">
                    {i < step ? "✓" : i === step ? <span className="h-2 w-2 rounded-full bg-[var(--color-orchid)] cb-pulse-glow" style={{ color: "var(--color-orchid)" }} /> : "·"}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="text-center text-[14px] text-[var(--color-mist)]/65">
                The oracle is funded and ready to review every bloom at once.
              </p>
              <Button variant="orchid" size="lg" disabled={eligible.length === 0 || !funded} onClick={() => setConfirm(true)} className="w-full">
                <Sparkles size={17} /> Judge all (batch)
              </Button>
              {!funded && (
                <p className="text-center text-[13px] text-[var(--color-clay)]">Fund the oracle first (Stage 5).</p>
              )}
            </>
          )}
        </div>
      </div>

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Judge all eligible blooms?"
        description="The Ritual AI evaluates every valid revealed answer together in a single batch against the rubric, then recommends a winner."
        accent="var(--color-orchid)"
        confirmVariant="orchid"
        confirmLabel="Run batch judging"
        busy={busy}
        onConfirm={run}
        checklist={[
          `${eligible.length} eligible blooms will be judged together.`,
          "Unrevealed submissions are excluded.",
          "On Ritual this pins gas: 6,000,000 for the async LLM replay.",
          "The AI only recommends — you finalize the winner.",
        ]}
      />
    </StageScaffold>
  );
}
