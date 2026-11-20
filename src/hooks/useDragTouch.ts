"use client";
import { useCallback, useRef, useState } from "react";

export interface DragState {
  draggedId: string | null;
  x: number;
  y: number;
  originX: number;
  originY: number;
  isDragging: boolean;
}

const INITIAL: DragState = {
  draggedId: null,
  x: 0,
  y: 0,
  originX: 0,
  originY: 0,
  isDragging: false,
};

/** CSS selector of elements that accept drops. */
export const DROPZONE_SELECTOR = "[data-dropzone]";

/**
 * Pointer-based drag and drop that works the same for mouse, pen and touch.
 *
 * Attach the returned handlers to each draggable element. When the pointer is
 * released, `onDrop` is called with the dragged id and the nearest element
 * under the pointer that matches `[data-dropzone]` (or `null`). A cancelled
 * pointer (for example the browser taking over a scroll gesture) ends the drag
 * without a drop.
 */
export function useDragTouch(
  onDrop: (draggedId: string, targetEl: Element | null) => void
) {
  const [drag, setDrag] = useState<DragState>(INITIAL);
  // Mirrors `drag` so the handlers always see the latest value, even when
  // several pointer events arrive before React re-renders.
  const dragRef = useRef<DragState>(INITIAL);
  const dragEl = useRef<HTMLElement | null>(null);

  const update = useCallback((next: DragState) => {
    dragRef.current = next;
    setDrag(next);
  }, []);

  const reset = useCallback(() => {
    dragEl.current = null;
    update(INITIAL);
  }, [update]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, id: string) => {
      // Ignore secondary buttons and extra fingers while a drag is active.
      if (e.button !== 0 || dragRef.current.isDragging) return;
      const el = e.currentTarget;
      el.setPointerCapture?.(e.pointerId);
      dragEl.current = el;
      const rect = el.getBoundingClientRect();
      update({
        draggedId: id,
        x: e.clientX,
        y: e.clientY,
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
        isDragging: true,
      });
    },
    [update]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const current = dragRef.current;
      if (!current.isDragging) return;
      update({ ...current, x: e.clientX, y: e.clientY });
    },
    [update]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const { isDragging, draggedId } = dragRef.current;
      if (!isDragging || !draggedId) return;

      // The dragged card sits under the pointer, so hide it from hit-testing
      // while looking up the element beneath it.
      const el = dragEl.current;
      const previous = el?.style.pointerEvents ?? "";
      if (el) el.style.pointerEvents = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (el) el.style.pointerEvents = previous;

      reset();
      onDrop(draggedId, target?.closest(DROPZONE_SELECTOR) ?? null);
    },
    [onDrop, reset]
  );

  const onPointerCancel = useCallback(() => {
    if (dragRef.current.isDragging) reset();
  }, [reset]);

  const dragOffset = drag.isDragging
    ? { x: drag.x - drag.originX, y: drag.y - drag.originY }
    : { x: 0, y: 0 };

  return { drag, dragOffset, onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
}
