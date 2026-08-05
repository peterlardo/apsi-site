import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";
import {
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  signAccessToken,
} from "./tokens.js";
import { requireAuth } from "./middleware.js";

export const REFRESH_COOKIE = "apsi_refresh";
const IS_PROD = process.env.NODE_ENV === "production";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives. Réessayez dans 15 minutes." },
});

const router = Router();

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 7 * 864e5,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
    if (!user.active) {
      return res.status(403).json({ error: "Compte désactivé" });
    }
    await pool.execute("UPDATE users SET updated_at = NOW() WHERE id = ?", [user.id]);
    setRefreshCookie(res, await createRefreshToken(user));
    res.json({ user: publicUser(user), accessToken: signAccessToken(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      return res.status(401).json({ error: "Session expirée" });
    }
    const rotated = await rotateRefreshToken(token);
    if (!rotated) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: "Session expirée" });
    }
    setRefreshCookie(res, rotated.refreshToken);
    res.json({
      user: publicUser(rotated.user),
      accessToken: signAccessToken(rotated.user),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      const payload = token.split(".").length === 3 ? JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString()
      ) : null;
      if (payload?.jti) await revokeRefreshToken(payload.jti);
    }
    clearRefreshCookie(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ error: "Champs requis" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 8 caractères" });
    }
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ?", [req.user.id]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect" });
    }
    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.execute("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [
      newHash,
      user.id,
    ]);
    await pool.execute(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL",
      [user.id]
    );
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
