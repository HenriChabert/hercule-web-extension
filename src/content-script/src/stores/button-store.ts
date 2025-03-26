import { create } from "zustand";

export interface Button {
  id: string;
  label: string;
  size: "small" | "medium" | "large";
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "in-content";
  anchorCssSelector?: string;
  positionToAnchor?: "first-child" | "last-child" | "nth-child" | "before" | "after" | "replace";
  nthChildIndex?: number;
  applyOnAllCssSelectorMatches?: boolean;
  customHtml?: string;
  customCss?: string;
  anchorCustomCss?: string;
  buttonAction?: "run_trigger";
  triggerId?: string;
}

interface ButtonsStore {
  buttons: Button[];
  addButton: (button: Button) => void;
}

const fakeButtons: Button[] = [
  // {
  //   id: "download-music-sheet",
  //   label: "Download Music Sheet",
  //   size: "medium",
  //   variant: "primary",
  //   position: "in-content",
  //   anchorCssSelector: ".add-score-container",
  //   positionToAnchor: "after",
  //   customCss: `
  //     .hercule-in-content-button {
  //       margin-top: 10px;
  //       width: 100%;
  //       background-color: #e82076 !important;
  //       border-color: #e82076 !important;
  //       color: #fff !important;
  //       flex-grow: 1 !important;
  //       font-size: 16px !important;
  //       line-height: 1.3 !important;
  //       border-radius: 25px !important;
  //       border: 2px solid;
  //       padding: 10px;
  //     }
  //     .hercule-in-content-button:hover {
  //       background-color: transparent !important;
  //       color: #e82076 !important;
  //     }
  //   `,
  // },
];

export const useButtonsStore = create<ButtonsStore>((set) => ({
  buttons: fakeButtons,
  addButton: (button) =>
    set((state) => ({
      buttons: [...state.buttons.filter((b) => b.id !== button.id), button],
    })),
}));
