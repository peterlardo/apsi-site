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
import { sendResetPasswordEmail } from "./email.js";

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

auth.post("/forgot-password", async (c) => {
  const body = await c.req.json();
  const email = String(body.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "Adresse email invalide" }, 400);
  }
  const user = await c.env.DB.prepare("SELECT id, email, name FROM users WHERE email = ? AND active = 1").bind(email).first();
  if (!user) {
    return c.json({ ok: true, message: "Si cette adresse est associée à un compte, vous recevrez un lien de réinitialisation." });
  }
  const crypto = globalThis.crypto || (await import("crypto")).webcrypto;
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = Array.from(tokenBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const expiresAt = new Date(Date.now() + 3600000).toISOString();
  await c.env.DB.prepare(
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
  ).bind(user.id, token, expiresAt).run();
  const resetUrl = `${c.env.CORS_ORIGIN || "https://apsi-cg.pages.dev"}/admin/reset-password?token=${token}`;
  try {
    await sendResetPasswordEmail(c.env, { name: user.name, email: user.email, resetUrl });
  } catch (e) {
    console.error("Reset email error:", e.message);
  }
  return c.json({ ok: true, message: "Si cette adresse est associée à un compte, vous recevrez un lien de réinitialisation." });
});

auth.post("/reset-password", async (c) => {
  const body = await c.req.json();
  const { token, newPassword } = body || {};
  if (!token || !newPassword) {
    return c.json({ error: "Token et nouveau mot de passe requis" }, 400);
  }
  if (newPassword.length < 8) {
    return c.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, 400);
  }
  const row = await c.env.DB.prepare(
    "SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?"
  ).bind(token).first();
  if (!row || row.used) {
    return c.json({ error: "Lien invalide ou déjà utilisé" }, 400);
  }
  if (new Date(row.expires_at) < new Date()) {
    return c.json({ error: "Ce lien a expiré. Demandez un nouveau lien." }, 400);
  }
  const newHash = await bcrypt.hash(newPassword, 12);
  await c.env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").bind(newHash, row.user_id).run();
  await c.env.DB.prepare("UPDATE password_reset_tokens SET used = 1 WHERE id = ?").bind(row.id).run();
  await c.env.DB.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL").bind(row.user_id).run();
  return c.json({ ok: true, message: "Mot de passe réinitialisé avec succès." });
});

export default auth;
