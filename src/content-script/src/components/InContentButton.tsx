import { APP_SLUG } from "@/config/constants";
import cn from "classnames";
import { useEffect } from "react";

interface InContentButtonProps {
  label: string;
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  size: "small" | "medium" | "large";
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  customHtml?: string;
  customCss?: string;
}

export default function InContentButton({
  label,
  variant = "primary",
  size = "medium",
  onClick,
  className = "",
  loading = false,
  customCss = "",
  customHtml = "",
}: InContentButtonProps) {
  useEffect(() => {
    const newStyle = document.createElement("style");
    newStyle.innerHTML = customCss;
    document.head.appendChild(newStyle);

    return () => {
      document.head.removeChild(newStyle);
    };
  }, [customCss]);

  const sizeClasses = {
    small: "px-2 py-1 text-sm",
    medium: "px-4 py-2",
    large: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    success: "bg-green-500 hover:bg-green-600 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  const customHTMLContent = customHtml ? (
    <div onClick={onClick} className={cn(className)} dangerouslySetInnerHTML={{ __html: customHtml }} />
  ) : null;

  if (customHTMLContent) {
    return customHTMLContent;
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "rounded font-medium transition-colors duration-200",
        sizeClasses[size],
        variantClasses[variant],
        loading && "opacity-50 cursor-not-allowed",
        className,
        `${APP_SLUG}-in-content-button`
      )}
    >
      {loading ? "Loading..." : label}
    </button>
  );
}
