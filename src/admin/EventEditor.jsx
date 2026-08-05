import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Wand2 } from "lucide-react";
import { createEvent, getEventsAdmin, updateEvent } from "../lib/api";
import { useContent } from "../context/ContentContext";

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const EVENT_CATEGORIES = [
  "Conférence", "Atelier", "Compétition", "Formation",
  "Rencontre", "Sensibilisation", "Séminaire", "Webinaire",
];

const emptyForm = {
  title: "",
  slug: "",
  date: "",
  place: "",
  category: "",
  excerpt: "",
  image: "",
  published: 1,
  body: "",
};

export default function EventEditor() {
  const { id } = useParams();
  const isNew = id === undefined || id === "nouveau";
  const navigate = useNavigate();
  const { refresh } = useContent();

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
        const res = await getEventsAdmin();
        const events = Array.isArray(res) ? res : [];
        const ev = events.find((e) => String(e.id) === String(id));
        if (cancelled) return;
        if (!ev) {
          setError("Événement introuvable");
        } else {
          setForm({
            title: ev.title || "",
            slug: ev.slug || "",
            date: ev.date || "",
            place: ev.place || "",
            category: ev.category || "",
            excerpt: ev.excerpt || "",
            image: ev.image || "",
            published: Number(ev.published) === 1 ? 1 : 0,
            body: ev.body || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger l'événement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew, loaded]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function autoSlug() {
    set("slug", slugify(form.title));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, slug: form.slug.trim() || slugify(form.title) };
      if (isNew) {
        await createEvent(payload);
      } else {
        await updateEvent(id, payload);
      }
      refresh();
      navigate("/admin/events");
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/admin/events" className="admin-btn admin-btn--ghost admin-btn--icon" title="Retour">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2>{isNew ? "Nouvel événement" : "Modifier l'événement"}</h2>
            <p>Créez ou modifiez un événement. Les brouillons ne sont pas visibles sur le site public.</p>
          </div>
        </div>
        <button type="submit" form="event-form" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {loading && (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement de l'événement…
        </div>
      )}

      {!loading && (
        <form id="event-form" onSubmit={handleSubmit} className="admin-panel admin-form" style={{ gap: 18 }}>
          <div className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="admin-form-row">
              <label className="admin-field">
                <span>Titre</span>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Titre de l'événement" />
              </label>
              <label className="admin-field">
                <span>Slug (URL)</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="titre-de-l-evenement"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="admin-btn admin-btn--ghost" onClick={autoSlug} title="Générer depuis le titre">
                    <Wand2 size={15} />
                  </button>
                </div>
              </label>
            </div>

            <div className="admin-form-row">
              <label className="admin-field">
                <span>Catégorie</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={EVENT_CATEGORIES.includes(form.category) ? form.category : "__custom__"}
                    onChange={(e) => {
                      if (e.target.value !== "__custom__") set("category", e.target.value);
                      else set("category", "");
                    }}
                    style={{ flex: 1 }}
                  >
                    <option value="">— Choisir —</option>
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">Autre (saisir manuellement)</option>
                  </select>
                  {!EVENT_CATEGORIES.includes(form.category) && (
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
                <span>Date / fréquence</span>
                <input type="text" value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="15 Septembre 2026" />
              </label>
            </div>

            <label className="admin-field">
              <span>Lieu</span>
              <input type="text" value={form.place} onChange={(e) => set("place", e.target.value)} placeholder="Brazzaville" />
            </label>

            <label className="admin-field">
              <span>Image (URL)</span>
              <input type="text" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
              {form.image && (
                <img
                  src={form.image}
                  alt="Aperçu"
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 9, border: "1px solid var(--admin-border)", marginTop: 6 }}
                />
              )}
            </label>

            <label className="admin-field">
              <span>Extrait</span>
              <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Résumé affiché dans la liste des événements…" />
            </label>

            <label className="admin-field">
              <span>Contenu détaillé</span>
              <textarea className="tall" value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Description complète de l'événement…" />
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={form.published === 1} onChange={(e) => set("published", e.target.checked ? 1 : 0)} />
              <span>Publier cet événement sur le site public</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
