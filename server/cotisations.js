import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();
router.use(requireAuth);

const FIELDS = ["member_id", "amount", "period", "due_date", "payment_date", "status", "method", "receipt_no", "notes"];

function pick(body) {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined) out[f] = body[f] === "" ? null : body[f];
  }
  return out;
}

router.get("/", async (req, res, next) => {
  try {
    const { status, member_id, year } = req.query;
    const where = [];
    const params = [];
    if (status) {
      where.push("c.status = ?");
      params.push(status);
    }
    if (member_id) {
      where.push("c.member_id = ?");
      params.push(member_id);
    }
    if (year) {
      where.push("c.period = ?");
      params.push(year);
    }
    const sql = `
      SELECT c.*, m.first_name, m.last_name, m.email
      FROM cotisations c
      LEFT JOIN members m ON m.id = c.member_id
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY c.period DESC, c.created_at DESC
    `;
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [[encaisse]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'payee'"
    );
    const [[enAttente]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'en_attente'"
    );
    const [[retard]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'retard'"
    );
    const [[membres]] = await pool.execute("SELECT COUNT(*) AS n FROM members");
    res.json({
      encaisse: { total: Number(encaisse.total) || 0, n: encaisse.n },
      enAttente: { total: Number(enAttente.total) || 0, n: enAttente.n },
      retard: { total: Number(retard.total) || 0, n: retard.n },
      membres: membres.n,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.member_id || !data.amount) {
      return res.status(400).json({ error: "Le membre et le montant sont requis" });
    }
    const [result] = await pool.execute(
      `INSERT INTO cotisations (${Object.keys(data).join(", ")}) VALUES (${Object.keys(data)
        .map(() => "?")
        .join(", ")})`,
      Object.values(data)
    );
    const [rows] = await pool.execute(
      "SELECT c.*, m.first_name, m.last_name, m.email FROM cotisations c LEFT JOIN members m ON m.id = c.member_id WHERE c.id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!Object.keys(data).length) return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    await pool.execute(
      `UPDATE cotisations SET ${Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ")} WHERE id = ?`,
      [...Object.values(data), req.params.id]
    );
    const [rows] = await pool.execute(
      "SELECT c.*, m.first_name, m.last_name, m.email FROM cotisations c LEFT JOIN members m ON m.id = c.member_id WHERE c.id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Cotisation introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM cotisations WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
