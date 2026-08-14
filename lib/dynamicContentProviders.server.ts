import type {
  DynamicContentContextDescriptor,
  DynamicItemContext,
} from "@/lib/dynamicContent";
import { resolveWordPressPostCollection } from "@/lib/wordpressDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

export type DynamicContentProviderInput = {
  website?: SaaSWebsite | null;
  descriptor: DynamicContentContextDescriptor;
};

export type DynamicContentProvider = (
  input: DynamicContentProviderInput,
) => Promise<DynamicItemContext[]>;

const providers: Readonly<Record<string, DynamicContentProvider>> = {
  wordpress: resolveWordPressPostCollection,
};

/** Server/data-layer orchestration. Presentation components must not call providers. */
export async function resolveDynamicContentContexts(
  input: DynamicContentProviderInput,
): Promise<DynamicItemContext[]> {
  const provider = providers[input.descriptor.provider];
  if (!provider) {
    throw new Error(
      `Unsupported Dynamic Content provider: ${input.descriptor.provider}.`,
    );
  }
  return provider(input);
}
