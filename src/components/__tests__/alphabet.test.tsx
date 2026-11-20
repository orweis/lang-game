import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlphabetGrid } from "@/components/game/AlphabetGrid";
import { ALPHABET } from "@/data";
import { TIMING } from "@/lib/constants";
import { installSpeechSynthesis } from "../../../test/speech";

const tile = (i: number) =>
  screen.getByRole("button", { name: `${ALPHABET[i].nameRomanized} - ${ALPHABET[i].name}` });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("AlphabetGrid", () => {
  it("shows all 22 letters", () => {
    render(<AlphabetGrid />);
    ALPHABET.forEach((_, i) => expect(tile(i)).toBeInTheDocument());
  });

  it("speaks a tapped letter and highlights it until speech ends", () => {
    const synth = installSpeechSynthesis();
    render(<AlphabetGrid />);
    fireEvent.click(tile(2));
    expect(synth.spoken()).toEqual([ALPHABET[2].ttsPhrase]);
    expect(tile(2)).toHaveAttribute("aria-pressed", "true");

    act(() => synth.last()!.onstart?.());
    act(() => synth.last()!.onend?.());
    act(() => vi.advanceTimersByTime(300));
    expect(tile(2)).toHaveAttribute("aria-pressed", "false");
  });

  it("plays every letter in order and ignores taps meanwhile", () => {
    const synth = installSpeechSynthesis();
    render(<AlphabetGrid />);
    fireEvent.click(screen.getByRole("button", { name: "נגן את כל האותיות" }));
    expect(synth.spoken()).toEqual([ALPHABET[0].ttsPhrase]);

    fireEvent.click(tile(10));
    expect(synth.spoken()).toHaveLength(1);

    act(() => vi.advanceTimersByTime(TIMING.playAllStep * ALPHABET.length));
    expect(synth.spoken()).toEqual(ALPHABET.map((l) => l.ttsPhrase));
    expect(screen.getByRole("button", { name: "נגן את כל האותיות" })).toBeInTheDocument();
  });

  it("stops playing all and cancels speech", () => {
    const synth = installSpeechSynthesis();
    render(<AlphabetGrid />);
    fireEvent.click(screen.getByRole("button", { name: "נגן את כל האותיות" }));
    act(() => vi.advanceTimersByTime(TIMING.playAllStep));
    fireEvent.click(screen.getByRole("button", { name: "עצור" }));
    const cancels = synth.cancel.mock.calls.length;
    act(() => vi.advanceTimersByTime(TIMING.playAllStep * 5));
    expect(synth.spoken()).toHaveLength(2);
    expect(cancels).toBeGreaterThanOrEqual(3);
    ALPHABET.forEach((_, i) => expect(tile(i)).toHaveAttribute("aria-pressed", "false"));
  });

  it("stops the sequence when unmounted", () => {
    const synth = installSpeechSynthesis();
    const { unmount } = render(<AlphabetGrid />);
    fireEvent.click(screen.getByRole("button", { name: "נגן את כל האותיות" }));
    unmount();
    act(() => vi.advanceTimersByTime(TIMING.playAllStep * 5));
    expect(synth.spoken()).toHaveLength(1);
  });
});
