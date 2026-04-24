import { GameShell } from "@/components/layout/GameShell";
import { AlphabetGrid } from "@/components/game/AlphabetGrid";

export default function AlphabetPage() {
  return (
    <GameShell title="🔤 אָלֶף-בֵּית">
      <AlphabetGrid />
    </GameShell>
  );
}
