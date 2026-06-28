import { motion } from "framer-motion";
import { Wallet, AlertTriangle } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Button } from "@/components/ui/Button";

/** Stage 0 — Wake the Garden. Dark sleeping garden; green lights wake on connect. */
export function ConnectStage() {
  const { network, connect, busy } = useBloomStore();
  const awake = network === "connected";
  const wrong = network === "wrong-network";

  // a small constellation of garden lights
  const lights = [
    { x: 18, y: 30 }, { x: 38, y: 64 }, { x: 60, y: 24 },
    { x: 74, y: 58 }, { x: 50, y: 80 }, { x: 86, y: 38 }, { x: 28, y: 82 },
  ];

  return (
    <StageScaffold
      scene="Stage 0"
      title="Wake the Garden"
      intro="Connect your wallet to enter the private bounty garden. Ritual network required."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div
          className="relative grid h-[300px] place-items-center overflow-hidden rounded-3xl border border-[var(--color-mist)]/10"
          style={{ background: "radial-gradient(60% 70% at 50% 60%, rgba(16,23,15,0.6), rgba(8,10,7,0.2))" }}
        >
          {lights.map((l, i) => (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ left: `${l.x}%`, top: `${l.y}%`, background: "var(--color-lime)" }}
              animate={
                awake
                  ? { opacity: [0.2, 1, 0.6], scale: [0.6, 1.2, 1], boxShadow: "0 0 14px 2px var(--color-lime)" }
                  : { opacity: 0.12, scale: 0.6 }
              }
              transition={{ duration: 1.4, delay: i * 0.12, repeat: awake ? Infinity : 0, repeatType: "reverse" }}
            />
          ))}
          <motion.div
            className="relative grid h-28 w-28 place-items-center rounded-full"
            animate={awake ? { boxShadow: "0 0 50px -6px var(--color-lime)" } : { boxShadow: "none" }}
          >
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <circle cx="60" cy="60" r="40" fill="none" stroke="var(--color-lime)" strokeOpacity={awake ? 0.5 : 0.12} strokeWidth="1.5" className={awake ? "cb-spin-slow" : ""} />
              <circle cx="60" cy="60" r="16" fill={awake ? "var(--color-lime)" : "#10170f"} fillOpacity={awake ? 0.4 : 1} stroke="var(--color-aqua)" strokeOpacity={awake ? 0.8 : 0.2} strokeWidth="2" className={awake ? "cb-pulse-glow" : ""} style={{ color: "var(--color-lime)" }} />
            </svg>
          </motion.div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          {wrong && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-[var(--color-thorn)]/40 bg-[var(--color-thorn)]/8 p-3.5 cb-thorn-shake">
              <AlertTriangle size={18} className="mt-0.5 text-[var(--color-thorn)]" />
              <p className="text-[14px] text-[var(--color-mist)]/85">
                Wrong network. Switch your wallet to <b>Ritual Testnet</b> to continue.
              </p>
            </div>
          )}
          <p className="text-[16px] leading-relaxed text-[var(--color-mist)]/75">
            {awake
              ? "Wallet connected. The garden is awake — plant a bounty to begin."
              : "The garden is asleep. Your wallet is the garden key that wakes the lights."}
          </p>
          {!awake && (
            <Button variant="lime" size="lg" onClick={connect} disabled={busy} className="self-start">
              <Wallet size={18} /> {busy ? "Waking…" : "Connect wallet"}
            </Button>
          )}
        </div>
      </div>
    </StageScaffold>
  );
}
