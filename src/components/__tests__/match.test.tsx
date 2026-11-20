import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MatchBoard } from "@/components/game/MatchBoard";
import { MatchGame } from "@/components/game/MatchGame";
import { TIMING } from "@/lib/constants";
import type { MatchRound } from "@/types";
import { installSpeechSynthesis } from "../../../test/speech";
import { letter, word } from "./fixtures";

// lion→aleph, house→bet, fish→dalet
const ROUND: MatchRound = {
  letters: [letter("bet"), letter("aleph"), letter("dalet")],
  words: [word("fish"), word("lion"), word("house")],
};
const ROUND_2: MatchRound = {
  letters: [letter("mem"), letter("lamed")],
  words: [word("bread"), word("water")],
};

/** Drags a letter card and drops it on a word (or on nothing when wordId is null). */
function dragTo(letterId: string, wordId: string | null) {
  const card = screen.getByTestId(`match-card-${letterId}`);
  const target = wordId ? screen.getByTestId(`dropzone-${wordId}`) : document.body;
  document.elementFromPoint = vi.fn(() => target);
  fireEvent.pointerDown(card, { button: 0, clientX: 10, clientY: 10 });
  fireEvent.pointerMove(card, { clientX: 50, clientY: 50 });
  fireEvent.pointerUp(card, { clientX: 50, clientY: 50 });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error -- set per test by dragTo
  delete document.elementFromPoint;
});

describe("MatchBoard", () => {
  it("accepts a correct drop, praises it and locks the pair", () => {
    const synth = installSpeechSynthesis();
    render(<MatchBoard {...ROUND} onRoundComplete={vi.fn()} />);
    dragTo("aleph", "lion");

    expect(screen.getByTestId("match-card-aleph")).toHaveAttribute("data-matched", "true");
    expect(screen.getByTestId("dropzone-lion")).toHaveAttribute("data-matched", "true");
    expect(synth.spoken()).toEqual(["כָּל הַכָּבוֹד"]);
    expect(screen.getByText("כָּל הַכָּבוֹד!")).toHaveAttribute("aria-live", "polite");
  });

  it("rejects a wrong drop and asks to try again", () => {
    const synth = installSpeechSynthesis();
    render(<MatchBoard {...ROUND} onRoundComplete={vi.fn()} />);
    dragTo("aleph", "house");

    expect(screen.getByTestId("match-card-aleph")).not.toHaveAttribute("data-matched");
    expect(screen.getByTestId("dropzone-house")).not.toHaveAttribute("data-matched");
    expect(synth.spoken()).toEqual(["נסה שוב"]);
  });

  it("ignores drops outside any word", () => {
    const synth = installSpeechSynthesis();
    render(<MatchBoard {...ROUND} onRoundComplete={vi.fn()} />);
    dragTo("aleph", null);
    expect(synth.spoken()).toEqual([]);
  });

  it("completes the round once, after the last pair, with a short delay", () => {
    const onRoundComplete = vi.fn();
    render(<MatchBoard {...ROUND} onRoundComplete={onRoundComplete} />);
    dragTo("aleph", "lion");
    dragTo("bet", "house");
    act(() => vi.advanceTimersByTime(TIMING.matchRoundComplete * 2));
    expect(onRoundComplete).not.toHaveBeenCalled();

    dragTo("dalet", "fish");
    expect(onRoundComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(TIMING.matchRoundComplete));
    expect(onRoundComplete).toHaveBeenCalledTimes(1);
  });

  it("does not complete the round after unmounting", () => {
    const onRoundComplete = vi.fn();
    const { unmount } = render(<MatchBoard {...ROUND_2} onRoundComplete={onRoundComplete} />);
    dragTo("mem", "water");
    dragTo("lamed", "bread");
    unmount();
    act(() => vi.advanceTimersByTime(TIMING.matchRoundComplete * 2));
    expect(onRoundComplete).not.toHaveBeenCalled();
  });

  it("supports matching with the keyboard", () => {
    const onRoundComplete = vi.fn();
    render(<MatchBoard {...ROUND_2} onRoundComplete={onRoundComplete} />);
    const mem = screen.getByTestId("match-card-mem");

    fireEvent.keyDown(mem, { key: "Enter" });
    expect(mem).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(screen.getByTestId("dropzone-water"), { key: " " });
    expect(screen.getByTestId("dropzone-water")).toHaveAttribute("data-matched", "true");

    // Activating a word without a selected letter does nothing.
    fireEvent.keyDown(screen.getByTestId("dropzone-bread"), { key: "Enter" });
    expect(screen.getByTestId("dropzone-bread")).not.toHaveAttribute("data-matched");

    fireEvent.keyDown(screen.getByTestId("match-card-lamed"), { key: "Enter" });
    fireEvent.click(screen.getByTestId("dropzone-bread"));
    act(() => vi.advanceTimersByTime(TIMING.matchRoundComplete));
    expect(onRoundComplete).toHaveBeenCalledTimes(1);
  });

  it("toggles a keyboard selection off when the same letter is chosen again", () => {
    render(<MatchBoard {...ROUND_2} onRoundComplete={vi.fn()} />);
    const mem = screen.getByTestId("match-card-mem");
    fireEvent.keyDown(mem, { key: "Enter" });
    fireEvent.keyDown(mem, { key: "Enter" });
    expect(mem).toHaveAttribute("aria-pressed", "false");
  });
});

describe("MatchGame", () => {
  const twoRounds = () => [ROUND_2, ROUND];

  function finishRound(pairs: Array<[string, string]>) {
    for (const [l, w] of pairs) dragTo(l, w);
    act(() => vi.advanceTimersByTime(TIMING.matchRoundComplete));
    expect(screen.getByTestId("celebration")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(TIMING.celebration));
  }

  it("plays through every round and shows the result", () => {
    render(<MatchGame buildRounds={twoRounds} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "2");

    finishRound([
      ["mem", "water"],
      ["lamed", "bread"],
    ]);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    // The second round starts fresh.
    expect(screen.getByTestId("match-card-aleph")).not.toHaveAttribute("data-matched");

    finishRound([
      ["aleph", "lion"],
      ["bet", "house"],
      ["dalet", "fish"],
    ]);
    expect(screen.getByRole("heading", { name: "כָּל הַכָּבוֹד!" })).toBeInTheDocument();
    expect(screen.getByText("השלמת 2 סיבובים!")).toBeInTheDocument();
  });

  it("rebuilds the rounds when playing again", () => {
    const build = vi.fn(() => [ROUND_2]);
    render(<MatchGame buildRounds={build} />);
    finishRound([
      ["mem", "water"],
      ["lamed", "bread"],
    ]);
    const calls = build.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "שחק שוב" }));
    expect(build.mock.calls.length).toBe(calls + 1);
    const board = screen.getByTestId("match-card-mem");
    expect(board).not.toHaveAttribute("data-matched");
  });

  it("uses the real word list by default", () => {
    render(<MatchGame />);
    const zones = document.querySelectorAll("[data-dropzone]");
    expect(zones.length).toBeGreaterThanOrEqual(2);
    expect(within(document.body).getAllByRole("button").length).toBeGreaterThan(zones.length);
  });
});
