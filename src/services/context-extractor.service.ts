import browser from "webextension-polyfill";

interface ContextExtractorService {
  name: string;
  extract(...args: unknown[]): Promise<unknown> | unknown;
}

class UrlExtractor implements ContextExtractorService {
  name = "url";

  getCurrentUrl = async (tabId: number): Promise<string> => {
    const tab = await browser.tabs.get(tabId);
    return tab.url || "";
  };

  async extract(tabId: number): Promise<string> {
    return this.getCurrentUrl(tabId);
  }
}

class HTMLContentExtractor implements ContextExtractorService {
  name = "html_content";

  domToString = async (selector: string) => {
    let element: HTMLElement;
    if (!selector) {
      element = document.documentElement;
    } else {
      element = document.querySelector(selector) as HTMLElement;
      if (!element) return "ERROR: querySelector failed to find node";
    }
    return element.outerHTML;
  };

  async extract(tabId: number, selector: string | null = null): Promise<string> {
    const urlExtractor = new UrlExtractor();
    const url = await urlExtractor.extract(tabId);

    console.log({ url });

    if (!url.startsWith("http") && !url.startsWith("https")) {
      return "";
    }

    const result = await browser.scripting.executeScript({
      target: { tabId: tabId },
      func: this.domToString,
      args: [selector],
    });
    return result[0].result as string;
  }
}

export const contextExtractors = [new UrlExtractor(), new HTMLContentExtractor()];

export type ContextExtractor = UrlExtractor | HTMLContentExtractor;
