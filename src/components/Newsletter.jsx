import { useState } from "react";
import { Send } from "lucide-react";
import Reveal from "./Reveal";
import { newsletterApi } from "../lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Une adresse e-mail est requise.");
    if (!consent) return setError("Le consentement est obligatoire pour recevoir la newsletter.");
    setSubmitting(true);
    newsletterApi
      .subscribe({ email, consent_newsletter: true, consent_source: "newsletter_footer" })
      .then(() => {
        setSent(true);
        setEmail("");
        setConsent(false);
        setTimeout(() => setSent(false), 4000);
      })
      .catch((err) => setError(err.message || "Inscription impossible pour le moment."))
      .finally(() => setSubmitting(false));
  };

  return (
    <section className="newsletter section" style={{ padding: "60px 0" }}>
      <div className="container newsletter-inner">
        <Reveal>
          <h2>Inscrivez-vous à notre newsletter</h2>
          <p>Recevez nos analyses, alertes de menaces et actualités de la sécurité de l'information.</p>
        </Reveal>
        <Reveal delay={120}>
          <form onSubmit={submit} aria-label="Inscription newsletter">
            <div className="newsletter-form">
              <input
                type="email"
                required
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
              <button type="submit" className="btn btn--sm" disabled={submitting}>
                <span className="btn-inner">{submitting ? "Envoi…" : "S'abonner"}</span>
                <span className="btn-arrow"><Send size={16} /></span>
              </button>
            </div>
            <label className="consent-checkbox consent-checkbox--inline">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                J'accepte de recevoir la newsletter et les alertes (RGPD).{" "}
                <a href="/politique-confidentialite" className="consent-link">Confidentialité</a>
              </span>
            </label>
            {sent && <p className="newsletter-note" style={{ color: "var(--lime-400)" }}>Merci ! Votre inscription a bien été prise en compte.</p>}
            {error && <p className="newsletter-note" style={{ color: "#fca5a5" }}>{error}</p>}
            <p className="newsletter-note">Rejoignez 2 000+ abonnés — désinscription en un clic.</p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
