import { useState } from "react";
import { Droplets } from "lucide-react";
import { formatEther } from "viem";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OracleFlower } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useToast } from "@/components/ui/Toaster";
import { useRitualWallet } from "@/hooks/useRitualWallet";
import { MIN_LLM_BALANCE, DEPOSIT_AMOUNT } from "@/lib/ritualWallet";

/** Stage 5 — Feed the Oracle. Deposit RITUAL into the LLM escrow (RitualWallet)
    so the AI judge can be charged during judgeAll. This is a real on-chain
    deposit, not a per-bounty balance. */
export function FundStage() {
  const { bounty } = useBloomStore();
  const toast = useToast();
  const { status, depositing, deposit, refresh } = useRitualWallet();
  const [confirm, setConfirm] = useState(false);
  if (!bounty) return null;

  const balance = status ? Number(formatEther(status.balance)) : 0;
  const required = Number(formatEther(MIN_LLM_BALANCE));
  const depositAmt = Number(formatEther(DEPOSIT_AMOUNT));
  const ready = status?.ready === true;
  const openness = Math.min(1, balance / required);

  async function fund() {
    try {
      await deposit();
      toast("success", "Oracle fed — AI judging escrow funded and locked.");
    } catch {
      toast("error", "Deposit failed. Check your wallet and try again.");
    } finally {
      setConfirm(false);
    }
  }

  return (
    <StageScaffold
      scene="Stage 5"
      title="Feed the Oracle"
      intro="Fund the AI judgement before evaluation. The Ritual LLM precompile charges your RitualWallet escrow, so it needs ~0.32 RITUAL deposited and locked."
      accent="var(--color-clay)"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label="Escrow balance" value={`${balance.toFixed(3)} RITUAL`} color="var(--color-aqua)" />
            <Metric label="Minimum required" value={`${required.toFixed(2)} RITUAL`} color="var(--color-clay)" />
          </div>

          {status && (
            <div className="rounded-2xl border border-[var(--color-mist)]/10 bg-black/20 p-3.5 text-[14px] text-[var(--color-mist)]/70">
              Lock {status.hasEnoughLockDuration ? "is sufficient" : "needs extending"} ·{" "}
              {status.hasEnoughBalance ? "balance is sufficient" : "balance is low"}.
            </div>
          )}

          <Badge color={ready ? "var(--color-aqua)" : "var(--color-clay)"} dot>
            {ready ? "AI Ready" : "Not ready — deposit nectar"}
          </Badge>

          <Button variant="clay" size="lg" onClick={() => setConfirm(true)} disabled={depositing}>
            <Droplets size={17} /> {depositing ? "Depositing…" : `Deposit ${depositAmt} RITUAL`}
          </Button>
          <button
            onClick={() => void refresh()}
            className="block text-[13px] text-[var(--color-mist)]/55 hover:text-[var(--color-aqua)]"
          >
            Refresh escrow status
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[var(--color-mist)]/10 bg-black/20 p-6">
          <OracleFlower size={200} openness={openness} processing={false} />
          <div className="text-center text-[14px] text-[var(--color-mist)]/65">
            {ready
              ? "The oracle flower has opened — judging escrow funded and locked."
              : openness > 0
                ? "The flower stirs but needs more nectar to open."
                : "The oracle is closed and waiting for inference fuel."}
          </div>
        </div>
      </div>

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Fund the AI judgement?"
        description="This deposits RITUAL into the Ritual LLM escrow (RitualWallet) and locks it long enough to cover the async judging callback."
        accent="var(--color-clay)"
        confirmVariant="clay"
        confirmLabel={`Deposit ${depositAmt} RITUAL`}
        busy={depositing}
        onConfirm={fund}
        checklist={[
          `You are depositing ${depositAmt} RITUAL into the LLM escrow.`,
          "Funds stay locked to cover the async TEE callback.",
          "judgeAll evaluates every eligible bloom in one batch.",
        ]}
      />
    </StageScaffold>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-mist)]/10 bg-white/[0.02] p-4">
      <div className="text-[13px] uppercase tracking-wide text-[var(--color-mist)]/50">{label}</div>
      <div className="mt-1 text-[18px] font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}
