import {type ReactNode } from "react";

const ACTIVE_COLOR = "#4361EE";

interface TabProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tab({ icon, label, active = false, onClick }: TabProps) {
  const color = active ? ACTIVE_COLOR : "#444";
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        height: 64,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        background: "none",
        border: "none",
        cursor: "pointer",
        color,
        transition: "color 0.15s",
        padding: 0,
      }}
    >
      <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </span>
      <span style={{ fontSize: 12, fontWeight: 500, lineHeight: 1 }}>{label}</span>
    </button>
  );
}

export function BottomNav({ children }: { children: ReactNode }) {
  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      background: "#111",
      borderTop: "1px solid #1e1e1e",
    }}>
      {children}
    </nav>
  );
}
