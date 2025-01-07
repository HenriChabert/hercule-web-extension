export type ActionType = "show_alert" | "show_console" | "inject_script";

export interface ActionBase {
  type: ActionType;
  params: Record<string, unknown>;
}

export interface ShowAlertAction extends ActionBase {
  params: {
    message: string;
  };
}

export interface ShowConsoleAction extends ActionBase {
  params: {
    message: string;
  };
}

export interface InjectScriptAction extends ActionBase {
  params: {
    script: string;
    mainIframeOnly: boolean;
  };
}

export type Action = ShowAlertAction | ShowConsoleAction | InjectScriptAction;
