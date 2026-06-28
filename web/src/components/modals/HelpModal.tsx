import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Sprout, Lock, KeyRound, Sparkles, HandHeart } from "lucide-react";

const STEPS = [
  {
    icon: Lock,
    color: "var(--color-sealed)",
    title: "1 · Plant privately",
    body: "Your answer becomes a sealed seed. Only the commitment hash goes on-chain — the real answer stays hidden during the Commit phase.",
  },
  {
    icon: KeyRound,
    color: "var(--color-aqua)",
    title: "2 · Open the sprout",
    body: "After the submission deadline you reveal answer + salt. If answer + salt + sender + bountyId match the original hash, the seed blooms and becomes eligible.",
  },
  {
    icon: Sparkles,
    color: "var(--color-orchid)",
    title: "3 · Batch AI review",
    body: "The Ritual AI judges every valid bloom together in one batch — no one-by-one judging — and recommends a winner against the rubric.",
  },
  {
    icon: HandHeart,
    color: "var(--color-nectar)",
    title: "4 · Human harvest",
    body: "The AI only recommends. The human owner reviews and finalizes the winner, releasing the reward nectar.",
  },
];

export function HelpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/55 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
                className="glass-strong fixed left-1/2 top-1/2 z-[91] w-[min(94vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-7"
              >
                <div className="mb-1 flex items-center gap-2.5">
                  <Sprout size={22} className="text-[var(--color-lime)]" />
                  <Dialog.Title className="text-[26px] font-semibold text-[var(--color-mist)]">
                    How Cipher Bloom works
                  </Dialog.Title>
                </div>
                <Dialog.Description className="text-[15px] leading-relaxed text-[var(--color-mist)]/65">
                  A private cryptographic garden. Answers are planted as sealed
                  seeds, revealed as verified blooms, judged by Ritual AI in one
                  batch, and harvested by a human owner.
                </Dialog.Description>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {STEPS.map((s) => (
                    <div
                      key={s.title}
                      className="glass-panel rounded-2xl p-4"
                      style={{ borderColor: `color-mix(in srgb, ${s.color} 30%, transparent)` }}
                    >
                      <s.icon size={20} style={{ color: s.color }} />
                      <h4
                        className="mt-2 text-[15px] font-semibold"
                        style={{ color: s.color }}
                      >
                        {s.title}
                      </h4>
                      <p className="mt-1 text-[14px] leading-snug text-[var(--color-mist)]/75">
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-center text-[14px] font-medium tracking-wide text-[var(--color-nectar)]">
                  AI recommends. Human harvests.
                </p>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
