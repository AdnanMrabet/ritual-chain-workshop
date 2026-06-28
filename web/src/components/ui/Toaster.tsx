import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

/* Toasts that appear like small blooming flowers in the corner. */

type ToastKind = "success" | "warning" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const COLOR: Record<ToastKind, string> = {
  success: "var(--color-aqua)",
  warning: "var(--color-clay)",
  error: "var(--color-thorn)",
  info: "var(--color-lime)",
};

const ICON: Record<ToastKind, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const ToastCtx = createContext<(kind: ToastKind, message: string) => void>(
  () => {}
);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICON[t.kind];
            const color = COLOR[t.kind];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="glass-strong pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
              >
                <Icon size={20} style={{ color }} className="mt-0.5 shrink-0" />
                <p className="text-[14px] leading-snug text-[var(--color-mist)]/90">
                  {t.message}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
