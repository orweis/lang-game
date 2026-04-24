"use client";
import { useCallback, useRef, useState } from "react";

interface DragState {
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

export function useDragTouch(
  onDrop: (draggedId: string, targetEl: Element | null) => void
) {
  const [drag, setDrag] = useState<DragState>(INITIAL);
  const dragEl = useRef<HTMLElement | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, id: string) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragEl.current = e.currentTarget;
      const rect = e.currentTarget.getBoundingClientRect();
      setDrag({
        draggedId: id,
        x: e.clientX,
        y: e.clientY,
        originX: rect.left + rect.width / 2,
        originY: rect.top + rect.height / 2,
        isDragging: true,
      });
    },
    []
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (!drag.isDragging) return;
    setDrag((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
  }, [drag.isDragging]);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!drag.isDragging || !drag.draggedId) return;
      // Find element under the drop point (hide the dragged card first)
      if (dragEl.current) dragEl.current.style.pointerEvents = "none";
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (dragEl.current) dragEl.current.style.pointerEvents = "";

      const dropZone = target?.closest("[data-dropzone]") ?? null;
      onDrop(drag.draggedId, dropZone);
      setDrag(INITIAL);
    },
    [drag, onDrop]
  );

  const dragOffset = drag.isDragging
    ? { x: drag.x - drag.originX, y: drag.y - drag.originY }
    : { x: 0, y: 0 };

  return { drag, dragOffset, onPointerDown, onPointerMove, onPointerUp };
}
