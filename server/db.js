import { DEFAULT_TRAININGS } from "./training-defaults.js";

export function createPool(db) {
  return {
    async execute(sql, params = []) {
      const upper = sql.trim().toUpperCase();
      const isRead =
        upper.startsWith("SELECT") ||
        upper.startsWith("WITH") ||
        upper.startsWith("PRAGMA");

      if (isRead) {
        const { results } = await db
          .prepare(sql)
          .bind(...params)
          .all();
        return [results];
      }

      const { meta } = await db
        .prepare(sql)
        .bind(...params)
        .run();
      return [
        { insertId: meta.last_row_id, affectedRows: meta.changes },
      ];
    },
  };
}

export async function initDb(db) {
  for (const t of DEFAULT_TRAININGS) {
    const existing = await db
      .prepare("SELECT id FROM trainings WHERE slug = ?")
      .bind(t.slug)
      .first();
    if (!existing) {
      await db
        .prepare(
          `INSERT INTO trainings (slug, icon, title, category, level, format, duration, next_session, description, active, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`
        )
        .bind(
          t.slug,
          t.icon,
          t.title,
          t.category,
          t.level,
          t.format,
          t.duration,
          t.next_session,
          t.description
        )
        .run();
    }
  }
}
