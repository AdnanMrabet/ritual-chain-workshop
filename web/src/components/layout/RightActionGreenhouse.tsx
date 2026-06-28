import { motion } from "framer-motion";
import {
  Flower2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Users,
} from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STAGE_BY_ID } from "@/lib/stages";
import { LoadBountyPanel } from "./LoadBountyPanel";
import type { StageId, UserRole } from "@/types";

interface ActionSpec {
  headline: string;
  note: string;
  /** Which roles may act here. */
  actors: UserRole[];
  accent: string;
  /** The stage the action button jumps to. */
  goto: StageId;
  cta: string;
}

const ACTIONS: Record<StageId, ActionSpec> = {
  connect: { headline: "Wake the garden", note: "Connect a wallet on Ritual to begin.", actors: ["visitor", "owner", "participant"], accent: "var(--color-lime)", goto: "connect", cta: "Connect" },
  create: { headline: "Owner · plant a bounty", note: "Set the rubric, deadlines and lock the reward.", actors: ["owner"], accent: "var(--color-clay)", goto: "create", cta: "Open create" },
  status: { headline: "Watch the growth", note: "Track phase and the two time drops.", actors: ["owner", "participant", "visitor"], accent: "var(--color-aqua)", goto: "status", cta: "View status" },
  commit: { headline: "Participant · seal a seed", note: "Submit only your commitment hash.", actors: ["participant", "owner"], accent: "var(--color-lime)", goto: "commit", cta: "Open commit" },
  reveal: { headline: "Participant · open the sprout", note: "Reveal answer + salt to bloom.", actors: ["participant", "owner"], accent: "var(--color-aqua)", goto: "reveal", cta: "Open reveal" },
  fund: { headline: "Owner · feed the oracle", note: "Deposit nectar for AI inference.", actors: ["owner"], accent: "var(--color-clay)", goto: "fund", cta: "Open fund" },
  judge: { headline: "Owner · batch judging", note: "Judge every eligible bloom at once.", actors: ["owner"], accent: "var(--color-orchid)", goto: "judge", cta: "Open judge" },
  verdict: { headline: "Oracle recommendation", note: "Review the AI ranking and reasons.", actors: ["owner", "participant", "visitor"], accent: "var(--color-orchid)", goto: "verdict", cta: "View verdict" },
  finalize: { headline: "Owner · harvest the winner", note: "Confirm or override, then pay.", actors: ["owner"], accent: "var(--color-nectar)", goto: "finalize", cta: "Open finalize" },
  submissions: { headline: "Submission garden", note: "Browse all seeds, sprouts and blooms.", actors: ["owner", "participant", "visitor"], accent: "var(--color-lime)", goto: "submissions", cta: "View garden" },
};

export function RightActionGreenhouse({ onOpenSubmissions }: { onOpenSubmissions: () => void }) {
  const { activeStage, role, setRole, network, submissions, setStage } = useBloomStore();
  const spec = ACTIONS[activeStage];
  const meta = STAGE_BY_ID[activeStage];
  const allowed = spec.actors.includes(role);
  const connected = network === "connected";

  return (
    <aside className="glass flex h-full flex-col gap-4 rounded-3xl p-5">
      {/* role switcher */}
      <div>
        <div className="mb-2 text-[13px] uppercase tracking-wide text-[var(--color-mist)]/55">Your role</div>
        <div className="flex gap-1.5 rounded-2xl border border-[var(--color-mist)]/10 bg-black/25 p-1">
          {(["owner", "participant", "visitor"] as UserRole[]).map((r) => {
            const active = role === r;
            const color = r === "owner" ? "var(--color-clay)" : r === "participant" ? "var(--color-lime)" : "var(--color-mist)";
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 rounded-xl px-2 py-1.5 text-[13px] font-medium capitalize transition-all"
                style={{
                  color: active ? color : "rgba(238,243,232,0.5)",
                  background: active ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* current action */}
      <motion.div
        key={activeStage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-black/20 p-4"
        style={{ borderColor: `color-mix(in srgb, ${spec.accent} 30%, transparent)` }}
      >
        <Badge color={spec.accent} dot>
          {meta.index} · {meta.sceneName}
        </Badge>
        <h3 className="mt-2 text-[18px] font-semibold text-[var(--color-mist)]">{spec.headline}</h3>
        <p className="mt-1 text-[14px] leading-snug text-[var(--color-mist)]/65">{spec.note}</p>

        {/* permission status */}
        <div className="mt-3 flex items-center gap-2 text-[13px]">
          {allowed && connected ? (
            <>
              <ShieldCheck size={15} className="text-[var(--color-aqua)]" />
              <span className="text-[var(--color-aqua)]">You can act in this stage</span>
            </>
          ) : (
            <>
              <ShieldAlert size={15} className="text-[var(--color-clay)]" />
              <span className="text-[var(--color-clay)]">
                {!connected ? "Connect a wallet first" : `Requires ${spec.actors.join(" / ")} role`}
              </span>
            </>
          )}
        </div>

        <Button
          variant={
            spec.accent.includes("clay") ? "clay" : spec.accent.includes("nectar") ? "nectar" : spec.accent.includes("orchid") ? "orchid" : "lime"
          }
          size="md"
          className="mt-4 w-full"
          disabled={!allowed && spec.goto !== "status" && spec.goto !== "verdict" && spec.goto !== "submissions"}
          onClick={() => setStage(spec.goto)}
        >
          {spec.cta} <ArrowRight size={16} />
        </Button>
      </motion.div>

      {/* submissions shortcut */}
      <button
        onClick={onOpenSubmissions}
        className="flex items-center justify-between rounded-2xl border border-[var(--color-mist)]/10 bg-white/[0.02] p-4 transition-colors hover:border-[var(--color-lime)]/35"
      >
        <div className="flex items-center gap-2.5">
          <Flower2 size={18} className="text-[var(--color-lime)]" />
          <div className="text-left">
            <div className="text-[15px] font-medium text-[var(--color-mist)]">Submission garden</div>
            <div className="text-[13px] text-[var(--color-mist)]/55">{submissions.length} submissions</div>
          </div>
        </div>
        <Users size={16} className="text-[var(--color-mist)]/45" />
      </button>

      {connected && <LoadBountyPanel />}

      <div className="mt-auto rounded-2xl border border-[var(--color-nectar)]/20 bg-[var(--color-nectar)]/5 p-3.5">
        <p className="text-center text-[13px] font-medium tracking-wide text-[var(--color-nectar)]">
          AI recommends. Human harvests.
        </p>
      </div>
    </aside>
  );
}
