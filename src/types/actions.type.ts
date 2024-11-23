export type ActionType = "show_alert" | "show_console";

export interface ActionBase {
  type: ActionType;
  params: {
    message?: string;
  };
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

export type Action = ShowAlertAction | ShowConsoleAction;
