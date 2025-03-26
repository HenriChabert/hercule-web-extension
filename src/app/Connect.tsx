import { Flex, Text, Button } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { TextField } from "@radix-ui/themes";
import { UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { ConnectMessage, ConnectMessageResponse } from "../types/messages.type";
import useConnectStatus from "./hooks/use-connect-status";

const DEFAULT_SERVER_URL = "http://localhost:8000";

function Connect() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_SERVER_URL);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { connectStatus, connectConfig } = useConnectStatus();

  const isUrlValid = (url: string) => {
    return /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:[0-9]+)?$/.test(url);
  };

  const urlToPattern = (url: string) => {
    return url.replace(/\/?$/, "/*");
  };

  const requestPermissions = async (url: string) => {
    const pattern = urlToPattern(url);

    return await browser.permissions.request({
      permissions: ["webRequest"],
      origins: [pattern],
    });
  };

  const handleConnect = async () => {
    if (!isUrlValid(serverUrl)) {
      setError("Invalid server URL");
      return;
    }

    /* For the time being, we don't need to request permissions because it breaks UX (popup is closed when permissions are requested)
    const granted = await requestPermissions(serverUrl);

    if (!granted) {
      setError("Permissions not granted");
      return;
    }
      */

    try {
      const response = (await browser.runtime.sendMessage({
        type: "CONNECT",
        payload: { serverUrl },
      } as ConnectMessage)) as ConnectMessageResponse;

      if (response.success) {
        // Redirect to another page if logged in successfully
        return navigate("/");
      } else {
        setError(
          "Failed to connect. Please check your credentials. Original error: " +
          JSON.stringify(response.payload?.message)
        );
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred during connection: " + error);
    }
  };

  useEffect(() => {
    switch (connectStatus) {
      case "loading":
        break;
      case "connected":
        navigate("/");
        break;
      case "disconnected":
        if (connectConfig?.serverUrl) {
          setServerUrl(connectConfig.serverUrl);
        }
        break;
    }
  }, [connectStatus, connectConfig, navigate]);

  return (
    <Flex direction="column" height="600px" width="400px" px="8" py="4" align="center" className="!justify-around">
      <Text>Login to Hercule Server</Text>
      <Flex direction="column" width="100%" gap="2">
        <Flex direction="column" width="100%">
          <Text>Hercule Server URL</Text>
          <TextField.Root
            placeholder="https://hercule.example.com"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          >
            <TextField.Slot>
              <UserIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
        </Flex>
      </Flex>
      {error && (
        <Text color="red" align="center">
          {error}
        </Text>
      )}
      <Button onClick={handleConnect}>Connect</Button>
    </Flex>
  );
}

export default Connect;
