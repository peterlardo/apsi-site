import {
  ShieldCheck,
  Bug,
  ScrollText,
  GraduationCap,
  Siren,
  CloudCog,
  Landmark,
  ShoppingCart,
  Building2,
  Factory,
  Banknote,
  FileSearch,
  LineChart,
  Rocket,
  MessageCircle,
  Scale,
  Users,
  Award,
  Search,
  Megaphone,
  Lock,
  Network,
  Handshake,
  Lightbulb,
  CalendarDays,
  Trophy,
  MapPin,
  Target,
  Eye,
  HeartHandshake,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

export const COMPANY = {
  name: "APSI-CG",
  fullName: "Association des Professionnels de la Sécurité de l'Information du Congo",
  email: "contact@apsi-cg.org",
  phone: "+242 06 123 45 67",
  phoneAlt: "+242 05 123 45 67",
  address: "Avenue Amílcar Cabral, Centre-ville",
  city: "Brazzaville, République du Congo",
  rating: "4.9",
  reviews: "5K+",
};

export const NAV_LINKS = [
  { label: "Accueil", path: "/" },
  { label: "À propos", path: "/a-propos" },
  {
    label: "Pages",
    children: [
      { label: "Nos services", path: "/services" },
      { label: "Nos projets", path: "/projets" },
      { label: "Notre équipe", path: "/equipe" },
      { label: "Tarifs & adhésion", path: "/tarifs" },
      { label: "FAQ", path: "/faq" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Nos services", path: "/services" },
      { label: "Demander un devis", path: "/contact" },
    ],
  },
  {
    label: "Blog",
    children: [
      { label: "Le blog", path: "/blog" },
      { label: "Derniers articles", path: "/blog" },
    ],
  },
  { label: "Contact", path: "/contact" },
];

export const FEATURES = [
  {
    icon: GraduationCap,
    title: "Formations et certifications",
    text: "Programmes de montée en compétence et accompagnement vers les certifications professionnelles reconnues.",
  },
  {
    icon: Search,
    title: "Veille et Recherches",
    text: "Surveillance des vulnérabilités émergentes et partage des dernières recherches entre experts.",
  },
  {
    icon: Landmark,
    title: "Plaidoyer et relations institutionnelles",
    text: "Dialogue avec les institutions publiques et privées pour structurer la cybersécurité nationale.",
  },
  {
    icon: Rocket,
    title: "Innovation et projets",
    text: "Conception et pilotage de projets innovants au service de la sécurité numérique congolaise.",
  },
  {
    icon: Scale,
    title: "Contentieux et Conformité",
    text: "Veille réglementaire (ISO 27001, NIS2, RGPD) et accompagnement des organisations vers la conformité.",
  },
  {
    icon: Megaphone,
    title: "Communication et Médias",
    text: "Campagnes de sensibilisation et animation des médias pour informer sur les risques numériques.",
  },
];

export const SERVICES = [
  {
    icon: ShieldCheck,
    title: "Audit de sécurité & conformité",
    text: "Cartographie de vos risques et mise en conformité avec les référentiels internationaux.",
    points: ["ISO 27001 & NIS2", "RGPD & protection des données", "Plan d'action priorisé"],
  },
  {
    icon: Bug,
    title: "Tests d'intrusion (Pentest)",
    text: "Simulation d'attaques contrôlées sur vos infrastructures, applications et réseaux.",
    points: ["Pentest interne & externe", "Tests d'applications web", "Rapport détaillé et remédiation"],
  },
  {
    icon: ScrollText,
    title: "Gouvernance & gestion des risques",
    text: "Structuration de votre gouvernance cybersécurité et pilotage des risques.",
    points: ["RSSI à la demande", "Politiques & procédures", "Tableaux de bord de risques"],
  },
  {
    icon: GraduationCap,
    title: "Formation & sensibilisation",
    text: "Développez une culture sécurité durable au sein de votre organisation.",
    points: ["Sensibilisation des employés", "Certifications (CEH, ISO)", "Phishing simulé"],
  },
  {
    icon: Siren,
    title: "Réponse aux incidents & SOC",
    text: "Détection, analyse et résolution rapide des incidents de sécurité.",
    points: ["Réponse 24/7", "Analyse forensique", "Supervision sécurité (SOC)"],
  },
  {
    icon: CloudCog,
    title: "Sécurité cloud & DevSecOps",
    text: "Sécurisation de vos environnements cloud et intégration de la sécurité au cycle DevOps.",
    points: ["Azure, AWS & GCP", "CI/CD sécurisé", "Sécurité des conteneurs"],
  },
];

export const STATS = [
  { value: 98, suffix: "%", label: "Taux de satisfaction clients" },
  { value: 150, suffix: "+", label: "Audits réalisés au Congo" },
  { value: 4.9, suffix: "/5", label: "Note moyenne des clients", decimals: 1 },
];

export const STAT_CHECK = [
  "Rapports d'analyse de marché",
  "Résultats de croissance mesurables",
  "Clients de confiance potentiels",
];

export const SKILL_TAGS = ["Audit", "Pentest", "Conformité", "Formation", "Conseil"];

export const WHY_CHOOSE = [
  {
    icon: Users,
    title: "Équipe professionnelle certifiée",
    text: "Des experts certifiés (CISSP, CEH, ISO 27001 Lead Auditor) qui livrent des résultats mesurables et concrets.",
  },
  {
    icon: MessageCircle,
    title: "Support dédié 24/7",
    text: "Une assistance réactive et un interlocuteur unique pour répondre à vos besoins de sécurité en continu.",
  },
  {
    icon: Scale,
    title: "Approche conforme & éthique",
    text: "Nos interventions respectent strictement les réglementations nationales et les bonnes pratiques internationales.",
  },
];

export const PROCESS = [
  {
    icon: FileSearch,
    title: "Évaluez votre exposition",
    text: "Analysez votre contexte, recueillez vos besoins et identifiez vos points faibles.",
    points: ["Consultation initiale", "Collecte des exigences"],
  },
  {
    icon: LineChart,
    title: "Planifiez la stratégie",
    text: "Élaborez des stratégies sur mesure pour une croissance durable de votre sécurité.",
    points: ["Analyse de l'existant", "Feuille de route personnalisée"],
  },
  {
    icon: Rocket,
    title: "Déployez & optimisez",
    text: "Implémentez les solutions et améliorez en continu vos performances sécurité.",
    points: ["Déploiement des mesures", "Suivi & optimisation continue"],
  },
];

export const QUOTE = {
  text: "La sécurité de l'information n'est pas un produit, c'est un processus vivant — celui qui protège votre entreprise, votre réputation et votre avenir.",
  author: "Pr. Jean-Claude Mboungou",
  role: "Président — APSI-CG",
};

export const PROJECTS = [
  {
    tag: "Secteur bancaire",
    title: "Audit de sécurité — Banque Nationale",
    text: "Audit complet des systèmes bancaires critiques",
    icon: Landmark,
  },
  {
    tag: "E-commerce",
    title: "Pentest — Plateforme de paiement",
    text: "Tests d'intrusion sur la plateforme e-paiement",
    icon: ShoppingCart,
  },
  {
    tag: "Télécommunications",
    title: "Conformité NIS2 — Opérateur mobile",
    text: "Mise en conformité réglementaire complète",
    icon: Building2,
  },
  {
    tag: "Industrie",
    title: "Sécurisation — OT & systèmes industriels",
    text: "Protection des systèmes de contrôle industriels",
    icon: Factory,
  },
];

export const TEAM = [
  {
    name: "Murphy SEMO",
    role: "Président APSI-CG",
    img: "https://www.lhorizonafricain.com/wp-content/uploads/2025/10/Murphy-Semo-1.webp",
  },
  {
    name: "André LONDE",
    role: "Vice-Président APSI-CG",
    img: "/team/londe.jpg",
  },
  {
    name: "Roch GOUAMPAKA",
    role: "Secrétaire Général APSI-CG",
    img: "/team/gouampaka.jpg",
  },
  {
    name: "Dessia SITA",
    role: "Trésorière",
    img: "/team/sita.jpg",
  },


  {
    name: "Chadly MOUKOURI",
    role: "Contrôleur Général de l'OCED",
    img: "https://i1.rgstatic.net/ii/profile.image/11431281209083880-1701614747962_Q512/Chadly-Moukouri-Ngami.jpg",
  },
  {
    name: "Rochard MAPOUKA",
    role: "Secrétaire Général de l'OCED",
    img: "/team/mapouka.svg",
  },
];

export const BRANDS = [
  { name: "ACPCE", logo: "/partners/acpce.png" },
  { name: "CARIA", logo: "/partners/caria.png" },
  { name: "ADEN", logo: "/partners/aden.png" },
  { name: "ARTF", logo: "/partners/artf.png" },
  { name: "Ministère du Commerce", logo: "/partners/commerce.png" },
  { name: "EROSIS CONSEIL", logo: "/partners/erosis.png" },
  { name: "MOUFARMA", logo: "/partners/moufarma.png" },
  { name: "NEXT EVOLUTION", logo: "/partners/nextevolution.webp" },
  { name: "LUTESSA", logo: "/partners/lutessa.png" },
  { name: "CERTI-TRUST", logo: "/partners/certitrust.png" },
  { name: "FACT CHECK CONGO", logo: "https://factcheck-congo.org/wp-content/uploads/2025/09/Sans-titre-1-1.jpg" },
];

export const TESTIMONIALS = [
  {
    logo: "Nabhan",
    quote:
      "APSI-CG a transformé notre stratégie de sécurité. Leur audit a identifié des failles critiques que nous ignorions, et leurs recommandations ont réduit nos coûts et renforcé notre résilience.",
    name: "Tomas Addision",
    role: "CEO — Banque Nationale",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    logo: "Congo Telecom",
    quote:
      "Nous recommandons vivement APSI-CG pour tout besoin de cybersécurité. Leur approche professionnelle, leur réflexion stratégique et leurs solutions concrètes nous ont convaincus.",
    name: "Jakulin Farna",
    role: "MD — Congo Telecom",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
  {
    logo: "Logitek",
    quote:
      "La formation dispensée par APSI-CG a changé la culture sécurité de nos équipes. Les résultats sont mesurables : moins d'incidents, plus de vigilance, un vrai professionnalisme.",
    name: "Donald Shaver",
    role: "CFO — Logitek",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
  },
];

export const FAQS = [
  {
    q: "Faut-il des connaissances techniques pour faire auditer son entreprise ?",
    a: "Non. Nos experts vous accompagnent pas à pas. Nous commençons toujours par comprendre votre activité et vos objectifs, puis nous traduisons les aspects techniques en recommandations claires et actionnables pour vos équipes dirigeantes.",
  },
  {
    q: "Proposez-vous des solutions de sécurité personnalisées ?",
    a: "Absolument. Chaque organisation est unique : nous construisons des feuilles de route sur mesure après une évaluation approfondie de votre contexte, de vos risques et de votre budget. Aucune solution standardisée imposée.",
  },
  {
    q: "Quels types de services de sécurité proposez-vous ?",
    a: "Audit et conformité (ISO 27001, NIS2, RGPD), tests d'intrusion, gouvernance et gestion des risques, formation et sensibilisation, réponse aux incidents, supervision SOC et sécurité cloud/DevSecOps.",
  },
  {
    q: "Quelle est la durée typique d'une mission de consulting ?",
    a: "Une mission d'audit prend généralement de 2 à 6 semaines selon la taille de l'organisation. Les accompagnements en gouvernance s'étendent sur 3 à 12 mois. Nous établissons toujours un calendrier clair dès le départ.",
  },
  {
    q: "Comment devenir membre de l'association ?",
    a: "Trois étapes simples : remplissez le formulaire d'adhésion en ligne, réglez votre cotisation annuelle, puis rejoignez notre communauté de professionnels. Vous accéderez à nos formations, événements et réseaux d'expertise.",
  },
  {
    q: "Intervenez-vous uniquement à Brazzaville ?",
    a: "Non. Nos équipes interviennent dans tout le Congo et en Afrique centrale. Nos services de supervision (SOC) et de formation en ligne sont accessibles partout où vous avez une connexion internet.",
  },
];

export const BLOG_POSTS = [
  {
    date: "12 Juillet 2026",
    category: "Cybersécurité",
    title: "Ransomware : 7 réflexes essentiels pour protéger votre entreprise",
    excerpt:
      "Les attaques par rançongiciel explosent en Afrique centrale. Découvrez les bonnes pratiques pour réduire votre exposition et réagir efficacement.",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
  },
  {
    date: "28 Juin 2026",
    category: "Réglementation",
    title: "NIS2 et entreprises congolaises : ce qui change pour vous",
    excerpt:
      "La directive NIS2 étend son champ d'application. Comprenez les obligations qui s'appliquent à votre secteur et comment vous y préparer.",
    img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
  },
  {
    date: "05 Juin 2026",
    category: "Formation",
    title: "Sensibilisation : comment la data aide vos équipes à se protéger",
    excerpt:
      "Les statistiques de phishing simulé révèlent vos points faibles humains. Comment transformer ces données en programme de formation efficace.",
    img: "https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&w=900&q=80",
  },
];

export const PRICING = [
  {
    name: "Membre Individuel",
    price: "50 000",
    period: "FCFA / an",
    desc: "Pour les professionnels souhaitant adhérer à la communauté.",
    features: [
      { text: "Adhésion à l'association", included: true },
      { text: "Accès aux événements & conférences", included: true },
      { text: "Webinaires mensuels", included: true },
      { text: "Réductions sur les formations", included: true },
      { text: "Accès au réseau d'experts", included: false },
      { text: "Support sécurité prioritaire", included: false },
    ],
    featured: false,
  },
  {
    name: "Membre Organisation",
    price: "250 000",
    period: "FCFA / an",
    desc: "Pour les entreprises et organisations de toutes tailles.",
    features: [
      { text: "Jusqu'à 5 membres inclus", included: true },
      { text: "Tous les avantages individuels", included: true },
      { text: "2 formations annuelles offertes", included: true },
      { text: "Accès au réseau d'experts", included: true },
      { text: "Alerte menaces & veille cyber", included: true },
      { text: "Audit express offert (1 jour)", included: true },
    ],
    featured: true,
  },
  {
    name: "Partenaire Premium",
    price: "750 000",
    period: "FCFA / an",
    desc: "Pour les grandes entreprises et partenaires institutionnels.",
    features: [
      { text: "Membres illimités", included: true },
      { text: "Tous les avantages organisation", included: true },
      { text: "RSSI à la demande (10h/mois)", included: true },
      { text: "Support sécurité prioritaire 24/7", included: true },
      { text: "Tableaux de bord de risques", included: true },
      { text: "Co-organisation d'événements", included: true },
    ],
    featured: false,
  },
];

export const IMAGES = {
  hero: "/hero-1.jpg",
  heroAbout: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=70",
  heroServices: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=70",
  heroProjects: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=70",
  heroPricing: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=70",
  heroFaq: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=70",
  heroBlog: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=70",
  heroContact: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=70",
  heroCommissions: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=70",
  heroEvenements: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=70",
  heroTeam: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1600&q=70",
  aboutMain: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  aboutSmall: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  ceo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
  choose: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
  cta: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
  project1: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=700&q=80",
  project2: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80",
  project3: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=80",
  project4: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=700&q=80",
  blog1: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80",
  blog2: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80",
  blog3: "https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&w=900&q=80",
  contactMap: "https://maps.google.com/maps?q=Brazzaville&t=&z=13&ie=UTF8&iwloc=&output=embed",
};

export const MEMBER_BENEFITS = [
  { icon: Award, title: "Certification reconnue", text: "Faites valider vos compétences par des certifications respectées dans la région." },
  { icon: Users, title: "Réseau professionnel", text: "Échangez avec plus de 850 professionnels de la sécurité de l'information." },
  { icon: GraduationCap, title: "Formation continue", text: "Restez à jour grâce à nos formations, webinaires et ateliers pratiques." },
];

export const HERO_SLIDES = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg", "/hero-4.jpg"];

export const VALUES = [
  {
    icon: Target,
    title: "Notre mission",
    text: "Promouvoir les bonnes pratiques de sécurité de l'information au Congo, fédérer les professionnels du secteur et accompagner les organisations dans leur transformation numérique sécurisée.",
  },
  {
    icon: Eye,
    title: "Notre vision",
    text: "Faire du Congo un pôle de référence en cybersécurité en Afrique centrale, grâce à une communauté d'experts engagés et des entreprises résilientes face aux cybermenaces.",
  },
  {
    icon: HeartHandshake,
    title: "Nos valeurs",
    text: "Excellence, intégrité, partage de connaissances et éthique professionnelle guident chacune de nos actions, de nos formations et de nos missions d'accompagnement.",
  },
];

export const EXTRA_TEAM = [
  {
    name: "Vince TOKANOU",
    role: "Responsable de la commission Innovation & Projets",
    img: "/team/vince-tokanou.jpg",
  },
  {
    name: "Patrick ITSOUA",
    role: "Responsable de la commission Plaidoyer & Relations Institutionnelles",
    img: "/team/patrick-itsoua.jpg",
  },
  {
    name: "M'VIBOUDOULOU Simon William",
    role: "Responsable de la commission Conformité et Contentieux",
    img: "/team/simon-william-mviboudoulou.jpg",
  },
  {
    name: "Dupond EBOULI",
    role: "Responsable de la commission Formation & Certification",
    img: "/team/dupond-ebouli.svg",
  },
  {
    name: "Fred MABIALA",
    role: "Responsable de la commission Veille & Recherches",
    img: "/team/fred-mabiala.jpg",
  },
  {
    name: "Ronnie NSAFFOU-MBATCHI",
    role: "Responsable de la Commission communication et médias",
    img: "/team/ronnie-nsaffou-mbatchi.jpg",
  },
  {
    name: "NKODIA SAMBA Andy",
    role: "DPO APSI-CG",
    img: "/team/andy-nkodia-samba.svg",
  },
];

export const COMMISSIONS = [
  {
    id: "formations-certifications",
    icon: GraduationCap,
    title: "Commission Formations et certifications",
    text: "Programmes de montée en compétence, ateliers pratiques et accompagnement vers les certifications professionnelles reconnues en sécurité de l'information.",
  },
  {
    id: "veille-recherches",
    icon: Search,
    title: "Commission Veille et Recherches",
    text: "Surveillance des vulnérabilités émergentes, partage d'outils, retours d'expérience entre experts et publication de travaux de recherche.",
  },
  {
    id: "plaidoyer-institutionnel",
    icon: Handshake,
    title: "Commission Plaidoyer et relations institutionnelles",
    text: "Dialogue avec les institutions publiques et privées pour structurer la cybersécurité au niveau national et faire évoluer le cadre réglementaire.",
  },
  {
    id: "innovation-projets",
    icon: Lightbulb,
    title: "Commission Innovation et projets",
    text: "Conception et pilotage des projets innovants de l'association, des solutions concrètes au service de la sécurité numérique congolaise.",
  },
  {
    id: "contentieux-conformite",
    icon: Scale,
    title: "Commission Contentieux et Conformité",
    text: "Veille sur les cadres réglementaires (ANSSI, ISO 27001, NIS2, RGPD) et accompagnement des organisations congolaises vers la conformité.",
  },
  {
    id: "communication-medias",
    icon: Megaphone,
    title: "Commission Communication et Médias",
    text: "Campagnes de sensibilisation, présence médiatique et animation des réseaux de l'association pour informer le public sur les risques numériques.",
  },
];

export const EVENTS = [
  {
    icon: Users,
    title: "Rencontres mensuelles",
    date: "Chaque 1er jeudi du mois",
    place: "Brazzaville",
    text: "Rencontres d'échange entre professionnels de la sécurité de l'information, partage de retours d'expérience et veille collective.",
  },
  {
    icon: Trophy,
    title: "Capture The Flag (CTF)",
    date: "Deux fois par an",
    place: "En ligne",
    text: "Compétitions pratiques de cybersécurité ouvertes aux étudiants et aux professionnels pour développer leurs compétences techniques.",
  },
  {
    icon: CalendarDays,
    title: "Conférence annuelle APSI-CG",
    date: "Chaque année",
    place: "Brazzaville",
    text: "Le rendez-vous de la cybersécurité au Congo : conférences, panels et ateliers avec des experts nationaux et internationaux.",
  },
  {
    icon: MapPin,
    title: "Ateliers de sensibilisation",
    date: "Tout au long de l'année",
    place: "Entreprises & écoles",
    text: "Campagnes de sensibilisation aux risques numériques destinées aux organisations, aux écoles et au grand public.",
  },
];

export const CONTACT_CARDS = [
  { icon: Mail, title: "Écrivez-nous", lines: [COMPANY.email], href: `mailto:${COMPANY.email}` },
  { icon: Phone, title: "Appelez-nous", lines: [COMPANY.phone, COMPANY.phoneAlt], href: `tel:${COMPANY.phone.replace(/\s/g, "")}` },
  { icon: MapPin, title: "Notre adresse", lines: [COMPANY.address, COMPANY.city] },
  { icon: Clock, title: "Horaires", lines: ["Lun – Ven : 8h00 – 17h30", "Réponse incidents : 24/7"] },
];






