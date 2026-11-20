import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { Fragment, createElement, type ReactNode } from "react";
import { afterEach, vi } from "vitest";
import { uninstallSpeechSynthesis } from "./speech";

// Finish framer-motion animations instantly so tests don't wait on them.
MotionGlobalConfig.skipAnimations = true;

// AnimatePresence keeps exiting children mounted until their exit animation
// ends, which never happens under fake timers. Swap children immediately.
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children?: ReactNode }) =>
      createElement(Fragment, null, children),
  };
});

afterEach(() => {
  cleanup();
  uninstallSpeechSynthesis();
});
