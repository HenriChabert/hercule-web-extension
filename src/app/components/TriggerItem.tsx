import browser from "webextension-polyfill";
import { RunTriggerMessageResponse, Trigger } from "@/types/messages.type";
import { Flex, Text, Badge, Button } from "@radix-ui/themes";
import n8nIcon from "@/assets/n8n-icon.png";
import { PlayIcon } from "lucide-react";
import { useState } from "react";
import { RunTriggerMessage } from "@/types/messages.type";
import { useToaster } from "@/app/hooks/use-toaster";

interface TriggerItemProps {
  trigger: Trigger;
}

function TriggerItem({ trigger }: TriggerItemProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToaster();

  const onRun = async () => {
    setLoading(true);

    showToast({
      description: "Running trigger",
      variation: "success",
    });

    const currentUrl = window.location.href;

    const response = (await browser.runtime.sendMessage({
      type: "RUN_TRIGGER",
      payload: { triggerId: trigger.id, context: { url: currentUrl } },
    } as RunTriggerMessage)) as RunTriggerMessageResponse;

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
    <Flex justify="between" align="center" p="2" className="border border-slate-200 rounded-md hover:bg-slate-200">
      <Flex gap="2" align="center">
        <img src={n8nIcon} width={16} height={16} className="h-4 w-4" />
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
