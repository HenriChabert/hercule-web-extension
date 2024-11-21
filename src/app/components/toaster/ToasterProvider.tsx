import * as ToastPrimitive from "@radix-ui/react-toast";
import { useState } from "react";
import Toast from "@/app/components/toaster/Toast";
import ToasterViewport from "@/app/components/toaster/ToasterViewport";
import ToasterContext from "@/app/components/toaster/ToasterContext";

export const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toastProps, setToastProps] = useState<{
    title?: string;
    description?: string;
    variation?: "success" | "error" | "warning" | "info";
  }>({});

  const showToast = (props: {
    title?: string;
    description?: string;
    variation?: "success" | "error" | "warning" | "info";
  }) => {
    setToastProps(props);
    setOpen(true);
  };

  return (
    <ToasterContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider>
        {children}
        <Toast open={open} onOpenChange={setOpen} {...toastProps} />
        <ToasterViewport />
      </ToastPrimitive.Provider>
    </ToasterContext.Provider>
  );
};
