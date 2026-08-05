import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const documents = new Hono();
documents.use("*", requireAuth);

const CATEGORIES = ["officiel", "financier", "compte_rendu", "rapport", "projet", "autre"];

documents.get("/", async (c) => {
  const { category, q } = c.req.query();
  const where = [];
  const params = [];
  if (category) { where.push("d.category = ?"); params.push(category); }
  if (q) { where.push("(d.title LIKE ? OR d.description LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
  const { results } = await c.env.DB.prepare(
    `SELECT d.*, u.name AS uploaded_by_name FROM documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY d.created_at DESC`
  ).bind(...params).all();
  return c.json(results);
});

documents.get("/stats", async (c) => {
  const db = c.env.DB;
  const total = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(file_size), 0) AS size FROM documents").first();
  const { results: byCat } = await db.prepare("SELECT category, COUNT(*) AS n FROM documents GROUP BY category").all();
  return c.json({ total: total?.n || 0, size: Number(total?.size) || 0, categories: byCat });
});

documents.post("/", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const title = body["title"];
  const category = body["category"];
  const description = body["description"];
  if (!file || typeof file === "string") return c.json({ error: "Aucun fichier fourni" }, 400);
  if (!title) return c.json({ error: "Le titre est requis" }, 400);
  const cat = CATEGORIES.includes(category) ? category : "autre";
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO documents (title, category, description, file_name, file_size, mime_type, stored_name, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(title, cat, description || null, file.name, file.size, file.type, file.name, c.get("user").id).run();
  const row = await c.env.DB.prepare(
    "SELECT d.*, u.name AS uploaded_by_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by WHERE d.id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

documents.delete("/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM documents WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Document introuvable" }, 404);
  await c.env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

export default documents;
