import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me";
const ACCESS_TTL = "15m";
export const REFRESH_TTL_DAYS = 7;

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}

export async function createRefreshToken(user) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 864e5);
  const token = jwt.sign({ sub: user.id, jti: id }, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TTL_DAYS}d`,
  });
  await pool.execute(
    "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    [id, user.id, hashToken(token), expiresAt]
  );
  return token;
}

export async function revokeRefreshToken(id) {
  await pool.execute(
    "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL",
    [id]
  );
}

export async function rotateRefreshToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, REFRESH_SECRET);
  } catch {
    return null;
  }
  const [rows] = await pool.execute(
    "SELECT id, token_hash, expires_at, revoked_at FROM refresh_tokens WHERE id = ?",
    [payload.jti]
  );
  const row = rows[0];
  if (!row || row.revoked_at) return null;
  if (new Date(row.expires_at) <= new Date()) return null;
  if (row.token_hash !== hashToken(token)) return null;

  await revokeRefreshToken(row.id);
  const [users] = await pool.execute(
    "SELECT id, email, name, role FROM users WHERE id = ? AND active = 1",
    [payload.sub]
  );
  const user = users[0];
  if (!user) return null;
  return { user, refreshToken: await createRefreshToken(user) };
}
