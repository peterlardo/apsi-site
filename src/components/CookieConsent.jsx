import { useState, useEffect } from "react";
import { useCookieConsent } from "../context/CookieConsentContext";

export default function CookieConsent() {
  const { consent, hasChoice, categories, acceptAll, rejectAll, saveConsent, openManager, managerOpen, closeManager } = useCookieConsent();
  const [draft, setDraft] = useState(consent);

  useEffect(() => {
    const handler = () => openManager();
    window.addEventListener("open-cookie-manager", handler);
    return () => window.removeEventListener("open-cookie-manager", handler);
  }, [openManager]);

  if (hasChoice && !managerOpen) return null;

  const renderManager = () => (
    <div className="consent-panel">
      <div className="consent-panel__backdrop" onClick={closeManager} />
      <div className="consent-panel__content" role="dialog" aria-labelledby="consent-title" aria-modal="true">
        <div className="consent-panel__head">
          <h2 id="consent-title">Gestion de vos choix de cookies</h2>
          <p className="consent-panel__sub">
            Nous utilisons des cookies et technologies similaires pour mesurer l'audience et personnaliser
            la publicité. Vous pouvez choisir ce qui vous convient.
          </p>
        </div>

        <div className="consent-cats">
          {categories.map((c) => {
            const checked = c.essential ? true : Boolean(draft[c.key]);
            return (
              <label key={c.key} className={`consent-cat ${c.essential ? "essential" : ""}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={c.essential}
                  onChange={(e) => {
                    if (c.essential) return;
                    setDraft({ ...draft, [c.key]: e.target.checked });
                  }}
                />
                <span className="consent-cat__label">
                  <strong>{c.label}</strong>
                  {c.essential && <span className="consent-badge">Toujours activé</span>}
                </span>
                <p className="consent-cat__desc">{c.description}</p>
              </label>
            );
          })}
        </div>

        <div className="consent-panel__foot">
          <div className="consent-panel__actions">
            <button className="btn btn--sm btn--outline" onClick={() => { setDraft({ necessary: true, analytics: false, marketing: false }); }}>Tout refuser</button>
            <button className="btn btn--sm btn--outline" onClick={() => { setDraft({ necessary: true, analytics: true, marketing: true }); }}>Tout accepter</button>
            <button
              className="btn btn--sm"
              onClick={() => saveConsent({ ...draft, necessary: true })}
            >
              Enregistrer mes choix
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (managerOpen) return renderManager();

  return (
    <div className={`cookie-banner ${hasChoice ? "cookie-banner--hidden" : ""} `} aria-live="polite">
      <div className="cookie-banner__inner container">
        <div className="cookie-banner__text">
          <span className="cookie-banner__icon">🍪</span>
          <p>
            Nous utilisons des cookies nécessaires au fonctionnement du site ainsi que des cookies de mesure
            d'audience et de publicité, conformément à notre{" "}
            <a href="/cookies" className="underline">politique Cookies</a> et{" "}
            <a href="/politique-confidentialite" className="underline">confidentialité</a>.
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button className="btn btn--sm" onClick={acceptAll}>Tout accepter</button>
          <button className="btn btn--sm btn--outline" onClick={rejectAll}>Tout refuser</button>
          <button className="btn btn--sm btn--outline" onClick={openManager}>Gérer</button>
        </div>
      </div>
    </div>
  );
}
