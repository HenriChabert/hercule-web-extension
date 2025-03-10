import { create } from "zustand";

export interface Button {
  id: string;
  label: string;
  size: "small" | "medium" | "large";
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "in-content";
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
    position: "top-left",
  },
  {
    id: "button-2",
    label: "Button 1 bis",
    size: "small",
    variant: "danger",
    position: "top-left",
  },
  {
    id: "button-3",
    label: "Button 2",
    size: "large",
    variant: "secondary",
    position: "top-right",
  },
  {
    id: "button-4",
    label: "Button 3",
    size: "small",
    variant: "success",
    position: "bottom-left",
  },
];

export const useButtonsStore = create<ButtonsStore>((set) => ({
  buttons: [],
  addButton: (button) =>
    set((state) => ({
      buttons: [...state.buttons, button],
    })),
}));
