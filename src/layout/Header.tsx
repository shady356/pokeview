import { type ReactNode } from "react";
import "./Header.css";

interface HeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}

export function HeaderButton({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="header__btn">
      {children}
    </button>
  );
}

export function Header({ title, left, right }: HeaderProps) {
  return (
    <div className="header">
      <div className="header__slot">{left ?? <span />}</div>
      <span className="header__title">{title}</span>
      <div className="header__slot">{right ?? <span />}</div>
    </div>
  );
}
