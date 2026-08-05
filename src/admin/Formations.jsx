import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import {
  createTraining,
  deleteTraining,
  deleteTrainingRegistration,
  getTrainingRegistrationsAdmin,
  getTrainingsAdmin,
  updateTraining,
  updateTrainingRegistration,
} from "../lib/api";

const EMPTY_TRAINING = {
  slug: "",
  icon: "GraduationCap",
  title: "",
  category: "",
  level: "Débutant",
  format: "Présentiel",
  duration: "",
  next_session: "Sur inscription",
  description: "",
  active: "1",
  sort_order: "0",
};

const ICONS = [
  "GraduationCap",
  "ShieldCheck",
  "Lock",
  "FileSearch",
  "Bug",
  "Network",
  "CloudCog",
  "Siren",
  "Laptop",
  "BookOpenCheck",
  "Award",
  "CheckCircle2",
];

const LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"];
const FORMATS = ["Présentiel", "En ligne", "Hybride", "Atelier"];
const STATUSES = [
  { value: "nouvelle", label: "Nouvelle", badge: "badge--blue" },
  { value: "contactee", label: "Contactée", badge: "badge--lime" },
  { value: "confirmee", label: "Confirmée", badge: "badge--green" },
  { value: "annulee", label: "Annulée", badge: "badge--red" },
];

