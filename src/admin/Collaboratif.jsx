import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  createMessage,
  createProject,
  createTask,
  deleteMessage,
  deleteProject,
  deleteTask,
  getMessages,
  getMembers,
  getProjects,
  getTasks,
  updateProject,
  updateTask,
} from "../lib/api";

const STATUS_LABELS = {
  a_faire: "À faire",
  en_cours: "En cours",
  terminee: "Terminée",
};

export default function Collaboratif() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [projectModal, setProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", status: "en_cours", due_date: "" });
  const [savingProject, setSavingProject] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assigned_to: "", due_date: "" });
  const [savingTask, setSavingTask] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const [p, m] = await Promise.all([getProjects(), getMembers()]);
      setProjects(Array.isArray(p) ? p : []);
      setMembers(Array.isArray(m) ? m : []);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Impossible de charger les projets");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function selectProject(p) {
    setCurrent(p);
    setError("");
    try {
      const [t, msg] = await Promise.all([getTasks(p.id), getMessages(p.id)]);
      setTasks(Array.isArray(t) ? t : []);
      setMessages(Array.isArray(msg) ? msg : []);
    } catch (err) {
      setError(err.message || "Impossible de charger le projet");
    }
  }

  async function handleProjectSubmit(e) {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setError("Le nom du projet est requis");
      return;
    }
    setSavingProject(true);
    setError("");
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectForm);
      } else {
        await createProject(projectForm);
      }
      setProjectModal(false);
      setSuccess(editingProject ? "Projet mis à jour." : "Projet créé.");
      setTimeout(() => setSuccess(""), 3500);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleProjectDelete(p) {
    if (!window.confirm(`Supprimer le projet « ${p.name} » et toutes ses données ?`)) return;
    setBusyId(p.id);
    setError("");
    try {
      await deleteProject(p.id);
      setProjects((l) => l.filter((x) => x.id !== p.id));
      if (current?.id === p.id) {
        setCurrent(null);
        setTasks([]);
        setMessages([]);
      }
      setSuccess("Projet supprimé.");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setError("Le titre de la tâche est requis");
      return;
    }
    setSavingTask(true);
    setError("");
    try {
      await createTask(current.id, taskForm);
      setTaskModal(false);
      setTaskForm({ title: "", description: "", assigned_to: "", due_date: "" });
      const t = await getTasks(current.id);
      setTasks(Array.isArray(t) ? t : []);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout de la tâche");
    } finally {
      setSavingTask(false);
    }
  }

  async function toggleTask(task) {
    const next = task.status === "terminee" ? "en_cours" : "terminee";
    try {
      await updateTask(task.id, { ...task, status: next });
      setTasks((l) => l.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    } catch (err) {
      setError(err.message || "Erreur de mise à jour");
    }
  }

  async function handleTaskDelete(taskId) {
    setBusyId(taskId);
    try {
      await deleteTask(taskId);
      setTasks((l) => l.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    setSendingMsg(true);
    setError("");
    try {
      await createMessage(current.id, msgText.trim());
      setMsgText("");
      const msg = await getMessages(current.id);
      setMessages(Array.isArray(msg) ? msg : []);
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi");
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleMessageDelete(id) {
    setBusyId(id);
    try {
      await deleteMessage(id);
      setMessages((l) => l.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Travail collaboratif</h2>
          <p>Espaces de partage, discussions et projets communs entre membres.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={loadProjects} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => {
              setEditingProject(null);
              setProjectForm({ name: "", description: "", status: "en_cours", due_date: "" });
              setProjectModal(true);
            }}
          >
            <Plus size={16} /> Nouveau projet
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="collab-layout">
        <div className="collab-list">
          {loading ? (
            <div className="admin-empty">
              <Loader2 className="spin" size={20} /> Chargement…
            </div>
          ) : projects.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty-icon"><FolderKanban size={24} /></span>
              Aucun projet.
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className={`collab-item${current?.id === p.id ? " is-active" : ""}`}
                onClick={() => selectProject(p)}
              >
                <div className="collab-item-head">
                  <strong>{p.name}</strong>
                  <span className={`badge ${p.status === "termine" ? "badge--green" : p.status === "en_cours" ? "badge--blue" : "badge--lime"}`}>
                    {p.status === "termine" ? "Terminé" : p.status === "en_cours" ? "En cours" : "Planifié"}
                  </span>
                </div>
                <small>{p.tasks_done}/{p.tasks_total} tâches terminées</small>
                <div className="collab-item-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="admin-btn admin-btn--icon"
                    title="Modifier"
                    onClick={() => {
                      setEditingProject(p);
                      setProjectForm({
                        name: p.name || "",
                        description: p.description || "",
                        status: p.status || "en_cours",
                        due_date: p.due_date ? p.due_date.slice(0, 10) : "",
                      });
                      setProjectModal(true);
                    }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="admin-btn admin-btn--icon danger"
                    title="Supprimer"
                    disabled={busyId === p.id}
                    onClick={() => handleProjectDelete(p)}
                  >
                    {busyId === p.id ? <Loader2 className="spin" size={14} /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="collab-detail">
          {!current ? (
            <div className="admin-empty">
              <span className="admin-empty-icon"><FolderKanban size={24} /></span>
              Sélectionnez un projet pour voir ses tâches et sa discussion.
            </div>
          ) : (
            <>
              <div className="collab-detail-head">
                <div>
                  <h3>{current.name}</h3>
                  {current.description && <p>{current.description}</p>}
                </div>
              </div>

              <div className="collab-columns">
                <div className="collab-panel">
                  <div className="collab-panel-head">
                    <h4>Tâches</h4>
                    <button
                      className="admin-btn admin-btn--soft admin-btn--sm"
                      onClick={() => setTaskModal(true)}
                    >
                      <Plus size={14} /> Tâche
                    </button>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="collab-empty-text">Aucune tâche pour ce projet.</p>
                  ) : (
                    <ul className="task-list">
                      {tasks.map((t) => (
                        <li key={t.id} className={`task-item${t.status === "terminee" ? " is-done" : ""}`}>
                          <button
                            className="task-check"
                            onClick={() => toggleTask(t)}
                            title={t.status === "terminee" ? "Rouvrir" : "Marquer terminée"}
                          >
                            {t.status === "terminee" ? <CheckCircle2 size={17} /> : <span />}
                          </button>
                          <div className="task-body">
                            <strong>{t.title}</strong>
                            {t.description && <small>{t.description}</small>}
                            <span className="task-meta">
                              <span className={`badge ${t.status === "terminee" ? "badge--green" : t.status === "en_cours" ? "badge--blue" : "badge--lime"}`}>
                                {STATUS_LABELS[t.status] || t.status}
                              </span>
                              {t.assigned_name && (
                                <small> — {t.assigned_name}</small>
                              )}
                              {t.due_date && <small> — échéance {t.due_date.slice(0, 10)}</small>}
                            </span>
                          </div>
                          <button
                            className="admin-btn admin-btn--icon danger"
                            title="Supprimer"
                            disabled={busyId === t.id}
                            onClick={() => handleTaskDelete(t.id)}
                          >
                            {busyId === t.id ? <Loader2 className="spin" size={13} /> : <Trash2 size={13} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="collab-panel">
                  <div className="collab-panel-head">
                    <h4>Discussion</h4>
                  </div>
                  <div className="msg-list">
                    {messages.length === 0 ? (
                      <p className="collab-empty-text">Aucun message. Lancez la discussion !</p>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className="msg-item">
                          <div className="msg-head">
                            <span className="msg-avatar"><User size={13} /></span>
                            <strong>{m.user_name || "Utilisateur"}</strong>
                            <small>{m.created_at ? new Date(m.created_at).toLocaleString("fr-FR") : ""}</small>
                            <button
                              className="admin-btn admin-btn--icon danger"
                              title="Supprimer"
                              disabled={busyId === m.id}
                              onClick={() => handleMessageDelete(m.id)}
                              style={{ marginLeft: "auto" }}
                            >
                              {busyId === m.id ? <Loader2 className="spin" size={12} /> : <Trash2 size={12} />}
                            </button>
                          </div>
                          <p>{m.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <form className="msg-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Écrire un message…"
                    />
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      disabled={sendingMsg || !msgText.trim()}
                    >
                      {sendingMsg ? <Loader2 className="spin" size={14} /> : <Send size={14} />}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {projectModal && (
        <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setProjectModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>{editingProject ? "Modifier le projet" : "Nouveau projet"}</h3>
              <button className="admin-icon-btn" onClick={() => setProjectModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleProjectSubmit} className="admin-form">
              <label className="admin-field">
                <span>Nom du projet *</span>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex : Site web — refonte 2026"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Objectifs, périmètre…"
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Statut</span>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="en_cours">En cours</option>
                    <option value="planifie">Planifié</option>
                    <option value="termine">Terminé</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Date d'échéance</span>
                  <input
                    type="date"
                    value={projectForm.due_date}
                    onChange={(e) => setProjectForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setProjectModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={savingProject}>
                  {savingProject ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  {editingProject ? "Enregistrer" : "Créer le projet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {taskModal && current && (
        <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setTaskModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>Nouvelle tâche — {current.name}</h3>
              <button className="admin-icon-btn" onClick={() => setTaskModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="admin-form">
              <label className="admin-field">
                <span>Titre *</span>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex : Rédiger le rapport d'audit"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Détails de la tâche…"
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Assigné à</span>
                  <select
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm((f) => ({ ...f, assigned_to: e.target.value }))}
                  >
                    <option value="">— Non assigné —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Échéance</span>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setTaskModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={savingTask}>
                  {savingTask ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  Ajouter la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
