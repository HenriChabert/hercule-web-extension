import { create } from "zustand";

export interface Button {
  id: string;
  label: string;
  size: "small" | "medium" | "large";
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "in-content";
  parentCssSelector?: string;
  customCss?: string;
}

interface ButtonsStore {
  buttons: Button[];
  addButton: (button: Button) => void;
}

const fakeButtons: Button[] = [
  {
    id: "button-1",
    label: "Button 1",
    size: "medium",
    variant: "primary",
    position: "in-content",
    parentCssSelector: ".w3-clear.w3-center.nextprev",
  },
];

export const useButtonsStore = create<ButtonsStore>((set) => ({
  buttons: fakeButtons,
  addButton: (button) =>
    set((state) => ({
      buttons: [...state.buttons, button],
    })),
}));
