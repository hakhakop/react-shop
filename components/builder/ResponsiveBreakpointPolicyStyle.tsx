import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  renderResponsiveBreakpointPolicyCss,
  resolveResponsiveBreakpointPolicy,
  type ResponsiveBreakpointPolicy,
} from "@/lib/responsiveBreakpointPolicy";

type Props = {
  shellSettings?: Partial<BuilderShellSettings> | null;
  policy?: ResponsiveBreakpointPolicy;
};

/** Shared Builder/storefront bridge from Global Styles to rendered-page CSS. */
export function ResponsiveBreakpointPolicyStyle({ shellSettings, policy: suppliedPolicy }: Props) {
  const policy = suppliedPolicy ?? resolveResponsiveBreakpointPolicy(shellSettings);
  return <style
    data-responsive-breakpoint-policy={policy.id}
    dangerouslySetInnerHTML={{ __html: renderResponsiveBreakpointPolicyCss(policy) }}
  />;
}
