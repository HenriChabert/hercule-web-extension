export interface Message {
  type: string;
  payload: any;
}

export interface MessageResponse {
  success: boolean;
  payload?: any;
}

export interface SuccessMessageResponse extends MessageResponse {
  success: true;
}

export interface ErrorMessageResponse extends MessageResponse {
  success: false;
  payload: {
    message: string;
  };
}

// Connect

export interface ConnectMessage extends Message {
  type: "CONNECT";
  payload: {
    serverUrl: string;
    secretKey: string;
  };
}

export interface ConnectMessageResponse extends MessageResponse {
  success: boolean;
}

// Disconnect

export interface DisconnectMessage extends Message {
  type: "DISCONNECT";
}

export interface DisconnectMessageResponse extends MessageResponse {
  success: boolean;
}
// Connect Status

export type ConnectStatus = "loading" | "connected" | "disconnected";

export interface ConnectConfig {
  serverUrl: string | null;
}

export interface ConnectStatusMessage extends Message {
  type: "CONNECT_STATUS";
}

export interface ConnectStatusMessageResponse extends MessageResponse {
  success: boolean;
  payload: {
    status: ConnectStatus;
    connectConfig: ConnectConfig | null;
  };
}

// List Triggers

export interface Trigger {
  id: string;
  name: string;
  source: "n8n" | "zapier" | "make" | "webflow";
  urlRegex: string | null;
}

export interface ListTriggersMessage extends Message {
  type: "LIST_TRIGGERS";
  payload: {
    search: string;
  };
}

export interface ListTriggersMessageResponseSuccess
  extends SuccessMessageResponse {
  success: true;
  payload: {
    triggers: Trigger[];
  };
}

export type ListTriggersMessageResponse =
  | ListTriggersMessageResponseSuccess
  | ErrorMessageResponse;

// Run Trigger

export interface BrowserContext {
  url: string;
}

export interface RunTriggerMessage extends Message {
  type: "RUN_TRIGGER";
  payload: {
    triggerId: string;
    context: BrowserContext;
  };
}

export interface RunTriggerMessageResponse extends MessageResponse {
  success: boolean;
}
