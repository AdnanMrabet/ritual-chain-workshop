import { useState } from "react";
import { ToasterProvider } from "@/components/ui/Toaster";
import { FloatingGardenHeader } from "@/components/layout/FloatingGardenHeader";
import { StageCardRibbon } from "@/components/layout/StageCardRibbon";
import { MainBloomStage } from "@/components/layout/MainBloomStage";
import { RightActionGreenhouse } from "@/components/layout/RightActionGreenhouse";
import { BottomGrowthTimeline } from "@/components/layout/BottomGrowthTimeline";
import { SubmissionsGardenDrawer } from "@/components/layout/SubmissionsGardenDrawer";
import { HelpModal } from "@/components/modals/HelpModal";

function Shell() {
  const [help, setHelp] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="relative z-[1] flex min-h-screen flex-col">
      {/* readability veil + bioluminescence on top of the host background */}
      <div className="cb-atmosphere" />

      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <FloatingGardenHeader onHelp={() => setHelp(true)} />
      </div>

      <div className="mx-auto w-full max-w-[1640px] px-3 pt-3 sm:px-4">
        <StageCardRibbon />
      </div>

      <main className="mx-auto grid w-full max-w-[1640px] flex-1 grid-cols-1 gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="order-1">
          <MainBloomStage />
        </div>
        <div className="order-2 lg:sticky lg:top-[96px] lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto lg:overscroll-contain thin-scroll">
          <RightActionGreenhouse onOpenSubmissions={() => setDrawer(true)} />
        </div>
      </main>

      <div className="sticky bottom-0 z-30 px-3 pb-3 sm:px-4">
        <BottomGrowthTimeline />
      </div>

      <SubmissionsGardenDrawer open={drawer} onOpenChange={setDrawer} />
      <HelpModal open={help} onOpenChange={setHelp} />
    </div>
  );
}

export default function App() {
  return (
    <ToasterProvider>
      <Shell />
    </ToasterProvider>
  );
}
