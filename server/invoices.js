import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();
router.use(requireAuth);

const FIELDS = [
  "number",
  "member_id",
  "title",
  "amount",
  "issue_date",
  "due_date",
  "status",
  "notes",
];

function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f] === "" ? null : body[f];
  }
  return out;
}

router.get("/", async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const where = [];
    const params = [];
    if (status && status !== "toutes") {
      where.push("i.status = ?");
      params.push(status);
    }
    if (q) {
      where.push("(i.number LIKE ? OR i.title LIKE ? OR CONCAT(m.first_name, ' ', m.last_name) LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    const sql = `SELECT i.*, m.first_name, m.last_name, m.email
      FROM invoices i
      LEFT JOIN members m ON m.id = i.member_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY i.created_at DESC`;
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [[total]] = await pool.execute("SELECT COUNT(*) AS n FROM invoices");
    const [[totalMontant]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM invoices"
    );
    const [[payees]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'payee'"
    );
    const [[emises]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'emise'"
    );
    const [[impayees]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM invoices WHERE status = 'impayee'"
    );
    res.json({
      total: total.n,
      totalMontant: Number(totalMontant.total) || 0,
      payees: { total: Number(payees.total) || 0, n: payees.n },
      emises: { total: Number(emises.total) || 0, n: emises.n },
      impayees: { total: Number(impayees.total) || 0, n: impayees.n },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.*, m.first_name, m.last_name, m.email
       FROM invoices i LEFT JOIN members m ON m.id = i.member_id
       WHERE i.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Facture introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.title || !data.amount) {
      return res.status(400).json({ error: "Le titre et le montant sont requis" });
    }
    data.amount = Number(data.amount);
    if (data.member_id === null) delete data.member_id;
    if (!data.number) {
      const year = new Date().getFullYear();
      const [[{ n }]] = await pool.execute("SELECT COUNT(*) AS n FROM invoices");
      data.number = `FAC-${year}-${String(n + 1).padStart(4, "0")}`;
    }
    const [result] = await pool.execute(
      `INSERT INTO invoices (${Object.keys(data).join(", ")}) VALUES (${Object.keys(data)
        .map(() => "?")
        .join(", ")})`,
      Object.values(data)
    );
    const [rows] = await pool.execute(
      `SELECT i.*, m.first_name, m.last_name, m.email
       FROM invoices i LEFT JOIN members m ON m.id = i.member_id
       WHERE i.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Le numéro de facture existe déjà" });
    }
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!Object.keys(data).length) return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    if (data.amount !== undefined) data.amount = Number(data.amount);
    if (data.member_id === null) delete data.member_id;
    await pool.execute(
      `UPDATE invoices SET ${Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ")} WHERE id = ?`,
      [...Object.values(data), req.params.id]
    );
    const [rows] = await pool.execute("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Facture introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM invoices WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
