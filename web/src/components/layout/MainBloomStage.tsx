import { AnimatePresence } from "framer-motion";
import { useBloomStore } from "@/store/useBloomStore";
import { ConnectStage } from "@/components/stages/ConnectStage";
import { CreateStage } from "@/components/stages/CreateStage";
import { StatusStage } from "@/components/stages/StatusStage";
import { CommitStage } from "@/components/stages/CommitStage";
import { RevealStage } from "@/components/stages/RevealStage";
import { FundStage } from "@/components/stages/FundStage";
import { JudgeStage } from "@/components/stages/JudgeStage";
import { VerdictStage } from "@/components/stages/VerdictStage";
import { FinalizeStage } from "@/components/stages/FinalizeStage";
import { SubmissionsStage } from "@/components/stages/SubmissionsStage";
import type { StageId } from "@/types";

const SCENES: Record<StageId, React.ComponentType> = {
  connect: ConnectStage,
  create: CreateStage,
  status: StatusStage,
  commit: CommitStage,
  reveal: RevealStage,
  fund: FundStage,
  judge: JudgeStage,
  verdict: VerdictStage,
  finalize: FinalizeStage,
  submissions: SubmissionsStage,
};

/** The largest central area — the active scene of the current stage, with a
    motion transition each time the stage changes. */
export function MainBloomStage() {
  const { activeStage } = useBloomStore();
  const Scene = SCENES[activeStage];

  return (
    <section className="glass relative min-h-[560px] rounded-3xl p-6 sm:p-7">
      <AnimatePresence mode="wait">
        <Scene key={activeStage} />
      </AnimatePresence>
    </section>
  );
}
