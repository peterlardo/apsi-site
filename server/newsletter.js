import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

router.get("/check/:email", async (req, res, next) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) return res.status(400).json({ error: "E-mail invalide" });
    const [rows] = await pool.execute(
      "SELECT id, email, consent_newsletter, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE email = ?",
      [email]
    );
    res.json({ subscribed: rows[0] ? rows[0] : null });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const email = String(b.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Une adresse e-mail valide est requise." });
    }
    if (!b.consent_newsletter) {
      return res.status(400).json({ error: "Le consentement à recevoir la newsletter est obligatoire (RGPD)." });
    }
    await pool.execute(
      `INSERT INTO newsletter_subscribers (email, consent_newsletter, consent_source, ip)
       VALUES (?, 1, ?, ?)
       ON DUPLICATE KEY UPDATE consent_newsletter = 1, unsubscribed_at = NULL`,
      [email, b.consent_source || "site", getIp(req)]
    );
    res.status(201).json({ ok: true, email });
  } catch (err) {
    next(err);
  }
});

router.delete("/unsubscribe/:email", async (req, res, next) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) return res.status(400).json({ error: "E-mail invalide" });
    const [r] = await pool.execute(
      "UPDATE newsletter_subscribers SET unsubscribed_at = NOW(), consent_newsletter = 0 WHERE email = ? AND unsubscribed_at IS NULL",
      [email]
    );
    res.json({ unsubscribed: r.affectedRows > 0, email });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, consent_source, ip, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
