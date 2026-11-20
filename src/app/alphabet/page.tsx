import type { Metadata } from "next";
import { GameShell } from "@/components/layout/GameShell";
import { AlphabetGrid } from "@/components/game/AlphabetGrid";
import { STRINGS } from "@/lib/strings";

export const metadata: Metadata = { title: "אָלֶף-בֵּית | לומדים עברית" };

export default function AlphabetPage() {
  return (
    <GameShell title={STRINGS.alphabetTitle}>
      <AlphabetGrid />
    </GameShell>
  );
}
