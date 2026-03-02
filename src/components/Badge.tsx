interface BadgeProps {
  value: number;
  selected?: boolean;
  onClick?: () => void;
}

export function Badge({ value, selected = false, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
        height: 28,
        padding: "0 8px",
        borderRadius: 10,
        background: selected ? "#4361EE" : "#E0E0E4",
        color: selected ? "#fff" : "#2B2D42",
        fontSize: 14,
        fontWeight: 700,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s ease",
        lineHeight: 1,
      }}
    >
      {value}
    </span>
  );
}
