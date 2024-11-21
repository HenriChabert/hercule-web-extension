import { useContext } from "react";
import ToastContext from "@/app/components/toaster/ToasterContext";

export const useToaster = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
