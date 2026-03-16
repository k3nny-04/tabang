import { useRef, useState } from "react";

const CLOSE_THRESHOLD = 120;

const BottomSheet = ({ open, onClose, title, children, height=70 }) => {
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (!dragging) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) onClose();
    setDragY(0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-60 flex flex-col rounded-t-2xl bg-surface shadow-xl transition-transform duration-300"
        style={{
          height: `${height}%`,
          transform: open
            ? dragging
              ? `translateY(${dragY}px)`
              : "translateY(0)"
            : "translateY(100%)",
          transition: dragging ? "none" : undefined,
        }}
      >
        {/* Handle */}
        <div
          className="flex justify-center pt-3 pb-2"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-1.5 w-10 rounded-full bg-border-medium" />
        </div>

        {/* Header */}
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;