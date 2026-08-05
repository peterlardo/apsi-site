import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, Wand2 } from "lucide-react";
import { createBlogPost, getBlogAdmin, updateBlogPost } from "../lib/api";
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

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  date: "",
  excerpt: "",
  image: "",
  published: 0,
  body: "",
};

export default function BlogEditor() {
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
        const res = await getBlogAdmin();
        const posts = Array.isArray(res) ? res : res.posts || [];
        const post = posts.find((p) => String(p.id) === String(id));
        if (cancelled) return;
        if (!post) {
          setError("Article introuvable");
        } else {
          setForm({
            title: post.title || "",
            slug: post.slug || "",
            category: post.category || "",
            date: post.date || "",
            excerpt: post.excerpt || "",
            image: post.image || "",
            published: Number(post.published) === 1 ? 1 : 0,
            body: post.body || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger l'article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
        await createBlogPost(payload);
      } else {
        await updateBlogPost(id, payload);
      }
      refresh();
      navigate("/admin/blog");
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/admin/blog" className="admin-btn admin-btn--ghost admin-btn--icon" title="Retour">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2>{isNew ? "Nouvel article" : "Modifier l'article"}</h2>
            <p>Rédigez votre article. Les brouillons ne sont pas visibles sur le site public.</p>
          </div>
        </div>
        <button type="submit" form="blog-form" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {loading && (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement de l'article…
        </div>
      )}

      {!loading && (
        <form id="blog-form" onSubmit={handleSubmit} className="admin-panel admin-form" style={{ gap: 18 }}>
          <div className="admin-panel-body" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="admin-form-row">
              <label className="admin-field">
                <span>Titre</span>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Titre de l'article" />
              </label>
              <label className="admin-field">
                <span>Slug (URL)</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="titre-de-l-article"
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
                <input type="text" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Cybersécurité" />
              </label>
              <label className="admin-field">
                <span>Date affichée</span>
                <input type="text" value={form.date} onChange={(e) => set("date", e.target.value)} placeholder="12 Juillet 2026" />
              </label>
            </div>

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
              <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} placeholder="Résumé affiché dans la liste du blog…" />
            </label>

            <label className="admin-field">
              <span>Contenu de l'article</span>
              <textarea className="tall" value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Rédigez le corps de l'article ici…" />
            </label>

            <label className="admin-check">
              <input type="checkbox" checked={form.published === 1} onChange={(e) => set("published", e.target.checked ? 1 : 0)} />
              <span>Publier cet article sur le site public</span>
            </label>
          </div>
        </form>
      )}
    </div>
  );
}
