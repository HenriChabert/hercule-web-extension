import { Action } from "./actions.type";

export interface TriggerEventContext {
  triggerId?: string;
  url?: string;
}

export interface TriggerEvent {
  id: "button_clicked" | "page_opened";
  context: TriggerEventContext;
}

export interface TriggerEventResponse {
  actions?: Action[];
}

export interface ButtonClickedEvent extends TriggerEvent {
  id: "button_clicked";
  context: Required<TriggerEventContext>;
}

export interface PageOpenedEvent extends TriggerEvent {
  id: "page_opened";
  context: Pick<TriggerEventContext, "url">;
}
