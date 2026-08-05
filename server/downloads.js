import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const downloads = new Hono();

downloads.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, title, description, category, file_name, file_size, mime_type, created_at FROM download_files ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

downloads.get("/:id/file", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT file_data, file_name, mime_type FROM download_files WHERE id = ?"
  ).bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Fichier introuvable" }, 404);
  const binary = Uint8Array.from(atob(row.file_data), (ch) => ch.charCodeAt(0));
  return new Response(binary, {
    headers: {
      "Content-Type": row.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${row.file_name}"`,
    },
  });
});

downloads.post("/", requireAuth, async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const title = body["title"];
  const description = body["description"];
  const category = body["category"];
  if (!file || typeof file === "string") return c.json({ error: "Aucun fichier fourni" }, 400);
  if (!title) return c.json({ error: "Le titre est requis" }, 400);
  const arrayBuf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO download_files (title, description, category, file_name, file_size, mime_type, file_data) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(title, description || null, category || "autre", file.name, file.size, file.type, base64).run();
  const row = await c.env.DB.prepare(
    "SELECT id, title, description, category, file_name, file_size, mime_type, created_at FROM download_files WHERE id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

downloads.delete("/:id", requireAuth, async (c) => {
  const row = await c.env.DB.prepare("SELECT id FROM download_files WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Fichier introuvable" }, 404);
  await c.env.DB.prepare("DELETE FROM download_files WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

export default downloads;
