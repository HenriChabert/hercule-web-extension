import { Action } from "@/types/actions.type";
import { User } from "@/types/user.type";

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

export interface Token {
  access_token: string;
  token_type: "bearer";
}

export interface LoginResponse {
  user: User;
  token: Token;
  error?: string;
}

export interface MeResponse {
  success: boolean;
  payload: {
    user: User;
  };
}

