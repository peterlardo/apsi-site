import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from "./tokens.js";
import { requireAuth } from "./middleware.js";

const REFRESH_COOKIE = "apsi_refresh";

const auth = new Hono();

function setRefreshCookie(c, token) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/api/auth",
    maxAge: 7 * 86400,
  });
}

function clearRefreshCookie(c) {
  deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const { email, password } = body || {};
  if (!email || !password) {
    return c.json({ error: "Email et mot de passe requis" }, 400);
  }
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email.trim().toLowerCase())
    .first();
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return c.json({ error: "Email ou mot de passe incorrect" }, 401);
  }
  if (!user.active) {
    return c.json({ error: "Compte désactivé" }, 403);
  }
  await c.env.DB.prepare("UPDATE users SET updated_at = datetime('now') WHERE id = ?")
    .bind(user.id)
    .run();
  const refreshToken = await createRefreshToken(user, c.env.DB);
  setRefreshCookie(c, refreshToken);
  return c.json({
    user: publicUser(user),
    accessToken: await signAccessToken(user),
  });
});

auth.post("/refresh", async (c) => {
  const token = getCookie(c, REFRESH_COOKIE);
  if (!token) {
    return c.json({ error: "Session expirée" }, 401);
  }
  const rotated = await rotateRefreshToken(token, c.env.DB);
  if (!rotated) {
    clearRefreshCookie(c);
    return c.json({ error: "Session expirée" }, 401);
  }
  setRefreshCookie(c, rotated.refreshToken);
  return c.json({
    user: publicUser(rotated.user),
    accessToken: await signAccessToken(rotated.user),
  });
});

auth.post("/logout", async (c) => {
  const token = getCookie(c, REFRESH_COOKIE);
  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString()
      );
      if (payload?.jti) await revokeRefreshToken(payload.jti, c.env.DB);
    } catch {}
  }
  clearRefreshCookie(c);
  return c.body(null, { status: 204 });
});

auth.get("/me", requireAuth, async (c) => {
  return c.json({ user: publicUser(c.get("user")) });
});

auth.post("/change-password", requireAuth, async (c) => {
  const body = await c.req.json();
  const { currentPassword, newPassword } = body || {};
  if (!currentPassword || !newPassword) {
    return c.json({ error: "Champs requis" }, 400);
  }
  if (newPassword.length < 8) {
    return c.json(
      { error: "Le nouveau mot de passe doit contenir au moins 8 caractères" },
      400
    );
  }
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(c.get("user").id)
    .first();
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    return c.json({ error: "Mot de passe actuel incorrect" }, 400);
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await c.env.DB.prepare(
    "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(newHash, user.id)
    .run();
  await c.env.DB.prepare(
    "UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL"
  )
    .bind(user.id)
    .run();
  clearRefreshCookie(c);
  return c.json({ ok: true });
});

export default auth;
