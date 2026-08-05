import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Calendar, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { deleteEvent, getEventsAdmin } from "../lib/api";
import { useContent } from "../context/ContentContext";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const { refresh } = useContent();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getEventsAdmin();
      setEvents(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(ev) {
    if (!window.confirm(`Supprimer définitivement « ${ev.title} » ?`)) return;
    setBusyId(ev.id);
    setError("");
    try {
      await deleteEvent(ev.id);
      refresh();
      setEvents((p) => p.filter((x) => x.id !== ev.id));
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
          <h2>Événements</h2>
          <p>Gérez les événements affichés sur le site public.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <Link to="/admin/events/nouveau" className="admin-btn admin-btn--primary">
            <Plus size={16} /> Nouvel événement
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des événements…
        </div>
      ) : events.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><Calendar size={24} /></span>
          Aucun événement pour le moment.
          <br />
          <Link to="/admin/events/nouveau" className="admin-btn admin-btn--soft admin-btn--sm" style={{ marginTop: 14 }}>
            <Plus size={14} /> Créer le premier événement
          </Link>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id}>
                    <td className="cell-title">
                      <strong>{ev.title}</strong>
                      <small>{ev.excerpt ? ev.excerpt.slice(0, 70) : ""}…</small>
                    </td>
                    <td>
                      <span className="badge badge--blue">{ev.category || "—"}</span>
                    </td>
                    <td>{ev.date || "—"}</td>
                    <td>{ev.place || "—"}</td>
                    <td>
                      {Number(ev.published) === 1 ? (
                        <span className="badge badge--green">Publié</span>
                      ) : (
                        <span className="badge badge--lime">Brouillon</span>
                      )}
                    </td>
                    <td className="cell-actions">
                      <Link to={`/admin/events/${ev.id}/edit`} className="admin-btn admin-btn--icon" title="Éditer">
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="admin-btn admin-btn--icon danger"
                        onClick={() => handleDelete(ev)}
                        disabled={busyId === ev.id}
                        title="Supprimer"
                        style={{ marginLeft: 6 }}
                      >
                        {busyId === ev.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
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
