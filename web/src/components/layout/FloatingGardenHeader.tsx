import { HelpCircle, Wallet } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RitualNetworkBadge } from "@/components/visual/RitualNetworkBadge";
import { shortAddress } from "@/lib/utils";

const ROLE_COLOR: Record<string, string> = {
  owner: "var(--color-clay)",
  participant: "var(--color-lime)",
  visitor: "var(--color-mist)",
};

/** Abstract Cipher Bloom logo — a small geometric bloom over a seed. */
function BloomLogo() {
  return (
    <div className="relative grid h-10 w-10 place-items-center">
      <svg viewBox="0 0 40 40" className="h-10 w-10">
        <g transform="translate(20 20)" className="cb-breathe">
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={i}
              rx="4"
              ry="13"
              cy="-9"
              fill="var(--color-lime)"
              fillOpacity="0.45"
              stroke="var(--color-lime)"
              strokeOpacity="0.7"
              strokeWidth="0.8"
              transform={`rotate(${(360 / 6) * i})`}
              style={{ transformOrigin: "0 0" }}
            />
          ))}
          <circle r="5" fill="var(--color-aqua)" fillOpacity="0.4" stroke="var(--color-aqua)" />
        </g>
      </svg>
    </div>
  );
}

export function FloatingGardenHeader({ onHelp }: { onHelp: () => void }) {
  const { network, address, role, bounty, connect, busy } = useBloomStore();

  return (
    <header className="glass-strong mx-auto flex w-full max-w-[1640px] flex-wrap items-center justify-between gap-3 rounded-3xl px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <BloomLogo />
        <div className="leading-tight">
          <div className="text-[19px] font-semibold tracking-tight text-[var(--color-mist)]">
            Cipher Bloom
          </div>
          <div className="text-[13px] text-[var(--color-aqua)]/75">
            Privacy-Preserving AI Bounty Judge
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RitualNetworkBadge status={network} />

        {bounty && (
          <Badge color="var(--color-nectar)">bounty #{bounty.id.toString()}</Badge>
        )}

        {network !== "disconnected" && (
          <Badge color={ROLE_COLOR[role]} dot>
            {role[0].toUpperCase() + role.slice(1)}
          </Badge>
        )}

        {address ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--color-mist)]/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[13px] text-[var(--color-mist)]/80 sm:inline-flex">
            <Wallet size={14} className="text-[var(--color-lime)]" />
            {shortAddress(address)}
          </span>
        ) : (
          <Button variant="lime" size="sm" onClick={connect} disabled={busy}>
            <Wallet size={15} /> Connect
          </Button>
        )}

        <button
          onClick={onHelp}
          aria-label="Help"
          className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--color-mist)]/15 text-[var(--color-mist)]/70 transition-colors hover:border-[var(--color-aqua)]/45 hover:text-[var(--color-aqua)]"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
}
