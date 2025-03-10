import browser from "webextension-polyfill";
import { renderToString } from "react-dom/server";
import { useButtonsStore } from "./stores/button-store";
import { useMemo, useState, useEffect } from "react";
import FloatingButton from "./components/FloatingButton";
import FloatingButtonsBar from "./components/FloatingButtonsBar";
import InContentButton from "./components/InContentButton";
import { Button } from "./stores/button-store";
import { TriggerEventMessage, TriggerEventMessageResponse } from "@/types/messages.type";
import { attachCSS } from "./helpers/twind";
import { APP_SLUG } from "@/config/constants";

function App() {
  const buttons = useButtonsStore((state) => state.buttons);
  const [buttonLoading, setButtonLoading] = useState<string | null>(null);
  const [inContentButtonsContainers, setInContentButtonsContainers] = useState<HTMLDivElement[]>([]);

  const inContentButtonContainerClassName = `${APP_SLUG}-in-content-button-container`;

  const buttonsByPosition = useMemo(() => {
    return buttons.reduce((acc, button) => {
      acc[button.position] = [...(acc[button.position] || []), button];
      return acc;
    }, {} as Record<Button["position"], Button[]>);
  }, [buttons]);

  const inContentButtons = useMemo(() => {
    return buttonsByPosition["in-content"];
  }, [buttonsByPosition]);

  const createInContentButton = (button: Button) => {
    // Create container div and shadow root
    const container = document.createElement("div");
    container.classList.add(inContentButtonContainerClassName);
    const shadowRoot = container.attachShadow({ mode: "open" });

    // Create button element inside shadow root
    const buttonElement = document.createElement("div");
    buttonElement.innerHTML = renderToString(<InContentButton {...button} />);
    shadowRoot.appendChild(buttonElement);

    attachCSS(shadowRoot);

    return container;
  };

  const resetInContentButtons = () => {
    inContentButtonsContainers.forEach((container) => {
      container.remove();
    });

    document.querySelectorAll(`.${inContentButtonContainerClassName}`).forEach((container) => {
      container.remove();
    });

    setInContentButtonsContainers([]);
  };

  const insertInContentButtons = () => {
    const inContentButtonsContainersInner: HTMLDivElement[] = [];
    if (inContentButtons) {
      inContentButtons.forEach((button) => {
        if (!button.parentCssSelector) return;

        const parentAnchor = document.querySelectorAll(button.parentCssSelector);

        if (!parentAnchor) return;

        parentAnchor.forEach((anchor) => {
          const container = createInContentButton(button);
          anchor.appendChild(container);
          inContentButtonsContainersInner.push(container);
        });
      });
    }

    return inContentButtonsContainersInner;
  };

  const refreshInContentButtons = () => {
    resetInContentButtons();

    const inContentButtonsContainersInner = insertInContentButtons();

    setInContentButtonsContainers(inContentButtonsContainersInner);

    return inContentButtonsContainersInner;
  };

  useEffect(() => {
    const inContentButtonsContainersInner = refreshInContentButtons();
    return () => {
      inContentButtonsContainersInner.forEach((container) => {
        container.remove();
      });
    };
  }, [inContentButtons]);

  useEffect(() => {
    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations affect elements that could contain our buttons
      const relevantChanges = mutations.some((mutation) => {
        // Check for added nodes that match our parent selectors
        return Array.from(mutation.addedNodes).some((node) => {
          if (node instanceof Element) {
            // Check if the node itself matches
            const nodeMatches = inContentButtons?.some(
              (button) => button.parentCssSelector && node.matches(button.parentCssSelector)
            );

            // Check if any children match
            const childrenMatch = inContentButtons?.some(
              (button) => button.parentCssSelector && node.querySelectorAll(button.parentCssSelector).length > 0
            );

            return nodeMatches || childrenMatch;
          }
          return false;
        });
      });

      if (relevantChanges) {
        // Re-insert buttons if relevant changes detected
        refreshInContentButtons();
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

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
