import { useRef, useState } from "react";
import ReportForm from "./ReportForm";

const CLOSE_THRESHOLD = 120;

const ReportDialog = ({ open, onClose }) => {
  const startY = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    if (!dragging) return;

    const currentY = e.touches[0].clientY;
    const delta = currentY - startY.current;

    if (delta > 0) {
      setDragY(delta);
    }
  };

  const onTouchEnd = () => {
    setDragging(false);

    if (dragY > CLOSE_THRESHOLD) {
      onClose();
    }

    setDragY(0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-60 flex h-[75%] flex-col rounded-t-2xl bg-surface shadow-elevated transition-transform duration-300 ease-out`}
        style={{
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
          className="flex shrink-0 cursor-grab justify-center pt-3 pb-2 active:cursor-grabbing"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="h-1.5 w-10 rounded-full bg-border-medium" />
        </div>

        {/* Header */}
        <div className="shrink-0 px-4 py-2">
          <h2 className="text-lg font-semibold text-text-primary">
            Create Report
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-4 text-text-primary">
          <ReportForm />
        </div>
      </div>
    </>
  );
};

export default ReportDialog;