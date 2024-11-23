import { Trigger } from "@/types/messages.type";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { ListTriggersMessage, ListTriggersMessageResponse } from "@/types/messages.type";
import TriggerItem from "./TriggerItem";
import { Flex, ScrollArea, Text, Separator } from "@radix-ui/themes";

function TriggersList() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  const fetchTriggers = async () => {
    try {
      const response = (await browser.runtime.sendMessage({
        type: "LIST_TRIGGERS",
      } as ListTriggersMessage)) as ListTriggersMessageResponse;

      if (response.success) {
        setTriggers(response.payload.triggers);
      } else {
        console.log("Failed to fetch triggers. Original error: " + JSON.stringify(response.payload.message));
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, []);

  return (
    <Flex direction="column" align="center" width="100%">
      <Text size="6">My triggers</Text>
      <Separator my="3" size="4" />
      <ScrollArea>
        <Flex direction="column" gap="2">
          {triggers.map((trigger: Trigger) => (
            <TriggerItem key={trigger.id} trigger={trigger} />
          ))}
        </Flex>
      </ScrollArea>
    </Flex>
  );
}

export default TriggersList;
