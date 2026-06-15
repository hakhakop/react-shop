import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveEffectiveHeaderTextMode,
} from "../lib/headerBackgroundContext.ts";

const modes = {
  configuredTextMode: "auto",
  headerTextMode: "dark",
  pageTextMode: "dark",
  sectionTextMode: "light",
};

const cases = [
  {
    name: "non-transparent header uses its own background",
    input: {
      ...modes,
      backgroundMode: "default",
      firstSectionOverlapEnabled: true,
      firstSectionTouchesPageTop: true,
    },
    expected: { context: "header", textMode: "dark" },
  },
  {
    name: "non-transparent header ignores a section gap",
    input: {
      ...modes,
      backgroundMode: "glass",
      firstSectionOverlapEnabled: true,
      firstSectionTouchesPageTop: false,
    },
    expected: { context: "header", textMode: "dark" },
  },
  {
    name: "transparent overlapping header uses a touching section",
    input: {
      ...modes,
      backgroundMode: "none",
      firstSectionOverlapEnabled: true,
      firstSectionTouchesPageTop: true,
    },
    expected: { context: "section", textMode: "light" },
  },
  {
    name: "transparent header without overlap uses the page",
    input: {
      ...modes,
      backgroundMode: "none",
      firstSectionOverlapEnabled: false,
      firstSectionTouchesPageTop: true,
    },
    expected: { context: "page", textMode: "dark" },
  },
  {
    name: "transparent overlapping header above a section gap uses the page",
    input: {
      ...modes,
      backgroundMode: "none",
      firstSectionOverlapEnabled: true,
      firstSectionTouchesPageTop: false,
    },
    expected: { context: "page", textMode: "dark" },
  },
  {
    name: "dashboard preview follows the same transparent non-overlap rule",
    input: {
      ...modes,
      backgroundMode: "none",
      firstSectionOverlapEnabled: false,
      firstSectionTouchesPageTop: false,
    },
    expected: { context: "page", textMode: "dark" },
  },
];

for (const matrixCase of cases) {
  test(matrixCase.name, () => {
    assert.deepEqual(
      resolveEffectiveHeaderTextMode(matrixCase.input),
      matrixCase.expected,
    );
  });
}
