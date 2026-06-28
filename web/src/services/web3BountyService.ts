import type { AIVerdict, Bounty, Submission, SubmissionStatus } from "@/types";
import type { BountyService, CreateBountyInput } from "./types";
import type { Address, Hex } from "viem";
import { parseEther } from "viem";
import {
  publicClient,
  getWalletClient,
  requestAccounts,
  getChainId,
  ensureRitualNetwork,
} from "@/lib/viemClient";
import { bloomAbi, contractAddress, executorAddress, ritualChainId } from "@/config/contract";
import { buildJudgeAllLlmInput, type JudgeSubmission } from "@/lib/ritualLlm";
import { decodeAiVerdict } from "@/lib/aiReview";

/* ============================================================================
   Ritual L1 bounty service — talks to the deployed CipherBloomJudge.

   Ritual specifics honored here:
     • block.timestamp is in MILLISECONDS — deadlines are sent/read in ms.
     • judgeAll triggers an async LLM precompile replay (~1.09M gas); the auto
       estimate is far too low, so we PIN gas: 6_000_000n.
     • Commitment = keccak256(abi.encode(answer, salt, sender, bountyId)).
   ========================================================================== */

const RITUAL = "RITUAL";

async function activeAccount(): Promise<Address> {
  const [addr] = await requestAccounts();
  if (!addr) throw new Error("No account connected.");
  return addr;
}

/** Map the getBounty tuple + phase into the UI Bounty shape. */
function toBounty(
  id: bigint,
  raw: readonly [
    Address, string, string, bigint, bigint, bigint,
    boolean, boolean, bigint, bigint, bigint, Hex,
  ]
): Bounty {
  const [
    owner, title, rubric, reward, submissionDeadline, revealDeadline,
    judged, finalized,
  ] = raw;

  const aiFundRequired = 0.4;
  let phase: Bounty["phase"];
  const now = Date.now();
  if (finalized) phase = "finalized";
  else if (judged) phase = "judged";
  else if (now < Number(submissionDeadline)) phase = "commit";
  else if (now < Number(revealDeadline)) phase = "reveal";
  else phase = "judging";

  return {
    id,
    title,
    rubric,
    owner,
    reward: Number(reward) / 1e18,
    rewardSymbol: RITUAL,
    submissionDeadline: Number(submissionDeadline),
    revealDeadline: Number(revealDeadline),
    phase,
    aiFunded: judged, // funding is a wallet concern; treated separately in UI
    aiFundBalance: 0,
    aiFundRequired,
    // keep raw verdict bytes around for the verdict stage
    // (not in the type, but harmless extra is avoided — verdict is fetched via judgeAll)
  } as Bounty;
}

async function readBounty(id: bigint) {
  return publicClient.readContract({
    address: contractAddress,
    abi: bloomAbi,
    functionName: "getBounty",
    args: [id],
  }) as Promise<
    readonly [
      Address, string, string, bigint, bigint, bigint,
      boolean, boolean, bigint, bigint, bigint, Hex,
    ]
  >;
}

function statusFor(revealed: boolean, finalized: boolean, isWinner: boolean): SubmissionStatus {
  if (isWinner) return "winner";
  if (revealed) return "revealed";
  return finalized ? "dormant" : "sealed";
}

