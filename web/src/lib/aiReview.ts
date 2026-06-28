import { hexToString } from "viem";

export type RankingEntry = {
  index: number;
  score: number;
  reason: string;
};

export type JudgeResult = {
  winnerIndex: number;
  ranking: RankingEntry[];
  summary: string;
};

const EMPTY_BYTES = new Set(["", "0x"]);

/**
 * Decode the on-chain `aiVerdict` bytes into a parsed judge result.
 * The contract stores the model's raw response bytes. We read them as UTF-8,
 * strip stray markdown fences, isolate the first JSON object, and parse it into
 * `{ winnerIndex, ranking, summary }`. Returns null if nothing usable.
 */
export function decodeAiVerdict(aiVerdictHex?: string): JudgeResult | null {
  if (!aiVerdictHex || EMPTY_BYTES.has(aiVerdictHex)) return null;

  let raw: string;
  try {
    raw = hexToString(aiVerdictHex as `0x${string}`);
  } catch {
    raw = aiVerdictHex;
  }

  return tryParseJudgeResult(raw);
}

function tryParseJudgeResult(text: string): JudgeResult | null {
  const candidate = extractJson(text);
  if (!candidate) return null;

  let obj: unknown;
  try {
    obj = JSON.parse(candidate);
  } catch {
    return null;
  }

  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (typeof o.winnerIndex !== "number") return null;

  const ranking: RankingEntry[] = Array.isArray(o.ranking)
    ? (o.ranking as unknown[])
        .map((r) => {
          if (!r || typeof r !== "object") return null;
          const e = r as Record<string, unknown>;
          return {
            index: typeof e.index === "number" ? e.index : Number(e.index),
            score: typeof e.score === "number" ? e.score : Number(e.score),
            reason: typeof e.reason === "string" ? e.reason : String(e.reason ?? ""),
          } satisfies RankingEntry;
        })
        .filter((r): r is RankingEntry => r !== null)
    : [];

  return {
    winnerIndex: o.winnerIndex,
    ranking,
    summary: typeof o.summary === "string" ? o.summary : "",
  };
}

function extractJson(text: string): string | null {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return t.slice(start, end + 1);
}
