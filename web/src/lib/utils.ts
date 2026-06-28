import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shorten a 0x address for display: 0x1234…cdef */
export function shortAddress(addr?: string | null): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Shorten a long hash for readable labels while staying recognisable. */
export function shortHash(hash?: string | null, lead = 10, tail = 8): string {
  if (!hash) return "—";
  if (hash.length <= lead + tail + 1) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}

/** ms remaining → { d, h, m, s, total, urgency }.
    Ritual L1 measures block.timestamp in MILLISECONDS, so all deadlines and
    countdowns in this app stay in ms end-to-end. */
export function countdownParts(targetMs: number, nowMs: number) {
  const total = Math.max(0, targetMs - nowMs);
  const s = Math.floor(total / 1000) % 60;
  const m = Math.floor(total / 60000) % 60;
  const h = Math.floor(total / 3600000) % 24;
  const d = Math.floor(total / 86400000);
  return { d, h, m, s, total };
}

export function formatCountdown(targetMs: number, nowMs: number): string {
  const { d, h, m, s, total } = countdownParts(targetMs, nowMs);
  if (total <= 0) return "ended";
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

export type Urgency = "safe" | "warning" | "critical";

export function urgencyOf(targetMs: number, nowMs: number): Urgency {
  const remaining = targetMs - nowMs;
  if (remaining <= 0) return "critical";
  if (remaining < 2 * 60 * 1000) return "critical"; // < 2 min
  if (remaining < 10 * 60 * 1000) return "warning"; // < 10 min
  return "safe";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatReward(amount: number, symbol = "RITUAL"): string {
  return `${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)} ${symbol}`;
}
