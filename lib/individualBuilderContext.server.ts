import type { BuilderDataScope, BuilderLayout } from "@/lib/builderLayouts";
import {
  materializeBuilderDynamicContent,
  type DynamicContentContextResolver,
} from "@/lib/builderDynamicContentMaterializer.server";
import { createContentDiscoveryService } from "@/lib/contentDiscovery.server";
import {
  createIndividualLayoutsService,
  parseSupportedIndividualIdentity,
  type IndividualLayoutStatus,
} from "@/lib/individualLayoutsService.server";
import type { StableContentIdentity } from "@/lib/layoutRouting";
import type { SaaSWebsite } from "@/lib/websites";

export class IndividualBuilderContextMismatchError extends Error {}

const TRANSPORT_PREFIX = "v1.";

export function encodeIndividualBuilderIdentity(value: unknown) {
  const identity = parseSupportedIndividualIdentity(value);
  return `${TRANSPORT_PREFIX}${Buffer.from(JSON.stringify(identity), "utf8").toString("base64url")}`;
}

export function decodeIndividualBuilderIdentity(value: unknown): StableContentIdentity {
  if (typeof value !== "string" || !value.startsWith(TRANSPORT_PREFIX)) {
    throw new IndividualBuilderContextMismatchError("Invalid Individual Builder identity context.");
  }
  try {
    return parseSupportedIndividualIdentity(JSON.parse(
      Buffer.from(value.slice(TRANSPORT_PREFIX.length), "base64url").toString("utf8"),
    ));
  } catch (error) {
    if (error instanceof IndividualBuilderContextMismatchError) throw error;
    throw new IndividualBuilderContextMismatchError("Invalid Individual Builder identity context.");
  }
}

export type IndividualBuilderContext = {
  mode: "individual";
  documentId: string;
  identity: StableContentIdentity;
  pageType: string;
  family: "product" | "post";
  familyLabel: "Individual Product Layout" | "Individual Post Layout";
  title: string | null;
  slug: string | null;
  availability: "published" | "unpublished" | "unknown" | "missing";
  websiteId?: string;
  storefrontHref?: string;
  assignedTemplate: IndividualLayoutStatus["assignedTemplate"];
};

export async function resolveIndividualBuilderContext(input: {
  documentId: unknown;
  individual: unknown;
  authoredLayout?: BuilderLayout;
  scope?: BuilderDataScope;
  website?: SaaSWebsite | null;
  resolveContexts?: DynamicContentContextResolver;
  individualService?: ReturnType<typeof createIndividualLayoutsService>;
  discoveryService?: ReturnType<typeof createContentDiscoveryService>;
}) {
  if (typeof input.documentId !== "string") {
    throw new IndividualBuilderContextMismatchError("Invalid Builder document ID.");
  }
  const scope = input.scope ?? {};
  const identity = decodeIndividualBuilderIdentity(input.individual);
  const individualService = input.individualService ?? createIndividualLayoutsService(scope);
  let persistedLayout: BuilderLayout;
  try {
    persistedLayout = await individualService.validateBuilderOwnership(identity, input.documentId);
  } catch {
    throw new IndividualBuilderContextMismatchError(
      "Individual assignment does not own this Builder document in the current website.",
    );
  }
  const layout = input.authoredLayout ?? persistedLayout;
  const discovery = input.discoveryService ?? createContentDiscoveryService(input.website);
  const [entity, status] = await Promise.all([
    discovery.resolveByStableIdentity(identity),
    individualService.getStatus(identity),
  ]);
  const family: "product" | "post" = identity.contentType === "product" ? "product" : "post";
  const context: IndividualBuilderContext = {
    mode: "individual",
    documentId: input.documentId,
    identity,
    pageType: `singular:${identity.contentType}`,
    family,
    familyLabel: family === "product" ? "Individual Product Layout" : "Individual Post Layout",
    title: entity.availability === "missing" ? null : entity.item.title,
    slug: entity.availability === "missing" ? null : entity.item.slug,
    availability: entity.availability,
    websiteId: scope.websiteId,
    ...(entity.availability !== "missing" && entity.item.storefrontHref
      ? { storefrontHref: entity.item.storefrontHref }
      : {}),
    assignedTemplate: status.assignedTemplate,
  };
  if (entity.availability === "missing") {
    return {
      layout,
      renderLayout: layout,
      diagnostics: [],
      context,
      status: { ...status, contentAvailability: entity.availability },
      unavailable: true,
    };
  }
  const materialization = await materializeBuilderDynamicContent(layout, {
    website: input.website,
    rootContext: entity.context,
    resolveContexts: input.resolveContexts,
  });
  return {
    layout,
    renderLayout: materialization.renderLayout,
    diagnostics: materialization.diagnostics,
    context,
    status: { ...status, contentAvailability: entity.availability },
    unavailable: false,
  };
}
