import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Sprout } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

/** Copy button whose icon blooms into a small leaf/check when copied. */
export function CopyHashButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  async function handle() {
    const ok = await copyToClipboard(value);
    if (ok) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  }

  return (
    <button
      onClick={handle}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-mist)]/15 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-[var(--color-mist)]/75 transition-colors hover:border-[var(--color-aqua)]/45 hover:text-[var(--color-aqua)]"
    >
      <span className="relative grid h-4 w-4 place-items-center">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.span
              key="ok"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              className="absolute"
            >
              <Sprout size={15} className="text-[var(--color-aqua)]" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute"
            >
              <Copy size={14} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {done ? "Copied" : label}
    </button>
  );
}
