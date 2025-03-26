import { twind, cssom, observe } from "@twind/core";
import config from "../../../../twind.config";

export function attachCSS(shadowRoot: ShadowRoot) {
  const sheet = cssom(new CSSStyleSheet());

  const tw = twind(config, sheet);

  shadowRoot.adoptedStyleSheets = [sheet.target];

  observe(tw, shadowRoot);
  return sheet;
}
