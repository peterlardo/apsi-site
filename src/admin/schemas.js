const textField = (key, label, extra = {}) => ({ key, label, type: "text", ...extra });
const textareaField = (key, label, extra = {}) => ({ key, label, type: "textarea", ...extra });
const numberField = (key, label, extra = {}) => ({ key, label, type: "number", ...extra });
const booleanField = (key, label, extra = {}) => ({ key, label, type: "boolean", ...extra });
const iconField = (key, label = "Icône") => ({ key, label, type: "icon" });
const urlField = (key, label, extra = {}) => ({ key, label, type: "url", ...extra });
const stringList = (itemLabel) => ({ type: "strings", itemLabel });
const objectGroup = (itemLabel, itemFields) => ({ type: "group", itemLabel, itemFields });

export const SCHEMAS = {
  company: {
    label: "Coordonnées de l'association",
    kind: "object",
    fields: [
      textField("name", "Nom court"),
      textareaField("fullName", "Nom complet"),
      textField("email", "Email"),
      textField("phone", "Téléphone 1"),
      textField("phoneAlt", "Téléphone 2"),
      textField("address", "Adresse"),
      textField("city", "Ville"),
      textField("rating", "Note affichée"),
      textField("reviews", "Nombre d'avis"),
    ],
  },
  nav_links: {
    label: "Menu de navigation",
    kind: "list",
    itemLabel: "lien",
    fields: [
      textField("label", "Libellé"),
      textField("path", "Lien (chemin)", { placeholder: "/a-propos" }),
      objectGroup("sous-lien", [textField("label", "Libellé"), textField("path", "Lien")]),
    ],
  },
  features: {
    label: "Services mis en avant (accueil)",
    kind: "list",
    itemLabel: "service",
    fields: [iconField("icon"), textField("title", "Titre"), textareaField("text", "Description")],
  },
  services: {
    label: "Services détaillés",
    kind: "list",
    itemLabel: "service",
    fields: [
      iconField("icon"),
      textField("title", "Titre"),
      textareaField("text", "Description"),
      stringList("point"),
    ],
  },
  stats: {
    label: "Chiffres clés",
    kind: "list",
    itemLabel: "chiffre",
    fields: [
      numberField("value", "Valeur"),
      textField("suffix", "Suffixe", { placeholder: "% ou +" }),
      textField("label", "Libellé"),
      numberField("decimals", "Décimales (optionnel)"),
    ],
  },
  stat_check: { label: "Points forts (accueil)", kind: "strings", itemLabel: "point" },
  skill_tags: { label: "Compétences affichées", kind: "strings", itemLabel: "compétence" },
  why_choose: {
    label: "Pourquoi nous choisir",
    kind: "list",
    itemLabel: "argument",
    fields: [iconField("icon"), textField("title", "Titre"), textareaField("text", "Description")],
  },
  process: {
    label: "Notre démarche",
    kind: "list",
    itemLabel: "étape",
    fields: [
      iconField("icon"),
      textField("title", "Titre"),
      textareaField("text", "Description"),
      stringList("point"),
    ],
  },
  quote: {
    label: "Citation du président",
    kind: "object",
    fields: [
      textareaField("text", "Citation"),
      textField("author", "Auteur"),
      textField("role", "Fonction"),
    ],
  },
  projects: {
    label: "Projets réalisés",
    kind: "list",
    itemLabel: "projet",
    fields: [
      textField("tag", "Secteur"),
      textField("title", "Titre"),
      textField("text", "Description courte"),
      iconField("icon"),
    ],
  },
  team: {
    label: "Équipe dirigeante",
    kind: "list",
    itemLabel: "membre",
    fields: [textField("name", "Nom"), textField("role", "Fonction"), urlField("img", "Photo (URL)")],
  },
  extra_team: {
    label: "Experts associés",
    kind: "list",
    itemLabel: "membre",
    fields: [textField("name", "Nom"), textField("role", "Fonction"), urlField("img", "Photo (URL)")],
  },
  brands: {
    label: "Partenaires",
    kind: "list",
    itemLabel: "partenaire",
    fields: [textField("name", "Nom"), textField("logo", "Logo (URL)", { placeholder: "/partners/xxx.png" })],
  },
  testimonials: {
    label: "Témoignages",
    kind: "list",
    itemLabel: "témoignage",
    fields: [
      textField("logo", "Entreprise"),
      textareaField("quote", "Citation"),
      textField("name", "Nom"),
      textField("role", "Fonction"),
      urlField("img", "Photo (URL)"),
      numberField("rating", "Note (1-5)"),
    ],
  },
  faqs: {
    label: "Questions fréquentes",
    kind: "list",
    itemLabel: "question",
    fields: [textareaField("q", "Question"), textareaField("a", "Réponse")],
  },
  pricing: {
    label: "Tarifs & adhésion",
    kind: "list",
    itemLabel: "offre",
    fields: [
      textField("name", "Nom de l'offre"),
      textField("price", "Prix", { placeholder: "50 000" }),
      textField("period", "Période", { placeholder: "FCFA / an" }),
      textareaField("desc", "Description"),
      objectGroup("avantage", [textField("text", "Avantage"), booleanField("included", "Inclus")]),
      booleanField("featured", "Offre mise en avant"),
    ],
  },
  images: {
    label: "Images du site",
    kind: "keyvalues",
    fields: [
      textField("key", "Clé (identifiant)"),
      urlField("value", "URL de l'image"),
    ],
  },
  member_benefits: {
    label: "Avantages membres",
    kind: "list",
    itemLabel: "avantage",
    fields: [iconField("icon"), textField("title", "Titre"), textareaField("text", "Description")],
  },
  hero_slides: { label: "Carrousel d'accueil (images)", kind: "strings", itemLabel: "image (URL)" },
  values: {
    label: "Mission, vision, valeurs",
    kind: "list",
    itemLabel: "valeur",
    fields: [iconField("icon"), textField("title", "Titre"), textareaField("text", "Description")],
  },
  trainings: {
    label: "Formations",
    kind: "list",
    itemLabel: "formation",
    fields: [iconField("icon"), textField("title", "Titre"), textareaField("text", "Description")],
  },
  commissions: {
    label: "Commissions",
    kind: "list",
    itemLabel: "commission",
    fields: [
      textField("id", "Identifiant", { placeholder: "formations-certifications" }),
      iconField("icon"),
      textField("title", "Titre"),
      textareaField("text", "Description"),
    ],
  },
  events: {
    label: "Événements",
    kind: "list",
    itemLabel: "événement",
    fields: [
      iconField("icon"),
      textField("title", "Titre"),
      textField("date", "Date / fréquence"),
      textField("place", "Lieu"),
      textareaField("text", "Description"),
    ],
  },
  contact_cards: {
    label: "Cartes de contact",
    kind: "list",
    itemLabel: "carte",
    fields: [
      iconField("icon"),
      textField("title", "Titre"),
      stringList("ligne"),
      textField("href", "Lien (optionnel)", { placeholder: "mailto:..." }),
    ],
  },
};

export const getSchema = (name) => SCHEMAS[name];

export const SECTION_LABELS = Object.fromEntries(
  Object.entries(SCHEMAS).map(([name, schema]) => [name, schema.label])
);
