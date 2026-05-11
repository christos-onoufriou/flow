import { AppShell } from "@/components/layout/AppShell";
import { Toolbar } from "@/components/layout/Toolbar";
import { LayersPanel } from "@/components/layout/LayersPanel";
import { PropertiesPanel } from "@/components/layout/PropertiesPanel";
import { Canvas } from "@/components/canvas/Canvas";
import { PromptBox } from "@/components/ui/PromptBox";

export default function Home() {
  return (
    <AppShell
      header={<Toolbar />}
      leftSidebar={<LayersPanel />}
      rightSidebar={<PropertiesPanel />}
    >
      <Canvas />
      <PromptBox />
    </AppShell>
  );
}
