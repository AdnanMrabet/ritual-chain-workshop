import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";

export interface SafetyConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  checklist: string[];
  confirmLabel: string;
  confirmVariant?: ButtonProps["variant"];
  accent?: string;
  onConfirm: () => void;
  busy?: boolean;
}

/* Premium confirmation modal: blurred backdrop, luminous border, soft scale-in,
   a safety checklist and one very clear primary action. */
export function SafetyConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  checklist,
  confirmLabel,
  confirmVariant = "lime",
  accent = "var(--color-lime)",
  onConfirm,
  busy,
}: SafetyConfirmProps) {
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
                className="glass-strong fixed left-1/2 top-1/2 z-[91] w-[min(94vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-7"
                style={{ borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    color: accent,
                    background: `color-mix(in srgb, ${accent} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
                  }}
                >
                  <ShieldCheck size={22} />
                </div>

                <Dialog.Title className="text-[26px] font-semibold leading-tight text-[var(--color-mist)]">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-[15px] leading-relaxed text-[var(--color-mist)]/70">
                  {description}
                </Dialog.Description>

                <ul className="mt-5 space-y-2.5">
                  {checklist.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{
                          color: accent,
                          background: `color-mix(in srgb, ${accent} 16%, transparent)`,
                        }}
                      >
                        <Check size={13} />
                      </span>
                      <span className="text-[14px] leading-snug text-[var(--color-mist)]/80">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex items-center justify-end gap-3">
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="md">
                      Cancel
                    </Button>
                  </Dialog.Close>
                  <Button
                    variant={confirmVariant}
                    size="md"
                    onClick={onConfirm}
                    disabled={busy}
                  >
                    {busy ? "Working…" : confirmLabel}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