export const web3BountyService: BountyService = {
  async connectWallet() {
    await ensureRitualNetwork();
    const address = await activeAccount();
    const chainId = await getChainId();
    return { address, chainId };
  },

  async createBounty(input: CreateBountyInput): Promise<Bounty> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: bloomAbi,
      functionName: "createBounty",
      args: [
        input.title,
        input.rubric,
        BigInt(Math.floor(input.submissionDeadline)),
        BigInt(Math.floor(input.revealDeadline)),
      ],
      value: parseEther(String(input.reward)),
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // nextBountyId was incremented; the new id is (nextBountyId - 1).
    const next = (await publicClient.readContract({
      address: contractAddress,
      abi: bloomAbi,
      functionName: "nextBountyId",
    })) as bigint;
    const id = next - 1n;
    void receipt;
    return toBounty(id, await readBounty(id));
  },

  async getBounty(id: bigint): Promise<Bounty | null> {
    try {
      return toBounty(id, await readBounty(id));
    } catch {
      return null;
    }
  },

  async getSubmissions(id: bigint): Promise<Submission[]> {
    const raw = await readBounty(id);
    const count = Number(raw[8]);
    const finalized = raw[7];
    const winnerIndex = Number(raw[10]);
    const subs: Submission[] = [];
    for (let i = 0; i < count; i++) {
      const [author, commitment, revealed, answer] = (await publicClient.readContract({
        address: contractAddress,
        abi: bloomAbi,
        functionName: "getSubmission",
        args: [id, BigInt(i)],
      })) as readonly [Address, Hex, boolean, string];
      const isWinner = finalized && winnerIndex === i;
      subs.push({
        index: i,
        participant: author,
        commitment,
        status: statusFor(revealed, finalized, isWinner),
        revealedAnswer: revealed ? answer : undefined,
        eligible: revealed,
      });
    }
    return subs;
  },

  async submitCommitment(id: bigint, commitment: Hex): Promise<Submission> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: bloomAbi,
      functionName: "submitCommitment",
      args: [id, commitment],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return {
      index: -1,
      participant: account,
      commitment,
      status: "sealed",
      eligible: false,
    };
  },

  async revealAnswer(id: bigint, answer: string, salt: Hex): Promise<Submission> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: bloomAbi,
      functionName: "revealAnswer",
      args: [id, answer, salt],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return {
      index: -1,
      participant: account,
      commitment: "0x" as Hex,
      status: "revealed",
      revealedAnswer: answer,
      eligible: true,
    };
  },

  async fundAI(id: bigint, _amount: number): Promise<Bounty> {
    // Funding is the RitualWallet escrow concern, handled by the wallet panel.
    // Here we just re-read the bounty so the UI refreshes.
    void _amount;
    return toBounty(id, await readBounty(id));
  },

  async judgeAll(id: bigint): Promise<AIVerdict> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const raw = await readBounty(id);
    const [, title, rubric] = raw;
    const count = Number(raw[8]);

    // Collect ONLY revealed answers for the single batch.
    const submissions: JudgeSubmission[] = [];
    for (let i = 0; i < count; i++) {
      const [submitter, , revealed, answer] = (await publicClient.readContract({
        address: contractAddress,
        abi: bloomAbi,
        functionName: "getSubmission",
        args: [id, BigInt(i)],
      })) as readonly [Address, Hex, boolean, string];
      if (revealed) submissions.push({ index: i, submitter, answer });
    }

    const llmInput = buildJudgeAllLlmInput({ executorAddress, title, rubric, submissions });

    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: bloomAbi,
      functionName: "judgeAll",
      args: [id, llmInput],
      // CRITICAL: pin gas. The async LLM replay needs ~1.09M; auto-estimate
      // only covers the first pass and the tx dies mid-settlement otherwise.
      gas: 6_000_000n,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    // Re-read to pull the stored aiVerdict bytes.
    const after = await readBounty(id);
    const verdictBytes = after[11];
    const decoded = decodeAiVerdict(verdictBytes);

    const fallbackIndex = submissions[0]?.index ?? 0;
    if (!decoded) {
      return {
        recommendedIndex: fallbackIndex,
        summary:
          "The judging transaction settled, but no structured verdict was returned. Review the revealed answers and finalize the winner.",
        confidence: "low",
        ranking: submissions.map((s) => ({ index: s.index, score: 0, reason: "" })),
      };
    }

    return {
      recommendedIndex: decoded.winnerIndex ?? fallbackIndex,
      summary: decoded.summary || "The AI evaluated every revealed bloom together in one batch.",
      confidence: "high",
      ranking:
        decoded.ranking.length > 0
          ? decoded.ranking
          : submissions.map((s) => ({
              index: s.index,
              score: s.index === decoded.winnerIndex ? 100 : 0,
              reason: s.index === decoded.winnerIndex ? "Recommended by the Ritual AI." : "",
            })),
    };
  },

  async finalizeWinner(id: bigint, winnerIndex: number): Promise<Bounty> {
    const account = await activeAccount();
    const wallet = getWalletClient();
    const hash = await wallet.writeContract({
      account,
      chain: undefined,
      address: contractAddress,
      abi: bloomAbi,
      functionName: "finalizeWinner",
      args: [id, BigInt(winnerIndex)],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return toBounty(id, await readBounty(id));
  },
};

void ritualChainId;
