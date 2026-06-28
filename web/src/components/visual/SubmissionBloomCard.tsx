import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import type { Submission } from "@/types";
import { SealedSeed, OpenBloom, WitheredSprout } from "./GardenGlyphs";
import { HashTagLabel } from "./HashTagLabel";
import { Badge } from "@/components/ui/Badge";
import { shortAddress } from "@/lib/utils";

const STATUS_META: Record<
  Submission["status"],
  { label: string; color: string }
> = {
  sealed: { label: "Sealed Seed", color: "var(--color-sealed)" },
  revealed: { label: "Revealed Bloom", color: "var(--color-aqua)" },
  withered: { label: "Withered Seed", color: "var(--color-thorn)" },
  dormant: { label: "Dormant Seed", color: "var(--color-mist)" },
  "ai-pick": { label: "AI Pick", color: "var(--color-orchid)" },
  winner: { label: "Golden Bloom", color: "var(--color-nectar)" },
};

export function SubmissionBloomCard({ submission }: { submission: Submission }) {
  const meta = STATUS_META[submission.status];
  const isWinner = submission.status === "winner";
  const isPick = submission.status === "ai-pick";

  const glyph = (() => {
    if (submission.status === "withered") return <WitheredSprout size={86} />;
    if (submission.status === "sealed" || submission.status === "dormant")
      return <SealedSeed size={86} />;
    if (isWinner)
      return <OpenBloom size={86} petal="var(--color-nectar)" core="var(--color-nectar)" />;
    if (isPick)
      return <OpenBloom size={86} petal="var(--color-orchid)" core="var(--color-orchid)" />;
    return <OpenBloom size={86} />;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex gap-3 rounded-2xl border p-3.5"
      style={{
        borderColor: `color-mix(in srgb, ${meta.color} ${isWinner ? 60 : 28}%, transparent)`,
        background: isWinner
          ? "color-mix(in srgb, var(--color-nectar) 9%, rgba(255,255,255,0.02))"
          : "rgba(255,255,255,0.02)",
        boxShadow: isWinner
          ? "0 0 34px -8px var(--color-nectar)"
          : isPick
            ? "0 0 26px -10px var(--color-orchid)"
            : "none",
      }}
    >
      <div className="grid shrink-0 place-items-center">{glyph}</div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={meta.color} dot>
            {isWinner && <Crown size={12} />}
            {isPick && <Sparkles size={12} />}
            {meta.label}
          </Badge>
          {submission.eligible && submission.status === "revealed" && (
            <Badge color="var(--color-aqua)">eligible</Badge>
          )}
          {submission.aiScore != null && (
            <Badge color="var(--color-orchid)">score {submission.aiScore}</Badge>
          )}
        </div>

        <div className="mt-2 font-mono text-[13px] text-[var(--color-mist)]/65">
          {shortAddress(submission.participant)}
        </div>

        <div className="mt-1.5">
          <HashTagLabel hash={submission.commitment} />
        </div>

        {submission.revealedAnswer ? (
          <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-[var(--color-mist)]/85">
            {submission.revealedAnswer}
          </p>
        ) : (
          <p className="mt-2 text-[13px] italic text-[var(--color-mist)]/45">
            Hidden until reveal.
          </p>
        )}
      </div>
    </motion.div>
  );
}
