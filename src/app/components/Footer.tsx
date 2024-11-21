import browser from "webextension-polyfill";
import { DisconnectMessage, DisconnectMessageResponse } from "@/types/messages.type";
import { useNavigate } from "react-router-dom";
import useConnectStatus from "@/app/hooks/use-connect-status";
import { useMemo } from "react";
import { Flex, Link, Text } from "@radix-ui/themes";
import { APP_VERSION } from "@/config/constants";

function Footer() {
  const navigate = useNavigate();
  const { connectConfig } = useConnectStatus();

  const handleLogout = async () => {
    try {
      const response = (await browser.runtime.sendMessage({
        type: "DISCONNECT",
      } as DisconnectMessage)) as DisconnectMessageResponse;

      if (response.success) {
        // Redirect to another page if logged in successfully
        return navigate("/connect");
      } else {
        console.error("Failed to log out. Original error:", response.payload.message);
      }
    } catch (error: any) {
      console.error("Failed to log out. Original error:", error.message);
    }
  };

  const logoutText = useMemo(() => {
    return connectConfig?.serverUrl ? `Logout from ${connectConfig.serverUrl}` : "Logout";
  }, [connectConfig]);

  return (
    <Flex direction="column" align="center" gap="2" mt="auto">
      <Link href="#" onClick={handleLogout} color="gray" size="1">
        {logoutText}
      </Link>
      <Text color="gray" size="1">
        Version {APP_VERSION}
      </Text>
    </Flex>
  );
}

export default Footer;
