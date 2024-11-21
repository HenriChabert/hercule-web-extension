import { Flex } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useConnectStatus from "./hooks/use-connect-status";
import Footer from "@/app/components/Footer";
import TriggersList from "./components/TriggersList";
import * as ToastPrimitive from "@radix-ui/react-toast";
import Toast from "./components/toaster/Toast";

function Home() {
  const navigate = useNavigate();
  const { connectStatus } = useConnectStatus();

  useEffect(() => {
    if (connectStatus === "loading") return;
    if (connectStatus === "disconnected") {
      return navigate("/connect");
    }
  }, [connectStatus]);

  return (
    <Flex direction="column" height="600px" width="400px" px="8" py="4" align="center" className="!justify-around">
      {connectStatus === "connected" && <TriggersList />}
      {/* <Toast variation="success" description="Connection successful" duration={100000} /> */}
      <Footer />
    </Flex>
  );
}

export default Home;
