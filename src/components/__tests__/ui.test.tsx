import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BigButton } from "@/components/ui/BigButton";
import { CelebrationOverlay } from "@/components/ui/CelebrationOverlay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ResultScreen } from "@/components/ui/ResultScreen";
import { HomeScreen } from "@/components/layout/HomeScreen";
import { TIMING } from "@/lib/constants";

describe("ProgressBar", () => {
  it("shows one star per completed step and exposes progress to assistive tech", () => {
    render(<ProgressBar current={2} total={5} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "2");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAccessibleName("2 מתוך 5");
    expect(bar.textContent).toBe("⭐⭐⬜⬜⬜");
  });

  it("clamps out-of-range values", () => {
    const { rerender } = render(<ProgressBar current={9} total={3} />);
    expect(screen.getByRole("progressbar").textContent).toBe("⭐⭐⭐");
    rerender(<ProgressBar current={-1} total={2} />);
    expect(screen.getByRole("progressbar").textContent).toBe("⬜⬜");
    rerender(<ProgressBar current={0} total={0} />);
    expect(screen.getByRole("progressbar").textContent).toBe("");
  });
});

describe("BigButton", () => {
  it("is a type=button that calls onClick", async () => {
    const onClick = vi.fn();
    render(
      <BigButton onClick={onClick} aria-label="go" className="bg-red-400">
        Go
      </BigButton>
    );
    const btn = screen.getByRole("button", { name: "go" });
    expect(btn).toHaveAttribute("type", "button");
    expect(btn).toHaveClass("bg-red-400", "rounded-3xl");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <BigButton onClick={onClick} disabled>
        Go
      </BigButton>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("CelebrationOverlay", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders nothing while hidden", () => {
    render(<CelebrationOverlay show={false} onComplete={vi.fn()} />);
    expect(screen.queryByTestId("celebration")).toBeNull();
  });

  it("calls onComplete once after the celebration time", () => {
    const onComplete = vi.fn();
    render(<CelebrationOverlay show onComplete={onComplete} />);
    expect(screen.getByTestId("celebration")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(TIMING.celebration - 1));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not restart its timer when the parent re-renders with a new callback", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<CelebrationOverlay show onComplete={first} />);
    act(() => vi.advanceTimersByTime(TIMING.celebration / 2));
    rerender(<CelebrationOverlay show onComplete={second} />);
    act(() => vi.advanceTimersByTime(TIMING.celebration / 2));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not fire after being hidden or unmounted", () => {
    const onComplete = vi.fn();
    const { rerender, unmount } = render(<CelebrationOverlay show onComplete={onComplete} />);
    rerender(<CelebrationOverlay show={false} onComplete={onComplete} />);
    unmount();
    act(() => vi.advanceTimersByTime(TIMING.celebration * 2));
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe("ResultScreen", () => {
  it("shows the result and restarts on demand", async () => {
    const onRestart = vi.fn();
    render(
      <ResultScreen
        emoji="🎉"
        title="סיימת!"
        subtitle="3 מתוך 5"
        onRestart={onRestart}
        buttonClassName="bg-purple-400"
      />
    );
    expect(screen.getByRole("heading", { name: "סיימת!" })).toBeInTheDocument();
    expect(screen.getByText("3 מתוך 5")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "שחק שוב" }));
    expect(onRestart).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "חזור לתפריט הראשי" })).toHaveAttribute("href", "/");
  });
});

describe("HomeScreen", () => {
  it("links to the three game modes", () => {
    render(<HomeScreen />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/alphabet", "/match", "/quiz"]);
  });
});
