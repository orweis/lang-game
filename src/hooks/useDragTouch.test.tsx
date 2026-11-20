import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDragTouch } from "@/hooks/useDragTouch";

function Harness({ onDrop }: { onDrop: (id: string, el: Element | null) => void }) {
  const { drag, dragOffset, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useDragTouch(onDrop);
  return (
    <div>
      <div
        data-testid="card"
        onPointerDown={(e) => onPointerDown(e, "aleph")}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
      <div data-testid="zone" data-dropzone="lion">
        <span data-testid="zone-child">🦁</span>
      </div>
      <div data-testid="elsewhere" />
      <output data-testid="state">
        {JSON.stringify({ id: drag.draggedId, dragging: drag.isDragging, ...dragOffset })}
      </output>
    </div>
  );
}

const state = () => JSON.parse(screen.getByTestId("state").textContent!);

describe("useDragTouch", () => {
  let hit: Element | null = null;

  beforeEach(() => {
    hit = null;
    document.elementFromPoint = vi.fn(() => hit);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 100,
      width: 50,
      height: 50,
    } as DOMRect);
  });

  afterEach(() => {
    // @ts-expect-error -- jsdom has no elementFromPoint by default
    delete document.elementFromPoint;
  });

  it("tracks the offset from the card's centre while dragging", () => {
    render(<Harness onDrop={vi.fn()} />);
    const card = screen.getByTestId("card");
    fireEvent.pointerDown(card, { button: 0, clientX: 125, clientY: 125, pointerId: 1 });
    expect(state()).toMatchObject({ id: "aleph", dragging: true, x: 0, y: 0 });

    fireEvent.pointerMove(card, { clientX: 160, clientY: 90 });
    fireEvent.pointerMove(card, { clientX: 175, clientY: 105 });
    expect(state()).toMatchObject({ x: 50, y: -20 });
  });

  it("reports the drop zone under the pointer, even when a child element is hit", () => {
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} />);
    const card = screen.getByTestId("card");
    hit = screen.getByTestId("zone-child");

    fireEvent.pointerDown(card, { button: 0, clientX: 125, clientY: 125 });
    fireEvent.pointerUp(card, { clientX: 300, clientY: 300 });

    expect(document.elementFromPoint).toHaveBeenCalledWith(300, 300);
    expect(onDrop).toHaveBeenCalledWith("aleph", screen.getByTestId("zone"));
    expect(state()).toMatchObject({ id: null, dragging: false, x: 0, y: 0 });
    // The card is hit-testable again afterwards.
    expect(card.style.pointerEvents).toBe("");
  });

  it("reports null when dropped outside any zone", () => {
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} />);
    hit = screen.getByTestId("elsewhere");
    const card = screen.getByTestId("card");
    fireEvent.pointerDown(card, { button: 0 });
    fireEvent.pointerUp(card);
    expect(onDrop).toHaveBeenCalledWith("aleph", null);
  });

  it("does nothing on move or release without a drag", () => {
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} />);
    const card = screen.getByTestId("card");
    fireEvent.pointerMove(card, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(card);
    expect(onDrop).not.toHaveBeenCalled();
    expect(state()).toMatchObject({ dragging: false });
  });

  it("ignores non-primary buttons", () => {
    render(<Harness onDrop={vi.fn()} />);
    fireEvent.pointerDown(screen.getByTestId("card"), { button: 2 });
    expect(state()).toMatchObject({ dragging: false });
  });

  it("ends the drag without dropping when the pointer is cancelled", () => {
    const onDrop = vi.fn();
    render(<Harness onDrop={onDrop} />);
    const card = screen.getByTestId("card");
    fireEvent.pointerDown(card, { button: 0, clientX: 125, clientY: 125 });
    fireEvent.pointerMove(card, { clientX: 200, clientY: 200 });
    fireEvent.pointerCancel(card);
    expect(state()).toMatchObject({ dragging: false, x: 0, y: 0 });
    fireEvent.pointerUp(card);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("captures the pointer when the browser supports it", () => {
    const capture = vi.fn();
    render(<Harness onDrop={vi.fn()} />);
    const card = screen.getByTestId("card");
    card.setPointerCapture = capture;
    fireEvent.pointerDown(card, { button: 0, pointerId: 7 });
    expect(capture).toHaveBeenCalledWith(7);
  });
});
