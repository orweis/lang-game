import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { findHebrewVoice, useAudio } from "@/hooks/useAudio";
import { installSpeechSynthesis, type FakeUtterance } from "../../test/speech";

const voice = (lang: string, name = lang) => ({ lang, name }) as SpeechSynthesisVoice;

describe("findHebrewVoice", () => {
  it("prefers the first he/iw voice, case-insensitively", () => {
    expect(findHebrewVoice([voice("en-US"), voice("he-IL", "Carmit")])?.name).toBe("Carmit");
    expect(findHebrewVoice([voice("IW-il", "Legacy")])?.name).toBe("Legacy");
    expect(findHebrewVoice([voice("en-US"), voice("hi-IN")])).toBeNull();
    expect(findHebrewVoice([])).toBeNull();
  });
});

describe("useAudio", () => {
  it("is a silent no-op when speech synthesis is unavailable", () => {
    const { result } = renderHook(() => useAudio());
    expect(result.current.isSupported).toBe(false);
    expect(() => result.current.speak("שלום")).not.toThrow();
    expect(() => result.current.stop()).not.toThrow();
    expect(result.current.isSpeaking).toBe(false);
  });

  it("speaks Hebrew with child-friendly settings and cancels earlier speech", () => {
    const synth = installSpeechSynthesis();
    const { result } = renderHook(() => useAudio());
    expect(result.current.isSupported).toBe(true);

    act(() => result.current.speak("אָלֶף"));
    expect(synth.cancel).toHaveBeenCalledTimes(1);
    const u = synth.last()!;
    expect(u.text).toBe("אָלֶף");
    expect(u.lang).toBe("he-IL");
    expect(u.rate).toBeCloseTo(0.8);
    expect(u.pitch).toBeCloseTo(1.2);
    expect(u.voice).toBeNull();
  });

  it("uses a Hebrew voice, including one that loads later", () => {
    const voices: SpeechSynthesisVoice[] = [voice("en-US")];
    const synth = installSpeechSynthesis(voices);
    const { result } = renderHook(() => useAudio());

    act(() => result.current.speak("א"));
    expect(synth.last()!.voice).toBeNull();

    voices.push(voice("he-IL", "Carmit"));
    act(() => synth.fireVoicesChanged());
    act(() => result.current.speak("ב"));
    expect(synth.last()!.voice?.name).toBe("Carmit");
  });

  it("tracks speaking state from utterance events, including errors", () => {
    const synth = installSpeechSynthesis();
    const { result } = renderHook(() => useAudio());
    act(() => result.current.speak("א"));
    const u = synth.last() as FakeUtterance;

    act(() => u.onstart?.());
    expect(result.current.isSpeaking).toBe(true);
    act(() => u.onend?.());
    expect(result.current.isSpeaking).toBe(false);

    act(() => u.onstart?.());
    act(() => u.onerror?.());
    expect(result.current.isSpeaking).toBe(false);
  });

  it("stop() cancels speech and resets the speaking flag", () => {
    const synth = installSpeechSynthesis();
    const { result } = renderHook(() => useAudio());
    act(() => result.current.speak("א"));
    act(() => synth.last()!.onstart?.());
    act(() => result.current.stop());
    expect(result.current.isSpeaking).toBe(false);
    expect(synth.cancel).toHaveBeenCalledTimes(2);
  });

  it("cancels speech and removes its listener on unmount", () => {
    const synth = installSpeechSynthesis();
    const { unmount } = renderHook(() => useAudio());
    expect(synth.addEventListener).toHaveBeenCalledWith("voiceschanged", expect.any(Function));
    unmount();
    expect(synth.removeEventListener).toHaveBeenCalledWith("voiceschanged", expect.any(Function));
    expect(synth.cancel).toHaveBeenCalled();
  });

  it("keeps a stable speak function across renders", () => {
    installSpeechSynthesis();
    const { result, rerender } = renderHook(() => useAudio());
    const first = result.current.speak;
    rerender();
    expect(result.current.speak).toBe(first);
  });
});
