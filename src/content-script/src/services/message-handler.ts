import { Message, InsertButtonMessage } from "@/types/messages.type";
import { useButtonsStore } from "../stores/button-store";

const handleInsertButton = async (message: InsertButtonMessage) => {
  // Add button to store
  useButtonsStore.getState().addButton({
    id: message.payload.button.id,
    label: message.payload.button.label || "Click me",
    size: message.payload.button.size || "medium",
    variant: message.payload.button.variant || "primary",
    position: message.payload.button.position || "top-left",
  });
};

export const handleMessage = async (message: Message) => {
  switch (message.type) {
    case "INSERT_BUTTON":
      return handleInsertButton(message as InsertButtonMessage);
  }
};
