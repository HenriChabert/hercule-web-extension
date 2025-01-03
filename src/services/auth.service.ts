import { ConnectMessageResponse, ConnectStatus, DisconnectMessageResponse } from "@/types/messages.type";
import { ConnectMessage } from "@/types/messages.type";
import { ConnectConfig } from "@/types/messages.type";
import { ConnectStatusMessageResponse } from "@/types/messages.type";
import { herculeApiFromStorage } from "./hercule-server/hercule-api";
import { StorageHelper } from "@/helpers/storage.helper";

const storageHelper = new StorageHelper({ storageType: "local" });

export const onConnectStatusMessage = async (): Promise<ConnectStatusMessageResponse> => {
  const herculeApi = await herculeApiFromStorage();

  const isConnected = await herculeApi.isConnected();
  const connectStatus = isConnected ? "connected" : ("disconnected" as ConnectStatus);
  const connectConfig: ConnectConfig = {
    serverUrl: herculeApi.serverUrl,
  };

  const response = {
    success: true,
    payload: { status: connectStatus, connectConfig: connectConfig },
  };

  return response;
};

export const onConnectMessage = async (message: ConnectMessage): Promise<ConnectMessageResponse> => {
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

export const onDisconnectMessage = async (): Promise<DisconnectMessageResponse> => {
  try {
    storageHelper.eraseData("serverUrl");
    storageHelper.eraseData("secretKey");

    const herculeApi = await herculeApiFromStorage();
    await herculeApi.disconnect();

    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    return { success: false };
  }
};
