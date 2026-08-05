import {
  Award,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  CloudCog,
  FileSearch,
  GraduationCap,
  Laptop,
  Lock,
  Network,
  ShieldCheck,
  Siren,
} from "lucide-react";

export const TRAININGS_PER_PAGE = 8;
export const FILTER_ALL = "Tous";

export const ICON_MAP = {
  Award,
  BookOpenCheck,
  Bug,
  CheckCircle2,
  CloudCog,
  FileSearch,
  GraduationCap,
  Laptop,
  Lock,
  Network,
  ShieldCheck,
  Siren,
};

export const FALLBACK_TRAININGS = [
  {
    slug: "fondamentaux-cybersecurite",
    icon: "ShieldCheck",
    title: "Fondamentaux de la cybersécurité",
    category: "Sensibilisation",
    level: "Débutant",
    format: "Présentiel",
    duration: "2 jours",
    next_session: "Session mensuelle",
    description: "Comprendre les menaces, vulnérabilités, contrôles de base et bonnes pratiques de protection des systèmes d'information.",
  },
  {
    slug: "iso-27001-lead-implementer",
    icon: "Lock",
    title: "ISO 27001 Lead Implementer",
    category: "Gouvernance",
    level: "Avancé",
    format: "Hybride",
    duration: "5 jours",
    next_session: "Sur inscription",
    description: "Structurer un SMSI, conduire l'analyse de risques, produire les livrables clés et préparer l'organisation à la certification.",
  },
  {
    slug: "audit-securite-si",
    icon: "FileSearch",
    title: "Audit de sécurité SI",
    category: "Audit",
    level: "Intermédiaire",
    format: "Présentiel",
    duration: "3 jours",
    next_session: "Trimestrielle",
    description: "Préparer une mission d'audit, collecter les preuves, qualifier les écarts et restituer un rapport exploitable par la direction.",
  },
  {
    slug: "test-intrusion-web",
    icon: "Bug",
    title: "Test d'intrusion web",
    category: "Technique",
    level: "Avancé",
    format: "Atelier",
    duration: "4 jours",
    next_session: "Sur inscription",
    description: "Méthodologie de pentest applicatif, OWASP Top 10, exploitation contrôlée, priorisation des vulnérabilités et remédiation.",
  },
  {
    slug: "securite-reseau-entreprise",
    icon: "Network",
    title: "Sécurité réseau d'entreprise",
    category: "Technique",
    level: "Intermédiaire",
    format: "Présentiel",
    duration: "3 jours",
    next_session: "Bimestrielle",
    description: "Segmentation, pare-feu, durcissement, supervision, VPN et contrôle des accès sur les architectures réseau critiques.",
  },
  {
    slug: "securite-cloud-devsecops",
    icon: "CloudCog",
    title: "Sécurité cloud & DevSecOps",
    category: "Cloud",
    level: "Intermédiaire",
    format: "Hybride",
    duration: "3 jours",
    next_session: "Sur inscription",
    description: "Sécuriser les environnements cloud, les pipelines CI/CD, les conteneurs, les secrets et les déploiements applicatifs.",
  },
  {
    slug: "reponse-incidents-gestion-crise",
    icon: "Siren",
    title: "Réponse aux incidents & gestion de crise",
    category: "SOC & Incident",
    level: "Intermédiaire",
    format: "Atelier",
    duration: "2 jours",
    next_session: "Mensuelle",
    description: "Préparer les procédures, qualifier un incident, coordonner les équipes, communiquer en crise et capitaliser après l'événement.",
  },
  {
    slug: "soc-analyst-niveau-1",
    icon: "Laptop",
    title: "SOC analyst niveau 1",
    category: "SOC & Incident",
    level: "Débutant",
    format: "Atelier",
    duration: "4 jours",
    next_session: "Sur inscription",
    description: "Lire les alertes, enrichir les événements, appliquer les playbooks, escalader les cas et suivre les indicateurs opérationnels.",
  },
  {
    slug: "protection-donnees-conformite-rgpd",
    icon: "BookOpenCheck",
    title: "Protection des données & conformité RGPD",
    category: "Conformité",
    level: "Débutant",
    format: "En ligne",
    duration: "2 jours",
    next_session: "Mensuelle",
    description: "Cartographier les traitements, gérer les bases légales, organiser les droits des personnes et préparer la documentation conformité.",
  },
  {
    slug: "preparation-ceh",
    icon: "Award",
    title: "Préparation CEH",
    category: "Certification",
    level: "Avancé",
    format: "Hybride",
    duration: "5 jours",
    next_session: "Sur inscription",
    description: "Réviser les domaines clés de l'ethical hacking, consolider la pratique labo et préparer un plan de passage de certification.",
  },
  {
    slug: "sensibilisation-phishing-hygiene-numerique",
    icon: "GraduationCap",
    title: "Sensibilisation phishing & hygiène numérique",
    category: "Sensibilisation",
    level: "Débutant",
    format: "En ligne",
    duration: "1 jour",
    next_session: "À la demande",
    description: "Réduire les risques humains avec des réflexes concrets : phishing, mots de passe, MFA, données sensibles et signalement.",
  },
  {
    slug: "gestion-risques-cyber",
    icon: "CheckCircle2",
    title: "Gestion des risques cyber",
    category: "Gouvernance",
    level: "Intermédiaire",
    format: "Présentiel",
    duration: "3 jours",
    next_session: "Trimestrielle",
    description: "Identifier les actifs, évaluer les scénarios de risque, définir les mesures de traitement et suivre un tableau de bord cyber.",
  },
];

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110) || "formation";
}

