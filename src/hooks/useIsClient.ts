"use client";
import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * `false` during server rendering and hydration, `true` afterwards.
 *
 * Game screens build their content with `Math.random`, so rendering it on the
 * server would never match what the browser builds. Gating on this hook keeps
 * hydration consistent without a set-state-in-effect round trip.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
