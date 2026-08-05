import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const cotisations = new Hono();
cotisations.use("*", requireAuth);

const FIELDS = ["member_id", "amount", "period", "due_date", "payment_date", "status", "method", "receipt_no", "notes"];

function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f] === "" ? null : body[f];
  }
  return out;
}

cotisations.get("/", async (c) => {
  const { status, member_id, year } = c.req.query();
  const where = [];
  const params = [];
  if (status) { where.push("c.status = ?"); params.push(status); }
  if (member_id) { where.push("c.member_id = ?"); params.push(member_id); }
  if (year) { where.push("c.period = ?"); params.push(year); }
  const sql = `SELECT c.*, m.first_name, m.last_name, m.email
    FROM cotisations c LEFT JOIN members m ON m.id = c.member_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY c.period DESC, c.created_at DESC`;
  const { results } = await c.env.DB.prepare(sql).bind(...params).all();
  return c.json(results);
});

cotisations.get("/stats", async (c) => {
  const db = c.env.DB;
  const encaisse = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'payee'").first();
  const enAttente = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'en_attente'").first();
  const retard = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'retard'").first();
  const membres = await db.prepare("SELECT COUNT(*) AS n FROM members").first();
  return c.json({
    encaisse: { total: Number(encaisse?.total) || 0, n: encaisse?.n || 0 },
    enAttente: { total: Number(enAttente?.total) || 0, n: enAttente?.n || 0 },
    retard: { total: Number(retard?.total) || 0, n: retard?.n || 0 },
    membres: membres?.n || 0,
  });
});

cotisations.post("/", async (c) => {
  const data = pick(await c.req.json());
  if (!data.member_id || !data.amount) return c.json({ error: "Le membre et le montant sont requis" }, 400);
  const cols = Object.keys(data);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO cotisations (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`
  ).bind(...Object.values(data)).run();
  const row = await c.env.DB.prepare(
    "SELECT c.*, m.first_name, m.last_name, m.email FROM cotisations c LEFT JOIN members m ON m.id = c.member_id WHERE c.id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

cotisations.put("/:id", async (c) => {
  const data = pick(await c.req.json());
  if (!Object.keys(data).length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  const sets = Object.keys(data).map((k) => `${k} = ?`).join(", ");
  await c.env.DB.prepare(`UPDATE cotisations SET ${sets} WHERE id = ?`)
    .bind(...Object.values(data), c.req.param("id")).run();
  const row = await c.env.DB.prepare(
    "SELECT c.*, m.first_name, m.last_name, m.email FROM cotisations c LEFT JOIN members m ON m.id = c.member_id WHERE c.id = ?"
  ).bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Cotisation introuvable" }, 404);
  return c.json(row);
});

cotisations.delete("/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM cotisations WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

export default cotisations;
