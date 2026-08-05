import { Hono } from "hono";
import { requireAuth } from "./middleware.js";

const projects = new Hono();
projects.use("*", requireAuth);

projects.get("/", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, u.name AS created_by_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS tasks_total,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'terminee') AS tasks_done
     FROM projects p LEFT JOIN users u ON u.id = p.created_by ORDER BY p.created_at DESC`
  ).all();
  return c.json(results);
});

projects.post("/", async (c) => {
  const { name, description, status, due_date } = await c.req.json();
  if (!name) return c.json({ error: "Le nom du projet est requis" }, 400);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO projects (name, description, status, due_date, created_by) VALUES (?, ?, ?, ?, ?)"
  ).bind(name, description || null, status || "en_cours", due_date || null, c.get("user").id).run();
  const row = await c.env.DB.prepare(
    "SELECT p.*, u.name AS created_by_name, 0 AS tasks_total, 0 AS tasks_done FROM projects p LEFT JOIN users u ON u.id = p.created_by WHERE p.id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

projects.put("/:id", async (c) => {
  const { name, description, status, due_date } = await c.req.json();
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push("name = ?"); params.push(name); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description); }
  if (status !== undefined) { fields.push("status = ?"); params.push(status); }
  if (due_date !== undefined) { fields.push("due_date = ?"); params.push(due_date || null); }
  if (!fields.length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  await c.env.DB.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`).bind(...params, c.req.param("id")).run();
  const row = await c.env.DB.prepare("SELECT p.*, u.name AS created_by_name FROM projects p LEFT JOIN users u ON u.id = p.created_by WHERE p.id = ?").bind(c.req.param("id")).first();
  if (!row) return c.json({ error: "Projet introuvable" }, 404);
  return c.json(row);
});

projects.delete("/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(c.req.param("id")).run();
  return c.body(null, { status: 204 });
});

projects.get("/:id/tasks", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.*, m.first_name, m.last_name FROM tasks t
     LEFT JOIN members m ON m.id = t.assigned_to
     WHERE t.project_id = ? ORDER BY t.status ASC, t.due_date ASC, t.created_at ASC`
  ).bind(c.req.param("id")).all();
  return c.json(results);
});

projects.post("/:id/tasks", async (c) => {
  const { title, description, assigned_to, status, due_date } = await c.req.json();
  if (!title) return c.json({ error: "Le titre de la tâche est requis" }, 400);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO tasks (project_id, title, description, assigned_to, status, due_date) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(c.req.param("id"), title, description || null, assigned_to || null, status || "a_faire", due_date || null).run();
  const row = await c.env.DB.prepare("SELECT t.*, m.first_name, m.last_name FROM tasks t LEFT JOIN members m ON m.id = t.assigned_to WHERE t.id = ?").bind(meta.last_row_id).first();
  return c.json(row, 201);
});

projects.put("/tasks/:taskId", async (c) => {
  const { title, description, assigned_to, status, due_date } = await c.req.json();
  const fields = [];
  const params = [];
  if (title !== undefined) { fields.push("title = ?"); params.push(title); }
  if (description !== undefined) { fields.push("description = ?"); params.push(description); }
  if (assigned_to !== undefined) { fields.push("assigned_to = ?"); params.push(assigned_to || null); }
  if (status !== undefined) { fields.push("status = ?"); params.push(status); }
  if (due_date !== undefined) { fields.push("due_date = ?"); params.push(due_date || null); }
  if (!fields.length) return c.json({ error: "Aucune donnée à mettre à jour" }, 400);
  await c.env.DB.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`).bind(...params, c.req.param("taskId")).run();
  const row = await c.env.DB.prepare("SELECT t.*, m.first_name, m.last_name FROM tasks t LEFT JOIN members m ON m.id = t.assigned_to WHERE t.id = ?").bind(c.req.param("taskId")).first();
  if (!row) return c.json({ error: "Tâche introuvable" }, 404);
  return c.json(row);
});

projects.delete("/tasks/:taskId", async (c) => {
  await c.env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(c.req.param("taskId")).run();
  return c.body(null, { status: 204 });
});

projects.get("/:id/messages", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT msg.*, u.name AS user_name FROM messages msg
     LEFT JOIN users u ON u.id = msg.user_id
     WHERE msg.project_id = ? ORDER BY msg.created_at ASC`
  ).bind(c.req.param("id")).all();
  return c.json(results);
});

projects.post("/:id/messages", async (c) => {
  const body = await c.req.json();
  if (!body.body?.trim()) return c.json({ error: "Le message est vide" }, 400);
  const { meta } = await c.env.DB.prepare(
    "INSERT INTO messages (project_id, user_id, body) VALUES (?, ?, ?)"
  ).bind(c.req.param("id"), c.get("user").id, body.body.trim()).run();
  const row = await c.env.DB.prepare(
    "SELECT msg.*, u.name AS user_name FROM messages msg LEFT JOIN users u ON u.id = msg.user_id WHERE msg.id = ?"
  ).bind(meta.last_row_id).first();
  return c.json(row, 201);
});

projects.delete("/messages/:messageId", async (c) => {
  await c.env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(c.req.param("messageId")).run();
  return c.body(null, { status: 204 });
});

export default projects;
