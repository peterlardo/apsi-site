import { verifyAccessToken } from "./tokens.js";

export async function requireAuth(c, next) {
  const header = c.req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? await verifyAccessToken(token) : null;
  if (!payload) {
    return c.json({ error: "Non authentifié" }, 401);
  }
  const user = await c.env.DB.prepare(
    "SELECT id, email, name, role FROM users WHERE id = ? AND active = 1"
  )
    .bind(payload.sub)
    .first();
  if (!user) {
    return c.json({ error: "Compte inactif ou supprimé" }, 401);
  }
  c.set("user", user);
  await next();
}
