import browser from "webextension-polyfill";
import { DisconnectMessage, DisconnectMessageResponse, LogoutMessage, LogoutMessageResponse } from "@/types/messages.type";
import { useNavigate } from "react-router-dom";
import useConnectStatus from "@/app/hooks/use-connect-status";
import { useMemo } from "react";
import { Flex, Link, Text } from "@radix-ui/themes";
import { APP_VERSION } from "@/config/constants";

function Footer() {
  const navigate = useNavigate();
  const { connectConfig, user } = useConnectStatus();

  const handleDisconnect = async () => {
    try {
      const response = (await browser.runtime.sendMessage({
        type: "DISCONNECT",
      } as DisconnectMessage)) as DisconnectMessageResponse;

      if (response.success) {
        // Redirect to another page if logged in successfully
        return navigate("/connect");
      } else {
        console.error("Failed to disconnect. Original error:", response.payload?.message);
      }
    } catch (error: any) {
      console.error("Failed to disconnect. Original error:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const response = (await browser.runtime.sendMessage({
        type: "LOGOUT",
      } as LogoutMessage)) as LogoutMessageResponse;

      if (response.success) {
        // Redirect to another page if logged in successfully
        return navigate("/login");
      } else {
        console.error("Failed to log out. Original error:", response.payload?.message);
      }
    } catch (error: any) {
      console.error("Failed to log out. Original error:", error.message);
    }
  };

  const disconnectText = useMemo(() => {
    return connectConfig?.serverUrl ? `Disconnect from ${connectConfig.serverUrl}` : "Disconnect";
  }, [connectConfig]);

  const logoutText = useMemo(() => {
    return user?.email ? `Logout from ${user.email}` : "Logout";
  }, [user]);

  return (
    <Flex direction="column" align="center" gap="2" mt="auto">
      <Link href="#" onClick={handleDisconnect} color="gray" size="1">
        {disconnectText}
      </Link>
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
