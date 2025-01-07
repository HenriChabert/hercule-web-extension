/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { herculeApiFromStorage } from "./hercule-server/hercule-api";
import { handleActions } from "@/services/actions.service";

export async function subscribe() {
  const herculeApi = await herculeApiFromStorage();
  const publicKey = await herculeApi.getServerPublicKey();
  const applicationServerKey = urlB64ToUint8Array(publicKey);

  let subscriptionData: PushSubscription | undefined;

  try {
    const registration = self.registration;
    subscriptionData = await registration.pushManager.subscribe({
      userVisibleOnly: false,
      applicationServerKey: applicationServerKey,
    });
    console.log("[Service Worker] Extension is subscribed to push server.");
    logSubscriptionDataToConsole(subscriptionData);
  } catch (error) {
    console.error("[Service Worker] Failed to subscribe, error: ", error);
  }

  return subscriptionData;
}

function logSubscriptionDataToConsole(subscription: PushSubscription) {
  console.log("[Service Worker] Subscription data to be pasted in the test push" + "notification server: ");
  console.log(JSON.stringify(subscription));
}

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");
  console.log(`[Service Worker] Push had this data/text: "${event.data?.text()}"`);

  const data = JSON.parse(event.data?.text() || "{}");

  if (data.actions) {
    handleActions(data.actions);
  }
});

function urlB64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
