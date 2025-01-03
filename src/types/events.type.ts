import { Action } from "./actions.type";

export type EventId = "button_clicked" | "page_opened";

export interface TriggerEventContext {
  triggerId?: string;
  url?: string;
  html_content?: string;
}

export interface TriggerEvent {
  id: EventId;
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
