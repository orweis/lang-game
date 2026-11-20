"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
const getSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window && !!window.speechSynthesis;
const getServerSupported = () => false;

/** Picks a Hebrew voice ("he" or the legacy "iw" language code), if one is installed. */
export function findHebrewVoice(
  voices: readonly SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  return (
    voices.find((v) => {
      const lang = v.lang.toLowerCase();
      return lang.startsWith("he") || lang.startsWith("iw");
    }) ?? null
  );
}

/**
 * Text-to-speech through the browser's Web Speech API.
 *
 * Speech is spoken in Hebrew (he-IL) with a slightly slow, high voice suited
 * to young children. Starting a new utterance cancels the current one, and
 * any speech is cancelled when the component unmounts. In browsers without
 * `speechSynthesis`, `speak` and `stop` do nothing.
 */
export function useAudio() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSupported = useSyncExternalStore(noopSubscribe, getSupported, getServerSupported);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!getSupported()) return;
    const synth = window.speechSynthesis;

    // Voices load asynchronously in some browsers, so re-check when they change.
    const pickVoice = () => {
      voiceRef.current = findHebrewVoice(synth.getVoices());
    };

    pickVoice();
    synth.addEventListener?.("voiceschanged", pickVoice);
    return () => {
      synth.removeEventListener?.("voiceschanged", pickVoice);
      synth.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!getSupported() || typeof SpeechSynthesisUtterance === "undefined") return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "he-IL";
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 1.0;
    if (voiceRef.current) utterance.voice = voiceRef.current;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (!getSupported()) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}
