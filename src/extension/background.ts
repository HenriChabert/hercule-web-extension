import browser from "webextension-polyfill";
import { Trigger } from "../services/hercule-server/hercule-api.types";
import {
  Message,
  MessageResponse,
  ErrorMessageResponse,
  TriggerEventMessage,
  TriggerEventMessageResponse,
  LoginMessage,
} from "../types/messages.type";
import { ConnectMessage } from "../types/messages.type";
import { ListTriggersMessageResponse } from "../types/messages.type";
import { triggerEventServices } from "@/services/trigger-event.service";
import { herculeApiFromStorage } from "@/services/hercule-server/hercule-api";
import { onConnectStatusMessage, onConnectMessage, onDisconnectMessage, onLoginMessage } from "@/services/auth.service";
import { MessageTriggerEventService } from "@/services/trigger-event.service";
import { getCurrentTabUrl } from "@/helpers/background-utils.helper";

self.addEventListener("activate", () => {
  registerEvents();
});

const registerEvents = async () => {
  browser.runtime.onMessage.addListener(onMessage);
  triggerEventServices.forEach((service) => service.register());
};

const onTriggerEventMessage = async (message: TriggerEventMessage): Promise<TriggerEventMessageResponse> => {
  const eventId = message.payload.event.id;
  const service = MessageTriggerEventService.servicesMap[eventId];

  if (service) {
    const shouldTrigger = await service.onEventShouldTrigger(message);
    if (shouldTrigger) {
      const response = await service.triggerEvent(message.payload.event.context);
      return { success: response.success, payload: { response: response.payload } };
    }
  }

  return { success: false };
};

const onListTriggersMessage = async (): Promise<ListTriggersMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();
  let triggers: Trigger[];
  try {
    const url = await getCurrentTabUrl();
    triggers = await herculeApi.listTriggers({
      event: "button_clicked",
      url,
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
    case "LOGIN":
      return onLoginMessage(messageWithType as LoginMessage);
    default:
      return onFallbackMessage();
  }
};
