import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { HashTagLabel } from "@/components/visual/HashTagLabel";
import { OpenBloom, SealedSeed, WitheredSprout } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useToast } from "@/components/ui/Toaster";
import { computeCommitment } from "@/lib/crypto";
import { loadRevealKit, type RevealKitEntry } from "@/lib/revealKit";

/** Stage 4 — Open the Sprout. Compare original vs recomputed hash roots. */
export function RevealStage() {
  const { bounty, address, revealAnswer, busy } = useBloomStore();
  const toast = useToast();
  const [kit, setKit] = useState<RevealKitEntry | null>(null);
  const [confirm, setConfirm] = useState(false);
  const sender = (address ?? "0x0000000000000000000000000000000000000000") as `0x${string}`;

  useEffect(() => {
    if (bounty) setKit(loadRevealKit(bounty.id.toString()));
  }, [bounty]);

  const recomputed = useMemo(() => {
    if (!kit || !bounty) return null;
    return computeCommitment(kit.answer, kit.salt, sender, bounty.id);
  }, [kit, bounty, sender]);

  const matches = useMemo(() => {
    if (!kit || !recomputed) return null;
    return recomputed.toLowerCase() === kit.commitment.toLowerCase();
  }, [kit, recomputed]);

  async function reveal() {
    if (!kit) return;
    await revealAnswer(kit.answer, kit.salt);
    setConfirm(false);
    toast("success", "Reveal verified. Your bloom is eligible.");
  }

  return (
    <StageScaffold
      scene="Stage 4"
      title="Open the Sprout"
      intro="Reveal your answer and salt. If answer + salt + sender + bountyId match the original commitment, the seed blooms and becomes eligible for judging."
      accent="var(--color-aqua)"
    >
      {!kit ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-clay)]/40 bg-[var(--color-clay)]/8 p-5">
          <AlertTriangle size={20} className="mt-0.5 text-[var(--color-clay)]" />
          <div>
            <div className="text-[16px] font-medium text-[var(--color-mist)]">Missing local reveal kit</div>
            <p className="mt-1 text-[14px] text-[var(--color-mist)]/70">
              No saved answer + salt for this bounty in this browser. Without the reveal kit the sprout stays empty and cannot bloom.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* roots comparison */}
          <div className="space-y-4">
            <RootRow label="Original hash root" hash={kit.commitment} color="var(--color-sealed)" />
            <div className="flex justify-center">
              <ComparePipe matches={matches} />
            </div>
            <RootRow label="Recomputed hash root" hash={recomputed ?? "—"} color={matches ? "var(--color-aqua)" : "var(--color-thorn)"} />

            <div
              className="flex items-center gap-2.5 rounded-2xl border p-3.5"
              style={{
                borderColor: matches ? "color-mix(in srgb, var(--color-aqua) 40%, transparent)" : "color-mix(in srgb, var(--color-thorn) 40%, transparent)",
                background: matches ? "color-mix(in srgb, var(--color-aqua) 8%, transparent)" : "color-mix(in srgb, var(--color-thorn) 8%, transparent)",
              }}
            >
              {matches ? <CheckCircle2 size={18} className="text-[var(--color-aqua)]" /> : <XCircle size={18} className="text-[var(--color-thorn)]" />}
              <p className="text-[14px] text-[var(--color-mist)]/85">
                {matches ? "Hash match confirmed. This reveal is valid." : "Hash mismatch. This answer does not match the original commitment."}
              </p>
            </div>

            <Button variant="lime" size="lg" onClick={() => setConfirm(true)} disabled={!matches || busy}
              className="w-full bg-[var(--color-aqua)]/12 text-[var(--color-aqua)] border border-[var(--color-aqua)]/40 hover:bg-[var(--color-aqua)]/22 focus-visible:ring-[var(--color-aqua)]/50">
              <KeyRound size={17} /> Reveal answer
            </Button>
            {!matches && (
              <p className="text-center text-[13px] text-[var(--color-thorn)]/80">
                Reveal is blocked while the hashes don't match — it would only waste a transaction.
              </p>
            )}
          </div>

          {/* bloom scene */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--color-mist)]/10 bg-black/20 p-6">
            <motion.div animate={{ scale: matches ? 1 : 0.92 }} className="grid h-[200px] place-items-center">
              {matches === null ? <SealedSeed size={170} /> : matches ? <OpenBloom size={170} /> : <WitheredSprout size={170} />}
            </motion.div>
            <p className="text-center text-[14px] text-[var(--color-mist)]/65">
              {matches === null && "Load your reveal kit to compare roots."}
              {matches === true && "The roots joined — your seed blooms. Only valid blooms are eligible."}
              {matches === false && "The root dried. A mismatched reveal cannot bloom."}
            </p>
          </div>
        </div>
      )}

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Reveal your answer?"
        description="Your answer becomes public and your bloom becomes eligible for batch AI judging."
        accent="var(--color-aqua)"
        confirmVariant="lime"
        confirmLabel="Open the sprout"
        busy={busy}
        onConfirm={reveal}
        checklist={[
          "Your answer will be published on-chain.",
          "The hashes already match your original commitment.",
          "Only valid revealed blooms are eligible for judging.",
        ]}
      />
    </StageScaffold>
  );
}

function RootRow({ label, hash, color }: { label: string; hash: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-mist)]/10 bg-black/20 p-3.5">
      <div className="mb-1.5 text-[13px] text-[var(--color-mist)]/55">{label}</div>
      <HashTagLabel hash={hash} color={color} full />
    </div>
  );
}

function ComparePipe({ matches }: { matches: boolean | null }) {
  const color = matches === null ? "var(--color-mist)" : matches ? "var(--color-aqua)" : "var(--color-thorn)";
  return (
    <svg width="60" height="44" viewBox="0 0 60 44">
      <path d="M30 0 L30 18" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
      <path d="M30 26 L30 44" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
      <circle cx="30" cy="22" r="6" fill="none" stroke={color} strokeWidth="2" className={matches ? "cb-pulse-glow" : ""} style={{ color }} />
    </svg>
  );
}
