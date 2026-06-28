import { create } from "zustand";
import type {
  AIVerdict,
  Bounty,
  NetworkStatus,
  StageId,
  Submission,
  TimelineEvent,
  TimelineEventKind,
  UserRole,
} from "@/types";
import { web3BountyService as bountyService } from "@/services/web3BountyService";
import { STAGES, livePhase, autoStageFor } from "@/lib/stages";

const RITUAL_CHAIN_ID = 1979;

interface BloomState {
  // wallet / network
  network: NetworkStatus;
  address: `0x${string}` | null;
  chainId: number | null;
  role: UserRole;

  // navigation
  activeStage: StageId;
  furthestStage: number; // highest stage index unlocked

  // data
  bounty: Bounty | null;
  submissions: Submission[];
  verdict: AIVerdict | null;
  selectedWinner: number | null;

  // ui
  busy: boolean;
  error: string | null;
  timeline: TimelineEvent[];

  // actions
  setStage: (id: StageId) => void;
  unlockUpTo: (index: number) => void;
  pushEvent: (kind: TimelineEventKind, label: string, detail?: string) => void;

  connect: () => Promise<void>;
  disconnect: () => void;
  setRole: (role: UserRole) => void;

  createBounty: (input: {
    title: string;
    rubric: string;
    reward: number;
    submissionDeadline: number;
    revealDeadline: number;
  }) => Promise<void>;
  refreshBounty: () => Promise<void>;
  loadBounty: (id: bigint) => Promise<void>;
  submitCommitment: (commitment: `0x${string}`) => Promise<void>;
  revealAnswer: (answer: string, salt: `0x${string}`) => Promise<void>;
  fundAI: (amount: number) => Promise<void>;
  judgeAll: () => Promise<void>;
  selectWinner: (index: number) => void;
  finalizeWinner: (index: number) => Promise<void>;

  /** Called on an interval: detects phase boundary crossings and auto-advances
      the active stage, refreshing on-chain data when a boundary is crossed. */
  tick: () => void;
  lastPhase: Bounty["phase"] | null;
  autoFollow: boolean;
  setAutoFollow: (v: boolean) => void;
}

const stageIndex = (id: StageId) => STAGES.findIndex((s) => s.id === id);

/** Owner if the connected address created the bounty, else participant. */
function roleFor(address: string | null, bounty: Bounty | null): UserRole {
  if (!address) return "visitor";
  if (!bounty) return "participant";
  return bounty.owner.toLowerCase() === address.toLowerCase() ? "owner" : "participant";
}

