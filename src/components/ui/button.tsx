import { Trash2 } from "lucide-react";

export default function Button({
  Icon,
  text,
  color = "blue",
  onClick,
}: {
  Icon: React.ForwardRefExoticComponent<any>;
  text: string;
  color?: "blue" | "red" | "green";
  onClick?: () => void;
}) {
  // Map color to Tailwind class
  const colorClass =
    color === "red"
      ? "bg-red-500 hover:bg-red-600"
      : color === "green"
      ? "bg-green-500 hover:bg-green-600"
      : "bg-blue-500 hover:bg-blue-600";
  return (
    <button
      onClick={onClick}
      className={`flex border w-full items-center justify-center gap-2 text-lg p-1 ${colorClass} text-white hover:cursor-pointer rounded-md hover:scale-[101%] active:scale-100 transition-transform`}
    >
      <Icon />
      <p>{text}</p>
    </button>
  );
}
