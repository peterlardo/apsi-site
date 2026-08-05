import { useEffect, useState } from "react";
import {
  Archive,
  Download,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { deleteDocument, getDocuments, getDocumentsStats, uploadDocument } from "../lib/api";

const CATEGORIES = ["officiel", "financier", "compte_rendu", "rapport", "projet", "autre"];

const CAT_LABELS = {
  officiel: "Officiel",
  financier: "Financier",
  compte_rendu: "Compte rendu",
  rapport: "Rapport",
  projet: "Projet",
  autre: "Autre",
};

function formatSize(bytes) {
  if (!bytes) return "—";
  const n = Number(bytes);
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function Archivage() {
  const [docs, setDocs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filters, setFilters] = useState({ category: "", q: "" });
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "autre", description: "", file: null });

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [d, s] = await Promise.all([getDocuments(filters), getDocumentsStats()]);
      setDocs(Array.isArray(d) ? d : []);
      setStats(s);
    } catch (err) {
      setError(err.message || "Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      getDocuments(filters)
        .then((d) => setDocs(Array.isArray(d) ? d : []))
        .catch((err) => setError(err.message || "Erreur de recherche"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [filters.category, filters.q]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.file) {
      setError("Le titre et le fichier sont requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("category", form.category);
      fd.append("description", form.description.trim());
      fd.append("file", form.file);
      await uploadDocument(fd);
      setModal(false);
      setForm({ title: "", category: "autre", description: "", file: null });
      setSuccess("Document archivé.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message || "Erreur lors de l'upload");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(d) {
    if (!window.confirm(`Supprimer le document « ${d.title} » ?`)) return;
    setBusyId(d.id);
    setError("");
    try {
      await deleteDocument(d.id);
      setDocs((l) => l.filter((x) => x.id !== d.id));
      setSuccess("Document supprimé.");
      setTimeout(() => setSuccess(""), 3500);
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
          <h2>Archivage électronique</h2>
          <p>Centralisez, classez et retrouvez les documents officiels de l'association.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button className="admin-btn admin-btn--primary" onClick={() => setModal(true)}>
            <Upload size={16} /> Archiver un document
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {stats && (
        <div className="admin-kpis">
          <div className="admin-kpi admin-kpi--brand">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Documents archivés</p>
                <h4 className="admin-kpi-value">{stats.total}</h4>
              </div>
              <span className="admin-kpi-icon"><Archive size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--blue">Archive</span>
              <small>documents classés</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--success">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Espace utilisé</p>
                <h4 className="admin-kpi-value">{formatSize(stats.size)}</h4>
              </div>
              <span className="admin-kpi-icon"><HardDrive size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--green">{stats.categories?.length ?? 0} catégories</span>
              <small>en stockage</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--warning">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Répartition</p>
                <h4 className="admin-kpi-value small">
                  {CATEGORIES.filter((c) => (stats.categories || []).some((x) => x.category === c))
                    .map((c) => CAT_LABELS[c])
                    .join(" · ")}
                </h4>
              </div>
              <span className="admin-kpi-icon"><FolderOpen size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <small>par catégorie</small>
            </div>
          </div>
        </div>
      )}

      <div className="admin-filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CAT_LABELS[c]}</option>
          ))}
        </select>
        <span className="admin-search" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher un document…"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          />
        </span>
      </div>

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des documents…
        </div>
      ) : docs.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><FileText size={24} /></span>
          Aucun document archivé.
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Catégorie</th>
                  <th>Taille</th>
                  <th>Déposé par</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-title">
                      <span className="doc-icon"><FileText size={18} /></span>
                      <span>
                        <strong>{d.title}</strong>
                        <small>{d.description || d.file_name}</small>
                      </span>
                    </td>
                    <td><span className="badge badge--blue">{CAT_LABELS[d.category] || d.category}</span></td>
                    <td>{formatSize(d.file_size)}</td>
                    <td>{d.uploaded_by_name || "—"}</td>
                    <td className="cell-actions">
                      <a
                        className="admin-btn admin-btn--icon"
                        href={`/api/documents/${d.id}/download`}
                        title="Télécharger"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        className="admin-btn admin-btn--icon danger"
                        onClick={() => handleDelete(d)}
                        disabled={busyId === d.id}
                        title="Supprimer"
                        style={{ marginLeft: 6 }}
                      >
                        {busyId === d.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>Archiver un document</h3>
              <button className="admin-icon-btn" onClick={() => setModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="admin-form">
              <label className="admin-field">
                <span>Titre *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex : PV de l'assemblée générale 2026"
                  required
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Catégorie</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CAT_LABELS[c]}</option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Description</span>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Brève description"
                  />
                </label>
              </div>
              <label className="admin-field">
                <span>Fichier (max 25 Mo) *</span>
                <input
                  type="file"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))
                  }
                  required
                />
                {form.file && (
                  <small className="file-selected">
                    <FileText size={13} /> {form.file.name} ({formatSize(form.file.size)})
                  </small>
                )}
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? <Loader2 className="spin" size={15} /> : <Upload size={15} />}
                  Archiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
