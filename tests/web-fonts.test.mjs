import assert from "node:assert/strict";
import test from "node:test";
import { fontFamilyStack, getWebFontStylesheetHref } from "../lib/webFonts.ts";

test("Global Typography font roles share one web-font request with weight variants", () => {
  const href = getWebFontStylesheetHref({
    fontFamilyBody: "Outfit",
    fontFamilyHeading: "Poppins",
    fontFamilyPrimary: "Outfit",
  });

  assert.match(href, /family=Outfit:wght@400;500;600;700;800/);
  assert.match(href, /family=Poppins:wght@400;500;600;700;800/);
  assert.equal(fontFamilyStack("Outfit", "system-ui, sans-serif"), '"Outfit", system-ui, sans-serif');
  assert.equal(fontFamilyStack("inherit", "system-ui, sans-serif"), "system-ui, sans-serif");
});
