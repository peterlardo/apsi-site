import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileUp, Loader2, Save } from "lucide-react";
import { createDownload, getDownloadFile, deleteDownload } from "../lib/api";

const ICONS = [
  "FileText", "File", "ScrollText", "Shield", "FileCheck",
  "BookOpen", "Download", "ClipboardList", "FileSpreadsheet", "FileSignature",
];

const CATEGORIES = [
  "Documents officiels", "Guides", "Checklists", "Formulaires",
  "Rapports", "Ressources", "Modèles", "Présentations",
];

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " Ko";
  return (bytes / 1048576).toFixed(1) + " Mo";
}

const emptyForm = {
  title: "",
  description: "",
  category: "",
  icon: "FileText",
  restricted: 0,
};

export default function DownloadEditor() {
  const { id } = useParams();
  const isNew = id === undefined || id === "nouveau";
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getDownloadFile(id);
        if (cancelled) return;
        if (!res || res.error) {
          setError("Document introuvable");
        } else {
          setForm({
            title: res.title || "",
            description: res.description || "",
            category: res.category || "",
            icon: res.icon || "FileText",
          });
          setExistingFile({ name: res.file_name, size: res.file_size, type: res.mime_type });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger le document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setExistingFile(null);
    if (!form.title) set("title", f.name.replace(/\.[^.]+$/, ""));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isNew && !file) { setError("Veuillez sélectionner un fichier"); return; }
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("icon", form.icon);
      fd.append("restricted", String(form.restricted));
      if (file) fd.append("file", file);
      const res = await createDownload(fd);
      navigate("/admin/downloads");
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/admin/downloads" className="admin-btn admin-btn--ghost admin-btn--icon" title="Retour">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2>{isNew ? "Nouveau document" : "Modifier le document"}</h2>
            <p>Ajoutez ou modifiez un document téléchargeable.</p>
          </div>
        </div>
        <button type="submit" form="dl-form" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {loading && (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement…
        </div>
      )}

      {!loading && (
        <form id="dl-form" onSubmit={handleSubmit} className="admin-panel admin-form" style={{ gap: 18 }}>
          <div className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label className="admin-field">
              <span>Fichier</span>
              <div
                className="dl-upload-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("dl-upload-zone--over"); }}
                onDragLeave={(e) => e.currentTarget.classList.remove("dl-upload-zone--over")}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("dl-upload-zone--over"); if (e.dataTransfer.files[0]) handleFileChange({ target: { files: e.dataTransfer.files } }); }}
              >
                <input ref={fileRef} type="file" onChange={handleFileChange} style={{ display: "none" }} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv" />
                {file ? (
                  <div className="dl-upload-info">
                    <FileUp size={22} />
                    <strong>{file.name}</strong>
                    <small>{formatSize(file.size)} · {file.type || "inconnu"}</small>
                  </div>
                ) : existingFile ? (
                  <div className="dl-upload-info">
                    <FileUp size={22} />
                    <strong>{existingFile.name}</strong>
                    <small>{formatSize(existingFile.size)} · Fichier actuel</small>
                    <small style={{ color: "var(--teal-700)" }}>Cliquez pour remplacer</small>
                  </div>
                ) : (
                  <div className="dl-upload-info">
                    <FileUp size={28} />
                    <strong>Cliquez ou glissez un fichier ici</strong>
                    <small>PDF, Word, Excel, PowerPoint, ZIP…</small>
                  </div>
                )}
              </div>
            </label>

            <label className="admin-field">
              <span>Titre</span>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Nom du document" />
            </label>

            <div className="admin-form-row">
              <label className="admin-field">
                <span>Catégorie</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={CATEGORIES.includes(form.category) ? form.category : "__custom__"}
                    onChange={(e) => {
                      if (e.target.value !== "__custom__") set("category", e.target.value);
                      else set("category", "");
                    }}
                    style={{ flex: 1 }}
                  >
                    <option value="">— Choisir —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">Autre (saisir manuellement)</option>
                  </select>
                  {!CATEGORIES.includes(form.category) && (
                    <input
                      type="text"
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      placeholder="Nom de la catégorie"
                      style={{ flex: 1 }}
                    />
                  )}
                </div>
              </label>
              <label className="admin-field">
                <span>Icône</span>
                <select value={form.icon} onChange={(e) => set("icon", e.target.value)}>
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="admin-field">
              <span>Description</span>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Courte description du document…" rows={3} />
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={form.restricted === 1} onChange={(e) => set("restricted", e.target.checked ? 1 : 0)} />
              <span>Réservé aux membres actifs (vérification par code membre)</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
