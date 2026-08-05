import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();

function isJsonData(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

function slugify(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "article";
}

router.get("/", async (req, res, next) => {
  try {
    const [sections] = await pool.execute("SELECT name, data FROM content_sections");
    const [posts] = await pool.execute(
      "SELECT id, title, slug, date, category, excerpt, image FROM blog_posts WHERE published = 1 ORDER BY created_at DESC"
    );
    const content = {};
    for (const s of sections) content[s.name] = s.data;
    res.json({ content, blog: posts });
  } catch (err) {
    next(err);
  }
});

router.get("/admin", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, updated_at, JSON_LENGTH(data) AS items FROM content_sections ORDER BY name"
    );
    res.json({ sections: rows });
  } catch (err) {
    next(err);
  }
});

router.put("/admin/:name", requireAuth, async (req, res, next) => {
  try {
    const name = String(req.params.name || "").toLowerCase().trim();
    const { data } = req.body || {};
    if (!name || !/^[a-z_]+$/.test(name)) {
      return res.status(400).json({ error: "Nom de section invalide" });
    }
    if (!isJsonData(data) && !Array.isArray(data)) {
      return res.status(400).json({ error: "data doit être un objet ou un tableau JSON" });
    }
    await pool.execute(
      `INSERT INTO content_sections (name, data, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by), updated_at = NOW()`,
      [name, JSON.stringify(data), req.user.id]
    );
    res.json({ ok: true, name, updated_at: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

router.get("/admin/blog", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, slug, date, category, excerpt, image, published, created_at, updated_at FROM blog_posts ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/admin/blog", requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {};
    const title = String(b.title || "").trim();
    if (!title) return res.status(400).json({ error: "Le titre est requis" });
    const slug = slugify(b.slug || title);
    const [existing] = await pool.execute("SELECT id FROM blog_posts WHERE slug = ?", [slug]);
    if (existing[0]) return res.status(409).json({ error: "Ce slug existe déjà" });
    const [result] = await pool.execute(
      `INSERT INTO blog_posts (title, slug, date, category, excerpt, image, body, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        String(b.date || ""),
        String(b.category || ""),
        String(b.excerpt || ""),
        String(b.image || ""),
        String(b.body || ""),
        b.published ? 1 : 0,
      ]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.put("/admin/blog/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const title = String(b.title || "").trim();
    if (!title) return res.status(400).json({ error: "Le titre est requis" });
    const [existing] = await pool.execute(
      "SELECT id, slug FROM blog_posts WHERE slug = ? AND id <> ?",
      [slugify(b.slug || title), id]
    );
    if (existing[0]) return res.status(409).json({ error: "Ce slug existe déjà" });
    await pool.execute(
      `UPDATE blog_posts SET title = ?, slug = ?, date = ?, category = ?, excerpt = ?, image = ?, body = ?, published = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        slugify(b.slug || title),
        String(b.date || ""),
        String(b.category || ""),
        String(b.excerpt || ""),
        String(b.image || ""),
        String(b.body || ""),
        b.published ? 1 : 0,
        id,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/blog/:id", requireAuth, async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM blog_posts WHERE id = ?", [Number(req.params.id)]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
