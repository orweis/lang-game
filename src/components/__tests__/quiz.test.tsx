import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuizChoice } from "@/components/game/QuizChoice";
import { QuizQuestion } from "@/components/game/QuizQuestion";
import { QuizGame } from "@/components/game/QuizGame";
import { TIMING } from "@/lib/constants";
import { installSpeechSynthesis } from "../../../test/speech";
import { LETTER_Q, SOUND_Q, WORD_Q, letter, word } from "./fixtures";

// Fake timers drive every delay, so clicks use fireEvent (synchronous).
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("QuizChoice", () => {
  it.each([
    ["letter", letter("bet"), "ב"],
    ["name", letter("bet"), "בֵּית"],
    ["word", word("cat"), "חָתוּל"],
  ] as const)("renders a %s choice", (showAs, choice, text) => {
    render(<QuizChoice choice={choice} state="idle" showAs={showAs} onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent(text);
  });

  it("renders nothing inside when the choice kind does not match showAs", () => {
    render(<QuizChoice choice={word("cat")} state="idle" showAs="letter" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toHaveTextContent("");
  });

  it("is disabled once marked correct or wrong", () => {
    const { rerender } = render(
      <QuizChoice choice={letter("bet")} state="wrong" showAs="letter" onClick={vi.fn()} />
    );
    expect(screen.getByRole("button")).toBeDisabled();
    rerender(<QuizChoice choice={letter("bet")} state="correct" showAs="letter" onClick={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("button")).toHaveAttribute("data-state", "correct");
  });
});

describe("QuizQuestion", () => {
  it("reads the prompt aloud after a short delay", () => {
    const synth = installSpeechSynthesis();
    render(<QuizQuestion question={LETTER_Q} onAnswer={vi.fn()} />);
    expect(synth.spoken()).toEqual([]);
    act(() => vi.advanceTimersByTime(TIMING.quizPromptDelay));
    expect(synth.spoken()).toEqual([LETTER_Q.ttsPrompt]);
  });

  it("shows the right content for each question type", () => {
    const { rerender } = render(<QuizQuestion question={LETTER_Q} onAnswer={vi.fn()} />);
    expect(screen.getByText("ב", { selector: "span.text-8xl" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /בֵּית|גִּימֶל|דָּלֶת/ })).toHaveLength(3);

    rerender(<QuizQuestion key="w" question={WORD_Q} onAnswer={vi.fn()} />);
    expect(screen.getByText("🐱", { selector: "span.text-8xl" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /חָתוּל/ })).toBeInTheDocument();

    rerender(<QuizQuestion key="s" question={SOUND_Q} onAnswer={vi.fn()} />);
    expect(screen.getByText('"Mem" — ?')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "מ" })).toBeInTheDocument();
  });

  it("praises a correct answer and reports it after the feedback delay", () => {
    const synth = installSpeechSynthesis();
    const onAnswer = vi.fn();
    render(<QuizQuestion question={LETTER_Q} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "בֵּית" }));

    expect(screen.getByRole("button", { name: /בֵּית/ })).toHaveAttribute("data-state", "correct");
    expect(synth.spoken().at(-1)).toBe("כָּל הַכָּבוֹד");
    expect(onAnswer).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(TIMING.quizFeedback));
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("marks a wrong answer, reveals the right one and repeats the prompt", () => {
    const synth = installSpeechSynthesis();
    const onAnswer = vi.fn();
    render(<QuizQuestion question={LETTER_Q} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "גִּימֶל" }));

    expect(screen.getByRole("button", { name: "גִּימֶל" })).toHaveAttribute("data-state", "wrong");
    expect(screen.getByRole("button", { name: /בֵּית/ })).toHaveAttribute("data-state", "correct");
    expect(screen.getByRole("button", { name: "דָּלֶת" })).toHaveAttribute("data-state", "idle");
    expect(synth.spoken().at(-1)).toBe(LETTER_Q.ttsPrompt);
    act(() => vi.advanceTimersByTime(TIMING.quizFeedback));
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("accepts only the first answer", () => {
    const onAnswer = vi.fn();
    render(<QuizQuestion question={LETTER_Q} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "גִּימֶל" }));
    fireEvent.click(screen.getByRole("button", { name: "דָּלֶת" }));
    act(() => vi.advanceTimersByTime(TIMING.quizFeedback * 2));
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("does not report an answer after unmounting", () => {
    const onAnswer = vi.fn();
    const { unmount } = render(<QuizQuestion question={LETTER_Q} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "בֵּית" }));
    unmount();
    act(() => vi.advanceTimersByTime(TIMING.quizFeedback * 2));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  it("replays the prompt from the listen button", () => {
    const synth = installSpeechSynthesis();
    render(<QuizQuestion question={WORD_Q} onAnswer={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "האזן שוב" }));
    expect(synth.spoken()).toContain(WORD_Q.ttsPrompt);
  });
});

describe("QuizGame", () => {
  const twoQuestions = () => [LETTER_Q, SOUND_Q];

  function answer(name: string | RegExp) {
    fireEvent.click(screen.getByRole("button", { name }));
    act(() => vi.advanceTimersByTime(TIMING.quizFeedback));
  }

  it("scores correct answers, celebrates them and shows the final result", () => {
    render(<QuizGame buildQuestions={twoQuestions} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    answer("בֵּית");
    expect(screen.getByTestId("celebration")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(TIMING.celebration));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText('"Mem" — ?')).toBeInTheDocument();

    answer("נ"); // wrong
    expect(screen.queryByTestId("celebration")).toBeNull();
    act(() => vi.advanceTimersByTime(TIMING.quizWrongPause));

    expect(screen.getByRole("heading", { name: "סיימת!" })).toBeInTheDocument();
    expect(screen.getByText("1 מתוך 2 ⭐")).toBeInTheDocument();
  });

  it("derives the total from the questions it was given", () => {
    render(<QuizGame buildQuestions={() => [WORD_Q]} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "1");
  });

  it("builds a fresh set of questions on restart and resets the score", () => {
    const build = vi.fn(() => [LETTER_Q]);
    render(<QuizGame buildQuestions={build} />);
    answer("בֵּית");
    act(() => vi.advanceTimersByTime(TIMING.celebration));
    expect(screen.getByText("1 מתוך 1 ⭐")).toBeInTheDocument();
    const callsBefore = build.mock.calls.length;

    fireEvent.click(screen.getByRole("button", { name: "שחק שוב" }));
    expect(build.mock.calls.length).toBe(callsBefore + 1);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    // The restarted question is fresh (not still showing the old answer).
    expect(screen.getByRole("button", { name: "בֵּית" })).toHaveAttribute("data-state", "idle");
  });

  it("does not skip a question when the wrong-answer timer outlives the game", () => {
    const { unmount } = render(<QuizGame buildQuestions={twoQuestions} />);
    answer("גִּימֶל");
    unmount();
    expect(() => act(() => vi.advanceTimersByTime(TIMING.quizWrongPause * 2))).not.toThrow();
  });

  it("plays a full default session of 15 questions", () => {
    render(<QuizGame />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "15");
  });
});
