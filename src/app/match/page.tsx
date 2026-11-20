import type { Metadata } from "next";
import { MatchGame } from "@/components/game/MatchGame";

export const metadata: Metadata = { title: "הַתְאֵם | לומדים עברית" };

export default function MatchPage() {
  return <MatchGame />;
}
