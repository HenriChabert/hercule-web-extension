import { Message, InsertButtonMessage } from "@/types/messages.type";
import { useButtonsStore } from "../stores/button-store";

const handleInsertButton = async (message: InsertButtonMessage) => {
  // Add button to store
  useButtonsStore.getState().addButton({
    id: message.payload.button.id || "",
    label: message.payload.button.label || "Click me",
    size: message.payload.button.size || "medium",
    variant: message.payload.button.variant || "primary",
    position: message.payload.button.position || "top-left",
    anchorCssSelector: message.payload.button.anchorCssSelector,
    positionToAnchor: message.payload.button.positionToAnchor || "first-child",
    nthChildIndex: message.payload.button.nthChildIndex || 0,
    applyOnAllCssSelectorMatches: message.payload.button.applyOnAllCssSelectorMatches || true,
    customCss: message.payload.button.customCss,
    anchorCustomCss: message.payload.button.anchorCustomCss,
    customHtml: message.payload.button.customHtml,
    buttonAction: message.payload.buttonAction,
    triggerId: message.payload.triggerId,
  });
};

export const handleMessage = async (message: Message) => {
  switch (message.type) {
    case "INSERT_BUTTON":
      return handleInsertButton(message as InsertButtonMessage);
  }
};
