import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBloomStore } from "@/store/useBloomStore";
import type { TimelineEvent, TimelineEventKind } from "@/types";

const KIND_COLOR: Record<TimelineEventKind, string> = {
  wallet: "var(--color-lime)",
  created: "var(--color-clay)",
  "reward-locked": "var(--color-nectar)",
  commit: "var(--color-sealed)",
  reveal: "var(--color-aqua)",
  fund: "var(--color-clay)",
  "judge-start": "var(--color-orchid)",
  verdict: "var(--color-orchid)",
  finalize: "var(--color-nectar)",
  paid: "var(--color-nectar)",
};

/** Horizontal "growing branch". Completed events are bright leaves; the live
    edge glows. Click a leaf to read its detail. */
export function BottomGrowthTimeline() {
  const { timeline } = useBloomStore();
  const [open, setOpen] = useState<TimelineEvent | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="glass mx-auto w-full max-w-[1640px] rounded-3xl px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[12px] uppercase tracking-[0.18em] text-[var(--color-mist)]/55">
          Growth timeline
        </span>

        {timeline.length === 0 ? (
          <span className="text-[14px] text-[var(--color-mist)]/55">
            Closed buds — connect a wallet to start the branch growing.
          </span>
        ) : (
          <div
            ref={scrollerRef}
            className="relative flex items-center gap-1 overflow-x-auto py-1 thin-scroll"
          >
            {/* the branch line */}
            <div className="pointer-events-none absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-gradient-to-r from-[var(--color-lime)]/30 via-[var(--color-aqua)]/25 to-transparent" />
            {timeline.map((e, i) => {
              const color = KIND_COLOR[e.kind];
              const isLast = i === timeline.length - 1;
              return (
                <button
                  key={e.id}
                  onClick={() => setOpen(e)}
                  className="relative z-[1] flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-mist)]/10 bg-black/35 px-2.5 py-1 transition-transform hover:scale-105"
                  title={e.detail ? `${e.label} — ${e.detail}` : e.label}
                >
                  <span
                    className={isLast ? "cb-pulse-glow" : ""}
                    style={{ color }}
                  >
                    <Leaf color={color} bright={isLast} />
                  </span>
                  <span className="whitespace-nowrap text-[13px] text-[var(--color-mist)]/80">
                    {e.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-center justify-between rounded-xl border border-[var(--color-mist)]/10 bg-black/30 px-3 py-2">
              <div>
                <div className="text-[14px] font-medium text-[var(--color-mist)]">
                  {open.label}
                </div>
                {open.detail && (
                  <div className="text-[13px] text-[var(--color-mist)]/60">
                    {open.detail}
                  </div>
                )}
                <div className="font-mono text-[12px] text-[var(--color-mist)]/40">
                  {new Date(open.at).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => setOpen(null)}
                className="text-[13px] text-[var(--color-mist)]/55 hover:text-[var(--color-mist)]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Leaf({ color, bright }: { color: string; bright: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <path
        d="M7 1 C11 3 13 7 7 13 C1 7 3 3 7 1 Z"
        fill={color}
        fillOpacity={bright ? 0.85 : 0.4}
        stroke={color}
        strokeOpacity="0.8"
        strokeWidth="0.8"
      />
      <path d="M7 3 L7 11" stroke="#0b0e0a" strokeOpacity="0.4" strokeWidth="0.7" />
    </svg>
  );
}
