import type { Metadata } from "next";
import { QuizGame } from "@/components/game/QuizGame";

export const metadata: Metadata = { title: "חִידוֹן | לומדים עברית" };

export default function QuizPage() {
  return <QuizGame />;
}
