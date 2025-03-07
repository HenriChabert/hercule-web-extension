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

export interface InsertButtonAction extends ActionBase {
  params: {
    button_label: string;
    button_variant: "primary" | "secondary" | "success" | "warning" | "danger";
    button_size: "small" | "medium" | "large";
    button_position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "in-content";
    button_parent_css_selector?: string;
    button_action: "launch_trigger";
    trigger_id?: string;
  };
}

export type Action = ShowAlertAction | ShowConsoleAction | InjectScriptAction | InsertButtonAction;
