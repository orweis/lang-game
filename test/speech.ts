import { vi } from "vitest";

/** Minimal stand-in for `SpeechSynthesisUtterance` (jsdom has none). */
export class FakeUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

export interface FakeSpeech {
  speak: ReturnType<typeof vi.fn>;
  cancel: ReturnType<typeof vi.fn>;
  getVoices: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  /** Texts passed to `speak`, in order. */
  spoken: () => string[];
  /** The most recent utterance passed to `speak`. */
  last: () => FakeUtterance | undefined;
  /** Fires every registered `voiceschanged` listener. */
  fireVoicesChanged: () => void;
}

/** Installs a fake `window.speechSynthesis` and returns it for assertions. */
export function installSpeechSynthesis(
  voices: Array<Pick<SpeechSynthesisVoice, "lang" | "name">> = []
): FakeSpeech {
  const listeners = new Set<() => void>();
  const utterances: FakeUtterance[] = [];
  const fake = {
    speak: vi.fn((u: FakeUtterance) => {
      utterances.push(u);
    }),
    cancel: vi.fn(),
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn((_: string, fn: () => void) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: () => void) => listeners.delete(fn)),
    spoken: () => utterances.map((u) => u.text),
    last: () => utterances.at(-1),
    fireVoicesChanged: () => listeners.forEach((fn) => fn()),
  };
  Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true });
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  return fake;
}

export function uninstallSpeechSynthesis(): void {
  if ("speechSynthesis" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;
  }
  vi.unstubAllGlobals();
}
