import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const trainings = new Hono();

const TRAINING_FIELDS = ["slug", "icon", "title", "category", "level", "format", "duration", "next_session", "description", "active", "sort_order"];
const REGISTRATION_STATUSES = ["nouvelle", "contactee", "confirmee", "annulee"];

function slugify(title) {
  return String(title || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 110) || `formation-${Date.now()}`;
}

function clean(value) {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function pickTraining(body) {
  const out = {};
  for (const field of TRAINING_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === "active") { out.active = body.active === true || body.active === 1 || body.active === "1" ? 1 : 0; continue; }
    if (field === "sort_order") { out.sort_order = Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0; continue; }
    out[field] = clean(body[field]);
  }
  if (body.nextSession !== undefined && out.next_session === undefined) out.next_session = clean(body.nextSession);
  if (body.text !== undefined && out.description === undefined) out.description = clean(body.text);
  if (!out.slug && out.title) out.slug = slugify(out.title);
  return out;
}

trainings.get("/", async (c) => {
  const { category, level, format, q } = c.req.query();
  const where = ["active = 1"];
  const params = [];
  if (category) { where.push("category = ?"); params.push(category); }
  if (level) { where.push("level = ?"); params.push(level); }
  if (format) { where.push("format = ?"); params.push(format); }
  if (q) { where.push("(title LIKE ? OR category LIKE ? OR description LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const { results } = await c.env.DB.prepare(
    `SELECT * FROM trainings WHERE ${where.join(" AND ")} ORDER BY sort_order ASC, title ASC`
  ).bind(...params).all();
  return c.json(results);
});

trainings.post("/registrations", async (c) => {
  const body = await c.req.json();
  const trainingId = body.training_id ? Number(body.training_id) : null;
  const fullName = clean(body.full_name || body.fullName);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const organization = clean(body.organization);
  const profile = clean(body.profile);
  const notes = clean(body.notes);
  let trainingTitle = clean(body.training_title || body.training);
  let resolvedTrainingId = null;
  if (!fullName || !email) return c.json({ error: "Le nom complet et l'email sont requis" }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Adresse email invalide" }, 400);
  if (trainingId) {
    const row = await c.env.DB.prepare("SELECT id, title FROM trainings WHERE id = ? AND active = 1").bind(trainingId).first();
    if (!row) return c.json({ error: "Formation introuvable ou inactive" }, 400);
    resolvedTrainingId = row.id; trainingTitle = row.title;
  }
  if (!trainingTitle) return c.json({ error: "La formation choisie est requise" }, 400);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO training_registrations (training_id, training_title, full_name, email, phone, organization, profile, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(resolvedTrainingId, trainingTitle, fullName, email, phone, organization, profile, notes).run();
  const row = await c.env.DB.prepare("SELECT * FROM training_registrations WHERE id = ?").bind(meta.last_row_id).first();
  return c.json(row, 201);
});

trainings.use("/admin/*", requireAuth);

trainings.get("/admin", async (c) => {
  const { active, category, q } = c.req.query();
  const where = [];
  const params = [];
  if (active === "1" || active === "0") { where.push("t.active = ?"); params.push(Number(active)); }
  if (category) { where.push("t.category = ?"); params.push(category); }
  if (q) { where.push("(t.title LIKE ? OR t.category LIKE ? OR t.description LIKE ?)"); params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  const { results } = await c.env.DB.prepare(
    `SELECT t.*, (SELECT COUNT(*) FROM training_registrations r WHERE r.training_id = t.id) AS registrations_count
     FROM trainings t ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY t.sort_order ASC, t.title ASC`
  ).bind(...params).all();
  return c.json(results);
});

trainings.post("/admin", async (c) => {
  const data = pickTraining(await c.req.json());
  if (!data.title) return c.json({ error: "Le titre de la formation est requis" }, 400);
  data.slug ||= slugify(data.title); data.icon ||= "GraduationCap"; data.category ||= "";
  data.level ||= ""; data.format ||= ""; data.duration ||= ""; data.next_session ||= "";
  data.active = data.active ?? 1; data.sort_order = data.sort_order ?? 0;
  const cols = Object.keys(data);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO trainings (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`
  ).bind(...Object.values(data)).run();
  const row = await c.env.DB.prepare("SELECT * FROM trainings WHERE id = ?").bind(meta.last_row_id).first();
  return c.json(row, 201);
});

trainings.get("/admin/registrations", async (c) => {
  const { status, training_id } = c.req.query();
  const where = [];
  const params = [];
  if (status) { where.push("r.status = ?"); params.push(status); }
  if (training_id) { where.push("r.training_id = ?"); params.push(training_id); }
  const { results } = await c.env.DB.prepare(
    `SELECT r.*, t.slug AS training_slug, t.category AS training_category
     FROM training_registrations r LEFT JOIN trainings t ON t.id = r.training_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY r.created_at DESC`
  ).bind(...params).all();
  return c.json(results);
});

trainings.put("/admin/registrations/:id", async (c) => {
  const body = await c.req.json();
  const status = clean(body.status);
  if (!REGISTRATION_STATUSES.includes(status)) return c.json({ error: "Statut d'inscription invalide" }, 400);
  await c.env.DB.prepare("UPDATE training_registrations SET status = ? WHERE id = ?").bind(status, c.req.param("id")).run();
  const row = await c.env.DB.prepare("SELECT * FROM training_registrations WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Inscription introuvable" }, 404);
  return c.json(row);
});

trainings.delete("/admin/registrations/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM training_registrations WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

trainings.put("/admin/:id", async (c) => {
  const data = pickTraining(await c.req.json());
  if (!Object.keys(data).length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  if (data.title && !data.slug && c.req.json().slug === undefined) delete data.slug;
  const sets = Object.keys(data).map((k) => `${k} = ?`).join(", ");
  await c.env.DB.prepare(`UPDATE trainings SET ${sets} WHERE id = ?`).bind(...Object.values(data), c.req.param("id")).run();
  const row = await c.env.DB.prepare("SELECT * FROM trainings WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Formation introuvable" }, 404);
  return c.json(row);
});

trainings.delete("/admin/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM trainings WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

export default trainings;
