import cn from "classnames";

interface FloatingButtonsBarProps {
  className?: string;
  children: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  axis?: "horizontal" | "vertical";
}

export default function FloatingButtonsBar({
  className = "",
  children,
  axis = "horizontal",
  position = "top-left",
}: FloatingButtonsBarProps) {
  const marginWithBorder = 5;
  const positionClasses = {
    "top-left": `top-${marginWithBorder} left-${marginWithBorder}`,
    "top-right": `top-${marginWithBorder} right-${marginWithBorder}`,
    "bottom-left": `bottom-${marginWithBorder} left-${marginWithBorder}`,
    "bottom-right": `bottom-${marginWithBorder} right-${marginWithBorder}`,
  };

  return (
    <div
      className={cn(
        "fixed flex flex-row gap-2 z-[100000000] items-center",
        className,
        axis === "horizontal" ? "flex-row" : "flex-col",
        positionClasses[position]
      )}
    >
      {children}
    </div>
  );
}
