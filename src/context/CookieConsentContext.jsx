import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { consentApi } from "../lib/api";

const STORAGE_KEY = "apsicg_consent";

const DEFAULT_CONSENT = {
  necessary: true,
  analytics: false,
  marketing: false,
  updated: null,
};

const CATEGORIES = [
  {
    key: "necessary",
    label: "Nécessaires",
    description: "Indispensables au fonctionnement du site (navigation, cookie de consentement). Déposés sans consentement.",
    essential: true,
  },
  {
    key: "analytics",
    label: "Analyse & mesure",
    description: "Mesurent l'audience et l'utilisation du site pour en améliorer les performances (ex: Plausible).",
    essential: false,
  },
  {
    key: "marketing",
    label: "Marketing & réseaux sociaux",
    description: "Utilisés pour personnaliser les contenus et les publicités, notamment sur les réseaux sociaux.",
    essential: false,
  },
];

function readConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeConsent(consent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {}
}

const CookieConsentContext = createContext({
  consent: DEFAULT_CONSENT,
  hasChoice: false,
  categories: CATEGORIES,
  isAllowed: () => false,
  acceptAll: () => {},
  rejectAll: () => {},
  saveConsent: () => {},
  openManager: () => {},
});

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(DEFAULT_CONSENT);
  const [hasChoice, setHasChoice] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      const merged = { ...DEFAULT_CONSENT, ...stored, necessary: true };
      setConsent(merged);
      setHasChoice(true);
      recordConsent(merged);
    } else {
      setHasChoice(false);
    }
  }, []);

  const recordConsent = useCallback(
    (c) => {
      const payload = { categories: { analytics: c.analytics, marketing: c.marketing } };
      if (typeof window !== "undefined" && window.USER_EMAIL_FOR_CONSENT) {
        payload.email = window.USER_EMAIL_FOR_CONSENT;
      }
      consentApi
        .save(payload)
        .catch(() => {})
        .finally(() => window.USER_EMAIL_FOR_CONSENT = null);
    },
    []
  );

  const saveConsent = useCallback(
    (choices) => {
      const merged = { ...DEFAULT_CONSENT, ...choices, necessary: true, updated: new Date().toISOString() };
      writeConsent(merged);
      setConsent(merged);
      setHasChoice(true);
      setManagerOpen(false);
      recordConsent(merged);
    },
    [recordConsent]
  );

  const acceptAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  }, [saveConsent]);

  const isAllowed = useCallback((category) => Boolean(consent[category]), [consent]);

  const value = useMemo(
    () => ({
      consent,
      hasChoice,
      categories: CATEGORIES,
      isAllowed,
      acceptAll,
      rejectAll,
      saveConsent,
      openManager: () => setManagerOpen(true),
      managerOpen,
      closeManager: () => setManagerOpen(false),
    }),
    [consent, hasChoice, isAllowed, acceptAll, rejectAll, saveConsent, managerOpen]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
