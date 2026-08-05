import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();
router.use(requireAuth);

const FIELDS = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "profession",
  "company",
  "member_since",
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
    const [rows] = await pool.execute(
      `SELECT m.*,
        (SELECT COUNT(*) FROM cotisations c WHERE c.member_id = m.id AND c.status = 'payee') AS cotisations_payees,
        (SELECT COALESCE(SUM(c.amount), 0) FROM cotisations c WHERE c.member_id = m.id AND c.status = 'payee') AS total_cotise
      FROM members m ORDER BY m.last_name ASC, m.first_name ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [[total]] = await pool.execute("SELECT COUNT(*) AS n FROM members");
    const [[actifs]] = await pool.execute(
      "SELECT COUNT(*) AS n FROM members WHERE status = 'actif'"
    );
    const [[cotise]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'payee'"
    );
    const [[enAttente]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS n FROM cotisations WHERE status = 'en_attente'"
    );
    res.json({
      total: total.n,
      actifs: actifs.n,
      cotisations: { payees: cotise.n, totalPaye: Number(cotise.total) || 0 },
      enAttente: { n: enAttente.n, total: Number(enAttente.total) || 0 },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM members WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Membre introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const data = pick(req.body);
    if (!data.first_name || !data.last_name) {
      return res.status(400).json({ error: "Le prénom et le nom sont requis" });
    }
    const [result] = await pool.execute(
      `INSERT INTO members (${Object.keys(data).join(", ")}) VALUES (${Object.keys(data)
        .map(() => "?")
        .join(", ")})`,
      Object.values(data)
    );
    const [rows] = await pool.execute("SELECT * FROM members WHERE id = ?", [result.insertId]);
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
      `UPDATE members SET ${Object.keys(data)
        .map((k) => `${k} = ?`)
        .join(", ")} WHERE id = ?`,
      [...Object.values(data), req.params.id]
    );
    const [rows] = await pool.execute("SELECT * FROM members WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Membre introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM members WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
