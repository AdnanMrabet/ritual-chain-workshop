/* ============================================================================
   Cipher Bloom — shared domain types
   These types mirror what a real Ritual commit-reveal bounty contract would
   expose, so the Web3 service layer maps onto the UI without reshaping it.
   ========================================================================== */

export type UserRole = "owner" | "participant" | "visitor";

export type NetworkStatus = "disconnected" | "wrong-network" | "connected";

/** On-chain bounty lifecycle phase. */
export type BountyPhase =
  | "commit"
  | "reveal"
  | "judging"
  | "judged"
  | "finalized";

/** The 10 guided UI stages (the Stage Card Ribbon). */
export type StageId =
  | "connect"
  | "create"
  | "status"
  | "commit"
  | "reveal"
  | "fund"
  | "judge"
  | "verdict"
  | "finalize"
  | "submissions";

export type StageStatus = "locked" | "active" | "done" | "warning" | "error";

export type SubmissionStatus =
  | "sealed" // committed, hidden answer
  | "revealed" // valid reveal → bloom
  | "withered" // invalid reveal (hash mismatch)
  | "dormant" // never revealed
  | "ai-pick" // recommended by AI
  | "winner"; // finalized winner

export interface Bounty {
  id: bigint;
  title: string;
  rubric: string;
  owner: `0x${string}`;
  reward: number; // RITUAL
  rewardSymbol: string;
  submissionDeadline: number; // ms epoch (Ritual uses ms)
  revealDeadline: number; // ms epoch
  phase: BountyPhase;
  aiFunded: boolean;
  aiFundBalance: number;
  aiFundRequired: number;
}

export interface CommitmentData {
  answer: string;
  salt: `0x${string}`;
  sender: `0x${string}`;
  bountyId: bigint;
  commitment: `0x${string}`;
}

export interface RevealData {
  answer: string;
  salt: `0x${string}`;
  matches: boolean;
}

export interface Submission {
  index: number;
  participant: `0x${string}`;
  commitment: `0x${string}`;
  status: SubmissionStatus;
  revealedAnswer?: string;
  eligible: boolean;
  aiRank?: number;
  aiScore?: number;
}

export interface AIVerdict {
  recommendedIndex: number;
  summary: string;
  ranking: Array<{
    index: number;
    score: number;
    reason: string;
  }>;
  confidence: "low" | "medium" | "high";
}

export type TimelineEventKind =
  | "wallet"
  | "created"
  | "reward-locked"
  | "commit"
  | "reveal"
  | "fund"
  | "judge-start"
  | "verdict"
  | "finalize"
  | "paid";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  label: string;
  detail?: string;
  at: number;
}
