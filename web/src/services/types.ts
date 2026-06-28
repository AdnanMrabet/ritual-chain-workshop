import type {
  AIVerdict,
  Bounty,
  Submission,
} from "@/types";
import type { Hex } from "viem";

/* Shared shape the UI talks to. The on-chain service implements this so the
   components never deal with viem/wagmi details directly. */
export interface BountyService {
  connectWallet(): Promise<{ address: `0x${string}`; chainId: number }>;
  createBounty(input: CreateBountyInput): Promise<Bounty>;
  getBounty(id: bigint): Promise<Bounty | null>;
  getSubmissions(id: bigint): Promise<Submission[]>;
  submitCommitment(id: bigint, commitment: Hex): Promise<Submission>;
  revealAnswer(id: bigint, answer: string, salt: Hex): Promise<Submission>;
  fundAI(id: bigint, amount: number): Promise<Bounty>;
  judgeAll(id: bigint): Promise<AIVerdict>;
  finalizeWinner(id: bigint, winnerIndex: number): Promise<Bounty>;
}

export interface CreateBountyInput {
  title: string;
  rubric: string;
  reward: number;
  submissionDeadline: number; // ms epoch
  revealDeadline: number; // ms epoch
}
