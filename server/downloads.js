import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const downloads = new Hono();

const PUBLIC_FIELDS = "id, title, description, category, file_name, file_size, mime_type, restricted, created_at";

downloads.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT ${PUBLIC_FIELDS} FROM download_files ORDER BY created_at DESC`
  ).all();
  return c.json(results);
});

downloads.get("/:id", async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT ${PUBLIC_FIELDS} FROM download_files WHERE id = ?`
  ).bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Fichier introuvable" }, 404);
  return c.json(row);
});

downloads.post("/verify-member", async (c) => {
  const { code } = await c.req.json();
  if (!code || !String(code).trim()) return c.json({ valid: false, error: "Code requis" }, 400);
  const member = await c.env.DB.prepare(
    "SELECT id, first_name, last_name, email, status, member_code FROM members WHERE member_code = ?"
  ).bind(String(code).trim()).first();
  if (!member) return c.json({ valid: false, error: "Code membre introuvable" });
  if (member.status !== "actif") return c.json({ valid: false, error: "Ce membre n'est pas actif" });
  return c.json({
    valid: true,
    member: { id: member.id, first_name: member.first_name, last_name: member.last_name },
  });
});

downloads.get("/:id/file", async (c) => {
  const id = c.req.param("id");
  const row = await c.env.DB.prepare(
    "SELECT file_data, file_name, mime_type, restricted FROM download_files WHERE id = ?"
  ).bind(id).first();
  if (!row) return c.json({ error: "Fichier introuvable" }, 404);

  if (row.restricted) {
    const code = c.req.header("X-Member-Code");
    if (!code) return c.json({ error: "Code membre requis pour ce document" }, 403);
    const member = await c.env.DB.prepare(
      "SELECT id, status FROM members WHERE member_code = ?"
    ).bind(code).first();
    if (!member || member.status !== "actif") {
      return c.json({ error: "Code membre invalide ou membre inactif" }, 403);
    }
  }

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
  const restricted = body["restricted"] === "1" || body["restricted"] === "true" ? 1 : 0;
  if (!file || typeof file === "string") return c.json({ error: "Aucun fichier fourni" }, 400);
  if (!title) return c.json({ error: "Le titre est requis" }, 400);
  const arrayBuf = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO download_files (title, description, category, file_name, file_size, mime_type, file_data, restricted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(title, description || null, category || "autre", file.name, file.size, file.type, base64, restricted).run();
  const row = await c.env.DB.prepare(
    `SELECT ${PUBLIC_FIELDS} FROM download_files WHERE id = ?`
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
