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
