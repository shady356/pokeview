import { useRef, useState, useCallback } from "react";

const DISMISS_THRESHOLD = 120;

export function useBottomSheetDrag(onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const dragging = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    dragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startY.current;
    // Only allow dragging downward
    if (dy > 0) {
      dragging.current = true;
      setIsDragging(true);
      setDragY(dy);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!dragging.current) {
      setIsDragging(false);
      setDragY(0);
      return;
    }
    if (dragY > DISMISS_THRESHOLD) {
      onClose();
    }
    setIsDragging(false);
    setDragY(0);
    dragging.current = false;
  }, [dragY, onClose]);

  const sheetStyle: React.CSSProperties = {
    transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
  };

  const handleProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return { sheetStyle, handleProps, isDragging, dragY };
}
