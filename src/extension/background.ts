import browser from "webextension-polyfill";
import HerculeApi from "../services/hercule-server/hercule-api";
import { Trigger } from "../services/hercule-server/hercule-api.types";
import { StorageHelper } from "../helpers/storage.helper";
import {
  Message,
  MessageResponse,
  ErrorMessageResponse,
  ConnectStatusMessageResponse,
  ConnectConfig,
  RunTriggerMessage,
  RunTriggerMessageResponse,
} from "../types/messages.type";
import { ConnectMessage, ConnectMessageResponse } from "../types/messages.type";
import { DisconnectMessageResponse } from "../types/messages.type";
import { ListTriggersMessageResponse } from "../types/messages.type";
const storageHelper = new StorageHelper({ storageType: "local" });

const herculeApiFromStorage = async () => {
  const herculeApi = new HerculeApi();

  const serverUrl = await storageHelper.getData<string>("serverUrl");
  const secretKey = await storageHelper.getData<string>("secretKey");

  if (serverUrl && secretKey) {
    try {
      herculeApi.connect({ serverUrl: serverUrl, secretKey: secretKey });
    } catch (error) {
      console.error("Error initializing Hercule API:", error);
    }
  }
  return herculeApi;
};

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
  } catch (error: any) {
    console.error("Error logging in:", error);
    return { success: false, payload: { message: error.message } };
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
    triggers = await herculeApi.listTriggers();
  } catch (error: any) {
    console.error("Error listing triggers:", error);
    return { success: false, payload: { message: error.message } };
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

const onRunTriggerMessage = async (message: RunTriggerMessage): Promise<RunTriggerMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();
  const response = await herculeApi.runTrigger(message.payload.triggerId, message.payload.context);
  return response;
};

const onFallbackMessage = async (message: Message): Promise<ErrorMessageResponse> => {
  return { success: false, payload: { message: "Invalid message type" } };
};

const onMessage = async (message: unknown, sender: browser.Runtime.MessageSender): Promise<MessageResponse> => {
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
    case "RUN_TRIGGER":
      return onRunTriggerMessage(messageWithType as RunTriggerMessage);
    default:
      return onFallbackMessage(messageWithType);
  }
};

browser.runtime.onMessage.addListener(onMessage);
