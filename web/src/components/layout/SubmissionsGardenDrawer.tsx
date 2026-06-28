import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, X } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { SubmissionBloomCard } from "@/components/visual/SubmissionBloomCard";

/** Greenhouse glass panel that slides in from the right with every submission
    as a visual card (never a table). */
export function SubmissionsGardenDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { submissions } = useBloomStore();

  const sealed = submissions.filter((s) => s.status === "sealed" || s.status === "dormant").length;
  const blooms = submissions.filter((s) => s.eligible).length;

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
                className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                className="glass-strong fixed right-0 top-0 z-[81] flex h-full w-[min(94vw,460px)] flex-col rounded-l-3xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Flower2 size={20} className="text-[var(--color-lime)]" />
                    <Dialog.Title className="text-[20px] font-semibold text-[var(--color-mist)]">
                      Submission Garden
                    </Dialog.Title>
                  </div>
                  <Dialog.Close className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--color-mist)]/15 text-[var(--color-mist)]/70 hover:text-[var(--color-mist)]">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <Dialog.Description className="mt-1 text-[14px] text-[var(--color-mist)]/60">
                  {submissions.length} submissions · {sealed} sealed · {blooms} eligible blooms
                </Dialog.Description>

                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 thin-scroll">
                  {submissions.length === 0 ? (
                    <p className="text-[14px] text-[var(--color-mist)]/55">
                      No seeds planted yet.
                    </p>
                  ) : (
                    submissions.map((s) => (
                      <SubmissionBloomCard key={s.index} submission={s} />
                    ))
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
