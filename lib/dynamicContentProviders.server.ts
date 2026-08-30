import type {
  DynamicContentContextDescriptor,
  DynamicItemContext,
} from "@/lib/dynamicContent";
import { resolveWordPressPostContexts } from "@/lib/wordpressDynamicContentProvider.server";
import {
  composeWooCommerceProductDescriptorWithInheritedContext,
  resolveWooCommerceProductContexts,
} from "@/lib/woocommerceDynamicContentProvider.server";
import { resolveWordPressGenericContentContexts } from "@/lib/wordpressGenericContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

export type DynamicContentProviderInput = {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
};

export type DynamicContentProvider = (
  input: DynamicContentProviderInput,
) => Promise<DynamicItemContext[]>;

const providers: Readonly<Record<string, DynamicContentProvider>> = {
  "wordpress/post": resolveWordPressPostContexts,
  "wordpress/content": resolveWordPressGenericContentContexts,
  "woocommerce/product": resolveWooCommerceProductContexts,
};

/** Provider-owned composition at the shared template inheritance boundary. */
export function composeDynamicContentDescriptorWithInheritedContext(
  descriptor: DynamicContentContextDescriptor,
  inheritedContext: DynamicItemContext | undefined,
) {
  return composeWooCommerceProductDescriptorWithInheritedContext(descriptor, inheritedContext);
}

/** Server/data-layer orchestration. Presentation components must not call providers. */
export async function resolveDynamicContentContexts(
  input: DynamicContentProviderInput,
): Promise<DynamicItemContext[]> {
  const providerKey = `${input.descriptor.provider}/${input.descriptor.source}`;
  const provider = providers[providerKey];
  if (!provider) {
    const providerExists = Object.keys(providers).some((key) =>
      key.startsWith(`${input.descriptor.provider}/`),
    );
    throw new Error(
      providerExists
        ? input.descriptor.provider === "wordpress"
          ? `Unsupported WordPress Dynamic Content source: ${input.descriptor.source}.`
          : `Unsupported Dynamic Content source: ${providerKey}.`
        : `Unsupported Dynamic Content provider: ${input.descriptor.provider}.`,
    );
  }
  return provider(input);
}
