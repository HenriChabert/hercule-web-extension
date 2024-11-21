import { createContext } from "react";

export interface ToasterContextType {
  showToast: (props: {
    title?: string;
    description?: string;
    variation?: "success" | "error" | "warning" | "info";
  }) => void;
}

export default createContext<ToasterContextType | undefined>(undefined);
