import { motion } from "framer-motion";

/** Shared scene wrapper so every stage feels like a distinct scene inside the
    same greenhouse, with a consistent title block and entrance motion. */
export function StageScaffold({
  scene,
  title,
  intro,
  accent = "var(--color-lime)",
  children,
}: {
  scene: string;
  title: string;
  intro: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-full flex-col"
    >
      <div className="mb-5">
        <div
          className="text-[13px] font-medium uppercase tracking-[0.22em]"
          style={{ color: accent }}
        >
          {scene}
        </div>
        <h2 className="mt-1 text-[30px] font-semibold leading-tight text-[var(--color-mist)] sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-2 max-w-[60ch] text-[16px] leading-relaxed text-[var(--color-mist)]/70">
          {intro}
        </p>
      </div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}
