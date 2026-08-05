import { Hono } from "hono";
import { requireAuth } from "./middleware.js";
import { sendNewsletterEmail, sendWelcomeNewsletterEmail } from "./email.js";

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

newsletter.get("/count", async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM newsletter_subscribers WHERE unsubscribed_at IS NULL"
  ).first();
  return c.json({ count: row?.count || 0 });
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
  let emailErrors = [];
  try {
    await sendNewsletterEmail(c.env, { email, source: b.consent_source || "site" });
  } catch (e) {
    console.error("Newsletter admin email failed:", e?.message || e);
    emailErrors.push("admin: " + (e?.message || String(e)));
  }
  try {
    await sendWelcomeNewsletterEmail(c.env, { email });
  } catch (e) {
    console.error("Welcome email failed:", e?.message || e);
    emailErrors.push("welcome: " + (e?.message || String(e)));
  }
  return c.json({ ok: true, email, emailErrors: emailErrors.length ? emailErrors : undefined }, 201);
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
    "SELECT id, email, consent_newsletter, consent_source, ip, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC"
  ).all();
  return c.json(results);
});

newsletter.get("/stats", requireAuth, async (c) => {
  const total = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers").first();
  const active = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE unsubscribed_at IS NULL").first();
  const unsubscribed = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE unsubscribed_at IS NOT NULL").first();
  const thisMonth = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE subscribed_at >= date('now', 'start of month')"
  ).first();
  const lastMonth = await c.env.DB.prepare(
    "SELECT COUNT(*) AS n FROM newsletter_subscribers WHERE subscribed_at >= date('now', 'start of month', '-1 month') AND subscribed_at < date('now', 'start of month')"
  ).first();
  const bySource = await c.env.DB.prepare(
    "SELECT consent_source, COUNT(*) AS n FROM newsletter_subscribers WHERE unsubscribed_at IS NULL GROUP BY consent_source"
  ).all();
  const byMonth = await c.env.DB.prepare(
    "SELECT strftime('%Y-%m', subscribed_at) AS month, COUNT(*) AS n FROM newsletter_subscribers WHERE unsubscribed_at IS NULL GROUP BY month ORDER BY month DESC LIMIT 12"
  ).all();
  return c.json({
    total: total?.n || 0,
    active: active?.n || 0,
    unsubscribed: unsubscribed?.n || 0,
    thisMonth: thisMonth?.n || 0,
    lastMonth: lastMonth?.n || 0,
    bySource: bySource?.results || [],
    byMonth: byMonth?.results || [],
  });
});

newsletter.delete("/admin/:id", requireAuth, async (c) => {
  await c.env.DB.prepare("DELETE FROM newsletter_subscribers WHERE id = ?")
    .bind(Number(c.req.param("id")))
    .run();
  return c.body(null, { status: 204 });
});

export default newsletter;
