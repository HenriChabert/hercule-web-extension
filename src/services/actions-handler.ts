import browser from "webextension-polyfill";
import { ActionType, Action, ShowAlertAction, ShowConsoleAction } from "@/types/actions.type";

export const actionsHandlers: Record<ActionType, (action: Action) => void | Promise<void>> = {
  show_alert: async (action: ShowAlertAction) => {
    const notification = await browser.notifications.create("", {
      type: "basic",
      title: "Hercule",
      message: action.params.message,
      iconUrl: browser.runtime.getURL("hercule-icon.png"),
    });
    console.log("Notification created:", notification);
  },
  show_console: async (action: ShowConsoleAction) => {
    console.log(action.params.message);
  },
};

function handleAction(action: Action): void {
  const handler = actionsHandlers[action.type];
  if (handler) {
    handler(action);
  }
}

export function handleActions(actions: Action[]): void {
  actions.forEach((action) => {
    handleAction(action);
  });
}
