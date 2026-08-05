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

router.post("/", async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim().toLowerCase();
    const subject = String(b.subject || "").trim();
    const message = String(b.message || "").trim();
    const consentContact = b.consent_contact ? 1 : 0;
    const consentNewsletter = b.consent_newsletter ? 1 : 0;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Les champs nom, e-mail et message sont obligatoires." });
    }
    if (!consentContact) {
      return res.status(400).json({ error: "Le consentement au traitement de votre message est obligatoire." });
    }

    const [result] = await pool.execute(
      `INSERT INTO contact_messages (name, email, subject, message, consent_contact, consent_newsletter, ip, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'lu')`,
      [name, email, subject, message, consentContact, consentNewsletter, getIp(req)]
    );

    if (consentNewsletter) {
      await pool.execute(
        `INSERT INTO newsletter_subscribers (email, consent_newsletter, consent_source, ip)
         VALUES (?, 1, 'contact', ?)
         ON DUPLICATE KEY UPDATE consent_newsletter = 1, unsubscribed_at = NULL`,
        [email, getIp(req)]
      );
    }

    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

router.get("/access/:email", async (req, res, next) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Adresse e-mail invalide." });
    }
    const [messages] = await pool.execute(
      "SELECT id, name, email, subject, message, consent_contact, consent_newsletter, created_at FROM contact_messages WHERE email = ? ORDER BY created_at DESC",
      [email]
    );
    const [subs] = await pool.execute(
      "SELECT id, email, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE email = ?",
      [email]
    );
    const [consents] = await pool.execute(
      "SELECT categories, created_at FROM consents WHERE email = ? ORDER BY created_at DESC",
      [email]
    );
    res.json({ messages, subscriptions: subs, consents });
  } catch (err) {
    next(err);
  }
});

router.delete("/erase/:email", async (req, res, next) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Adresse e-mail invalide." });
    }
    const [m] = await pool.execute("SELECT COUNT(*) AS n FROM contact_messages WHERE email = ?", [email]);
    const [s] = await pool.execute("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE email = ?", [email]);
    await pool.execute("DELETE FROM contact_messages WHERE email = ?", [email]);
    await pool.execute(
      "UPDATE newsletter_subscribers SET unsubscribed_at = NOW(), consent_newsletter = 0 WHERE email = ?",
      [email]
    );
    res.json({ deleted: m[0].n, unsubscribed: s[0].n, message: "Vos données personnelles ont été supprimées conformément à votre demande." });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const params = [];
    let where = "";
    if (status) {
      where = "WHERE status = ?";
      params.push(status);
    }
    if (q) {
      where = where ? `${where} AND ` : "WHERE ";
      where += "(name LIKE ? OR email LIKE ? OR subject LIKE ?)";
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    const [rows] = await pool.execute(
      `SELECT id, name, email, subject, message, consent_contact, consent_newsletter, status, created_at, updated_at
       FROM contact_messages ${where} ORDER BY created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, subject, message, consent_contact, consent_newsletter, status, created_at FROM contact_messages WHERE id = ?",
      [Number(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ error: "Message introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    const valid = ["lu", "en_cours", "archive"];
    if (!valid.includes(String(status))) {
      return res.status(400).json({ error: "Statut invalide" });
    }
    await pool.execute("UPDATE contact_messages SET status = ? WHERE id = ?", [status, Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const [r] = await pool.execute("DELETE FROM contact_messages WHERE id = ?", [Number(req.params.id)]);
    if (!r.affectedRows) return res.status(404).json({ error: "Message introuvable" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
