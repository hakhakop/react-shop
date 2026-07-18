"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, Globe2, Mail, Rocket, ShieldCheck, X } from "lucide-react";

type PublishPackage = { id: string; name: string; description: string; priceText: string; type: string; features: string[] };

export default function PublishFlowDialog({ open, onClose, onComplete, websiteId, websiteSlug, websiteName, packages }: { open: boolean; onClose: () => void; onComplete: () => Promise<void>; websiteId: string; websiteSlug: string; websiteName: string; packages: PublishPackage[] }) {
  const [step, setStep] = useState(1);
  const [packageId, setPackageId] = useState(packages[0]?.id ?? "");
  const [domainMode, setDomainMode] = useState("subdomain");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const selected = useMemo(() => packages.find((item) => item.id === packageId), [packageId, packages]);
  if (!open) return null;

  async function finish() {
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`/api/websites/${websiteId}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId, domainMode, domain, professionalEmail: email }) });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not complete publishing.");
      await onComplete(); setDone(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not complete publishing."); }
    finally { setSubmitting(false); }
  }

  const domainLabel = domainMode === "subdomain" ? `${websiteSlug}.webpages.am` : domain || "Your custom domain";
  return <div className="publish-flow-backdrop" role="presentation"><section className="publish-flow-dialog" role="dialog" aria-modal="true" aria-label="Publish website">
    <header><div><span className="publish-flow-kicker"><Rocket size={14} /> Launch {websiteName}</span><h2>{done ? "Your website is ready for the world." : ["Choose a plan", "Choose your domain", "Professional email", "Review & payment"][step - 1]}</h2></div><button type="button" onClick={onClose} aria-label="Close"><X size={19} /></button></header>
    {!done && <div className="publish-flow-progress">{[1,2,3,4].map((item) => <span key={item} className={step >= item ? "is-active" : ""}><i>{step > item ? <Check size={12} /> : item}</i><small>{["Plan","Domain","Email","Payment"][item - 1]}</small></span>)}</div>}

    {done ? <div className="publish-flow-success"><span><Rocket size={34} /></span><h3>Published successfully</h3><p>Your site is live at <strong>{domainLabel}</strong>. You can keep editing and publish updates anytime.</p><a href={`https://${domainLabel}`} target="_blank" rel="noreferrer">Visit website <ArrowRight size={16} /></a></div> : <div className="publish-flow-body">
      {step === 1 && <div className="publish-plan-grid">{packages.map((item) => <button type="button" key={item.id} className={packageId === item.id ? "is-selected" : ""} onClick={() => setPackageId(item.id)}><span>{item.type}</span><h3>{item.name}</h3><strong>{item.priceText}</strong><p>{item.description}</p><ul>{item.features.slice(0,4).map((feature) => <li key={feature}><Check size={13} /> {feature.replace(/^✅\s*/, "")}</li>)}</ul></button>)}</div>}
      {step === 2 && <div className="publish-option-list">{[{ id:"subdomain", title:`${websiteSlug}.webpages.am`, text:"Fastest option · included with every plan", icon:Globe2 },{ id:"connect", title:"Connect an existing domain", text:"Use a domain you already own", icon:ShieldCheck },{ id:"register", title:"Register a new domain", text:"Choose a new address for your brand", icon:Globe2 }].map((item) => { const Icon=item.icon; return <label key={item.id} className={domainMode === item.id ? "is-selected" : ""}><input type="radio" checked={domainMode === item.id} onChange={() => setDomainMode(item.id)} /><Icon size={20} /><span><strong>{item.title}</strong><small>{item.text}</small></span></label>})}{domainMode !== "subdomain" && <label className="publish-text-field"><span>{domainMode === "connect" ? "Your existing domain" : "Domain you’d like"}</span><input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourbrand.com" /></label>}</div>}
      {step === 3 && <div className="publish-email-step"><span><Mail size={28} /></span><h3>Look professional from day one.</h3><p>Add an address such as hello@{domainLabel}. This is optional and can be configured later.</p><label className="publish-text-field"><span>Business email address · optional</span><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`hello@${domainLabel}`} /></label><small>No email selected? Just continue—your website launch won’t be delayed.</small></div>}
      {step === 4 && <div className="publish-payment-grid"><div className="publish-order-summary"><span>Order summary</span><h3>{selected?.name}</h3><p>{selected?.priceText}</p><dl><div><dt>Domain</dt><dd>{domainLabel}</dd></div><div><dt>Professional email</dt><dd>{email || "Not added"}</dd></div></dl></div><div className="publish-card-form"><span><CreditCard size={16} /> Secure payment preview</span><label className="publish-text-field"><span>Name on card</span><input defaultValue="Demo Customer" required /></label><label className="publish-text-field"><span>Card number</span><input defaultValue="4242 4242 4242 4242" inputMode="numeric" required /></label><div><label className="publish-text-field"><span>Expiry</span><input defaultValue="12/30" /></label><label className="publish-text-field"><span>CVC</span><input defaultValue="123" /></label></div><small>This is a demonstration. No payment will be charged.</small></div></div>}
      {error && <p className="saas-auth-error">{error}</p>}
    </div>}
    {!done && <footer><button type="button" onClick={() => step === 1 ? onClose() : setStep(step - 1)}><ArrowLeft size={16} /> {step === 1 ? "Cancel" : "Back"}</button><button type="button" className="is-primary" disabled={submitting || !packageId || (step === 2 && domainMode !== "subdomain" && !domain.trim())} onClick={() => step < 4 ? setStep(step + 1) : void finish()}>{submitting ? "Publishing..." : step === 4 ? "Pay & Publish" : step === 3 && !email ? "Skip & Continue" : "Continue"} <ArrowRight size={16} /></button></footer>}
  </section></div>;
}
