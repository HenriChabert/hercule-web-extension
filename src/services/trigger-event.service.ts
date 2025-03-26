import browser from "webextension-polyfill";
import { TriggerEventMessage } from "@/types/messages.type";
import { herculeApiFromStorage } from "@/services/hercule-server/hercule-api";
import { contextExtractors } from "@/services/context-extractor.service";
import { EventId, TriggerEventContext } from "@/types/events.type";
import { handleAction } from "@/services/actions.service";
import { TriggerEventResponse } from "@/services/hercule-server/hercule-api.types";
import { getCurrentTabId } from "@/helpers/background-utils.helper";
import { subscribe } from "@/services/webpush.service";

abstract class TriggerEventService {
  abstract id: EventId;
  abstract register(): void;
  abstract onEventShouldTrigger(...args: unknown[]): Promise<boolean> | boolean;

  async extractContext(tabId: number | null): Promise<Record<string, unknown>> {
    const context: Record<string, unknown> = {};
    for (const extractor of contextExtractors) {
      context[extractor.name] = await extractor.extract(tabId);
    }
    return context;
  }

  async triggerEvent(
    extractContext: Partial<TriggerEventContext> | null = null,
    tabId: number | null = null
  ): Promise<TriggerEventResponse> {
    const herculeApi = await herculeApiFromStorage();

    if (!tabId) {
      tabId = await getCurrentTabId();
    }

    let context = await this.extractContext(tabId);

    if (extractContext) {
      context = { ...context, ...extractContext };
    }

    const subscription = await subscribe();
    console.log("🚀 ~ TriggerEventServic ~ triggerEvent ~ subscription:", {
      subscription,
      context,
      event: this.id,
    });

    const response = await herculeApi.triggerEvent({
      event: this.id,
      context,
      webPushSubscription: subscription,
    });

    if (response.payload && response.success) {
      response.payload.forEach((item) => {
        if (item.action) {
          handleAction(item.action);
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
        console.log({ tabId, changeInfo });
        return (await this.triggerEvent(null, tabId)) as TriggerEventResponse;
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
    const currentTabId = await getCurrentTabId();
    if (changeInfo.status !== "complete" || currentTabId !== _tabId) {
      return false;
    }
    return true;
  }
}

class OnButtonClickedTriggerEventService extends MessageTriggerEventService {
  id = "button_clicked" as EventId;
}

class OnManualTriggerInPopupTriggerEventService extends MessageTriggerEventService {
  id = "manual_trigger_in_popup" as EventId;

  async onEventShouldTrigger(message: TriggerEventMessage): Promise<boolean> {
    return message.payload.event.id === this.id;
  }
}

export const triggerEventServices: TriggerEventService[] = [
  new OnPageLoadedTriggerEventService(),
  new OnButtonClickedTriggerEventService(),
  new OnManualTriggerInPopupTriggerEventService(),
];
