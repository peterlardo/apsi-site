import crypto from "node:crypto";
import * as jose from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-change-me"
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-me"
);

export const REFRESH_TTL_DAYS = 7;

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(user) {
  return new jose.SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

export async function verifyAccessToken(token) {
  try {
    const { payload } = await jose.jwtVerify(token, ACCESS_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function createRefreshToken(user, db) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_TTL_DAYS * 864e5).toISOString();
  const token = await new jose.SignJWT({ sub: user.id, jti: id })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${REFRESH_TTL_DAYS}d`)
    .sign(REFRESH_SECRET);

  await db
    .prepare(
      "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
    )
    .bind(id, user.id, hashToken(token), expiresAt)
    .run();

  return token;
}

export async function revokeRefreshToken(id, db) {
  await db
    .prepare(
      "UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE id = ? AND revoked_at IS NULL"
    )
    .bind(id)
    .run();
}

export async function rotateRefreshToken(token, db) {
  let payload;
  try {
    ({ payload } = await jose.jwtVerify(token, REFRESH_SECRET));
  } catch {
    return null;
  }

  const row = await db
    .prepare(
      "SELECT id, token_hash, expires_at, revoked_at FROM refresh_tokens WHERE id = ?"
    )
    .bind(payload.jti)
    .first();

  if (!row || row.revoked_at) return null;
  if (new Date(row.expires_at) <= new Date()) return null;
  if (row.token_hash !== hashToken(token)) return null;

  await revokeRefreshToken(row.id, db);

  const user = await db
    .prepare("SELECT id, email, name, role FROM users WHERE id = ? AND active = 1")
    .bind(payload.sub)
    .first();
  if (!user) return null;

  return { user, refreshToken: await createRefreshToken(user, db) };
}
