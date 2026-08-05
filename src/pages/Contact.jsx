import { useState } from "react";
import { Send } from "lucide-react";
import Reveal from "../components/Reveal";
import PageHero from "../components/PageHero";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";
import { contactApi } from "../lib/api";

export default function Contact() {
  const { content: { COMPANY, IMAGES, CONTACT_CARDS } } = useContent();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", consent_contact: false, consent_newsletter: false });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ type: "err", text: "Merci de remplir tous les champs obligatoires." });
      return;
    }
    if (!form.consent_contact) {
      setStatus({ type: "err", text: "Le consentement au traitement de votre message est obligatoire." });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    contactApi
      .send(form)
      .then(() => {
        setStatus({ type: "ok", text: "Merci ! Votre message a bien été envoyé. Nous vous répondrons sous 24h." });
        setForm({ name: "", email: "", subject: "", message: "", consent_contact: false, consent_newsletter: false });
      })
      .catch((err) => {
        setStatus({ type: "err", text: err.message || "Envoi impossible pour le moment. Réessayez plus tard." });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <PageHero
        title={<>Contactez-<em>nous</em></>}
        crumbs={[{ label: "Contact" }]}
        image={IMAGES.heroContact}
      />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-cards">
            {CONTACT_CARDS.map((c, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="contact-card">
                  <span className="feature-icon"><c.icon size={24} strokeWidth={1.8} /></span>
                  <div>
                    <h3>{c.title}</h3>
                    {c.lines.map((l, j) =>
                      c.href && j === 0 ? (
                        <p key={j}><a href={c.href}>{l}</a></p>
                      ) : (
                        <p key={j}>{l}</p>
                      )
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={320}>
              <div className="service-cta-card">
                <h3>Urgence sécurité ?</h3>
                <p>Nos experts sont disponibles 24h/24 et 7j/7 pour répondre aux incidents critiques.</p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="form-card">
              <h3>Envoyez-nous un message</h3>
              <p>Remplissez le formulaire ci-dessous, nous vous répondrons rapidement.</p>
              {status && (
                <div className={`form-status form-status--${status.type}`}>{status.text}</div>
              )}
              <form onSubmit={submit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Nom complet *</label>
                    <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Votre nom" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">E-mail *</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@entreprise.cg" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Sujet</label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">Choisissez un sujet…</option>
                    <option>Demande d'audit de sécurité</option>
                    <option>Test d'intrusion (Pentest)</option>
                    <option>Formation & sensibilisation</option>
                    <option>Adhésion à l'association</option>
                    <option>Intervention d'urgence</option>
                    <option>Autre demande</option>
                  </select>
                </div>
                 <div className="form-group">
                   <label htmlFor="message">Votre message *</label>
                   <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Décrivez votre besoin…" required />
                 </div>
                 <div className="consent-checkboxes">
                   <label className="consent-checkbox">
                     <input
                       type="checkbox"
                       name="consent_contact"
                       checked={form.consent_contact}
                       onChange={handleChange}
                       required
                     />
                     <span>
                       J'accepte que mes données soient traitées pour répondre à ma demande (champ obligatoire).
                       <a href="/politique-confidentialite" className="consent-link"> En savoir plus</a>
                     </span>
                   </label>
                   <label className="consent-checkbox">
                     <input
                       type="checkbox"
                       name="consent_newsletter"
                       checked={form.consent_newsletter}
                       onChange={handleChange}
                     />
                     <span>Je souhaite m'inscrire à la newsletter APSI-CG (désinscription possible à tout moment).</span>
                   </label>
                 </div>
                 <button type="submit" className="btn btn--block" disabled={submitting}>
                   <span className="btn-inner">{submitting ? "Envoi…" : "Envoyer le message"}</span>
                   <span className="btn-arrow"><Send size={17} /></span>
                 </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="map-frame">
              <iframe
                title="Localisation APSI-CG — Brazzaville"
                src={IMAGES.contactMap}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
