import browser from "webextension-polyfill";
import { ActionType, Action, ShowAlertAction, ShowConsoleAction, InjectScriptAction } from "@/types/actions.type";
import { getCurrentTabId } from "@/helpers/background-utils.helper";

export const actionsHandlers: Record<ActionType, (action: Action) => void | Promise<void>> = {
  show_alert: async (action) => {
    action = action as ShowAlertAction;

    const notification = await browser.notifications.create("", {
      type: "basic",
      title: "Hercule",
      message: action.params.message,
      iconUrl: browser.runtime.getURL("hercule-icon.png"),
    });
    console.log("Notification created:", notification);
  },
  show_console: async (action) => {
    action = action as ShowConsoleAction;

    console.log(action.params.message);
  },
  inject_script: async (action) => {
    /*
    // WARNING: This action is unsafe as it allows arbitrary JavaScript execution.
    // It is currently only used for testing purposes and should be removed or secured before production use.
    */
    action = action as InjectScriptAction;

    const tabId = await getCurrentTabId();

    browser.scripting.executeScript({
      target: { tabId: tabId },
      func: (action: InjectScriptAction) => {
        const el = document.createElement("script");
        el.textContent = action.params.script;
        document.documentElement.appendChild(el);
        el.remove();
      },
      args: [action],
      world: "MAIN",
    });
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
