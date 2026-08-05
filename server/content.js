import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const content = new Hono();

function slugify(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "article";
}

content.get("/", async (c) => {
  const db = c.env.DB;
  const { results: sections } = await db
    .prepare("SELECT name, data FROM content_sections")
    .all();
  const { results: posts } = await db
    .prepare(
      "SELECT id, title, slug, date, category, excerpt, image FROM blog_posts WHERE published = 1 ORDER BY created_at DESC"
    )
    .all();
  const contentMap = {};
  for (const s of sections) {
    contentMap[s.name] = typeof s.data === "string" ? JSON.parse(s.data) : s.data;
  }
  return c.json({ content: contentMap, blog: posts });
});

content.get("/admin", requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, updated_at, json_array_length(data) AS items FROM content_sections ORDER BY name"
  ).all();
  return c.json({ sections: results });
});

content.put("/admin/:name", requireAuth, async (c) => {
  const name = c.req.param("name").toLowerCase().trim();
  const body = await c.req.json();
  const { data } = body || {};
  if (!name || !/^[a-z_]+$/.test(name)) {
    return c.json({ error: "Nom de section invalide" }, 400);
  }
  await c.env.DB.prepare(
    `INSERT INTO content_sections (name, data, updated_by) VALUES (?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = datetime('now')`
  )
    .bind(name, JSON.stringify(data), c.get("user").id)
    .run();
  return c.json({ ok: true, name, updated_at: new Date().toISOString() });
});

content.get("/admin/blog", requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, title, slug, date, category, excerpt, image, published, created_at, updated_at FROM blog_posts ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

content.post("/admin/blog", requireAuth, async (c) => {
  const b = await c.req.json();
  const title = String(b.title || "").trim();
  if (!title) return c.json({ error: "Le titre est requis" }, 400);
  const slug = slugify(b.slug || title);
  const existing = await c.env.DB.prepare("SELECT id FROM blog_posts WHERE slug = ?")
    .bind(slug)
    .first();
  if (existing) return c.json({ error: "Ce slug existe déjà" }, 409);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO blog_posts (title, slug, date, category, excerpt, image, body, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      title,
      slug,
      String(b.date || ""),
      String(b.category || ""),
      String(b.excerpt || ""),
      String(b.image || ""),
      String(b.body || ""),
      b.published ? 1 : 0
    )
    .run();
  return c.json({ ok: true, id: meta.last_row_id }, 201);
});

content.put("/admin/blog/:id", requireAuth, async (c) => {
  const id = Number(c.req.param("id"));
  const b = await c.req.json();
  const title = String(b.title || "").trim();
  if (!title) return c.json({ error: "Le titre est requis" }, 400);
  const slug = slugify(b.slug || title);
  const existing = await c.env.DB.prepare(
    "SELECT id FROM blog_posts WHERE slug = ? AND id <> ?"
  )
    .bind(slug, id)
    .first();
  if (existing) return c.json({ error: "Ce slug existe déjà" }, 409);
  await c.env.DB.prepare(
    `UPDATE blog_posts SET title = ?, slug = ?, date = ?, category = ?, excerpt = ?, image = ?, body = ?, published = ?, updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      title,
      slug,
      String(b.date || ""),
      String(b.category || ""),
      String(b.excerpt || ""),
      String(b.image || ""),
      String(b.body || ""),
      b.published ? 1 : 0,
      id
    )
    .run();
  return c.json({ ok: true });
});

content.delete("/admin/blog/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM blog_posts WHERE id = ?")
    .bind(Number(c.req.param("id")))
    .run();
  return c.body(null, { status: 204 });
});

export default content;
