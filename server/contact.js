import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const contact = new Hono();

function getIp(c) {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

contact.post("/", async (c) => {
  const b = await c.req.json();
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const subject = String(b.subject || "").trim();
  const message = String(b.message || "").trim();
  const consentContact = b.consent_contact ? 1 : 0;
  const consentNewsletter = b.consent_newsletter ? 1 : 0;
  if (!name || !email || !message) return c.json({ error: "Les champs nom, e-mail et message sont obligatoires." }, 400);
  if (!consentContact) return c.json({ error: "Le consentement au traitement de votre message est obligatoire." }, 400);
  const { meta } = await c.env.DB.prepare(
    `INSERT INTO contact_messages (name, email, subject, message, consent_contact, consent_newsletter, ip, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'lu')`
  ).bind(name, email, subject, message, consentContact, consentNewsletter, getIp(c)).run();
  if (consentNewsletter) {
    await c.env.DB.prepare(
      `INSERT INTO newsletter_subscribers (email, consent_newsletter, consent_source, ip)
       VALUES (?, 1, 'contact', ?)
       ON CONFLICT(email) DO UPDATE SET consent_newsletter = 1, unsubscribed_at = NULL`
    ).bind(email, getIp(c)).run();
  }
  return c.json({ ok: true, id: meta.last_row_id }, 201);
});

contact.get("/access/:email", async (c) => {
  const email = c.req.param("email").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Adresse e-mail invalide." }, 400);
  const messages = (await c.env.DB.prepare("SELECT id, name, email, subject, message, consent_contact, consent_newsletter, created_at FROM contact_messages WHERE email = ? ORDER BY created_at DESC").bind(email).all()).results;
  const subs = (await c.env.DB.prepare("SELECT id, email, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE email = ?").bind(email).all()).results;
  const consents = (await c.env.DB.prepare("SELECT categories, created_at FROM consents WHERE email = ? ORDER BY created_at DESC").bind(email).all()).results;
  return c.json({ messages, subscriptions: subs, consents });
});

contact.delete("/erase/:email", async (c) => {
  const email = c.req.param("email").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Adresse e-mail invalide." }, 400);
  const m = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM contact_messages WHERE email = ?").bind(email).first();
  const s = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE email = ?").bind(email).first();
  await c.env.DB.prepare("DELETE FROM contact_messages WHERE email = ?").bind(email).run();
  await c.env.DB.prepare("UPDATE newsletter_subscribers SET unsubscribed_at = datetime('now'), consent_newsletter = 0 WHERE email = ?").bind(email).run();
  return c.json({ deleted: m?.n || 0, unsubscribed: s?.n || 0, message: "Vos données personnelles ont été supprimées conformément à votre demande." });
});

contact.get("/", requireAuth, async (c) => {
  const { status, q } = c.req.query();
  const where = [];
  const params = [];
  if (status) { where.push("status = ?"); params.push(status); }
  if (q) { where.push("(name LIKE ? OR email LIKE ? OR subject LIKE ?)"); const like = `%${q}%`; params.push(like, like, like); }
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, email, subject, message, consent_contact, consent_newsletter, status, created_at, updated_at
     FROM contact_messages ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC`
  ).bind(...params).all();
  return c.json(results);
});

contact.get("/:id", requireAuth, async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT id, name, email, subject, message, consent_contact, consent_newsletter, status, created_at FROM contact_messages WHERE id = ?"
  ).bind(Number(c.req.param("id"))).first();
  if (!row) return c.json({ error: "Message introuvable" }, 404);
  return c.json(row);
});

contact.put("/:id/status", requireAuth, async (c) => {
  const { status } = await c.req.json();
  const valid = ["lu", "en_cours", "archive"];
  if (!valid.includes(String(status))) return c.json({ error: "Statut invalide" }, 400);
  await c.env.DB.prepare("UPDATE contact_messages SET status = ? WHERE id = ?").bind(status, Number(c.req.param("id"))).run();
  return c.json({ ok: true });
});

contact.delete("/:id", requireAuth, async (c) => {
  const { meta } = await c.env.DB.prepare("DELETE FROM contact_messages WHERE id = ?").bind(Number(c.req.param("id"))).run();
  if (!meta.changes) return c.json({ error: "Message introuvable" }, 404);
  return c.body(null, { status: 204 });
});

export default contact;
