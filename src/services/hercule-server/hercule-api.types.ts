import { Action } from "@/types/actions.type";

export interface HealthResponse {
  status: string;
}

export interface Trigger {
  id: string;
  name: string;
  source: "n8n" | "zapier" | "make" | "webflow";
  url_regex: string | null;
}

export interface TriggerEventResponse {
  success: boolean;
  payload?: TriggerEventResponseItem[];
}

export interface TriggerEventResponseItem {
  status: "success" | "error";
  action?: Action;
}
