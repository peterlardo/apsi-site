import { ShieldCheck, Mail, MapPin, Phone, Globe } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { useContent } from "../context/ContentContext";

export default function MentionsLegales() {
  const { content: { COMPANY, CONTACT_CARDS } } = useContent();
  return (
    <>
      <PageHero title={<>Mentions <em>légales</em></>} crumbs={[{ label: "Mentions légales" }]} />
      <section className="section">
        <div className="container legal-content">
          <Reveal>
            <p className="lead">
              Les présentes mentions légales encadrent l'accès et l'utilisation du site apsi-cg.org. Elles
              sont régies par le droit congolais et, en matière de protection des données à caractère
              personnel, par le RGPD (UE 2016/679).
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2>Éditeur du site</h2>
            <table className="legal-table">
              <tbody>
                <tr><th>Raison sociale</th><td>{COMPANY.fullName}</td></tr>
                <tr><th>Forme juridique</th><td>Association déclarée enregistrement N° … au registre du commerce et du crédit moblier de Brazzaville</td></tr>
                <tr><th>Siège social</th><td>{COMPANY.address}, {COMPANY.city}</td></tr>
                <tr><th>Téléphone</th><td>{COMPANY.phone}</td></tr>
                <tr><th>E-mail</th><td><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></td></tr>
                <tr><th>Représentant légal</th><td>Murphy SEMO — Président</td></tr>
                <tr><th>N° d'identification (RCS)</th><td>En cours d'immatriculation — numéro communiqué sur demande</td></tr>
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={160}>
            <h2>Hébergeur</h2>
            <table className="legal-table">
              <tbody>
                <tr><th>Hébergeur</th><td>OVHcloud — Siège social : 2 rue Kellermann, 59100 Roubaix, France</td></tr>
                <tr><th>Directeur de la publication</th><td>Murphy SEMO</td></tr>
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={240}>
            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu du site (textes, images, graphismes, logos, vidéos, structure) est la
              propriété exclusive de APSI-CG ou de ses partenaires. Toute reproduction, représentation,
              diffusion ou utilisation non autorisée est strictement interdite et constitue une
              contrefaction passible de sanctions poursuites.
            </p>
          </Reveal>

          <Reveal delay={320}>
            <h2>Cookies</h2>
            <p>
              Le site utilise des cookies nécessaires et, sous votre consentement, des cookies de mesure
              d'audience. Reportez-vous à notre{" "}
              <a href="/cookies">politique Cookies</a> pour plus d'informations.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <h2>Données personnelles</h2>
            <p>
              La collecte et le traitement des données personnelles sont décrits dans notre{" "}
              <a href="/politique-confidentialite">politique de confidentialité</a>.
            </p>
          </Reveal>

          <Reveal delay={480}>
            <h2>Responsabilité</h2>
            <p>
              APSI-CG s'efforce de garantir la disponibilité du site, mais ne peut garantir l'absence de
              dysfonctionnement ou d'interruptions. Elle ne saurait être tenue responsable des dommages
              directs ou indirects liés à l'utilisation du site.
            </p>
          </Reveal>

          <Reveal delay={560}>
            <h2>Contact du Délégué à la Protection des Données</h2>
            <div className="contact-grid-simple">
              {CONTACT_CARDS.slice(0, 2).map((c) => (
                <div key={c.title} className="contact-line">
                  <span className="feature-icon"><c.icon size={20} strokeWidth={1.8} /></span>
                  <strong>{c.title}</strong>
                  {c.lines.map((l, j) => (
                    <p key={j}>{l}</p>
                  ))}
                </div>
              ))}
              <div className="contact-line">
                <span className="feature-icon"><Mail size={20} /></span>
                <strong>E-mail du DPO</strong>
                <p><a href="mailto:dpo@apsi-cg.org">dpo@apsi-cg.org</a></p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={640}>
            <p className="legal-small">
              Mentions légales mises à jour le {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