function statusMeta(status) {
  return STATUSES.find((item) => item.value === status) || STATUSES[0];
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toForm(training) {
  return {
    slug: training.slug || "",
    icon: training.icon || "GraduationCap",
    title: training.title || "",
    category: training.category || "",
    level: training.level || "Débutant",
    format: training.format || "Présentiel",
    duration: training.duration || "",
    next_session: training.next_session || "Sur inscription",
    description: training.description || "",
    active: String(Number(training.active ?? 1)),
    sort_order: String(training.sort_order ?? 0),
  };
}

export default function FormationsAdmin() {
  const [tab, setTab] = useState("catalogue");
  const [trainings, setTrainings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_TRAINING);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [busyRegistrationId, setBusyRegistrationId] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [catalogue, requests] = await Promise.all([
        getTrainingsAdmin(),
        getTrainingRegistrationsAdmin(),
      ]);
      setTrainings(Array.isArray(catalogue) ? catalogue : []);
      setRegistrations(Array.isArray(requests) ? requests : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredTrainings = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return trainings;
    return trainings.filter((training) => [
      training.title,
      training.category,
      training.level,
      training.format,
      training.description,
    ].join(" ").toLowerCase().includes(q));
  }, [query, trainings]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((registration) => {
      const matchesStatus = !statusFilter || registration.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || [
        registration.full_name,
        registration.email,
        registration.training_title,
        registration.organization,
      ].join(" ").toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, registrations, statusFilter]);

  const stats = useMemo(() => ({
    total: trainings.length,
    active: trainings.filter((training) => Number(training.active) === 1).length,
    registrations: registrations.length,
    newRegistrations: registrations.filter((registration) => registration.status === "nouvelle").length,
  }), [registrations, trainings]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_TRAINING);
    setModal(true);
  }

  function openEdit(training) {
    setEditing(training);
    setForm(toForm(training));
    setModal(true);
  }

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Le titre de la formation est requis");
      return;
    }

    const payload = {
      ...form,
      slug: form.slug.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      duration: form.duration.trim(),
      next_session: form.next_session.trim(),
      description: form.description.trim(),
      active: Number(form.active),
      sort_order: Number(form.sort_order) || 0,
    };

    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateTraining(editing.id, payload);
      } else {
        await createTraining(payload);
      }
      setModal(false);
      setSuccess(editing ? "Formation mise à jour." : "Formation ajoutée.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(training) {
    if (!window.confirm(`Supprimer la formation « ${training.title} » ?`)) return;
    setBusyId(training.id);
    setError("");
    try {
      await deleteTraining(training.id);
      setTrainings((list) => list.filter((item) => item.id !== training.id));
      setSuccess("Formation supprimée.");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRegistrationStatus(registration, status) {
    setBusyRegistrationId(registration.id);
    setError("");
    try {
      const updated = await updateTrainingRegistration(registration.id, { status });
      setRegistrations((list) => list.map((item) => item.id === registration.id ? { ...item, ...updated } : item));
    } catch (err) {
      setError(err.message || "Erreur lors du changement de statut");
    } finally {
      setBusyRegistrationId(null);
    }
  }

  async function handleDeleteRegistration(registration) {
    if (!window.confirm(`Supprimer la demande de « ${registration.full_name} » ?`)) return;
    setBusyRegistrationId(registration.id);
    setError("");
    try {
      await deleteTrainingRegistration(registration.id);
      setRegistrations((list) => list.filter((item) => item.id !== registration.id));
      setSuccess("Demande supprimée.");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyRegistrationId(null);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Formations</h2>
          <p>Catalogue public, filtres et demandes d'inscription enregistrés dans MySQL.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nouvelle formation
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <div className="admin-kpis">
        <div className="admin-kpi admin-kpi--brand">
          <div className="admin-kpi-top">
            <div>
              <p className="admin-kpi-label">Formations</p>
              <h4 className="admin-kpi-value">{stats.total}</h4>
            </div>
            <span className="admin-kpi-icon"><GraduationCap size={22} /></span>
          </div>
          <div className="admin-kpi-foot">
            <span className="badge badge--blue">Catalogue</span>
            <small>entrées en base</small>
          </div>
        </div>
        <div className="admin-kpi admin-kpi--success">
          <div className="admin-kpi-top">
            <div>
              <p className="admin-kpi-label">Actives</p>
              <h4 className="admin-kpi-value">{stats.active}</h4>
            </div>
            <span className="admin-kpi-icon"><CheckCircle2 size={22} /></span>
          </div>
          <div className="admin-kpi-foot">
            <span className="badge badge--green">Publiées</span>
            <small>visibles sur le site</small>
          </div>
        </div>
        <div className="admin-kpi admin-kpi--warning">
          <div className="admin-kpi-top">
            <div>
              <p className="admin-kpi-label">Inscriptions</p>
              <h4 className="admin-kpi-value">{stats.registrations}</h4>
            </div>
            <span className="admin-kpi-icon"><UserRoundCheck size={22} /></span>
          </div>
          <div className="admin-kpi-foot">
            <span className="badge badge--lime">{stats.newRegistrations} nouvelle(s)</span>
            <small>demandes reçues</small>
          </div>
        </div>
      </div>

      <div className="admin-filters">
        <button
          type="button"
          className={`admin-btn ${tab === "catalogue" ? "admin-btn--primary" : "admin-btn--ghost"}`}
          onClick={() => setTab("catalogue")}
        >
          <BookOpenCheck size={15} /> Catalogue
        </button>
        <button
          type="button"
          className={`admin-btn ${tab === "inscriptions" ? "admin-btn--primary" : "admin-btn--ghost"}`}
          onClick={() => setTab("inscriptions")}
        >
          <UserRoundCheck size={15} /> Inscriptions
        </button>
        {tab === "inscriptions" && (
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        )}
        <span className="admin-search" style={{ flex: 1, maxWidth: 340 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder={tab === "catalogue" ? "Rechercher une formation…" : "Rechercher une demande…"}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </span>
      </div>

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des formations…
        </div>
      ) : tab === "catalogue" ? (
        filteredTrainings.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon"><GraduationCap size={24} /></span>
            Aucune formation trouvée.
          </div>
        ) : (
          <div className="admin-panel">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Formation</th>
                    <th>Catégorie</th>
                    <th>Niveau</th>
                    <th>Format</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Demandes</th>
                    <th className="cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrainings.map((training) => (
                    <tr key={training.id}>
                      <td className="cell-title">
                        <strong>{training.title}</strong>
                        <small>{training.slug}</small>
                      </td>
                      <td>{training.category || "—"}</td>
                      <td>{training.level || "—"}</td>
                      <td>{training.format || "—"}</td>
                      <td>{training.duration || "—"}</td>
                      <td>
                        {Number(training.active) === 1 ? (
                          <span className="badge badge--green">Active</span>
                        ) : (
                          <span className="badge badge--gray">Inactive</span>
                        )}
                      </td>
                      <td>{training.registrations_count || 0}</td>
                      <td className="cell-actions">
                        <button className="admin-btn admin-btn--icon" onClick={() => openEdit(training)} title="Modifier">
                          <Pencil size={15} />
                        </button>
                        <button
                          className="admin-btn admin-btn--icon danger"
                          onClick={() => handleDelete(training)}
                          disabled={busyId === training.id}
                          title="Supprimer"
                          style={{ marginLeft: 6 }}
                        >
                          {busyId === training.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : filteredRegistrations.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><UserRoundCheck size={24} /></span>
          Aucune demande d'inscription trouvée.
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Formation</th>
                  <th>Contact</th>
                  <th>Profil</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => {
                  const meta = statusMeta(registration.status);
                  return (
                    <tr key={registration.id}>
                      <td className="cell-title">
                        <strong>{registration.full_name}</strong>
                        <small>{registration.organization || "—"}</small>
                      </td>
                      <td>{registration.training_title || "—"}</td>
                      <td>
                        <strong>{registration.email}</strong>
                        <small>{registration.phone || ""}</small>
                      </td>
                      <td>{registration.profile || "—"}</td>
                      <td>
                        <span className={`badge ${meta.badge}`} style={{ marginBottom: 8, display: "inline-flex" }}>
                          {meta.label}
                        </span>
                        <select
                          value={registration.status}
                          onChange={(event) => handleRegistrationStatus(registration, event.target.value)}
                          disabled={busyRegistrationId === registration.id}
                          style={{ display: "block", height: 32, minWidth: 130 }}
                        >
                          {STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                        </select>
                      </td>
                      <td>{formatDate(registration.created_at)}</td>
                      <td className="cell-actions">
                        <button
                          className="admin-btn admin-btn--icon danger"
                          onClick={() => handleDeleteRegistration(registration)}
                          disabled={busyRegistrationId === registration.id}
                          title="Supprimer"
                        >
                          {busyRegistrationId === registration.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="admin-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>{editing ? "Modifier la formation" : "Nouvelle formation"}</h3>
              <button className="admin-icon-btn" onClick={() => setModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Titre *</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => setField("title", event.target.value)}
                    placeholder="Ex : Audit de sécurité SI"
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Slug</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(event) => setField("slug", event.target.value)}
                    placeholder="audit-securite-si"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Catégorie</span>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) => setField("category", event.target.value)}
                    placeholder="Ex : Gouvernance"
                  />
                </label>
                <label className="admin-field">
                  <span>Icône</span>
                  <select value={form.icon} onChange={(event) => setField("icon", event.target.value)}>
                    {ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                  </select>
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Niveau</span>
                  <select value={form.level} onChange={(event) => setField("level", event.target.value)}>
                    {LEVELS.map((level) => <option key={level}>{level}</option>)}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Format</span>
                  <select value={form.format} onChange={(event) => setField("format", event.target.value)}>
                    {FORMATS.map((format) => <option key={format}>{format}</option>)}
                  </select>
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Durée</span>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(event) => setField("duration", event.target.value)}
                    placeholder="Ex : 3 jours"
                  />
                </label>
                <label className="admin-field">
                  <span>Prochaine session</span>
                  <input
                    type="text"
                    value={form.next_session}
                    onChange={(event) => setField("next_session", event.target.value)}
                    placeholder="Ex : Sur inscription"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Ordre</span>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(event) => setField("sort_order", event.target.value)}
                    min="0"
                  />
                </label>
                <label className="admin-field">
                  <span>Statut</span>
                  <select value={form.active} onChange={(event) => setField("active", event.target.value)}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </label>
              </div>
              <label className="admin-field">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Objectifs, contenu et bénéfices de la formation…"
                />
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  {editing ? "Enregistrer" : "Ajouter la formation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
