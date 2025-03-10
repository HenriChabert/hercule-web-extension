import React from "react";
import { WorkflowIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  label: string;
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  size: "small" | "medium" | "large";
  onClick?: () => void;
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  size = "medium",
  className = "",
  onClick,
  loading = false,
}) => {
  const sizeClasses = {
    small: "h-8 w-8 text-sm",
    medium: "h-10 w-10 text-base",
    large: "h-12 w-12 text-lg",
  };

  const variantClasses = {
    primary: "bg-blue-500/70 text-white hover:bg-blue-600",
    secondary: "bg-gray-500/70 text-white hover:bg-gray-600",
    success: "bg-green-500/70 text-white hover:bg-green-600",
    warning: "bg-yellow-500/70 text-black hover:bg-yellow-600",
    danger: "bg-red-500/70 text-white hover:bg-red-600",
  };

  const buttonClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-full
    font-bold
    transition-all
    duration-300
    z-50
    cursor-pointer
    flex
    items-center
    justify-center
    hover:w-auto
    hover:px-4
    hover:opacity-100
    group
    overflow-hidden
    whitespace-nowrap
  `
    .trim()
    .replace(/\s+/g, " ");

  const ButtonIcon = loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <WorkflowIcon className="h-5 w-5" />;
  const buttonLabel = loading ? "Loading..." : label;

  return (
    <button className={`${buttonClasses} ${className}`} onClick={onClick} disabled={loading}>
      <>
        {ButtonIcon}
        <span className="max-w-0 group-hover:max-w-[200px] group-hover:ml-2  overflow-hidden">{buttonLabel}</span>
      </>
    </button>
  );
};

export default Button;
