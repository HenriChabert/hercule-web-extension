import browser from "webextension-polyfill";

export async function getCurrentTabId(): Promise<number> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0].id || 0;
}

export async function getCurrentTabUrl(): Promise<string> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return tabs[0].url || "";
}
