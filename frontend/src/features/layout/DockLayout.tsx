import React, { useEffect, useRef, useState } from "react";
import "./dock.css";

interface DockLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  onLeftWidthChange?: (width: number) => void;
  onRightWidthChange?: (width: number) => void;
}

export function DockLayout({
  left,
  center,
  right,
  onLeftWidthChange,
  onRightWidthChange,
}: DockLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(250);
  const [rightWidth, setRightWidth] = useState(300);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftResizeRef = useRef<HTMLDivElement>(null);
  const rightResizeRef = useRef<HTMLDivElement>(null);
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dockLayout");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setLeftWidth(state.leftWidth ?? 250);
        setRightWidth(state.rightWidth ?? 300);
        setLeftCollapsed(state.leftCollapsed ?? false);
        setRightCollapsed(state.rightCollapsed ?? false);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "dockLayout",
      JSON.stringify({
        leftWidth,
        rightWidth,
        leftCollapsed,
        rightCollapsed,
      })
    );
    onLeftWidthChange?.(leftWidth);
    onRightWidthChange?.(rightWidth);
  }, [leftWidth, rightWidth, leftCollapsed, rightCollapsed, onLeftWidthChange, onRightWidthChange]);

  // Handle left resize
  useEffect(() => {
    if (!draggingLeft) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const minWidth = 100;
      const maxWidth = rect.width * 0.4;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => setDraggingLeft(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingLeft]);

  // Handle right resize
  useEffect(() => {
    if (!draggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = rect.right - e.clientX;
      const minWidth = 100;
      const maxWidth = rect.width * 0.4;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightWidth(newWidth);
      }
    };

    const handleMouseUp = () => setDraggingRight(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingRight]);

  const effectiveLeftWidth = leftCollapsed ? 32 : leftWidth;
  const effectiveRightWidth = rightCollapsed ? 32 : rightWidth;

  return (
    <div
      ref={containerRef}
      className="dock-layout"
      style={
        {
          "--left-width": `${effectiveLeftWidth}px`,
          "--right-width": `${effectiveRightWidth}px`,
        } as React.CSSProperties
      }
    >
      {/* Left Sidebar */}
      <div className={`dock-panel dock-left ${leftCollapsed ? "collapsed" : ""}`}>
        <div className="panel-inner">
          {left}
        </div>
        <button
          className="sidebar-collapse-btn left"
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          title={leftCollapsed ? "Expand" : "Collapse"}
        >
          {leftCollapsed ? "▶" : "◀"}
        </button>
      </div>

      {/* Left Resize Handle */}
      <div
        ref={leftResizeRef}
        className="resize-handle resize-handle-left"
        onMouseDown={() => setDraggingLeft(true)}
      />

      {/* Center */}
      <div className="dock-center">{center}</div>

      {/* Right Resize Handle */}
      <div
        ref={rightResizeRef}
        className="resize-handle resize-handle-right"
        onMouseDown={() => setDraggingRight(true)}
      />

      {/* Right Sidebar */}
      <div className={`dock-panel dock-right ${rightCollapsed ? "collapsed" : ""}`}>
        <div className="panel-inner">
          {right}
        </div>
        <button
          className="sidebar-collapse-btn right"
          onClick={() => setRightCollapsed(!rightCollapsed)}
          title={rightCollapsed ? "Expand" : "Collapse"}
        >
          {rightCollapsed ? "◀" : "▶"}
        </button>
      </div>
    </div>
  );
}
