import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const invoices = new Hono();
invoices.use("*", requireAuth);

const FIELDS = ["number", "member_id", "title", "amount", "issue_date", "due_date", "status", "notes"];

function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f] === "" ? null : body[f];
  }
  return out;
}

invoices.get("/", async (c) => {
  const { status, q } = c.req.query();
  const where = [];
  const params = [];
  if (status && status !== "toutes") { where.push("i.status = ?"); params.push(status); }
  if (q) {
    where.push("(i.number LIKE ? OR i.title LIKE ? OR (m.first_name || ' ' || m.last_name) LIKE ?)");
    const like = `%${q}%`; params.push(like, like, like);
  }
  const { results } = await c.env.DB.prepare(
    `SELECT i.*, m.first_name, m.last_name, m.email
     FROM invoices i LEFT JOIN members m ON m.id = i.member_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY i.created_at DESC`
  ).bind(...params).all();
  return c.json(results);
});

invoices.get("/stats", async (c) => {
  const db = c.env.DB;
  const total = await db.prepare("SELECT COUNT(*) AS n FROM invoices").first();
  const totalMontant = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM invoices").first();
  const payees = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'payee'").first();
  const emises = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'emise'").first();
  const impayees = await db.prepare("SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'impayee'").first();
  return c.json({
    total: total?.n || 0, totalMontant: Number(totalMontant?.total) || 0,
    payees: { total: Number(payees?.total) || 0, n: payees?.n || 0 },
    emises: { total: Number(emises?.total) || 0, n: emises?.n || 0 },
    impayees: { total: Number(impayees?.total) || 0, n: impayees?.n || 0 },
  });
});

invoices.get("/:id", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT i.*, m.first_name, m.last_name, m.email FROM invoices i LEFT JOIN members m ON m.id = i.member_id WHERE i.id = ?"
  ).bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Facture introuvable" }, 404);
  return c.json(row);
});

invoices.post("/", async (c) => {
  const data = pick(await c.req.json());
  if (!data.title || !data.amount) return c.json({ error: "Le titre et le montant sont requis" }, 400);
  data.amount = Number(data.amount);
  if (data.member_id === null) delete data.member_id;
  if (!data.number) {
    const year = new Date().getFullYear();
    const count = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM invoices").first();
    data.number = `FAC-${year}-${String((count?.n || 0) + 1).padStart(4, "0")}`;
  }
  const cols = Object.keys(data);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO invoices (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`
  ).bind(...Object.values(data)).run();
  const row = await c.env.DB.prepare(
    "SELECT i.*, m.first_name, m.last_name, m.email FROM invoices i LEFT JOIN members m ON m.id = i.member_id WHERE i.id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

invoices.put("/:id", async (c) => {
  const data = pick(await c.req.json());
  if (!Object.keys(data).length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  if (data.amount !== undefined) data.amount = Number(data.amount);
  if (data.member_id === null) delete data.member_id;
  const sets = Object.keys(data).map((k) => `${k} = ?`).join(", ");
  await c.env.DB.prepare(`UPDATE invoices SET ${sets} WHERE id = ?`).bind(...Object.values(data), c.req.param("id")).run();
  const row = await c.env.DB.prepare("SELECT * FROM invoices WHERE id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Facture introuvable" }, 404);
  return c.json(row);
});

invoices.delete("/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM invoices WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

export default invoices;
