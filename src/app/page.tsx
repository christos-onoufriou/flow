import { AppShell } from "@/components/layout/AppShell";
import { Toolbar } from "@/components/layout/Toolbar";
import { LayersPanel } from "@/components/layout/LayersPanel";
import { PropertiesPanel } from "@/components/layout/PropertiesPanel";
import { Canvas } from "@/components/canvas/Canvas";
import { ZoomControls } from "@/components/canvas/ZoomControls";
import { PromptBox } from "@/components/ui/PromptBox";
import { SecondaryToolbar } from "@/components/layout/SecondaryToolbar";
import { TabBar } from "@/components/layout/TabBar";

export default function Home() {
  return (
    <AppShell
      header={<Toolbar />}
      leftSidebar={<LayersPanel />}
      rightSidebar={<PropertiesPanel />}
    >
      <SecondaryToolbar />
      <TabBar />
      <Canvas />
      <ZoomControls />
      <PromptBox />
    </AppShell>
  );
}
