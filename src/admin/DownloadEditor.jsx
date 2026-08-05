import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { createDownload, getDownloadsAdmin, updateDownload } from "../lib/api";

const ICONS = [
  "FileText", "File", "ScrollText", "Shield", "FileCheck",
  "BookOpen", "Download", "ClipboardList", "FileSpreadsheet", "FileSignature",
];

const CATEGORIES = [
  "Documents officiels", "Guides", "Checklists", "Formulaires",
  "Rapports", "Ressources", "Modèles", "Présentations",
];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  file_size: "",
  file_url: "",
  icon: "FileText",
  published: 1,
};

export default function DownloadEditor() {
  const { id } = useParams();
  const isNew = id === undefined || id === "nouveau";
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isNew || loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getDownloadsAdmin();
        const items = Array.isArray(res) ? res : [];
        const item = items.find((d) => String(d.id) === String(id));
        if (cancelled) return;
        if (!item) {
          setError("Document introuvable");
        } else {
          setForm({
            title: item.title || "",
            description: item.description || "",
            category: item.category || "",
            file_size: item.file_size || "",
            file_url: item.file_url || "",
            icon: item.icon || "FileText",
            published: Number(item.published) === 1 ? 1 : 0,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger le document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew, loaded]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        await createDownload(form);
      } else {
        await updateDownload(id, form);
      }
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
            <p>Ajoutez ou modifiez un document téléchargeable. Les brouillons ne sont pas visibles sur le site public.</p>
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

            <div className="admin-form-row">
              <label className="admin-field">
                <span>URL du fichier</span>
                <input type="url" value={form.file_url} onChange={(e) => set("file_url", e.target.value)} placeholder="https://…" />
              </label>
              <label className="admin-field">
                <span>Taille du fichier</span>
                <input type="text" value={form.file_size} onChange={(e) => set("file_size", e.target.value)} placeholder="2.4 Mo" />
              </label>
            </div>

            <label className="admin-check">
              <input type="checkbox" checked={form.published === 1} onChange={(e) => set("published", e.target.checked ? 1 : 0)} />
              <span>Publier ce document sur le site public</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
