import { verifyAccessToken } from "./tokens.js";
import { pool } from "./db.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? verifyAccessToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, name, role FROM users WHERE id = ? AND active = 1",
      [payload.sub]
    );
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Compte inactif ou supprimé" });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
