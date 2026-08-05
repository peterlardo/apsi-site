import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const members = new Hono();
members.use("*", requireAuth);

const FIELDS = [
  "first_name", "last_name", "email", "phone", "profession",
  "company", "member_since", "status", "notes",
];

function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f] === "" ? null : body[f];
  }
  return out;
}

members.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT m.*,
      (SELECT COUNT(*) FROM cotisations c WHERE c.member_id = m.id AND c.status = 'payee') AS cotisations_payees,
      (SELECT COALESCE(SUM(c.amount), 0) FROM cotisations c WHERE c.member_id = m.id AND c.status = 'payee') AS total_cotise
    FROM members m ORDER BY m.last_name ASC, m.first_name ASC`
  ).all();
  return c.json(results);
});

members.get("/stats", async (c) => {
  const db = c.env.DB;
  const total = await db.prepare("SELECT COUNT(*) AS n FROM members").first();
  const actifs = await db.prepare("SELECT COUNT(*) AS n FROM members WHERE status = 'actif'").first();
  const cotise = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'payee'").first();
  const enAttente = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'en_attente'").first();
  return c.json({
    total: total?.n || 0,
    actifs: actifs?.n || 0,
    cotisations: { payees: cotise?.n || 0, totalPaye: Number(cotise?.total) || 0 },
    enAttente: { n: enAttente?.n || 0, total: Number(enAttente?.total) || 0 },
  });
});

members.get("/:id", async (c) => {
  const row = await c.env.DB.prepare("SELECT * FROM members WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  if (!row) return c.json({ error: "Membre introuvable" }, 404);
  return c.json(row);
});

members.post("/", async (c) => {
  const data = pick(await c.req.json());
  if (!data.first_name || !data.last_name) {
    return c.json({ error: "Le prénom et le nom sont requis" }, 400);
  }
  const cols = Object.keys(data);
  const placeholders = cols.map(() => "?").join(", ");
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO members (${cols.join(", ")}) VALUES (${placeholders})`
  )
    .bind(...Object.values(data))
    .run();
  const row = await c.env.DB.prepare("SELECT * FROM members WHERE id = ?")
    .bind(meta.last_row_id)
    .first();
  return c.json(row, 201);
});

members.put("/:id", async (c) => {
  const data = pick(await c.req.json());
  if (!Object.keys(data).length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  const sets = Object.keys(data).map((k) => `${k} = ?`).join(", ");
  await c.env.DB.prepare(`UPDATE members SET ${sets} WHERE id = ?`)
    .bind(...Object.values(data), c.req.param("id"))
    .run();
  const row = await c.env.DB.prepare("SELECT * FROM members WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  if (!row) return c.json({ error: "Membre introuvable" }, 404);
  return c.json(row);
});

members.delete("/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM members WHERE id = ?")
    .bind(c.req.param("id"))
    .run();
  return c.body(null, { status: 204 });
});

export default members;
