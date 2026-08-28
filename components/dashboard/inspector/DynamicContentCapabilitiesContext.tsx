"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
  type DynamicContentSourceCapability,
} from "@/lib/dynamicContentCapabilities";

const DynamicContentCapabilitiesContext = createContext<readonly DynamicContentSourceCapability[]>(
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
);

export function DynamicContentCapabilitiesProvider({
  discovered,
  children,
}: {
  discovered: readonly DynamicContentSourceCapability[];
  children: ReactNode;
}) {
  const capabilities = useMemo(() => {
    const byKey = new Map<string, DynamicContentSourceCapability>();
    [...DYNAMIC_CONTENT_SOURCE_CAPABILITIES, ...discovered].forEach((capability) => byKey.set(capability.key, capability));
    return Array.from(byKey.values());
  }, [discovered]);
  return (
    <DynamicContentCapabilitiesContext.Provider value={capabilities}>
      {children}
    </DynamicContentCapabilitiesContext.Provider>
  );
}

export const useDynamicContentCapabilities = () => useContext(DynamicContentCapabilitiesContext);
