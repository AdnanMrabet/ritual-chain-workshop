import { parseEther, type PublicClient } from "viem";
import { RITUAL_WALLET, ritualWalletAbi } from "@/abi/RitualWallet";

/**
 * Funding requirements for running an AI judging (judgeAll) transaction.
 * The LLM precompile escrows ~0.311 RITUAL, so the wallet must hold at least
 * that before judging, locked long enough to outlive the async callback.
 */
export const MIN_LLM_BALANCE = parseEther("0.32");
/** How long (in blocks) a deposit locks funds for. */
export const LOCK_DURATION = 100_000n;
/** Lock must extend at least this many blocks past the current block. */
export const REQUIRED_TTL_BUFFER = 300n;
/** Amount sent with a single deposit (covers the ~0.311 escrow with margin). */
export const DEPOSIT_AMOUNT = parseEther("0.4");

export type RitualWalletStatus = {
  balance: bigint;
  lockUntil: bigint;
  currentBlock: bigint;
  hasEnoughBalance: boolean;
  hasEnoughLockDuration: boolean;
  lockExpired: boolean;
  ready: boolean;
};

/** One-shot read of the connected wallet's RitualWallet funding state. */
export async function getRitualWalletStatus({
  publicClient,
  user,
}: {
  publicClient: PublicClient;
  user: `0x${string}`;
}): Promise<RitualWalletStatus> {
  const [balance, lockUntil, currentBlock] = await Promise.all([
    publicClient.readContract({
      address: RITUAL_WALLET,
      abi: ritualWalletAbi,
      functionName: "balanceOf",
      args: [user],
    }),
    publicClient.readContract({
      address: RITUAL_WALLET,
      abi: ritualWalletAbi,
      functionName: "lockUntil",
      args: [user],
    }),
    publicClient.getBlockNumber(),
  ]);

  return deriveStatus(balance, lockUntil, currentBlock);
}

export function deriveStatus(
  balance: bigint,
  lockUntil: bigint,
  currentBlock: bigint
): RitualWalletStatus {
  const hasEnoughBalance = balance >= MIN_LLM_BALANCE;
  const hasEnoughLockDuration = lockUntil >= currentBlock + REQUIRED_TTL_BUFFER;
  const lockExpired = lockUntil <= currentBlock;
  return {
    balance,
    lockUntil,
    currentBlock,
    hasEnoughBalance,
    hasEnoughLockDuration,
    lockExpired,
    ready: hasEnoughBalance && hasEnoughLockDuration,
  };
}
