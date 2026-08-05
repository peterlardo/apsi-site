import { useState } from "react";
import { GripVertical, Loader2, Pencil, Plus, Save, Trash2, Tag, X } from "lucide-react";
import { saveSection } from "../lib/api";
import { useContent } from "../context/ContentContext";

export default function Categories() {
  const { content: { BLOG_CATEGORIES }, refresh } = useContent();
  const [categories, setCategories] = useState(() => [...(BLOG_CATEGORIES || [])]);
  const [newCat, setNewCat] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  function addCategory() {
    const name = newCat.trim();
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      setStatus({ type: "err", msg: "Cette catégorie existe déjà." });
      return;
    }
    setCategories((prev) => [...prev, name]);
    setNewCat("");
    setStatus({ type: "", msg: "" });
  }

  function removeCategory(idx) {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
    if (editIdx === idx) {
      setEditIdx(null);
      setEditVal("");
    }
  }

  function startEdit(idx) {
    setEditIdx(idx);
    setEditVal(categories[idx]);
  }

  function confirmEdit() {
    const name = editVal.trim();
    if (!name) return;
    if (categories.some((c, i) => i !== editIdx && c.toLowerCase() === name.toLowerCase())) {
      setStatus({ type: "err", msg: "Cette catégorie existe déjà." });
      return;
    }
    setCategories((prev) => prev.map((c, i) => (i === editIdx ? name : c)));
    setEditIdx(null);
    setEditVal("");
  }

  async function handleSave() {
    if (categories.length === 0) {
      setStatus({ type: "err", msg: "Ajoutez au moins une catégorie." });
      return;
    }
    setSaving(true);
    setStatus({ type: "", msg: "" });
    try {
      await saveSection("blog_categories", categories);
      refresh();
      setStatus({ type: "ok", msg: "Catégories enregistrées avec succès." });
    } catch (err) {
      setStatus({ type: "err", msg: err.message || "Erreur lors de l'enregistrement" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Catégories du blog</h2>
          <p>Gérez les catégories disponibles pour les articles du blog.</p>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {status.msg && (
        <div className={`admin-alert admin-alert--${status.type === "ok" ? "ok" : "error"}`}>
          {status.msg}
        </div>
      )}

      <div className="admin-panel" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Nouvelle catégorie…"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
            style={{ flex: 1, padding: "10px 14px", border: "1.5px solid var(--admin-border)", borderRadius: 10, fontSize: 14, fontFamily: "inherit" }}
          />
          <button className="admin-btn admin-btn--primary" onClick={addCategory} type="button">
            <Plus size={15} /> Ajouter
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="admin-empty" style={{ padding: 40 }}>
            <span className="admin-empty-icon"><Tag size={24} /></span>
            Aucune catégorie. Ajoutez-en une ci-dessus.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {categories.map((cat, idx) => (
              <div
                key={`${cat}-${idx}`}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", background: "var(--admin-card)", border: "1px solid var(--admin-border)",
                  borderRadius: 10, transition: "all 0.2s",
                }}
              >
                <GripVertical size={16} style={{ color: "var(--admin-text-muted)", cursor: "grab", flexShrink: 0 }} />
                <Tag size={15} style={{ color: "var(--admin-primary)", flexShrink: 0 }} />

                {editIdx === idx ? (
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmEdit();
                      if (e.key === "Escape") setEditIdx(null);
                    }}
                    autoFocus
                    style={{ flex: 1, padding: "6px 10px", border: "1.5px solid var(--admin-primary)", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none" }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500 }}>{cat}</span>
                )}

                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {editIdx === idx ? (
                    <>
                      <button className="admin-btn admin-btn--icon" onClick={confirmEdit} title="Confirmer">
                        <Save size={14} />
                      </button>
                      <button className="admin-btn admin-btn--icon" onClick={() => setEditIdx(null)} title="Annuler">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="admin-btn admin-btn--icon" onClick={() => startEdit(idx)} title="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button className="admin-btn admin-btn--icon danger" onClick={() => removeCategory(idx)} title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
