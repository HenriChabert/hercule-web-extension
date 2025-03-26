import { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import { ConnectStatusMessage, ConnectStatusMessageResponse } from "../../types/messages.type";
import { ConnectConfig, ConnectStatus } from "../../types/messages.type";
import { User } from "@/types/user.type";

interface ConnectState {
  connectStatus: ConnectStatus;
  connectConfig: ConnectConfig | null;
  user: User | null;
}

const useConnectStatus = () => {
  const [connectState, setConnectState] = useState<ConnectState>({
    connectStatus: "loading",
    connectConfig: null,
    user: null
  });

  const getStatus = async () => {
    const response = (await browser.runtime.sendMessage({
      type: "CONNECT_STATUS",
    } as ConnectStatusMessage)) as ConnectStatusMessageResponse;

    return response;
  };

  useEffect(() => {
    let mounted = true;

    const initConnectState = async () => {
      const status = await getStatus();

      if (mounted) {
        setConnectState({
          connectStatus: status.payload.status,
          connectConfig: status.payload.connectConfig,
          user: status.payload.user
        });
      }
    };
    initConnectState();

    return () => {
      mounted = false;
    };
  }, []);

  return connectState;
};

export default useConnectStatus;
