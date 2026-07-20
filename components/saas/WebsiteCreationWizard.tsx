"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleAlert,
  FileText,
  Globe2,
  Image as ImageIcon,
  PenTool,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";

type WebsiteCreationResult =
  | { ok: true; websiteId: string; websiteSlug: string; redirectTo: string }
  | { ok: false; error: string };

type Starter = {
  id: string;
  name: string;
  description: string;
  preview: { tone: string; rows: readonly number[] };
};

type GenerationPhase = "form" | "creating" | "ready" | "error";

const initialResult: WebsiteCreationResult | null = null;
const websiteTypes = [
  { name: "Business", icon: BriefcaseBusiness, starter: "modern-business" },
  { name: "Online Store", icon: ShoppingBag, starter: "modern-business" },
  { name: "Portfolio", icon: PenTool, starter: "creative-agency" },
  { name: "Restaurant", icon: Utensils, starter: "local-services" },
  { name: "Blog", icon: FileText, starter: "creative-agency" },
  { name: "Blank", icon: Globe2, starter: "blank" },
];

export default function WebsiteCreationWizard({
  action,
  creationRequestId,
  starters,
  error,
}: {
  action: (data: FormData) => Promise<WebsiteCreationResult>;
  creationRequestId: string;
  starters: Starter[];
  error?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);
  const [step, setStep] = useState(1);
  const [websiteName, setWebsiteName] = useState("");
  const [type, setType] = useState("Business");
  const [starter, setStarter] = useState("modern-business");
  const [phase, setPhase] = useState<GenerationPhase>("form");
  const [progress, setProgress] = useState(12);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, formAction, isPending] = useActionState(
    async (_previous: WebsiteCreationResult | null, formData: FormData) =>
      action(formData),
    initialResult,
  );

  useEffect(() => {
    if (phase !== "creating") return;
    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(94, value + Math.ceil((96 - value) / 5)));
    }, 420);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (!result) return;
    if (!result.ok) {
      submittedRef.current = false;
      setHasSubmitted(false);
      setPhase("error");
      return;
    }

    setProgress(100);
    setPhase("ready");
    redirectTimerRef.current = window.setTimeout(() => {
      router.replace(result.redirectTo);
    }, 1000);

    return () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [result, router]);

  useEffect(
    () => () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (submittedRef.current || isPending) {
      event.preventDefault();
      return;
    }
    submittedRef.current = true;
    setHasSubmitted(true);
    setProgress(12);
    setPhase("creating");
  }

  function retryCreation() {
    if (submittedRef.current || isPending) return;
    formRef.current?.requestSubmit();
  }

  const showGeneration = phase !== "form";

  return (
    <div className="saas-create-wizard-stage">
      <form
        ref={formRef}
        action={formAction}
        className="saas-create-wizard"
        onSubmit={handleSubmit}
        hidden={showGeneration}
        aria-hidden={showGeneration}
      >
        <input type="hidden" name="creationRequestId" value={creationRequestId} />
        <input type="hidden" name="name" value={websiteName} />
        <input type="hidden" name="websiteCategory" value={type} />
        <input type="hidden" name="starterId" value={starter} />
        <header className="saas-create-wizard-head">
          <div>
            <span>{t("wizard.newWebsite")}</span>
            <h1>{t("wizard.heading")}</h1>
            <p>{t("wizard.description")}</p>
          </div>
          <div className="saas-create-steps">
            {[1, 2, 3].map((item) => (
              <span key={item} className={step >= item ? "is-active" : ""}>{item}</span>
            ))}
          </div>
        </header>

        {error && <p className="saas-auth-error">{error}</p>}

        {step === 1 && (
          <section className="saas-wizard-panel">
            <div className="saas-wizard-title"><span>{t("wizard.basics")}</span><h2>{t("wizard.whatCreating")}</h2></div>
            <label className="saas-auth-field"><span>{t("wizard.websiteName")}</span><input value={websiteName} onChange={(event) => setWebsiteName(event.target.value)} autoFocus required maxLength={100} placeholder="Acme Studio" /></label>
            <div className="saas-type-grid">
              {websiteTypes.map((item) => {
                const Icon = item.icon;
                return <button type="button" key={item.name} className={type === item.name ? "is-selected" : ""} onClick={() => { setType(item.name); setStarter(item.starter); }}><Icon size={21} /><strong>{item.name}</strong>{type === item.name && <Check size={15} />}</button>;
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="saas-wizard-panel">
            <div className="saas-wizard-title"><span>{t("wizard.startingPoint")}</span><h2>{t("wizard.chooseStarter")}</h2><p>{t("wizard.starterDescription")}</p></div>
            <div className="saas-starter-grid">
              {starters.map((item) => <label className="saas-starter-card" key={item.id}><input type="radio" name="starterPicker" value={item.id} checked={starter === item.id} onChange={() => setStarter(item.id)} /><span className={`saas-starter-preview saas-starter-preview--${item.preview.tone}`}>{item.preview.rows.map((width, index) => <i key={index} style={{ width: `${width}%` }} />)}</span><span className="saas-starter-card-copy"><strong>{item.name}</strong><small>{item.description}</small></span><span className="saas-starter-check">✓</span></label>)}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="saas-wizard-panel">
            <div className="saas-wizard-title"><span>{t("wizard.makeItYours")}</span><h2>{t("wizard.brandHeading")}</h2><p>{t("wizard.brandDescription")}</p></div>
            <div className="saas-wizard-fields"><label className="saas-auth-field"><span>{t("wizard.companyName")}</span><input name="companyName" maxLength={120} /></label><label className="saas-auth-field"><span>{t("wizard.contactPerson")}</span><input name="personName" maxLength={80} /></label><label className="saas-auth-field saas-field-wide"><span>{t("wizard.shortDescription")}</span><textarea name="description" rows={3} maxLength={240} placeholder={t("wizard.shortDescriptionPlaceholder")} /></label><label className="saas-auth-field"><span><ImageIcon size={13} /> {t("wizard.logo")}</span><input type="file" name="logo" accept="image/*" /></label><label className="saas-auth-field"><span>{t("wizard.optionalPhone")}</span><input name="phone" autoComplete="tel" /></label><label className="saas-auth-field"><span>{t("wizard.optionalEmail")}</span><input name="contactEmail" type="email" /></label><label className="saas-auth-field"><span>{t("wizard.optionalSocialLinks")}</span><input name="socialLinks" placeholder={t("wizard.socialPlaceholder")} /></label></div>
          </section>
        )}

        <footer className="saas-wizard-actions">
          <button type="button" className="saas-wizard-back" disabled={step === 1} onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> {t("wizard.back")}</button>
          {step < 3 ? <button type="button" className="saas-auth-submit" onClick={() => setStep((value) => value + 1)}>{t("wizard.continue")} <ArrowRight size={16} /></button> : <button type="submit" className="saas-auth-submit" disabled={isPending || hasSubmitted}>{t("wizard.createWebsite")} <Sparkles size={16} /></button>}
        </footer>
      </form>

      {showGeneration && (
        <section className={`saas-generation-screen is-${phase}`} aria-live="polite">
          <span className="saas-generation-orbit">
            {phase === "error" ? <CircleAlert size={30} /> : phase === "ready" ? <Check size={32} /> : <Sparkles size={30} />}
          </span>
          <p>{t("wizard.aiSetup")}</p>
          <h1>{phase === "ready" ? t("wizard.readyTitle") : phase === "error" ? t("wizard.errorTitle") : t("wizard.creatingTitle")}</h1>
          <p>{phase === "error" && result && !result.ok ? result.error : phase === "ready" ? t("wizard.readyDescription") : t("wizard.creatingDescription")}</p>
          <div className="saas-generation-progress"><i style={{ width: `${progress}%` }} /></div>
          {phase === "error" ? (
            <button type="button" className="saas-auth-submit saas-generation-retry" onClick={retryCreation} disabled={isPending}><RotateCcw size={16} /> {t("wizard.retry")}</button>
          ) : (
            <ul><li><Check size={15} /> {t("wizard.brandFoundation")}</li><li><Check size={15} /> {t("wizard.responsiveLayouts")}</li><li>{phase === "ready" ? <Check size={15} /> : <Sparkles size={15} />} {phase === "ready" ? t("wizard.websiteDataSaved") : t("wizard.openingBuilder")}</li></ul>
          )}
        </section>
      )}
    </div>
  );
}
