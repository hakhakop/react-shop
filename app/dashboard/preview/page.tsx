import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BuilderDocumentRuntime from "@/components/builder/BuilderDocumentRuntime";
import BuilderIframeSelectionBridge from "@/components/builder/BuilderIframeSelectionBridge";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import WebPagesFontLoader from "@/components/builder/WebPagesFontLoader";
import FooterShell from "@/components/FooterShell";
import HeaderShell from "@/components/HeaderShell";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  getPublishedBuilderLayout,
  normalizeBuilderLayoutKey,
} from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getPublishedHeaderDocumentSettings } from "@/lib/publishedHeaderDocumentSettings";

export const dynamic = "force-dynamic";

type RootPreviewPageProps = {
  searchParams?: Promise<{
    page?: string;
    builderFrame?: string;
    builderBridge?: string;
  }>;
};

export default async function RootPreviewPage({ searchParams }: RootPreviewPageProps) {
  const query = await searchParams;
  const user = await getCurrentUser(await cookies());
  const requestedPage = query?.page ?? "home";
  const builderIframeSelection = query?.builderFrame === "selection";
  const builderIframeDiagnostics: "minimal" | "settled" | "rect" | "toolbar" | "full" =
    query?.builderBridge === "full"
      ? "full"
      : query?.builderBridge === "settled"
        ? "settled"
        : query?.builderBridge === "toolbar"
          ? "toolbar"
          : query?.builderBridge === "rect"
            ? "rect"
            : "minimal";

  if (!user) {
    const queryString = query?.page
      ? `?page=${encodeURIComponent(query.page)}`
      : "";
    redirect(loginRedirectFor(`/dashboard/preview${queryString}`));
  }

  const page = normalizeBuilderLayoutKey(requestedPage);
  if (page !== requestedPage && requestedPage !== "home") {
    return (
      <main className="page">
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">The requested Root Builder page is invalid.</p>
      </main>
    );
  }

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout(page),
    getBuilderShellSettings(),
  ]);
  const headerDocumentSettings = await getPublishedHeaderDocumentSettings(shellSettings);
  const languageCookie = (await cookies()).get("website_content_language_root")?.value;
  const language = ["hy", "en", "ru"].includes(languageCookie ?? "")
    ? languageCookie!
    : "hy";
  const localizedLayout = layout
    ? {
        ...layout,
        sections: resolveContentSections(
          layout.sections as never,
          language,
          "hy",
        ) as typeof layout.sections,
      }
    : null;
  const materialization = localizedLayout
    ? await materializeBuilderDynamicContent(localizedLayout)
    : null;
  const renderLayout = materialization?.renderLayout ?? localizedLayout;

  if (!renderLayout?.sections?.some((section) => section.visible)) {
    return (
      <main className="page">
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">
          This Root website does not have a published layout for this page.
        </p>
      </main>
    );
  }

  return (
    <BuilderDocumentRuntime>
      <WebPagesFontLoader settings={shellSettings} />
      {builderIframeSelection ? (
        <BuilderIframeSelectionBridge diagnostics={builderIframeDiagnostics} />
      ) : null}
      <HeaderShell
        layoutOverride={shellSettings.headerLayout}
        shellSettingsOverride={shellSettings}
        hideSaaSEntry
        builderInteractionIdentity={builderIframeDiagnostics === "full"}
      />
      <StorefrontBuilderRenderer
        layout={renderLayout}
        page={page}
        shellSettings={shellSettings}
        headerOverlay={headerDocumentSettings.overlay}
        builderInteractionIdentity={builderIframeSelection}
        documentRuntimeOwnedExternally
      />
      <FooterShell
        shellSettingsOverride={shellSettings}
        builderInteractionIdentity={builderIframeDiagnostics === "full"}
        documentRuntimeOwnedExternally
      />
    </BuilderDocumentRuntime>
  );
}
