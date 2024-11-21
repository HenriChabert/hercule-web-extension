import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import {
  ConnectStatusMessage,
  ConnectStatusMessageResponse,
} from "../../types/messages.type";
import { ConnectConfig, ConnectStatus } from "../../types/messages.type";

interface ConnectState {
  connectStatus: ConnectStatus;
  connectConfig: ConnectConfig | null;
}

const useConnectStatus = () => {
  const [connectState, setConnectState] = useState<ConnectState>({
    connectStatus: "loading",
    connectConfig: null,
  });

  const getStatus = async () => {
    const response = (await browser.runtime.sendMessage({
      type: "CONNECT_STATUS",
    } as ConnectStatusMessage)) as ConnectStatusMessageResponse;

    return response;
  };

  useEffect(() => {
    const initConnectState = async () => {
      const status = await getStatus();

      setConnectState({
        connectStatus: status.payload.status,
        connectConfig: status.payload.connectConfig,
      });
    };
    initConnectState();
  }, []);

  return connectState;
};

export default useConnectStatus;