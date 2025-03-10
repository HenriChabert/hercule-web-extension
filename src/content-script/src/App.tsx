import browser from "webextension-polyfill";
import { useButtonsStore } from "./stores/button-store";
import { useMemo, useState } from "react";
import FloatingButton from "./components/FloatingButton";
import FloatingButtonsBar from "./components/FloatingButtonsBar";
import { Button } from "./stores/button-store";
import { TriggerEventMessage, TriggerEventMessageResponse } from "@/types/messages.type";
function App() {
  const buttons = useButtonsStore((state) => state.buttons);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);

  const buttonsByPosition = useMemo(() => {
    return buttons.reduce((acc, button) => {
      acc[button.position] = [...(acc[button.position] || []), button];
      return acc;
    }, {} as Record<Button["position"], Button[]>);
  }, [buttons]);

  const onButtonClick = async (id: string) => {
    setButtonLoading(id);
    try {
      const response: TriggerEventMessageResponse = await browser.runtime.sendMessage({
        type: "TRIGGER_EVENT",
        payload: {
          event: {
            id: "button_clicked",
            context: {
              triggerId: id,
            },
          },
        },
      } as TriggerEventMessage);

      if (!response.success) {
        console.error("Failed to trigger button click event");
      }
    } catch (error) {
      console.error("Error triggering button click event:", error);
    } finally {
      setButtonLoading(null);
    }
  };

  return (
    <div className="w-full h-full text-center">
      {Object.entries(buttonsByPosition)
        .filter(([position]) => position !== "in-content")
        .map(([position, buttons]) => (
          <FloatingButtonsBar key={position} position={position as Exclude<Button["position"], "in-content">}>
            {buttons.map((button) => (
              <FloatingButton
                key={button.id}
                label={button.label}
                variant={button.variant}
                size={button.size}
                loading={buttonLoading === button.id}
                onClick={() => onButtonClick(button.id)}
              />
            ))}
          </FloatingButtonsBar>
        ))}
    </div>
  );
}

export default App;
