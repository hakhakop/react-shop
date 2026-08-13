import { expect, test, type Page } from "@playwright/test";
import {
  formatFreshImportAcceptanceResult,
  runRegisteredYoothemeFreshImportAcceptance,
  type FreshImportCheck,
} from "@/tests/support/yoothemeFreshImportAcceptance";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

type SemanticProbe = {
  lead: string;
  defaultButton: { color: string; background: string; border: string; shadow: string } | null;
  secondaryButton: { color: string; background: string; border: string; shadow: string } | null;
  accordion: { title: string; content: string; indicator: string; divider: string };
};

async function probeSemanticContext(page: Page): Promise<SemanticProbe> {
  return page.locator(".uk-section-primary").first().evaluate((section) => {
    const read = (element: Element | null) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        color: style.color,
        background: style.backgroundColor,
        border: style.borderTopColor,
        shadow: style.boxShadow,
      };
    };
    const sandbox = document.createElement("div");
    sandbox.className = "shop-builder-column-block shop-builder-column-block--accordion";
    sandbox.innerHTML = `
      <ul class="shop-builder-accordion uk-accordion uk-accordion-default shop-builder-accordion--style-divided shop-builder-accordion--divider">
        <li><a class="uk-accordion-title" href="#"><span class="shop-builder-accordion-indicator">⌄</span><span class="shop-builder-accordion-title-text">Context title</span></a><div class="uk-accordion-content">Context content</div></li>
        <li><a class="uk-accordion-title" href="#"><span class="shop-builder-accordion-indicator">⌄</span><span class="shop-builder-accordion-title-text">Second title</span></a><div class="uk-accordion-content">Second content</div></li>
      </ul>`;
    section.append(sandbox);
    const accordion = sandbox.querySelector(".shop-builder-accordion")!;
    const firstTitle = accordion.querySelector(".uk-accordion-title");
    const firstContent = accordion.querySelector(".uk-accordion-content");
    const indicator = accordion.querySelector(".shop-builder-accordion-indicator");
    const divider = accordion.querySelectorAll("li")[1];
    return {
      lead: getComputedStyle(section.querySelector(".shop-builder-column-block--text.uk-text-lead")!).color,
      defaultButton: read(section.querySelector(".uk-button-default")),
      secondaryButton: read(section.querySelector(".uk-button-secondary")),
      accordion: {
        title: getComputedStyle(firstTitle!).color,
        content: getComputedStyle(firstContent!).color,
        indicator: getComputedStyle(indicator!).color,
        divider: getComputedStyle(divider).borderTopColor,
      },
    };
  });
}

test("Enterprise8 primary semantic context is shared by Builder and storefront", async ({ page }) => {
  const result = await runRegisteredYoothemeFreshImportAcceptance({
    page,
    context: page.context(),
    fixtureId: "enterprise8",
    authenticate: signIn,
    probe: async ({ builder, storefront }) => {
      const builderProbe = await probeSemanticContext(builder);
      const storefrontProbe = await probeSemanticContext(storefront);
      const equals = <T,>(key: keyof SemanticProbe, predicate: (value: T) => boolean, expected: string): FreshImportCheck => ({
        capability: `semantic-context.${String(key)}`,
        outcome: predicate(builderProbe[key] as T) && JSON.stringify(builderProbe[key]) === JSON.stringify(storefrontProbe[key]) ? "PASS" : "FAIL",
        expected,
        actual: `Builder=${JSON.stringify(builderProbe[key])}; storefront=${JSON.stringify(storefrontProbe[key])}`,
      });
      return [
        equals<string>("lead", (color) => color !== "rgb(51, 65, 85)", "inverse lead is not the former fixed dark color"),
        equals<SemanticProbe["accordion"]>("accordion", (value) =>
          value.title !== "rgb(0, 0, 0)" && value.content !== "rgb(0, 0, 0)" && value.indicator !== "rgb(0, 0, 0)" && value.divider !== "rgb(0, 0, 0)",
        "inverse Accordion title/content/indicator/divider consume semantic context"),
        equals<SemanticProbe["defaultButton"]>("defaultButton", (value) => Boolean(
          value && value.background === "rgb(255, 255, 255)" && value.color === "rgb(13, 10, 70)",
        ), "YOOtheme inverse Default is a light surface with emphasis text"),
        equals<SemanticProbe["secondaryButton"]>("secondaryButton", (value) => Boolean(
          value && value.background === "rgba(0, 0, 0, 0)" && value.color === "rgb(255, 255, 255)" && value.border === "rgb(255, 255, 255)" && value.shadow === "none",
        ), "YOOtheme inverse Secondary is the unglowed inverse outline"),
      ];
    },
  });

  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});

