import { Router } from "express";
import { pool } from "./db.js";

const router = Router();

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const email = b.email ? String(b.email).trim().toLowerCase() : null;
    const categories = typeof b.categories === "object" && b.categories !== null ? b.categories : {};
    await pool.execute(
      "INSERT INTO consents (email, categories, ip, user_agent) VALUES (?, ?, ?, ?)",
      [email || null, JSON.stringify(categories), getIp(req), req.headers["user-agent"] || null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/:email", async (req, res, next) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Adresse e-mail invalide." });
    }
    const [rows] = await pool.execute(
      "SELECT categories, ip, created_at FROM consents WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );
    if (!rows.length) return res.status(404).json({ consents: null });
    res.json({ consents: JSON.parse(rows[0].categories), recordedAt: rows[0].created_at });
  } catch (err) {
    next(err);
  }
});

export default router;
