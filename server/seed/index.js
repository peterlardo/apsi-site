import "dotenv/config";
import { pool, initDb } from "../db.js";
import { SECTIONS, BLOG_POSTS } from "./data.js";

function slugify(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "article";
}

async function main() {
  await initDb();

  console.log("— Sections de contenu —");
  for (const [name, data] of Object.entries(SECTIONS)) {
    await pool.execute(
      `INSERT INTO content_sections (name, data) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), updated_at = NOW()`,
      [name, JSON.stringify(data)]
    );
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(`  ✓ ${name} (${count})`);
  }

  console.log("— Articles de blog —");
  for (const p of BLOG_POSTS) {
    const slug = slugify(p.title);
    await pool.execute(
      `INSERT INTO blog_posts (title, slug, date, category, excerpt, image, body, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE title = VALUES(title), date = VALUES(date),
         category = VALUES(category), excerpt = VALUES(excerpt),
         image = VALUES(image), body = VALUES(body), updated_at = NOW()`,
      [p.title, slug, p.date, p.category, p.excerpt, p.image, p.body]
    );
    console.log(`  ✓ ${p.title}`);
  }

  const [[{ total }]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM content_sections"
  );
  const [[{ posts }]] = await pool.execute("SELECT COUNT(*) AS posts FROM blog_posts");
  const [[{ users }]] = await pool.execute("SELECT COUNT(*) AS users FROM users");

  console.log(`\nBase MySQL 'apsi_cg' prête : ${total} sections, ${posts} articles, ${users} utilisateur(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error("Seed échoué :", err);
  process.exit(1);
});
