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
import { projectImportedDynamicContentProvider } from "@/lib/importedDynamicContentProvider";
import { resolveWooCommerceTermContexts } from "@/lib/woocommerceTermContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";
import { resolveWordPressMenuContexts } from "@/lib/wordpressMenuContentProvider.server";

export type DynamicContentProviderInput = {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
};

export type DynamicContentProvider = (
  input: DynamicContentProviderInput,
) => Promise<DynamicItemContext[]>;

const providers: Readonly<Record<string, DynamicContentProvider>> = {
  "wordpress/menu-item": resolveWordPressMenuContexts,
  "wordpress/post": resolveWordPressPostContexts,
  "wordpress/content": resolveWordPressGenericContentContexts,
  "woocommerce/product": resolveWooCommerceProductContexts,
  "woocommerce/product-category": resolveWooCommerceTermContexts,
  "woocommerce/product-tag": resolveWooCommerceTermContexts,
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
  const descriptor = projectImportedDynamicContentProvider(input.descriptor);
  const providerKey = `${descriptor.provider}/${descriptor.source}`;
  const provider = providers[providerKey];
  if (!provider) {
    const providerExists = Object.keys(providers).some((key) =>
      key.startsWith(`${descriptor.provider}/`),
    );
    throw new Error(
      providerExists
        ? descriptor.provider === "wordpress"
          ? `Unsupported WordPress Dynamic Content source: ${descriptor.source}.`
          : `Unsupported Dynamic Content source: ${providerKey}.`
        : `Unsupported Dynamic Content provider: ${descriptor.provider}.`,
    );
  }
  return provider({ ...input, descriptor });
}
