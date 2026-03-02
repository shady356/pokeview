import { type ReactNode } from "react";
import "./BottomNav.css";

interface TabProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Tab({ icon, label, active = false, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`bottom-nav__tab${active ? " bottom-nav__tab--active" : ""}`}
    >
      <span className="bottom-nav__tab-icon">{icon}</span>
      <span className="bottom-nav__tab-label">{label}</span>
    </button>
  );
}

export function BottomNav({ children }: { children: ReactNode }) {
  return (
    <nav className="bottom-nav">
      {children}
    </nav>
  );
}
