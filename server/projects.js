import { Router } from "express";
import { pool } from "./db.js";
import { requireAuth } from "./middleware.js";

const router = Router();
router.use(requireAuth);

/* ===== Projets ===== */

router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS created_by_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS tasks_total,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'terminee') AS tasks_done
       FROM projects p
       LEFT JOIN users u ON u.id = p.created_by
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description, status, due_date } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom du projet est requis" });
    const [result] = await pool.execute(
      "INSERT INTO projects (name, description, status, due_date, created_by) VALUES (?, ?, ?, ?, ?)",
      [name, description || null, status || "en_cours", due_date || null, req.user.id]
    );
    const [rows] = await pool.execute(
      "SELECT p.*, u.name AS created_by_name, 0 AS tasks_total, 0 AS tasks_done FROM projects p LEFT JOIN users u ON u.id = p.created_by WHERE p.id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { name, description, status, due_date } = req.body;
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push("name = ?"); params.push(name); }
    if (description !== undefined) { fields.push("description = ?"); params.push(description); }
    if (status !== undefined) { fields.push("status = ?"); params.push(status); }
    if (due_date !== undefined) { fields.push("due_date = ?"); params.push(due_date || null); }
    if (!fields.length) return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    await pool.execute(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, [...params, req.params.id]);
    const [rows] = await pool.execute(
      "SELECT p.*, u.name AS created_by_name FROM projects p LEFT JOIN users u ON u.id = p.created_by WHERE p.id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Projet introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM projects WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ===== Tâches d'un projet ===== */

router.get("/:id/tasks", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, m.first_name, m.last_name FROM tasks t
       LEFT JOIN members m ON m.id = t.assigned_to
       WHERE t.project_id = ? ORDER BY t.status ASC, t.due_date ASC, t.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/tasks", async (req, res, next) => {
  try {
    const { title, description, assigned_to, status, due_date } = req.body;
    if (!title) return res.status(400).json({ error: "Le titre de la tâche est requis" });
    const [result] = await pool.execute(
      "INSERT INTO tasks (project_id, title, description, assigned_to, status, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.params.id, title, description || null, assigned_to || null, status || "a_faire", due_date || null]
    );
    const [rows] = await pool.execute(
      "SELECT t.*, m.first_name, m.last_name FROM tasks t LEFT JOIN members m ON m.id = t.assigned_to WHERE t.id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.put("/tasks/:taskId", async (req, res, next) => {
  try {
    const { title, description, assigned_to, status, due_date } = req.body;
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push("title = ?"); params.push(title); }
    if (description !== undefined) { fields.push("description = ?"); params.push(description); }
    if (assigned_to !== undefined) { fields.push("assigned_to = ?"); params.push(assigned_to || null); }
    if (status !== undefined) { fields.push("status = ?"); params.push(status); }
    if (due_date !== undefined) { fields.push("due_date = ?"); params.push(due_date || null); }
    if (!fields.length) return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    await pool.execute(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, [...params, req.params.taskId]);
    const [rows] = await pool.execute(
      "SELECT t.*, m.first_name, m.last_name FROM tasks t LEFT JOIN members m ON m.id = t.assigned_to WHERE t.id = ?",
      [req.params.taskId]
    );
    if (!rows.length) return res.status(404).json({ error: "Tâche introuvable" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/tasks/:taskId", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM tasks WHERE id = ?", [req.params.taskId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/* ===== Messages / discussion ===== */

router.get("/:id/messages", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT msg.*, u.name AS user_name FROM messages msg
       LEFT JOIN users u ON u.id = msg.user_id
       WHERE msg.project_id = ? ORDER BY msg.created_at ASC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/messages", async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: "Le message est vide" });
    const [result] = await pool.execute(
      "INSERT INTO messages (project_id, user_id, body) VALUES (?, ?, ?)",
      [req.params.id, req.user.id, body.trim()]
    );
    const [rows] = await pool.execute(
      `SELECT msg.*, u.name AS user_name FROM messages msg LEFT JOIN users u ON u.id = msg.user_id WHERE msg.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/messages/:messageId", async (req, res, next) => {
  try {
    await pool.execute("DELETE FROM messages WHERE id = ?", [req.params.messageId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
