export type ActionType = "show_alert" | "show_console" | "inject_script" | "insert_button";

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

export interface ButtonParams {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "success" | "warning" | "danger";
  size: "small" | "medium" | "large";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "in-content";
  parentCssSelector?: string;
  customCss?: string;
}

export interface InsertButtonAction extends ActionBase {
  params: {
    button: ButtonParams;
  };
}

export type Action = ShowAlertAction | ShowConsoleAction | InjectScriptAction | InsertButtonAction;
