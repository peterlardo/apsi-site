import { Hono } from "hono";

const consents = new Hono();

function getIp(c) {
  return c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || null;
}

consents.post("/", async (c) => {
  const b = await c.req.json();
  const email = b.email ? String(b.email).trim().toLowerCase() : null;
  const categories = typeof b.categories === "object" && b.categories !== null ? b.categories : {};
  await c.env.DB.prepare(
    "INSERT INTO consents (email, categories, ip, user_agent) VALUES (?, ?, ?, ?)"
  ).bind(email || null, JSON.stringify(categories), getIp(c), c.req.header("user-agent") || null).run();
  return c.json({ ok: true }, 201);
});

consents.get("/:email", async (c) => {
  const email = c.req.param("email").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ error: "Adresse e-mail invalide." }, 400);
  const row = await c.env.DB.prepare(
    "SELECT categories, ip, created_at FROM consents WHERE email = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(email).first();
  if (!row) return c.json({ consents: null }, 404);
  return c.json({ consents: JSON.parse(row.categories), recordedAt: row.created_at });
});

export default consents;
