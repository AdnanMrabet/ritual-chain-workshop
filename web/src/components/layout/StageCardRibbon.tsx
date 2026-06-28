import { motion } from "framer-motion";
import {
  Plug,
  Sprout,
  Activity,
  Lock,
  KeyRound,
  Droplets,
  Sparkles,
  ScrollText,
  HandHeart,
  Flower2,
  Check,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { STAGES } from "@/lib/stages";
import type { StageId, StageStatus } from "@/types";
import { cn } from "@/lib/utils";

const ICONS: Record<StageId, LucideIcon> = {
  connect: Plug,
  create: Sprout,
  status: Activity,
  commit: Lock,
  reveal: KeyRound,
  fund: Droplets,
  judge: Sparkles,
  verdict: ScrollText,
  finalize: HandHeart,
  submissions: Flower2,
};

const STATUS_COLOR: Record<StageStatus, string> = {
  locked: "var(--color-mist)",
  active: "var(--color-lime)",
  done: "var(--color-aqua)",
  warning: "var(--color-clay)",
  error: "var(--color-thorn)",
};

export function StageCardRibbon() {
  const { activeStage, furthestStage, setStage } = useBloomStore();

  function statusOf(index: number): StageStatus {
    const activeIndex = STAGES.findIndex((s) => s.id === activeStage);
    if (index === activeIndex) return "active";
    if (index < activeIndex || index <= furthestStage) return "done";
    return "locked";
  }

  return (
    <div className="glass mx-auto w-full max-w-[1640px] rounded-3xl p-2.5">
      <div className="flex gap-2.5 overflow-x-auto pb-1 thin-scroll">
        {STAGES.map((stage, i) => {
          const status = statusOf(i);
          const Icon = ICONS[stage.id];
          const color = STATUS_COLOR[status];
          const locked = status === "locked" && i > furthestStage;
          const isActive = status === "active";

          return (
            <motion.button
              key={stage.id}
              layout
              disabled={locked}
              onClick={() => !locked && setStage(stage.id)}
              whileHover={!locked ? { y: -3 } : undefined}
              className={cn(
                "group relative flex shrink-0 flex-col gap-1 rounded-2xl border p-3 text-left transition-all duration-300",
                isActive ? "w-[188px]" : "w-[150px]",
                locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
              )}
              style={{
                borderColor: `color-mix(in srgb, ${color} ${isActive ? 55 : 22}%, transparent)`,
                background: isActive
                  ? `color-mix(in srgb, ${color} 12%, rgba(255,255,255,0.02))`
                  : "rgba(255,255,255,0.02)",
                boxShadow: isActive
                  ? `0 0 30px -8px ${color}`
                  : status === "done"
                    ? `0 0 16px -10px ${color}`
                    : "none",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl"
                  style={{
                    color,
                    background: `color-mix(in srgb, ${color} 14%, transparent)`,
                  }}
                >
                  <Icon size={isActive ? 20 : 17} className={isActive ? "cb-pulse-glow" : ""} style={{ color }} />
                </span>
                <StatusDot status={status} color={color} />
              </div>

              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[13px] text-[var(--color-mist)]/45">
                  {i}
                </span>
                <span
                  className="text-[15px] font-semibold leading-tight"
                  style={{ color: isActive ? color : "var(--color-mist)" }}
                >
                  {stage.name}
                </span>
              </div>

              {isActive && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[13px] leading-snug text-[var(--color-mist)]/65"
                >
                  {stage.blurb}
                </motion.p>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status, color }: { status: StageStatus; color: string }) {
  if (status === "done")
    return (
      <span className="grid h-5 w-5 place-items-center rounded-full" style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
        <Check size={12} />
      </span>
    );
  if (status === "warning")
    return <AlertTriangle size={15} style={{ color }} />;
  if (status === "error") return <X size={15} style={{ color }} />;
  if (status === "active")
    return (
      <span
        className="h-2.5 w-2.5 rounded-full cb-pulse-glow"
        style={{ background: color, color }}
      />
    );
  return <span className="h-2.5 w-2.5 rounded-full bg-white/15" />;
}
