import { defineConfig, TwindRule } from "@twind/core";
import presetTailwind from "@twind/preset-tailwind";
import presetAutoprefix from "@twind/preset-autoprefix";

// Convert rem to px
const presetRemToPx = ({ baseValue = 16 } = {}) => {
  return {
    finalize(rule: TwindRule) {
      return {
        ...rule,
        d: rule.d?.replace(/"[^"]+"|'[^']+'|url\([^)]+\)|(-?\d*\.?\d+)rem/g, (match, p1) => {
          if (p1 === undefined) return match;
          return `${p1 * baseValue}${p1 == 0 ? "" : "px"}`;
        }),
      };
    },
  };
};

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind(/* options */), presetRemToPx()],
  /* config */
});
