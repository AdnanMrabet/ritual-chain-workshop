import { useState } from "react";
import { motion } from "framer-motion";
import { Sprout, Tag, Ruler, Droplet, Coins } from "lucide-react";
import { useBloomStore } from "@/store/useBloomStore";
import { StageScaffold } from "./StageScaffold";
import { Input, Textarea, FieldLabel } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { RewardNectarVault } from "@/components/visual/GardenGlyphs";
import { SafetyConfirmModal } from "@/components/modals/SafetyConfirmModal";
import { useToast } from "@/components/ui/Toaster";

/** Stage 1 — Plant the Bounty. A greenhouse control surface, not a plain form. */
export function CreateStage() {
  const { createBounty, busy } = useBloomStore();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [rubric, setRubric] = useState("");
  const [reward, setReward] = useState("5");
  const [subMin, setSubMin] = useState("20");
  const [revMin, setRevMin] = useState("40");
  const [confirm, setConfirm] = useState(false);

  const valid = title.trim() && rubric.trim() && Number(reward) > 0;

  async function plant() {
    const now = Date.now();
    await createBounty({
      title: title.trim(),
      rubric: rubric.trim(),
      reward: Number(reward),
      // Ritual deadlines are in ms.
      submissionDeadline: now + Number(subMin) * 60 * 1000,
      revealDeadline: now + Number(revMin) * 60 * 1000,
    });
    setConfirm(false);
    toast("success", "Bounty planted and reward locked.");
  }

  return (
    <StageScaffold
      scene="Stage 1"
      title="Plant the Bounty"
      intro="Create a bounty and lock the reward. The rubric guides the AI recommendation. The owner funds, judges, and finalizes."
      accent="var(--color-clay)"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <div>
            <FieldLabel hint="plant label" accent="var(--color-clay)">
              <span className="inline-flex items-center gap-1.5"><Tag size={14} /> Bounty title</span>
            </FieldLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Best Ritual Privacy Bounty Design" />
          </div>

          <div>
            <FieldLabel hint="growth rule" accent="var(--color-clay)">
              <span className="inline-flex items-center gap-1.5"><Ruler size={14} /> Evaluation rubric</span>
            </FieldLabel>
            <Textarea
              rows={4}
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              placeholder="What should the AI reward? e.g. correctness, originality, how well privacy is preserved."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel hint="first time drop" accent="var(--color-clay)">
                <span className="inline-flex items-center gap-1.5"><Droplet size={14} /> Submission window (min)</span>
              </FieldLabel>
              <Input type="number" min={1} value={subMin} onChange={(e) => setSubMin(e.target.value)} />
            </div>
            <div>
              <FieldLabel hint="second time drop" accent="var(--color-clay)">
                <span className="inline-flex items-center gap-1.5"><Droplet size={14} /> Reveal window (min)</span>
              </FieldLabel>
              <Input type="number" min={1} value={revMin} onChange={(e) => setRevMin(e.target.value)} />
            </div>
          </div>

          <Button
            variant="clay"
            size="lg"
            disabled={!valid || busy}
            onClick={() => setConfirm(true)}
          >
            <Sprout size={18} /> Plant bounty & lock reward
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[var(--color-nectar)]/20 bg-black/20 p-6">
          <FieldLabel accent="var(--color-nectar)">
            <span className="inline-flex items-center gap-1.5"><Coins size={14} /> Nectar core (reward)</span>
          </FieldLabel>
          <motion.div animate={{ scale: valid ? 1.04 : 1 }}>
            <RewardNectarVault charged={Number(reward) > 0} />
          </motion.div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              step="0.5"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              className="w-24 text-center font-mono text-[18px]"
            />
            <span className="text-[16px] font-medium text-[var(--color-nectar)]">RITUAL</span>
          </div>
          <p className="text-center text-[13px] text-[var(--color-mist)]/55">
            Reward is locked as nectar in the root until a winner is harvested.
          </p>
        </div>
      </div>

      <SafetyConfirmModal
        open={confirm}
        onOpenChange={setConfirm}
        title="Plant this bounty?"
        description="This locks the reward and opens the commit phase. Participants can then submit sealed seeds."
        accent="var(--color-clay)"
        confirmVariant="clay"
        confirmLabel="Plant & lock reward"
        busy={busy}
        onConfirm={plant}
        checklist={[
          `Reward of ${reward} RITUAL will be locked as nectar.`,
          "The rubric will guide the AI recommendation.",
          "You, the owner, will fund, judge and finalize.",
          "Deadlines use Ritual time (milliseconds) under the hood.",
        ]}
      />
    </StageScaffold>
  );
}
