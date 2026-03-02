import "./Tag.css";

interface TagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Tag({ label, selected = false, onClick }: TagProps) {
  return (
    <button
      onClick={onClick}
      className={`tag${selected ? " tag--selected" : ""}`}
    >
      {label}
    </button>
  );
}
