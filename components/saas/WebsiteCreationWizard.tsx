"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
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
  starters,
  error,
}: {
  action: (data: FormData) => Promise<WebsiteCreationResult>;
  starters: Starter[];
  error?: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);
  const [step, setStep] = useState(1);
  const [websiteName, setWebsiteName] = useState("");
  const [type, setType] = useState("Business");
  const [starter, setStarter] = useState("modern-business");
  const [phase, setPhase] = useState<GenerationPhase>("form");
  const [progress, setProgress] = useState(12);
  const creationRequestId = useId();
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
      setPhase("error");
      return;
    }

    setProgress(100);
    setPhase("ready");
    redirectTimerRef.current = window.setTimeout(() => {
      router.replace(result.redirectTo);
    }, 700);

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
            <span>New website</span>
            <h1>Create something great.</h1>
            <p>Start with a few essentials. Everything stays editable in the Builder.</p>
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
            <div className="saas-wizard-title"><span>01 · Basics</span><h2>What are you creating?</h2></div>
            <label className="saas-auth-field"><span>Website name</span><input value={websiteName} onChange={(event) => setWebsiteName(event.target.value)} autoFocus required maxLength={100} placeholder="Acme Studio" /></label>
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
            <div className="saas-wizard-title"><span>02 · Starting point</span><h2>Choose a starter template</h2><p>Pick the closest direction—you can change every section later.</p></div>
            <div className="saas-starter-grid">
              {starters.map((item) => <label className="saas-starter-card" key={item.id}><input type="radio" name="starterPicker" value={item.id} checked={starter === item.id} onChange={() => setStarter(item.id)} /><span className={`saas-starter-preview saas-starter-preview--${item.preview.tone}`}>{item.preview.rows.map((width, index) => <i key={index} style={{ width: `${width}%` }} />)}</span><span className="saas-starter-card-copy"><strong>{item.name}</strong><small>{item.description}</small></span><span className="saas-starter-check">✓</span></label>)}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="saas-wizard-panel">
            <div className="saas-wizard-title"><span>03 · Make it yours</span><h2>Tell us about the brand</h2><p>Only the website name is required. Add whatever you have now.</p></div>
            <div className="saas-wizard-fields"><label className="saas-auth-field"><span>Company name</span><input name="companyName" maxLength={120} /></label><label className="saas-auth-field"><span>Contact person</span><input name="personName" maxLength={80} /></label><label className="saas-auth-field saas-field-wide"><span>Short description</span><textarea name="description" rows={3} maxLength={240} placeholder="What do you offer, and who is it for?" /></label><label className="saas-auth-field"><span><ImageIcon size={13} /> Logo</span><input type="file" name="logo" accept="image/*" /></label><label className="saas-auth-field"><span>Phone · optional</span><input name="phone" autoComplete="tel" /></label><label className="saas-auth-field"><span>Email · optional</span><input name="contactEmail" type="email" /></label><label className="saas-auth-field"><span>Social links · optional</span><input name="socialLinks" placeholder="Instagram, LinkedIn, Facebook..." /></label></div>
          </section>
        )}

        <footer className="saas-wizard-actions">
          <button type="button" className="saas-wizard-back" disabled={step === 1} onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> Back</button>
          {step < 3 ? <button type="button" className="saas-auth-submit" onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={16} /></button> : <button type="submit" className="saas-auth-submit" disabled={isPending || submittedRef.current}>Create Website <Sparkles size={16} /></button>}
        </footer>
      </form>

      {showGeneration && (
        <section className={`saas-generation-screen is-${phase}`} aria-live="polite">
          <span className="saas-generation-orbit">
            {phase === "error" ? <CircleAlert size={30} /> : phase === "ready" ? <Check size={32} /> : <Sparkles size={30} />}
          </span>
          <p>WebPages AI setup</p>
          <h1>{phase === "ready" ? "Your website is ready" : phase === "error" ? "We couldn’t create your website" : "Creating your website..."}</h1>
          <p>{phase === "error" && result && !result.ok ? result.error : phase === "ready" ? "Everything is saved. Opening your Builder now." : "We’re assembling your header, navigation, starter pages, content, and footer."}</p>
          <div className="saas-generation-progress"><i style={{ width: `${progress}%` }} /></div>
          {phase === "error" ? (
            <button type="button" className="saas-auth-submit saas-generation-retry" onClick={retryCreation} disabled={isPending}><RotateCcw size={16} /> Retry</button>
          ) : (
            <ul><li><Check size={15} /> Brand foundation</li><li><Check size={15} /> Responsive page layouts</li><li>{phase === "ready" ? <Check size={15} /> : <Sparkles size={15} />} {phase === "ready" ? "Website data saved" : "Opening your Builder"}</li></ul>
          )}
        </section>
      )}
    </div>
  );
}
