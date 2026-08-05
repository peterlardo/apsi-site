import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { deleteDownload, getDownloadsAdmin } from "../lib/api";
import { useContent } from "../context/ContentContext";

export default function Downloads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const { refresh } = useContent();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getDownloadsAdmin();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(item) {
    if (!window.confirm(`Supprimer définitivement « ${item.title} » ?`)) return;
    setBusyId(item.id);
    setError("");
    try {
      await deleteDownload(item.id);
      refresh();
      setItems((p) => p.filter((x) => x.id !== item.id));
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
          <h2>Téléchargements</h2>
          <p>Gérez les documents téléchargeables affichés sur le site public.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <Link to="/admin/downloads/nouveau" className="admin-btn admin-btn--primary">
            <Plus size={16} /> Nouveau document
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des documents…
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><Download size={24} /></span>
          Aucun document pour le moment.
          <br />
          <Link to="/admin/downloads/nouveau" className="admin-btn admin-btn--soft admin-btn--sm" style={{ marginTop: 14 }}>
            <Plus size={14} /> Ajouter le premier document
          </Link>
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
                  <th>Statut</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-title">
                      <strong>{d.title}</strong>
                      <small>{d.description ? d.description.slice(0, 70) : ""}…</small>
                    </td>
                    <td>
                      <span className="badge badge--blue">{d.category || "—"}</span>
                    </td>
                    <td>{d.file_size || "—"}</td>
                    <td>
                      {Number(d.published) === 1 ? (
                        <span className="badge badge--green">Publié</span>
                      ) : (
                        <span className="badge badge--lime">Brouillon</span>
                      )}
                    </td>
                    <td className="cell-actions">
                      <Link to={`/admin/downloads/${d.id}/edit`} className="admin-btn admin-btn--icon" title="Éditer">
                        <Pencil size={15} />
                      </Link>
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
    </div>
  );
}
