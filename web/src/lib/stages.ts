import type { StageId } from "@/types";

export interface StageMeta {
  id: StageId;
  index: number;
  /** Short ribbon name, e.g. "Connect". */
  name: string;
  /** Poetic scene name from the garden metaphor. */
  sceneName: string;
  /** One-line explanation shown on the stage card. */
  blurb: string;
}

/** The fixed 10-stage journey:
    private idea → sealed seed → verified bloom → batch AI review → human
    harvest → reward paid. */
export const STAGES: StageMeta[] = [
  { id: "connect", index: 0, name: "Connect", sceneName: "Wake the Garden", blurb: "Connect your wallet to enter the garden." },
  { id: "create", index: 1, name: "Create", sceneName: "Plant the Bounty", blurb: "Owner plants a bounty and locks the reward." },
  { id: "status", index: 2, name: "Status", sceneName: "Growth State", blurb: "Watch the bounty's current phase." },
  { id: "commit", index: 3, name: "Commit", sceneName: "Seal the Seed", blurb: "Submit only the commitment hash." },
  { id: "reveal", index: 4, name: "Reveal", sceneName: "Open the Sprout", blurb: "Reveal answer + salt after the deadline." },
  { id: "fund", index: 5, name: "Fund AI", sceneName: "Feed the Oracle", blurb: "Owner funds the AI judgement." },
  { id: "judge", index: 6, name: "Judge", sceneName: "Bloom Review", blurb: "Ritual AI judges all valid blooms in one batch." },
  { id: "verdict", index: 7, name: "Verdict", sceneName: "Oracle's Recommendation", blurb: "AI recommends a winner." },
  { id: "finalize", index: 8, name: "Finalize", sceneName: "Harvest the Winner", blurb: "Human owner confirms and pays." },
  { id: "submissions", index: 9, name: "Submissions", sceneName: "Submission Garden", blurb: "Every seed, sprout and bloom." },
];

export const STAGE_BY_ID: Record<StageId, StageMeta> = Object.fromEntries(
  STAGES.map((s) => [s.id, s])
) as Record<StageId, StageMeta>;

import type { Bounty, UserRole } from "@/types";

/** Live phase derived from the two ms deadlines + stored phase (mirrors the
    contract). Terminal states (judged/finalized) come from the stored phase;
    commit/reveal/judging are derived from the clock. */
export function livePhase(b: Bounty, nowMs: number): Bounty["phase"] {
  if (b.phase === "finalized") return "finalized";
  if (b.phase === "judged") return "judged";
  if (nowMs < b.submissionDeadline) return "commit";
  if (nowMs < b.revealDeadline) return "reveal";
  return "judging";
}

/**
 * Which stages the user can open right now, given the bounty, role and time.
 * connect/create/status/submissions are always reachable once relevant; the
 * lifecycle stages unlock strictly by phase. Owner-only stages stay locked for
 * participants/visitors.
 */
export function availableStages(
  bounty: Bounty | null,
  role: UserRole,
  nowMs: number
): Set<StageId> {
  const open = new Set<StageId>(["connect"]);

  // Create is only meaningful before a bounty exists (owner path).
  if (!bounty) {
    open.add("create");
    return open;
  }

  const phase = livePhase(bounty, nowMs);
  const isOwner = role === "owner";

  open.add("status");
  open.add("submissions");

  // Commit: only during the planting window.
  if (phase === "commit") open.add("commit");

  // Reveal: only during the sprouting window.
  if (phase === "reveal") open.add("reveal");

  // Fund + Judge: owner only, once reveal closed and not yet judged.
  if (phase === "judging") {
    if (isOwner) {
      open.add("fund");
      open.add("judge");
    }
  }

  // Verdict: once judged (or finalized) there is a verdict to read.
  if (phase === "judged" || phase === "finalized") open.add("verdict");

  // Finalize: owner only, after judged, before finalized.
  if (phase === "judged" && isOwner) open.add("finalize");

  return open;
}

/** The stage the app should auto-advance to when a phase boundary is crossed. */
export function autoStageFor(
  bounty: Bounty | null,
  role: UserRole
): StageId | null {
  if (!bounty) return null;
  const phase = livePhase(bounty, Date.now());
  const isOwner = role === "owner";
  switch (phase) {
    case "commit":
      return "commit";
    case "reveal":
      return "reveal";
    case "judging":
      return isOwner ? "fund" : "status";
    case "judged":
      return "verdict";
    case "finalized":
      return "submissions";
    default:
      return null;
  }
}