function normalizeProgram(program) {
  if (Array.isArray(program)) return program;
  if (typeof program !== "string" || !program.trim()) return [];

  try {
    const parsed = JSON.parse(program);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Treat non-JSON strings as a simple line-based program.
  }

  return program
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => ({ title: `Module ${index + 1}`, items: [line] }));
}

export function normalizeTraining(training, index = 0) {
  const iconName = training.icon || "GraduationCap";
  const title = training.title || "Formation APSI-CG";

  return {
    id: training.id ?? training.slug ?? `fallback-${index}`,
    slug: training.slug || slugify(title),
    icon: ICON_MAP[iconName] || GraduationCap,
    iconName,
    title,
    category: training.category || "Général",
    level: training.level || "Tous niveaux",
    format: training.format || "Présentiel",
    duration: training.duration || "À définir",
    nextSession: training.next_session || training.nextSession || "Sur inscription",
    text: training.description || training.text || "",
    program: normalizeProgram(training.program),
    databaseId: Number.isFinite(Number(training.id)) ? Number(training.id) : null,
  };
}

export const FALLBACK_CATALOG = FALLBACK_TRAININGS.map(normalizeTraining);

export const trainingKey = (training) => String(training?.id ?? training?.slug ?? training?.title ?? "");

export const uniqueValues = (items, key) => [
  FILTER_ALL,
  ...new Set(items.map((item) => item[key]).filter(Boolean)),
];

export function getTrainingProgram(training) {
  if (training?.program?.length) return training.program;

  return [
    {
      title: "Module 1 - Cadrage et fondamentaux",
      items: [
        `Comprendre les objectifs de la formation ${training.title}.`,
        "Identifier les risques, les acteurs et les enjeux métier associés.",
        "Aligner le vocabulaire et les prérequis avant la pratique.",
      ],
    },
    {
      title: "Module 2 - Méthodes et cas pratiques",
      items: [
        `Appliquer les méthodes clés du domaine ${training.category.toLowerCase()}.`,
        "Travailler sur des scénarios réalistes issus d'environnements professionnels.",
        "Produire des livrables simples : checklist, plan d'action ou rapport synthétique.",
      ],
    },
    {
      title: "Module 3 - Atelier encadré",
      items: [
        "Mettre en pratique les notions sur un exercice guidé.",
        "Analyser les résultats et corriger les erreurs fréquentes.",
        "Préparer les bonnes pratiques à appliquer en entreprise ou en institution.",
      ],
    },
    {
      title: "Module 4 - Évaluation et plan de progression",
      items: [
        "Valider les acquis avec une restitution ou un quiz de synthèse.",
        "Identifier les prochaines compétences à renforcer.",
        "Recevoir des recommandations pour poursuivre la montée en compétence.",
      ],
    },
  ];
}