export const useBloomStore = create<BloomState>((set, get) => ({
  network: "disconnected",
  address: null,
  chainId: null,
  role: "visitor",

  activeStage: "connect",
  furthestStage: 0,

  bounty: null,
  submissions: [],
  verdict: null,
  selectedWinner: null,

  busy: false,
  error: null,
  timeline: [],
  lastPhase: null,
  autoFollow: true,

  setAutoFollow: (v) => set({ autoFollow: v }),

  setStage: (id) => set({ activeStage: id }),

  unlockUpTo: (index) =>
    set((s) => ({ furthestStage: Math.max(s.furthestStage, index) })),

  pushEvent: (kind, label, detail) =>
    set((s) => ({
      timeline: [
        ...s.timeline,
        { id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind, label, detail, at: Date.now() },
      ],
    })),

  connect: async () => {
    set({ busy: true, error: null });
    try {
      const { address, chainId } = await bountyService.connectWallet();
      const network: NetworkStatus =
        chainId === RITUAL_CHAIN_ID ? "connected" : "wrong-network";
      set({ address, chainId, network, role: roleFor(address, get().bounty) });
      get().unlockUpTo(stageIndex("create"));
      get().setStage("create");
      get().pushEvent("wallet", "Wallet connected", address);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  disconnect: () =>
    set({
      network: "disconnected",
      address: null,
      chainId: null,
      role: "visitor",
      activeStage: "connect",
    }),

  setRole: (role) => set({ role }),

  createBounty: async (input) => {
    set({ busy: true, error: null });
    try {
      const bounty = await bountyService.createBounty(input);
      set({ bounty, submissions: [], role: roleFor(get().address, bounty) });
      get().pushEvent("created", "Bounty planted", bounty.title);
      get().pushEvent("reward-locked", "Reward locked", `${bounty.reward} ${bounty.rewardSymbol}`);
      get().unlockUpTo(stageIndex("submissions"));
      get().setStage("status");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  refreshBounty: async () => {
    const { bounty } = get();
    if (!bounty) return;
    const [b, subs] = await Promise.all([
      bountyService.getBounty(bounty.id),
      bountyService.getSubmissions(bounty.id),
    ]);
    set({ bounty: b ?? bounty, submissions: subs, role: roleFor(get().address, b ?? bounty) });
  },

  loadBounty: async (id) => {
    set({ busy: true, error: null });
    try {
      const b = await bountyService.getBounty(id);
      if (!b) {
        set({ error: `Bounty #${id.toString()} not found.` });
        return;
      }
      const subs = await bountyService.getSubmissions(id);
      set({
        bounty: b,
        submissions: subs,
        role: roleFor(get().address, b),
        verdict: null,
        selectedWinner: null,
      });
      get().unlockUpTo(stageIndex("submissions"));
      get().setStage("status");
      get().pushEvent("created", "Bounty loaded", b.title);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  submitCommitment: async (commitment) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      await bountyService.submitCommitment(bounty.id, commitment);
      await get().refreshBounty();
      get().pushEvent("commit", "Commitment submitted");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  revealAnswer: async (answer, salt) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      await bountyService.revealAnswer(bounty.id, answer, salt);
      await get().refreshBounty();
      get().pushEvent("reveal", "Reveal verified");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  fundAI: async (amount) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      const b = await bountyService.fundAI(bounty.id, amount);
      set({ bounty: b });
      get().pushEvent("fund", "AI judgement funded", `${amount} ${b.rewardSymbol}`);
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  judgeAll: async () => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    get().pushEvent("judge-start", "Batch judging started");
    try {
      const verdict = await bountyService.judgeAll(bounty.id);
      await get().refreshBounty();
      set({ verdict, selectedWinner: verdict.recommendedIndex });
      get().pushEvent("verdict", "AI verdict received", `recommends entry #${verdict.recommendedIndex}`);
      get().setStage("verdict");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  selectWinner: (index) => set({ selectedWinner: index }),

  finalizeWinner: async (index) => {
    const { bounty } = get();
    if (!bounty) return;
    set({ busy: true, error: null });
    try {
      const b = await bountyService.finalizeWinner(bounty.id, index);
      await get().refreshBounty();
      set({ bounty: b });
      get().pushEvent("finalize", "Winner finalized", `entry #${index}`);
      get().pushEvent("paid", "Reward paid", `${b.reward} ${b.rewardSymbol}`);
      get().setStage("submissions");
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ busy: false });
    }
  },

  tick: () => {
    const { bounty, lastPhase, autoFollow, busy, activeStage } = get();
    if (!bounty) return;

    const phase = livePhase(bounty, Date.now());

    // Phase boundary crossed (e.g. commit→reveal, reveal→judging by time).
    if (phase !== lastPhase) {
      set({ lastPhase: phase });

      // Re-sync on-chain data on a boundary so submissions/flags are fresh.
      if (lastPhase !== null && !busy) {
        void get().refreshBounty();
      }

      // Auto-advance the active stage to the new phase's stage, unless the user
      // is mid-action (busy) or has wandered into Status/Submissions on purpose.
      if (lastPhase !== null && autoFollow && !busy) {
        const target = autoStageFor(bounty, get().role);
        const stay = activeStage === "status" || activeStage === "submissions";
        if (target && target !== activeStage && !stay) {
          const idx = stageIndex(target);
          if (idx >= 0) get().unlockUpTo(idx);
          get().setStage(target);
          get().pushEvent("created", "Phase advanced", `now in ${phase}`);
        }
      }
    }
  },
}));
