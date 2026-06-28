import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dice5, Eye, EyeOff, Lock, Download, Send } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Textarea, FieldLabel } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { HashTagLabel } from "@/components/visual/HashTagLabel";
import { CopyHashButton } from "@/components/visual/CopyHashButton";
import { SealedSeed } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useToast } from "@/components/ui/Toaster";
import { generateSalt, computeCommitment } from "@/lib/crypto";
import { saveRevealKit, downloadRevealKit } from "@/lib/revealKit";
import { shortHash } from "@/lib/utils";
import type { Hex } from "viem";

/** Stage 3 — Seal the Seed. Answer → particles → seed → salt drop → sealed. */
export function CommitStage() {
  const { bounty, address, submitCommitment, busy } = useBloomStore();
  const toast = useToast();
  const [answer, setAnswer] = useState("");
  const [salt, setSalt] = useState<Hex | null>(null);
  const [showSalt, setShowSalt] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const sender = (address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

  const commitment = useMemo(() => {
    if (!salt || !answer.trim() || !bounty) return null;
    return computeCommitment(answer.trim(), salt, sender, bounty.id);
  }, [salt, answer, sender, bounty]);

  const stage = !answer.trim() ? "empty" : !salt ? "answer" : "ready";

  async function commit() {
    if (!commitment || !salt || !bounty) return;
    saveRevealKit({ bountyId: bounty.id.toString(), answer: answer.trim(), salt, commitment, savedAt: Date.now() });
    await submitCommitment(commitment);
    setConfirm(false);
    toast("success", "Commitment submitted. Your answer is sealed.");
    setAnswer("");
    setSalt(null);
  }

  return (
    <StageScaffold
      scene="Stage 3"
      title="Seal the Seed"
      intro="Your answer becomes a sealed seed. Only the hash is published on-chain. Keep your answer and salt safe for reveal."
      accent="var(--color-sealed)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* left: inputs */}
        <div className="space-y-4">
          <div>
            <FieldLabel hint="hidden until reveal">Your answer</FieldLabel>
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer. It never goes on-chain in the clear." />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => setSalt(generateSalt())}>
              <Dice5 size={15} /> {salt ? "Regenerate salt" : "Generate salt"}
            </Button>
            {salt && (
              <button onClick={() => setShowSalt((v) => !v)} className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-mist)]/65 hover:text-[var(--color-aqua)]">
                {showSalt ? <EyeOff size={14} /> : <Eye size={14} />}
                {showSalt ? "Hide salt" : "Show salt"}
              </button>
            )}
          </div>

          {salt && (
            <div className="rounded-xl border border-[var(--color-mist)]/10 bg-black/25 p-3">
              <div className="text-[13px] text-[var(--color-mist)]/55">Salt (your secret drop)</div>
              <div className="mt-1 font-mono text-[13px] text-[var(--color-aqua)] break-all">
                {showSalt ? salt : shortHash(salt, 14, 10)}
              </div>
            </div>
          )}

          {/* commitment formula */}
          <div className="rounded-xl border border-[var(--color-mist)]/10 bg-black/20 p-3">
            <div className="text-[13px] text-[var(--color-mist)]/55">Commitment formula</div>
            <code className="mt-1 block font-mono text-[13px] leading-relaxed text-[var(--color-lime)]/90">
              keccak256(answer, salt, msg.sender, bountyId)
            </code>
          </div>

          {commitment && (
            <div className="rounded-xl border border-[var(--color-lime)]/25 bg-[var(--color-lime)]/6 p-3">
              <div className="mb-1.5 text-[13px] text-[var(--color-mist)]/65">Commitment hash (this is what goes on-chain)</div>
              <div className="flex flex-wrap items-center gap-2">
                <HashTagLabel hash={commitment} color="var(--color-lime)" />
                <CopyHashButton value={commitment} label="Copy hash" />
              </div>
            </div>
          )}
        </div>

        {/* right: seed scene */}
        <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-[var(--color-mist)]/10 bg-black/20 p-6">
          <div className="relative grid h-[200px] place-items-center">
            <SealedSeed size={170} glow={stage === "ready" ? "var(--color-lime)" : "var(--color-sealed)"} />
            <AnimatePresence>
              {stage === "answer" && (
                <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute h-1 w-1 rounded-full bg-[var(--color-lime)]"
                      style={{ left: "50%", top: "50%" }}
                      animate={{ x: [Math.cos(i) * 70, 0], y: [Math.sin(i * 2) * 70, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="text-center text-[14px] text-[var(--color-mist)]/65">
            {stage === "empty" && "Write an answer to fill the seed."}
            {stage === "answer" && "Your answer is gathering inside the seed…"}
            {stage === "ready" && "The salt drop has sealed the shell. Only the hash shows."}
          </div>

          {commitment && bounty && (
            <div className="flex w-full flex-col gap-2">
              <Button variant="ghost" size="sm" onClick={() => downloadRevealKit({ bountyId: bounty.id.toString(), answer: answer.trim(), salt: salt!, commitment, savedAt: Date.now() })}>
                <Download size={15} /> Download reveal kit
              </Button>
              <Button variant="lime" size="lg" onClick={() => setConfirm(true)} disabled={busy}>
                <Send size={17} /> Submit commitment
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[var(--color-clay)]/30 bg-[var(--color-clay)]/8 p-3.5">
        <Lock size={17} className="mt-0.5 text-[var(--color-clay)]" />
        <p className="text-[14px] text-[var(--color-mist)]/80">
          Save your reveal kit. Without your answer <b>and</b> salt you cannot reveal later, and the seed never blooms.
        </p>
      </div>

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Submit this commitment?"
        description="Only the commitment hash is published. Your answer stays private until you reveal."
        accent="var(--color-lime)"
        confirmVariant="lime"
        confirmLabel="Seal & submit"
        busy={busy}
        onConfirm={commit}
        checklist={[
          "Only the hash goes on-chain — not your answer.",
          "Your answer + salt are saved locally as a reveal kit.",
          "You will need both to reveal after the deadline.",
          "Reveal must match answer + salt + sender + bountyId.",
        ]}
      />
    </StageScaffold>
  );
}
