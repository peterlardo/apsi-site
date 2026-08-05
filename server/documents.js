import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10).toLowerCase();
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const router = Router();
router.use(requireAuth);

const CATEGORIES = ["officiel", "financier", "compte_rendu", "rapport", "projet", "autre"];

router.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const where = [];
    const params = [];
    if (category) {
      where.push("d.category = ?");
      params.push(category);
    }
    if (q) {
      where.push("(d.title LIKE ? OR d.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    const [rows] = await pool.execute(
      `SELECT d.*, u.name AS uploaded_by_name FROM documents d
       LEFT JOIN users u ON u.id = d.uploaded_by
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY d.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [[total]] = await pool.execute("SELECT COUNT(*) AS n, COALESCE(SUM(file_size), 0) AS size FROM documents");
    const [byCat] = await pool.execute("SELECT category, COUNT(*) AS n FROM documents GROUP BY category");
    res.json({ total: total.n, size: Number(total.size) || 0, categories: byCat });
  } catch (err) {
    next(err);
  }
});

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni" });
    const { title, category, description } = req.body;
    if (!title) return res.status(400).json({ error: "Le titre est requis" });
    const cat = CATEGORIES.includes(category) ? category : "autre";
    const [result] = await pool.execute(
      `INSERT INTO documents (title, category, description, file_name, file_size, mime_type, stored_name, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        cat,
        description || null,
        req.file.originalname,
        req.file.size,
        req.file.mimetype,
        req.file.filename,
        req.user.id,
      ]
    );
    const [rows] = await pool.execute(
      "SELECT d.*, u.name AS uploaded_by_name FROM documents d LEFT JOIN users u ON u.id = d.uploaded_by WHERE d.id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (req.file) fs.unlink(path.join(UPLOAD_DIR, req.file.filename), () => {});
    next(err);
  }
});

router.get("/:id/download", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM documents WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Document introuvable" });
    const doc = rows[0];
    const filePath = path.join(UPLOAD_DIR, doc.stored_name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Fichier manquant sur le serveur" });
    res.download(filePath, doc.file_name);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM documents WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Document introuvable" });
    fs.unlink(path.join(UPLOAD_DIR, rows[0].stored_name), () => {});
    await pool.execute("DELETE FROM documents WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
