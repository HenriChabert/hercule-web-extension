import browser from "webextension-polyfill";
import { Trigger, TriggerEventMessage, TriggerEventMessageResponse } from "@/types/messages.type";
import { Flex, Text, Badge, Button } from "@radix-ui/themes";
import n8nIcon from "@/assets/n8n-icon.png";
import zapierIcon from "@/assets/zapier-icon.png";
import makeIcon from "@/assets/make-icon.png";

import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { useToaster } from "@/app/hooks/use-toaster";

interface TriggerItemProps {
  trigger: Trigger;
}

const icons = {
  n8n: n8nIcon,
  zapier: zapierIcon,
  make: makeIcon,
} as Record<Trigger["source"], string>;

function TriggerItem({ trigger }: TriggerItemProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToaster();

  const getCurrentUrl = async () => {
    const query = { active: true, currentWindow: true };
    const [tab] = await browser.tabs.query(query);
    return tab.url;
  };

  const onRun = async () => {
    setLoading(true);

    showToast({
      description: "Running trigger",
      variation: "success",
    });

    const currentUrl = await getCurrentUrl();

    const response = (await browser.runtime.sendMessage({
      type: "TRIGGER_EVENT",
      payload: { event: { id: "manual_trigger_in_popup", context: { triggerId: trigger.id, url: currentUrl } } },
    } as TriggerEventMessage)) as TriggerEventMessageResponse;

    if (response.success) {
      showToast({
        description: "Trigger run successfully",
        variation: "success",
      });
    } else {
      showToast({
        description: "Failed to run trigger",
        variation: "error",
      });
    }

    setLoading(false);
  };

  return (
    <Flex
      justify="between"
      align="center"
      p="2"
      width="100%"
      className="border border-slate-200 rounded-md hover:bg-slate-200"
    >
      <Flex gap="2" align="center">
        <img src={icons[trigger.source as keyof typeof icons]} width={16} height={16} className="h-4 w-4" />
        <Flex direction="column" gap="1">
          <Text size="2">{trigger.name}</Text>
          <Flex gap="1">
            <Badge size="1" radius="large">
              {trigger.source}
            </Badge>
          </Flex>
        </Flex>
      </Flex>
      <Button size="1" loading={loading} onClick={onRun}>
        <PlayIcon size={16} />
        <Text>Run</Text>
      </Button>
    </Flex>
  );
}

export default TriggerItem;
