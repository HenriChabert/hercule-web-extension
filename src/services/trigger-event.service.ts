import browser from "webextension-polyfill";
import { TriggerEventMessage } from "@/types/messages.type";
import { herculeApiFromStorage } from "@/services/hercule-server/hercule-api";
import { contextExtractors } from "@/services/context-extractor.service";
import { EventId, TriggerEventContext } from "@/types/events.type";
import { handleActions } from "../services/actions.service";
import { TriggerEventResponse } from "./hercule-server/hercule-api.types";
import { subscribe } from "./webpush.service";

abstract class TriggerEventService {
  abstract id: EventId;
  abstract register(): void;
  abstract onEventShouldTrigger(...args: unknown[]): Promise<boolean> | boolean;

  async getCurrentTabId(): Promise<number> {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id || 0;
  }

  async extractContext(tabId: number): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};
    for (const extractor of contextExtractors) {
      context[extractor.name] = await extractor.extract(tabId);
    }
    return context;
  }

  async triggerEvent(extractContext: Partial<TriggerEventContext> | null = null): Promise<TriggerEventResponse> {
    const herculeApi = await herculeApiFromStorage();
    const tabId = await this.getCurrentTabId();
    let context = await this.extractContext(tabId);

    if (extractContext) {
      context = { ...context, ...extractContext };
    }

    const subscription = await subscribe();
    console.log("🚀 ~ TriggerEventService ~ triggerEvent ~ subscription:", subscription);

    const response = await herculeApi.triggerEvent({
      event: this.id,
      context,
      webPushSubscription: subscription,
    });

    if (response.payload && response.success) {
      response.payload.forEach((item) => {
        if (item.actions) {
          handleActions(item.actions);
        }
      });
    }

    return response;
  }
}

export abstract class MessageTriggerEventService extends TriggerEventService {
  static servicesMap: Record<string, MessageTriggerEventService> = {};

  async register(): Promise<void> {
    MessageTriggerEventService.servicesMap[this.id] = this;
  }

  async onEventShouldTrigger(message: TriggerEventMessage): Promise<boolean> {
    return message.payload.event.id === this.id;
  }
}

abstract class TabUpdatedTriggerEventService extends TriggerEventService {
  static registered = false;

  async register(): Promise<void> {
    if (TabUpdatedTriggerEventService.registered) {
      return;
    }

    const handler = async (tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType) => {
      if (await this.onEventShouldTrigger(tabId, changeInfo)) {
        return (await this.triggerEvent()) as TriggerEventResponse;
      }
    };

    browser.tabs.onUpdated.addListener(handler);
    TabUpdatedTriggerEventService.registered = true;
  }

  abstract onEventShouldTrigger(
    tabId: number,
    changeInfo: browser.Tabs.OnUpdatedChangeInfoType
  ): Promise<boolean> | boolean;
}

class OnPageLoadedTriggerEventService extends TabUpdatedTriggerEventService {
  id = "page_opened" as EventId;

  async onEventShouldTrigger(_tabId: number, changeInfo: browser.Tabs.OnUpdatedChangeInfoType): Promise<boolean> {
    if (changeInfo.status !== "complete") {
      return false;
    }
    return true;
  }
}

class OnButtonClickedTriggerEventService extends MessageTriggerEventService {
  id = "button_clicked" as EventId;
}

export const triggerEventServices: TriggerEventService[] = [
  new OnPageLoadedTriggerEventService(),
  new OnButtonClickedTriggerEventService(),
];
