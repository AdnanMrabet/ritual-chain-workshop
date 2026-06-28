import { useState } from "react";
import { Search } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

/** Load any existing bounty by id — so participants and visitors can join a
    bounty they didn't create. */
export function LoadBountyPanel() {
  const { loadBounty, busy, bounty } = useBloomStore();
  const [id, setId] = useState("");

  async function load() {
    const n = id.trim();
    if (!/^\d+$/.test(n)) return;
    await loadBounty(BigInt(n));
  }

  return (
    <div className="rounded-2xl border border-[var(--color-aqua)]/20 bg-black/20 p-4">
      <div className="mb-2 text-[13px] uppercase tracking-wide text-[var(--color-mist)]/55">
        Open an existing bounty
      </div>
      <div className="flex gap-2">
        <Input
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
          inputMode="numeric"
          placeholder="bounty id, e.g. 1"
          className="flex-1"
        />
        <Button variant="lime" size="md" onClick={load} disabled={busy || !id.trim()}>
          <Search size={16} />
        </Button>
      </div>
      {bounty && (
        <p className="mt-2 text-[13px] text-[var(--color-mist)]/55">
          Loaded: <span className="text-[var(--color-mist)]/80">{bounty.title}</span>
        </p>
      )}
    </div>
  );
}
