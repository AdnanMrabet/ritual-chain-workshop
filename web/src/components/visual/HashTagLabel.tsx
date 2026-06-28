import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { shortHash } from "@/lib/utils";

/** A readable monospace hash label — looks like a tag tied to a seed. */
export function HashTagLabel({
  hash,
  color = "var(--color-aqua)",
  full = false,
  className,
}: {
  hash: string;
  color?: string;
  full?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[13px]",
        className
      )}
      style={{
        color,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
        background: `color-mix(in srgb, ${color} 8%, transparent)`,
      }}
      title={hash}
    >
      <Hash size={12} className="opacity-70" />
      <span className={full ? "break-all" : ""}>
        {full ? hash : shortHash(hash)}
      </span>
    </span>
  );
}
