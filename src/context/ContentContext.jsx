import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSiteContent } from "../lib/api";
import { getIcon } from "../lib/icons";
import {
  COMPANY,
  NAV_LINKS,
  FEATURES,
  SERVICES,
  STATS,
  STAT_CHECK,
  SKILL_TAGS,
  WHY_CHOOSE,
  PROCESS,
  QUOTE,
  PROJECTS,
  TEAM,
  EXTRA_TEAM,
  BRANDS,
  TESTIMONIALS,
  FAQS,
  BLOG_POSTS,
  BLOG_CATEGORIES,
  PRICING,
  IMAGES,
  MEMBER_BENEFITS,
  VALUES,
  HERO_SLIDES,
  COMMISSIONS,
  EVENTS,
  CONTACT_CARDS,
  DOWNLOADS,
} from "../data/content";

const DEFAULTS = {
  COMPANY,
  NAV_LINKS,
  FEATURES,
  SERVICES,
  STATS,
  STAT_CHECK,
  SKILL_TAGS,
  WHY_CHOOSE,
  PROCESS,
  QUOTE,
  PROJECTS,
  TEAM,
  EXTRA_TEAM,
  BRANDS,
  TESTIMONIALS,
  FAQS,
  BLOG_POSTS,
  BLOG_CATEGORIES,
  PRICING,
  IMAGES,
  MEMBER_BENEFITS,
  VALUES,
  HERO_SLIDES,
  COMMISSIONS,
  EVENTS,
  CONTACT_CARDS,
  DOWNLOADS,
};

const SECTION_TO_KEY = {
  company: "COMPANY",
  nav_links: "NAV_LINKS",
  features: "FEATURES",
  services: "SERVICES",
  stats: "STATS",
  stat_check: "STAT_CHECK",
  skill_tags: "SKILL_TAGS",
  why_choose: "WHY_CHOOSE",
  process: "PROCESS",
  quote: "QUOTE",
  projects: "PROJECTS",
  team: "TEAM",
  extra_team: "EXTRA_TEAM",
  brands: "BRANDS",
  testimonials: "TESTIMONIALS",
  faqs: "FAQS",
  pricing: "PRICING",
  images: "IMAGES",
  member_benefits: "MEMBER_BENEFITS",
  hero_slides: "HERO_SLIDES",
  values: "VALUES",
  trainings: "TRAININGS",
  commissions: "COMMISSIONS",
  events: "EVENTS",
  contact_cards: "CONTACT_CARDS",
  downloads: "DOWNLOADS",
  blog_categories: "BLOG_CATEGORIES",
};

function isPlainObject(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function resolveIcons(value) {
  if (Array.isArray(value)) return value.map(resolveIcons);
  if (isPlainObject(value)) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "icon" && typeof v === "string") out[k] = getIcon(v) || null;
      else out[k] = resolveIcons(v);
    }
    return out;
  }
  return value;
}

function buildContent(apiContent, blog) {
  const merged = { ...DEFAULTS };
  if (apiContent) {
    for (const [name, data] of Object.entries(apiContent)) {
      const key = SECTION_TO_KEY[name];
      if (!key) continue;
      const resolved = resolveIcons(data);
      if (isPlainObject(data) && isPlainObject(DEFAULTS[key])) {
        merged[key] = { ...DEFAULTS[key], ...resolved };
      } else {
        merged[key] = resolved;
      }
    }
  }
  if (Array.isArray(blog)) {
    merged.BLOG_POSTS = blog.map((p) => ({
      id: p.id,
      slug: p.slug,
      date: p.date,
      category: p.category,
      title: p.title,
      excerpt: p.excerpt,
      img: p.image || p.img,
    }));
  }
  return merged;
}

const ContentContext = createContext({ content: DEFAULTS, loading: true, refresh: () => {} });

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getSiteContent();
      setContent(buildContent(res?.content, res?.blog));
    } catch {
      // backend indisponible : le contenu par défaut est conservé
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ content, loading, refresh }), [content, loading, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
