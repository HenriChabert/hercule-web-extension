import * as ToastPrimitive from "@radix-ui/react-toast";
import { useState } from "react";

interface ToastProps extends ToastPrimitive.ToastProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  variation?: "success" | "error" | "warning" | "info";
}

const variations = {
  success: "bg-green-200 text-green-900",
  error: "bg-red-200 text-red-900",
  warning: "bg-yellow-200 text-yellow-900",
  info: "bg-blue-200 text-blue-900",
};

const Toast = ({ title, description, children, variation = "info", open, onOpenChange, ...props }: ToastProps) => {
  return (
    <ToastPrimitive.Root
      {...props}
      open={open}
      onOpenChange={onOpenChange}
      className={`${variations[variation]} shadow-lg p-3 rounded-lg items-center data-[state=open]:animate-slideUpAndFade data-[state=closed]:animate-slideDownAndFade`}
      onClick={() => {
        onOpenChange?.(false);
      }}
    >
      {title && <ToastPrimitive.Title>{title}</ToastPrimitive.Title>}
      {description && <ToastPrimitive.Description>{description}</ToastPrimitive.Description>}
      {children && (
        <ToastPrimitive.Action altText="" asChild>
          {children}
        </ToastPrimitive.Action>
      )}
    </ToastPrimitive.Root>
  );
};

export default Toast;