type GeometryProbe = {
  text: { width: number; offset: number; centered: boolean } | null;
  grid: { display: string; alignItems: string; columnGap: number; cardWidth: number; expectedCardWidth: number; lastRowOffset: number; expectedLastRowOffset: number } | null;
  gridCandidates: Array<{ directCards: number; descendantCards: number }>;
};

async function probeTextAndGridGeometry(page: Page): Promise<GeometryProbe> {
  return page.locator("body").evaluate(() => {
    const textShell = Array.from(document.querySelectorAll<HTMLElement>(
      ".shop-builder-element-shell.uk-width-xlarge",
    )).find((shell) => shell.querySelector(".shop-builder-column-block--text"));
    const text = textShell ? (() => {
      const rect = textShell.getBoundingClientRect();
      const parent = textShell.parentElement!.getBoundingClientRect();
      const offset = rect.left - parent.left;
      return {
        width: rect.width,
        offset,
        centered: Math.abs(offset - (parent.width - rect.width) / 2) <= 1,
      };
    })() : null;

    const gridCandidates = Array.from(document.querySelectorAll<HTMLElement>(
      ".shop-builder-grid--yootheme-column-center",
    )).map((candidate) => ({
      directCards: candidate.querySelectorAll(":scope > .shop-builder-grid-card").length,
      descendantCards: candidate.querySelectorAll(".shop-builder-grid-card").length,
    }));
    const grid = Array.from(document.querySelectorAll<HTMLElement>(
      ".shop-builder-grid--yootheme-column-center",
    )).find((candidate) => candidate.querySelectorAll(".shop-builder-grid-card").length === 5);
    const gridMetrics = grid ? (() => {
      const cards = Array.from(grid.querySelectorAll<HTMLElement>(".shop-builder-grid-card"));
      const gridRect = grid.getBoundingClientRect();
      const style = getComputedStyle(grid);
      const columnGap = Number.parseFloat(style.columnGap);
      const rows = new Map<number, DOMRect[]>();
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const key = Math.round(rect.top);
        rows.set(key, [...(rows.get(key) ?? []), rect]);
      }
      const lastRow = [...rows.entries()].sort(([a], [b]) => a - b).at(-1)?.[1] ?? [];
      const lastRowWidth = lastRow.reduce((sum, rect) => sum + rect.width, 0) + Math.max(0, lastRow.length - 1) * columnGap;
      return {
        display: style.display,
        alignItems: style.alignItems,
        columnGap,
        cardWidth: cards[0]?.getBoundingClientRect().width ?? Number.NaN,
        expectedCardWidth: (gridRect.width - 2 * columnGap) / 3,
        lastRowOffset: lastRow[0] ? lastRow[0].left - gridRect.left : Number.NaN,
        expectedLastRowOffset: (gridRect.width - lastRowWidth) / 2,
      };
    })() : null;
    return { text, grid: gridMetrics, gridCandidates };
  });
}

test("Enterprise8 Text width and Grid alignment use the source UIkit geometry in Builder and storefront", async ({ page }) => {
  const result = await runRegisteredYoothemeFreshImportAcceptance({
    page,
    context: page.context(),
    fixtureId: "enterprise8",
    authenticate: signIn,
    probe: async ({ builder, storefront }) => {
      const [builderProbe, storefrontProbe] = await Promise.all([
        probeTextAndGridGeometry(builder),
        probeTextAndGridGeometry(storefront),
      ]);
      const textPass = (probe: GeometryProbe) => Boolean(
        probe.text
        && Math.abs(probe.text.width - 600) <= 1
        && probe.text.centered,
      );
      const gridPass = (probe: GeometryProbe) => Boolean(
        probe.grid
        && probe.grid.display === "flex"
        && Math.abs(probe.grid.cardWidth - probe.grid.expectedCardWidth) <= 1
        && Math.abs(probe.grid.lastRowOffset - probe.grid.expectedLastRowOffset) <= 1,
      );
      return [
        {
          capability: "text.maxwidth.xlarge",
          outcome: textPass(builderProbe) && textPass(storefrontProbe) ? "PASS" : "FAIL",
          expected: "UIkit uk-width-xlarge is a centered 600px text block",
          actual: `Builder=${JSON.stringify(builderProbe.text)}; storefront=${JSON.stringify(storefrontProbe.text)}`,
        },
        {
          capability: "grid.grid_column_align",
          outcome: gridPass(builderProbe) && gridPass(storefrontProbe) ? "PASS" : "FAIL",
          expected: "grid_column_align centers the incomplete final row through uk-flex-center semantics",
          actual: `Builder=${JSON.stringify(builderProbe.grid)}; storefront=${JSON.stringify(storefrontProbe.grid)}; candidates={Builder:${JSON.stringify(builderProbe.gridCandidates)}, storefront:${JSON.stringify(storefrontProbe.gridCandidates)}}`,
        },
      ];
    },
  });

  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});
