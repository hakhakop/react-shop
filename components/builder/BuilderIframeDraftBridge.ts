import type { BuilderState } from "@/components/dashboard/builderTypes";

export const BUILDER_IFRAME_DRAFT_SOURCE = "webpages-builder-draft";
export const BUILDER_IFRAME_DRAFT_MESSAGE = "draft-snapshot";

export type BuilderIframeDraftMessage = {
  source: typeof BUILDER_IFRAME_DRAFT_SOURCE;
  type: typeof BUILDER_IFRAME_DRAFT_MESSAGE;
  documentKey: string;
  revision: number;
  state: BuilderState;
};
