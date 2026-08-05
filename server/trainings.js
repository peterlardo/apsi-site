import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();

const TRAINING_FIELDS = [
  "slug",
  "icon",
  "title",
  "category",
  "level",
  "format",
  "duration",
  "next_session",
  "description",
  "active",
  "sort_order",
];

const REGISTRATION_STATUSES = ["nouvelle", "contactee", "confirmee", "annulee"];

function slugify(title) {
  return String(title || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110) || `formation-${Date.now()}`;
}

function clean(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function pickTraining(body) {
  const out = {};
  for (const field of TRAINING_FIELDS) {
    if (body[field] === undefined) continue;
    if (field === "active") {
      out.active = body.active === true || body.active === 1 || body.active === "1" ? 1 : 0;
      continue;
    }
    if (field === "sort_order") {
      out.sort_order = Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0;
      continue;
    }
    out[field] = clean(body[field]);
  }
  if (body.nextSession !== undefined && out.next_session === undefined) {
    out.next_session = clean(body.nextSession);
  }
  if (body.text !== undefined && out.description === undefined) {
    out.description = clean(body.text);
  }
  if (!out.slug && out.title) {
    out.slug = slugify(out.title);
  }
  return out;
}

function sendDuplicate(err, res) {
  if (err?.code === "ER_DUP_ENTRY") {
    res.status(409).json({ error: "Une formation avec ce slug existe déjà" });
    return true;
  }
  return false;
}

router.get("/", async (req, res, next) => {
  try {
    const { category, level, format, q } = req.query;
    const where = ["active = 1"];
    const params = [];
    if (category) {
      where.push("category = ?");
      params.push(category);
    }
    if (level) {
      where.push("level = ?");
      params.push(level);
    }
    if (format) {
      where.push("format = ?");
      params.push(format);
    }
    if (q) {
      where.push("(title LIKE ? OR category LIKE ? OR description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [rows] = await pool.execute(
      `SELECT * FROM trainings
       WHERE ${where.join(" AND ")}
       ORDER BY sort_order ASC, title ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/registrations", async (req, res, next) => {
  try {
    const trainingId = req.body.training_id ? Number(req.body.training_id) : null;
    const fullName = clean(req.body.full_name || req.body.fullName);
    const email = clean(req.body.email);
    const phone = clean(req.body.phone);
    const organization = clean(req.body.organization);
    const profile = clean(req.body.profile);
    const notes = clean(req.body.notes);
    let trainingTitle = clean(req.body.training_title || req.body.training);
    let resolvedTrainingId = null;

    if (!fullName || !email) {
      return res.status(400).json({ error: "Le nom complet et l'email sont requis" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Adresse email invalide" });
    }

    if (trainingId) {
      const [rows] = await pool.execute(
        "SELECT id, title FROM trainings WHERE id = ? AND active = 1",
        [trainingId]
      );
      if (!rows.length) {
        return res.status(400).json({ error: "Formation introuvable ou inactive" });
      }
      resolvedTrainingId = rows[0].id;
      trainingTitle = rows[0].title;
    }

    if (!trainingTitle) {
      return res.status(400).json({ error: "La formation choisie est requise" });
    }

    const [result] = await pool.execute(
      `INSERT INTO training_registrations
       (training_id, training_title, full_name, email, phone, organization, profile, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resolvedTrainingId, trainingTitle, fullName, email, phone, organization, profile, notes]
    );
    const [rows] = await pool.execute("SELECT * FROM training_registrations WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.use(requireAuth);

router.get("/admin", async (req, res, next) => {
  try {
    const { active, category, q } = req.query;
    const where = [];
    const params = [];
    if (active === "1" || active === "0") {
      where.push("t.active = ?");
      params.push(Number(active));
    }
    if (category) {
      where.push("t.category = ?");
      params.push(category);
    }
    if (q) {
      where.push("(t.title LIKE ? OR t.category LIKE ? OR t.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const [rows] = await pool.execute(
      `SELECT t.*,
        (SELECT COUNT(*) FROM training_registrations r WHERE r.training_id = t.id) AS registrations_count
       FROM trainings t
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY t.sort_order ASC, t.title ASC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/admin", async (req, res, next) => {
  try {
    const data = pickTraining(req.body);
    if (!data.title) {
      return res.status(400).json({ error: "Le titre de la formation est requis" });
    }
    data.slug ||= slugify(data.title);
    data.icon ||= "GraduationCap";
    data.category ||= "";
    data.level ||= "";
    data.format ||= "";
    data.duration ||= "";
    data.next_session ||= "";
    data.active = data.active ?? 1;
    data.sort_order = data.sort_order ?? 0;

    const keys = Object.keys(data);
    const [result] = await pool.execute(
      `INSERT INTO trainings (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`,
      Object.values(data)
    );
    const [rows] = await pool.execute("SELECT * FROM trainings WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (!sendDuplicate(err, res)) next(err);
  }
});

router.get("/admin/registrations", async (req, res, next) => {
  try {
    const { status, training_id } = req.query;
    const where = [];
    const params = [];
    if (status) {
      where.push("r.status = ?");
      params.push(status);
    }
    if (training_id) {
      where.push("r.training_id = ?");
      params.push(training_id);
    }
    const [rows] = await pool.execute(
      `SELECT r.*, t.slug AS training_slug, t.category AS training_category
       FROM training_registrations r
       LEFT JOIN trainings t ON t.id = r.training_id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY r.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put("/admin/registrations/:id", async (req, res, next) => {
  try {
    const status = clean(req.body.status);
    if (!REGISTRATION_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Statut d'inscription invalide" });
    }
    await pool.execute("UPDATE training_registrations SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    const [rows] = await pool.execute("SELECT * FROM training_registrations WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ error: "Inscription introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/admin/registrations/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM training_registrations WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.put("/admin/:id", async (req, res, next) => {
  try {
    const data = pickTraining(req.body);
    if (!Object.keys(data).length) {
      return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    }
    if (data.title && !data.slug && req.body.slug === undefined) {
      delete data.slug;
    }
    await pool.execute(
      `UPDATE trainings SET ${Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ")} WHERE id = ?`,
      [...Object.values(data), req.params.id]
    );
    const [rows] = await pool.execute("SELECT * FROM trainings WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Formation introuvable" });
    res.json(rows[0]);
  } catch (err) {
    if (!sendDuplicate(err, res)) next(err);
  }
});

router.delete("/admin/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM trainings WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
