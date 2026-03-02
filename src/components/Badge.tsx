import "./Badge.css";

interface BadgeProps {
  value: number;
  selected?: boolean;
  onClick?: () => void;
}

export function Badge({ value, selected = false, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={`badge${selected ? " badge--selected" : ""}${onClick ? " badge--clickable" : ""}`}
    >
      {value}
    </span>
  );
}
