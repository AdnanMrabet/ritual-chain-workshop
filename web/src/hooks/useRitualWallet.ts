import { useCallback, useEffect, useState } from "react";
import { useBloomStore } from "@/store/useBloomStore";
import {
  getRitualWalletStatus,
  DEPOSIT_AMOUNT,
  LOCK_DURATION,
  type RitualWalletStatus,
} from "@/lib/ritualWallet";
import { RITUAL_WALLET, ritualWalletAbi } from "@/abi/RitualWallet";
import { publicClient, getWalletClient } from "@/lib/viemClient";

/**
 * Reads the connected wallet's RitualWallet escrow state (balance + lock) and
 * exposes a deposit action. Funding the AI judge = topping up this escrow so
 * the LLM precompile can charge it during judgeAll.
 */
export function useRitualWallet() {
  const address = useBloomStore((s) => s.address);
  const [status, setStatus] = useState<RitualWalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setStatus(null);
      return;
    }
    setLoading(true);
    try {
      const s = await getRitualWalletStatus({ publicClient, user: address });
      setStatus(s);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const deposit = useCallback(async () => {
    if (!address) return;
    setError(null);
    setDepositing(true);
    try {
      const wallet = getWalletClient();
      const hash = await wallet.writeContract({
        account: address,
        chain: undefined,
        address: RITUAL_WALLET,
        abi: ritualWalletAbi,
        functionName: "deposit",
        args: [LOCK_DURATION],
        value: DEPOSIT_AMOUNT,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      await refresh();
    } catch (e) {
      setError((e as { shortMessage?: string; message?: string }).shortMessage ?? (e as Error).message);
      throw e;
    } finally {
      setDepositing(false);
    }
  }, [address, refresh]);

  return { status, loading, depositing, error, refresh, deposit };
}
