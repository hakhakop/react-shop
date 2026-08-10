import { expect, test } from "@playwright/test";
import { isGradientBackgroundPaint, isValidBackgroundPaint } from "@/lib/backgroundPaint";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";

const devstackGradient = "linear-gradient(40deg, #7141F1 0%, #4D6BD8 70%, #3183E2 100%)";

test("Global semantic background paint preserves imported gradients through the shared UIkit variables", () => {
  const imported = resolveYoothemeLess([{
    name: "DevStack style.less",
    precedence: 1,
    content: `@global-primary-background: ${devstackGradient};`,
  }]);

  expect(imported.shellSettings.backgroundPrimary).toBe(devstackGradient);
  expect(isValidBackgroundPaint(devstackGradient)).toBe(true);
  expect(isGradientBackgroundPaint(devstackGradient)).toBe(true);

  const vars = getUikitGlobalsCssVars(imported.shellSettings);
  expect(vars["--webpages-background-primary"]).toBe(devstackGradient);
  expect(vars["--uikit-section-primary-bg"]).toBe(devstackGradient);
});

test("Card background and hover background use the same canonical paint resolver", () => {
  const imported = resolveYoothemeLess([{
    name: "DevStack style.less",
    precedence: 1,
    content: `@card-primary-background: ${devstackGradient}; @card-primary-hover-background: radial-gradient(circle, #7141F1 0%, #3183E2 100%);`,
  }]);

  const vars = getUikitGlobalsCssVars(imported.shellSettings);
  expect(vars["--uk-card-primary-background"]).toBe(devstackGradient);
  expect(vars["--uk-card-primary-hover-background"])
    .toBe("radial-gradient(circle, #7141F1 0%, #3183E2 100%)");
});

test("DevStack internal Card gradients normalize into the visible Card background owners", () => {
  const imported = resolveYoothemeLess([{
    name: "master-devstack/_import.less",
    precedence: 1,
    content: `
      @global-secondary-background: #171258;
      @internal-card-primary-gradient: ${devstackGradient};
      @internal-card-secondary-gradient: linear-gradient(40deg, darken(@global-secondary-background, 5%) 0%, lighten(@global-secondary-background, 5%) 90%);
    `,
  }]);

  expect(imported.shellSettings.cardPrimaryBackground).toBe(devstackGradient);
  expect(imported.shellSettings.cardSecondaryBackground).toBe("linear-gradient(40deg, #161154 0%, #18135c 90%)");
  expect(getUikitGlobalsCssVars(imported.shellSettings)["--uk-card-primary-background"]).toBe(devstackGradient);
});

test("Global background paint accepts semantic color values and rejects declaration injection", () => {
  expect(isValidBackgroundPaint("transparent")).toBe(true);
  expect(isValidBackgroundPaint("radial-gradient(circle, #fff 0%, rgba(0,0,0,.2) 100%)")).toBe(true);
  expect(isValidBackgroundPaint("linear-gradient(40deg, #7141F1); color: red")).toBe(false);
  expect(isValidBackgroundPaint("url(https://example.test/image.png)")).toBe(false);
});
