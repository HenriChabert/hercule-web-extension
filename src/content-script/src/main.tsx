import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import browser from "webextension-polyfill";
import { handleMessage } from "./services/message-handler";
import { Message } from "@/types/messages.type";
import { APP_SLUG } from "@/config/constants";
import { attachCSS } from "./helpers/twind";

async function createAppRoot() {
  // Create container div
  const app = document.createElement("div");

  app.id = `${APP_SLUG}-shadow-host`;

  // Create shadow root
  const shadowRoot = app.attachShadow({ mode: "open" });

  attachCSS(shadowRoot);
  // Create container for React app inside shadow root
  const container = document.createElement("div");
  container.id = `${APP_SLUG}-root`;
  shadowRoot.appendChild(container);

  // Add app div to document
  document.body.prepend(app);

  const root = createRoot(container);

  return { root, app };
}

browser.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  console.log({ message });
  handleMessage(message as Message).then((response) => {
    sendResponse(response);
  });
  return true;
});

createAppRoot().then(({ root }) => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
