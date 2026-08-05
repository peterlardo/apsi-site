import { SECTIONS, BLOG_POSTS } from "./seed/data.js";
import { DEFAULT_TRAININGS } from "./training-defaults.js";
import fs from "node:fs";

const lines = [];

function esc(s) {
  return String(s || "").replace(/'/g, "''");
}

// Admin user (admin@apsi-cg.org / Apsi2026!)
lines.push(
  `INSERT INTO users (email, password_hash, name, role) VALUES ('admin@apsi-cg.org', '$2b$12$ydc1iDsaUzXRwoudIg2JVefM.JC3VRqR9YWXdet6tqd4PlaEfk45O', 'Administrateur', 'admin');`
);

// Content sections
for (const [name, data] of Object.entries(SECTIONS)) {
  const json = JSON.stringify(data);
  lines.push(
    `INSERT OR IGNORE INTO content_sections (name, data) VALUES ('${esc(name)}', '${esc(json)}');`
  );
}

// Blog posts
for (const p of BLOG_POSTS) {
  const slug = p.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  lines.push(
    `INSERT OR IGNORE INTO blog_posts (title, slug, date, category, excerpt, image, body, published) VALUES ('${esc(p.title)}', '${esc(slug)}', '${esc(p.date)}', '${esc(p.category)}', '${esc(p.excerpt)}', '${esc(p.image)}', '${esc(p.body)}', 1);`
  );
}

// Default trainings
DEFAULT_TRAININGS.forEach((t, i) => {
  lines.push(
    `INSERT OR IGNORE INTO trainings (slug, icon, title, category, level, format, duration, next_session, description, active, sort_order) VALUES ('${esc(t.slug)}', '${esc(t.icon)}', '${esc(t.title)}', '${esc(t.category)}', '${esc(t.level)}', '${esc(t.format)}', '${esc(t.duration)}', '${esc(t.next_session)}', '${esc(t.description)}', 1, ${i + 1});`
  );
});

fs.writeFileSync(
  new URL("../migrations/0002_seed.sql", import.meta.url),
  lines.join("\n")
);
console.log(`Seed SQL generated: ${lines.length} commands`);
