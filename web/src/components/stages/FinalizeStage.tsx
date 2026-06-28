import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HandHeart, Crown, Sparkles } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OpenBloom } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useToast } from "@/components/ui/Toaster";
import { shortAddress, formatReward } from "@/lib/utils";

/** Stage 8 — Harvest the Winner. Owner confirms; nectar flows to the winner. */
export function FinalizeStage() {
  const { bounty, submissions, verdict, selectedWinner, selectWinner, finalizeWinner, busy } = useBloomStore();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  if (!bounty) return null;

  const eligible = submissions.filter((s) => s.eligible);
  const chosen = selectedWinner ?? verdict?.recommendedIndex ?? eligible[0]?.index ?? 0;
  const override = verdict ? chosen !== verdict.recommendedIndex : false;
  const finalized = bounty.phase === "finalized";

  async function harvest() {
    await finalizeWinner(chosen);
    setConfirm(false);
    toast("success", `Finalized — ${formatReward(bounty!.reward, bounty!.rewardSymbol)} paid.`);
  }

  return (
    <StageScaffold
      scene="Stage 8"
      title="Harvest the Winner"
      intro="The human owner confirms the winner. AI recommends, human decides. Finalize to release the reward."
      accent="var(--color-nectar)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <div className="text-[14px] uppercase tracking-wide text-[var(--color-mist)]/55">Choose the winning bloom</div>
          {eligible.map((s) => {
            const isChosen = s.index === chosen;
            const isAI = verdict?.recommendedIndex === s.index;
            return (
              <button
                key={s.index}
                onClick={() => selectWinner(s.index)}
                disabled={finalized}
                className="flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all"
                style={{
                  borderColor: isChosen ? "color-mix(in srgb, var(--color-nectar) 55%, transparent)" : "rgba(238,243,232,0.1)",
                  background: isChosen ? "color-mix(in srgb, var(--color-nectar) 9%, transparent)" : "rgba(255,255,255,0.02)",
                  boxShadow: isChosen ? "0 0 26px -8px var(--color-nectar)" : "none",
                }}
              >
                <OpenBloom size={48} petal={isChosen ? "var(--color-nectar)" : "var(--color-aqua)"} core={isChosen ? "var(--color-nectar)" : "var(--color-lime)"} />
                <div className="flex-1">
                  <div className="font-mono text-[13px] text-[var(--color-mist)]/75">{shortAddress(s.participant)}</div>
                  <div className="mt-0.5 flex gap-1.5">
                    {isAI && <Badge color="var(--color-orchid)"><Sparkles size={11} /> AI Pick</Badge>}
                    {isChosen && <Badge color="var(--color-nectar)"><Crown size={11} /> Chosen</Badge>}
                  </div>
                </div>
              </button>
            );
          })}

          {override && (
            <div className="rounded-2xl border border-[var(--color-clay)]/35 bg-[var(--color-clay)]/8 p-3.5">
              <p className="text-[14px] text-[var(--color-mist)]/85">
                <b className="text-[var(--color-clay)]">Human override.</b> You are choosing a winner different from the AI recommendation. This is allowed — the human decides.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--color-nectar)]/20 bg-black/20 p-6">
          <div className="relative grid h-[220px] place-items-center">
            <motion.div animate={finalized ? { y: -10, scale: 1.08 } : {}}>
              <OpenBloom size={180} petal="var(--color-nectar)" core="var(--color-nectar)" />
            </motion.div>
            {/* nectar payout stream */}
            <AnimatePresence>
              {finalized && Array.from({ length: 6 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-[var(--color-nectar)]"
                  style={{ left: "50%", top: "30%" }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: [0, 120] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="text-center">
            <div className="text-[14px] text-[var(--color-mist)]/55">Payout preview</div>
            <div className="text-[24px] font-semibold text-[var(--color-nectar)]">{formatReward(bounty.reward, bounty.rewardSymbol)}</div>
            <div className="font-mono text-[13px] text-[var(--color-mist)]/60">→ {shortAddress(eligible.find((s) => s.index === chosen)?.participant)}</div>
          </div>

          {finalized ? (
            <Badge color="var(--color-nectar)" dot>Finalized — reward paid</Badge>
          ) : (
            <Button variant="nectar" size="lg" onClick={() => setConfirm(true)} disabled={busy} className="w-full">
              <HandHeart size={17} /> Finalize & pay winner
            </Button>
          )}
        </div>
      </div>

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Finalize this winner?"
        description="This releases the locked reward nectar to the chosen participant. It cannot be undone."
        accent="var(--color-nectar)"
        confirmVariant="nectar"
        confirmLabel="Harvest & pay"
        busy={busy}
        onConfirm={harvest}
        checklist={[
          `${formatReward(bounty.reward, bounty.rewardSymbol)} will be paid to the chosen bloom.`,
          override ? "You are overriding the AI recommendation (human decides)." : "You are confirming the AI-recommended winner.",
          "The reward release is final.",
        ]}
      />
    </StageScaffold>
  );
}
