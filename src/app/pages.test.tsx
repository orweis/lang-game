import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import AlphabetPage, { metadata as alphabetMeta } from "@/app/alphabet/page";
import MatchPage, { metadata as matchMeta } from "@/app/match/page";
import QuizPage, { metadata as quizMeta } from "@/app/quiz/page";

describe("routes", () => {
  it("renders the home menu", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("לומדים עברית!");
  });

  it.each([
    ["alphabet", AlphabetPage, alphabetMeta, "🔤 אָלֶף-בֵּית"],
    ["match", MatchPage, matchMeta, "🧩 הַתְאֵם"],
    ["quiz", QuizPage, quizMeta, "❓ חִידוֹן"],
  ] as const)("renders the %s page with its own title", (_, Page, meta, heading) => {
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
    expect(String(meta.title)).toContain("לומדים עברית");
  });
});
