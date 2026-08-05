import { BarChart2, Target, ShieldCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CookieConsent from "../components/CookieConsent";
import { useCookieConsent } from "../context/CookieConsentContext";

const COOKIES = [
  {
    name: "apsicg_consent",
    provider: "APSI-CG",
    purpose: "Mémoriser votre choix de consentement aux cookies.",
    type: "Nécessaire",
    duration: "1 an",
    icon: ShieldCheck,
  },
  {
    name: "plausible_ignore",
    provider: "Plausible Analytics",
    purpose: "Mesure d'audience anonyme (exemption de cookie de suivi).",
    type: "Analyse",
    duration: "2 ans",
    icon: BarChart2,
  },
  {
    name: "_ga / _gid (facultatif)",
    provider: "Google",
    purpose: "Publicités personnalisées et mesure d'audience (sous consentement).",
    type: "Marketing",
    duration: "2 ans / 24h",
    icon: Target,
  },
];

export default function Cookies() {
  const { acceptAll, rejectAll, saveConsent, consent, categories } = useCookieConsent();
  return (
    <>
      <PageHero title={<>Gestion des <em> Cookies</em></>} crumbs={[{ label: "Cookies" }]} />
      <section className="section">
        <div className="container legal-content">
          <Reveal>
            <p className="lead">
              APSI-CG ne diffuse pas de publicité comportementale. Pour mesurer l'audience de son site et
              améliorer l'expérience utilisateur, elle utilise Plausible Analytics, un service exempté de
              consentement lorsqu'il anonymise l'adresse IP. Aucun cookie de suivi n'est déposé sans votre
              consentement explicite.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2>Cookies déposés sur ce site</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie</th>
                  <th>Finalité</th>
                  <th>Catégorie</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                {COOKIES.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <span className="cookie-row">
                        {(() => {
                          const Icon = c.icon;
                          return <Icon size={16} className="text-teal-700 flex-shrink-0" />;
                        })()}
                        <code>{c.name}</code>
                      </span>
                    </td>
                    <td>{c.purpose}</td>
                    <td>{c.type}</td>
                    <td>{c.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal delay={160}>
            <h2>Gérer vos préférences</h2>
            <p>
              Vous pouvez à tout moment modifier votre choix. Le choix "Analyse" active la mesure
              d'audience ; le choix "Marketing" autorise les cookies de publicité. Le choix "Nécessaires"
              est toujours actif car indispensable au fonctionnement du site.
            </p>
            <div className="consent-manager">
              <div className="consent-manager__grid">
                {categories.map((c) => (
                  <div key={c.key} className="consent-manager__cat">
                    <label>
                      <input
                        type="checkbox"
                        checked={c.essential ? true : Boolean(consent[c.key])}
                        disabled={c.essential}
                        onChange={(e) =>
                          saveConsent({ ...consent, [c.key]: e.target.checked })
                        }
                      />
                      <span>
                        {c.label} {c.essential && <span className="consent-badge">Toujours activé</span>}
                      </span>
                    </label>
                    <p className="consent-manager__desc">{c.description}</p>
                  </div>
                ))}
              </div>
              <div className="consent-manager__actions">
                <button className="btn btn--sm btn--outline" onClick={rejectAll}>Tout refuser</button>
                <button className="btn btn--sm" onClick={acceptAll}>Tout accepter</button>
              </div>
            </div>
            <CookieConsent />
          </Reveal>

          <Reveal delay={240}>
            <h2>Vos droits sur les données de navigation</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement
              relatifs aux données de navigation. Adressez votre demande au DPD à{" "}
              <a href="mailto:dpo@apsi-cg.org">dpo@apsi-cg.org</a>.
            </p>
            <p>
              Pour en savoir plus : <a href="/politique-confidentialite">Politique de confidentialité</a>.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
