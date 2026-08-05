import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Newspaper, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { deleteBlogPost, getBlogAdmin } from "../lib/api";
import { useContent } from "../context/ContentContext";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const { refresh } = useContent();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getBlogAdmin();
      setPosts(Array.isArray(res) ? res : res.posts || []);
    } catch (err) {
      setError(err.message || "Impossible de charger les articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(post) {
    if (!window.confirm(`Supprimer définitivement « ${post.title} » ?`)) return;
    setBusyId(post.id);
    setError("");
    try {
      await deleteBlogPost(post.id);
      refresh();
      setPosts((p) => p.filter((x) => x.id !== post.id));
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
          <h2>Articles du blog</h2>
          <p>Rédigez, modifiez et publiez les articles du blog APSI-CG.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <Link to="/admin/blog/nouveau" className="admin-btn admin-btn--primary">
            <Plus size={16} /> Nouvel article
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des articles…
        </div>
      ) : posts.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><Newspaper size={24} /></span>
          Aucun article pour le moment.
          <br />
          <Link to="/admin/blog/nouveau" className="admin-btn admin-btn--soft admin-btn--sm" style={{ marginTop: 14 }}>
            <Plus size={14} /> Créer le premier article
          </Link>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-title">
                      <strong>{p.title}</strong>
                      <small>{p.excerpt ? p.excerpt.slice(0, 70) : ""}…</small>
                    </td>
                    <td>
                      <span className="badge badge--blue">{p.category || "—"}</span>
                    </td>
                    <td>{p.date || "—"}</td>
                    <td>
                      {Number(p.published) === 1 ? (
                        <span className="badge badge--green">Publié</span>
                      ) : (
                        <span className="badge badge--lime">Brouillon</span>
                      )}
                    </td>
                    <td className="cell-actions">
                      <Link to={`/admin/blog/${p.id}/edit`} className="admin-btn admin-btn--icon" title="Éditer">
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="admin-btn admin-btn--icon danger"
                        onClick={() => handleDelete(p)}
                        disabled={busyId === p.id}
                        title="Supprimer"
                        style={{ marginLeft: 6 }}
                      >
                        {busyId === p.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
