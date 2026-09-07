import type { BuilderState } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";

export const BUILDER_IFRAME_DRAFT_SOURCE = "webpages-builder-draft";
export const BUILDER_IFRAME_DRAFT_MESSAGE = "draft-snapshot";
export const BUILDER_IFRAME_DRAFT_READY_MESSAGE = "draft-receiver-ready";
export const BUILDER_IFRAME_DRAFT_ACK_MESSAGE = "draft-applied";

export type BuilderIframeDraftMessage = {
  source: typeof BUILDER_IFRAME_DRAFT_SOURCE;
  type: typeof BUILDER_IFRAME_DRAFT_MESSAGE;
  documentKey: string;
  /** Route key rendered by the iframe when it differs from the authored document key. */
  renderPage?: string;
  revision: number;
  state: BuilderState;
  /** The page rendered behind a Header/Footer document in shell editing mode. */
  contextState?: BuilderState;
  shellSettings?: BuilderShellSettings;
};

export type BuilderIframeDraftLifecycleMessage = {
  source: typeof BUILDER_IFRAME_DRAFT_SOURCE;
  type:
    | typeof BUILDER_IFRAME_DRAFT_READY_MESSAGE
    | typeof BUILDER_IFRAME_DRAFT_ACK_MESSAGE;
  documentKey: string;
  revision?: number;
};
