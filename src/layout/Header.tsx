import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
}

const btnStyle: React.CSSProperties = {
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "none",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  color: "#fff",
  flexShrink: 0,
};

export function HeaderButton({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={btnStyle}>
      {children}
    </button>
  );
}

export function Header({ title, left, right }: HeaderProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
    }}>
      <div style={{ width: 48 }}>{left ?? <span />}</div>
      <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{title}</span>
      <div style={{ width: 48 }}>{right ?? <span />}</div>
    </div>
  );
}
