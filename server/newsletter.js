import { Hono } from "hono";
import { requireAuth } from "./middleware.js";
import { sendNewsletterEmail } from "./email.js";

const newsletter = new Hono();

function getIp(c) {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

newsletter.get("/check/:email", async (c) => {
  const email = c.req.param("email").trim().toLowerCase();
  if (!isValidEmail(email)) return c.json({ error: "E-mail invalide" }, 400);
  const row = await c.env.DB.prepare(
    "SELECT id, email, consent_newsletter, subscribed_at, unsubscribed_at FROM newsletter_subscribers WHERE email = ?"
  ).bind(email).first();
  return c.json({ subscribed: row || null });
});

newsletter.post("/", async (c) => {
  const b = await c.req.json();
  const email = String(b.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) return c.json({ error: "Une adresse e-mail valide est requise." }, 400);
  if (!b.consent_newsletter) return c.json({ error: "Le consentement à recevoir la newsletter est obligatoire (RGPD)." }, 400);
  await c.env.DB.prepare(
    `INSERT INTO newsletter_subscribers (email, consent_newsletter, consent_source, ip)
     VALUES (?, 1, ?, ?)
     ON CONFLICT(email) DO UPDATE SET consent_newsletter = 1, unsubscribed_at = NULL`
  ).bind(email, b.consent_source || "site", getIp(c)).run();
  try { await sendNewsletterEmail(c.env, { email, source: b.consent_source || "site" }); } catch {}
  return c.json({ ok: true, email }, 201);
});

newsletter.delete("/unsubscribe/:email", async (c) => {
  const email = c.req.param("email").trim().toLowerCase();
  if (!isValidEmail(email)) return c.json({ error: "E-mail invalide" }, 400);
  const { meta } = await c.env.DB.prepare(
    "UPDATE newsletter_subscribers SET unsubscribed_at = datetime('now'), consent_newsletter = 0 WHERE email = ? AND unsubscribed_at IS NULL"
  ).bind(email).run();
  return c.json({ unsubscribed: meta.changes > 0, email });
});

newsletter.get("/", requireAuth, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, email, consent_source, ip, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC"
  ).all();
  return c.json(results);
});

export default newsletter;
