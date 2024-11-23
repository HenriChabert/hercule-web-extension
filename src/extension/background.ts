import browser from "webextension-polyfill";
import HerculeApi from "../services/hercule-server/hercule-api";
import { Trigger, TriggerEventResponseItem } from "../services/hercule-server/hercule-api.types";
import { StorageHelper } from "../helpers/storage.helper";
import {
  Message,
  MessageResponse,
  ErrorMessageResponse,
  ConnectStatusMessageResponse,
  ConnectConfig,
  TriggerEventMessage,
  TriggerEventMessageResponse,
} from "../types/messages.type";
import { ConnectMessage, ConnectMessageResponse } from "../types/messages.type";
import { DisconnectMessageResponse } from "../types/messages.type";
import { ListTriggersMessageResponse } from "../types/messages.type";
import { handleActions } from "../services/actions-handler";
import { Action } from "@/types/actions.type";

const storageHelper = new StorageHelper({ storageType: "local" });

let cachedHerculeApi: HerculeApi | null = null;

const herculeApiFromStorage = async () => {
  if (cachedHerculeApi) {
    return cachedHerculeApi;
  }

  const herculeApi = new HerculeApi();

  const serverUrl = await storageHelper.getData<string>("serverUrl");
  const secretKey = await storageHelper.getData<string>("secretKey");

  if (serverUrl && secretKey) {
    try {
      await herculeApi.connect({ serverUrl: serverUrl, secretKey: secretKey });
    } catch (error) {
      console.error("Error initializing Hercule API:", error);
    }
  }

  cachedHerculeApi = herculeApi;
  return herculeApi;
};

const registerEvents = async () => {
  browser.runtime.onMessage.addListener(onMessage);
  browser.tabs.onUpdated.addListener(onTabUpdated);
};

const findActions = (triggerEventResponse: TriggerEventResponseItem[]): Action[] => {
  const actions: Action[] = [];
  for (const triggerEventResponseItem of triggerEventResponse) {
    const triggerEventActions = triggerEventResponseItem.actions;
    if (triggerEventActions) {
      actions.push(...triggerEventActions);
    }
  }
  return actions;
};

const getCurrentUrl = async (tabId: number): Promise<string> => {
  const tab = await browser.tabs.get(tabId);
  return tab.url || "";
};

const onTabUpdated = async (tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
  const herculeApi = await herculeApiFromStorage();

  if (changeInfo.status !== "complete") {
    return;
  }

  console.log("onTabUpdated", changeInfo);
  const currentUrl = await getCurrentUrl(tabId);

  const response = await herculeApi.triggerEvent({
    event: "page_opened",
    context: { url: currentUrl },
  });

  if (response.payload) {
    handleActions(findActions(response.payload));
  }

  return { success: response.success };
};

const onTriggerEventMessage = async (message: TriggerEventMessage): Promise<TriggerEventMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();
  const event = message.payload.event;
  const response = await herculeApi.triggerEvent({
    event: event.id,
    context: event.context,
  });

  if (!response.payload) {
    return { success: response.success };
  }

  const actions: Action[] = [];
  for (const triggerEventResponse of response.payload) {
    const triggerEventActions = triggerEventResponse.actions;
    if (triggerEventActions) {
      actions.push(...triggerEventActions);
    }
  }

  handleActions(actions);

  return {
    success: response.success,
    payload: {
      response: response.payload,
    },
  };
};

// browser.tabs.onUpdated.addListener(onPageLoad);

const onConnectStatusMessage = async (): Promise<ConnectStatusMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();

  const isConnected = await herculeApi.isConnected();
  const connectStatus = isConnected ? "connected" : "disconnected";
  const connectConfig: ConnectConfig = {
    serverUrl: herculeApi.serverUrl,
  };
  return {
    success: true,
    payload: { status: connectStatus, connectConfig: connectConfig },
  };
};

const onConnectMessage = async (message: ConnectMessage): Promise<ConnectMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();

  try {
    if (
      !herculeApi.validateCredentials({
        serverUrl: message.payload.serverUrl,
        secretKey: message.payload.secretKey,
      })
    ) {
      return { success: false, payload: { message: "Invalid credentials" } };
    }

    await herculeApi.connect({
      serverUrl: message.payload.serverUrl,
      secretKey: message.payload.secretKey,
    });

    storageHelper.setData("serverUrl", message.payload.serverUrl);
    storageHelper.setData("secretKey", message.payload.secretKey);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error logging in:", error);
    return { success: false, payload: { message: (error as Error).message } };
  }
};

const onDisconnectMessage = async (): Promise<DisconnectMessageResponse> => {
  try {
    storageHelper.eraseData("serverUrl");
    storageHelper.eraseData("secretKey");

    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
};

const onListTriggersMessage = async (): Promise<ListTriggersMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();
  let triggers: Trigger[];
  try {
    triggers = await herculeApi.listTriggers({
      event: "button_clicked",
    });
  } catch (error: unknown) {
    console.error("Error listing triggers:", error);
    return { success: false, payload: { message: (error as Error).message } };
  }

  return {
    success: true,
    payload: {
      triggers: triggers.map((trigger) => {
        return {
          id: trigger.id,
          name: trigger.name,
          source: trigger.source,
          urlRegex: trigger.url_regex,
        };
      }),
    },
  };
};

const onFallbackMessage = async (): Promise<ErrorMessageResponse> => {
  return { success: false, payload: { message: "Invalid message type" } };
};

const onMessage = async (message: unknown): Promise<MessageResponse> => {
  const messageWithType = message as Message;

  console.debug("📨 Received message:", messageWithType);

  switch (messageWithType.type) {
    case "CONNECT":
      return onConnectMessage(messageWithType as ConnectMessage);
    case "DISCONNECT":
      return onDisconnectMessage();
    case "CONNECT_STATUS":
      return onConnectStatusMessage();
    case "LIST_TRIGGERS":
      return onListTriggersMessage();
    case "TRIGGER_EVENT":
      return onTriggerEventMessage(messageWithType as TriggerEventMessage);
    default:
      return onFallbackMessage();
  }
};

registerEvents();
