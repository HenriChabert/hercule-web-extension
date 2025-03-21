import { ConnectMessageResponse, ConnectStatus, DisconnectMessageResponse, LoginMessage, LoginMessageResponse } from "@/types/messages.type";
import { ConnectMessage } from "@/types/messages.type";
import { ConnectConfig } from "@/types/messages.type";
import { ConnectStatusMessageResponse } from "@/types/messages.type";
import { herculeApiFromStorage } from "./hercule-server/hercule-api";
import { StorageHelper } from "@/helpers/storage.helper";

const storageHelper = new StorageHelper({ storageType: "local" });

export const onConnectStatusMessage = async (): Promise<ConnectStatusMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();

  const isConnected = await herculeApi.isConnected();
  const isAuthenticated = await herculeApi.isAuthenticated();
  const connectStatus = isConnected ? "connected" : ("disconnected" as ConnectStatus);
  const connectConfig: ConnectConfig = {
    serverUrl: herculeApi.serverUrl,
  };

  const response = {
    success: true,
    payload: {
      status: connectStatus,
      connectConfig: connectConfig,
      isAuthenticated: isAuthenticated
    },
  };

  return response;
};

export const onConnectMessage = async (message: ConnectMessage): Promise<ConnectMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();

  try {
    if (
      !herculeApi.validateCredentials({
        serverUrl: message.payload.serverUrl
      })
    ) {
      return { success: false, payload: { message: "Invalid credentials" } };
    }

    await herculeApi.connect({
      serverUrl: message.payload.serverUrl
    });

    storageHelper.setData("serverUrl", message.payload.serverUrl);

    return { success: true };
  } catch (error: unknown) {
    console.error("Error logging in:", error);
    return { success: false, payload: { message: (error as Error).message } };
  }
};

export const onDisconnectMessage = async (): Promise<DisconnectMessageResponse> => {
  try {
    storageHelper.eraseData("serverUrl");

    const herculeApi = await herculeApiFromStorage();
    await herculeApi.disconnect();

    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
};

export const onLoginMessage = async (message: LoginMessage): Promise<LoginMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();
  const response = await herculeApi.login(message.payload);
  return {
    success: true, payload: {
      error: response.error,
      user: response.user
    }
  };
};