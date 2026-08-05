import { useEffect, useState } from "react";
import { Loader2, Mail, RefreshCw, Trash2, Users, TrendingUp, UserX, Calendar } from "lucide-react";
import { getNewsletterSubscribers, getNewsletterStats, deleteNewsletterSubscriber } from "../lib/api";

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [subs, st] = await Promise.all([
        getNewsletterSubscribers(),
        getNewsletterStats(),
      ]);
      setSubscribers(Array.isArray(subs) ? subs : []);
      setStats(st);
    } catch (err) {
      setError(err.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(sub) {
    if (!window.confirm(`Supprimer l'abonné « ${sub.email} » ?`)) return;
    setBusyId(sub.id);
    try {
      await deleteNewsletterSubscriber(sub.id);
      setSubscribers((p) => p.filter((x) => x.id !== sub.id));
      if (stats) setStats((s) => ({ ...s, total: s.total - 1, active: sub.unsubscribed_at ? s.active : s.active - 1 }));
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = subscribers.filter((s) => {
    if (filter === "active") return !s.unsubscribed_at;
    if (filter === "unsubscribed") return s.unsubscribed_at;
    return true;
  });

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Newsletter — Abonnés</h2>
          <p>Gérez les abonnés et consultez les statistiques d'inscription.</p>
        </div>
        <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
        </button>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement…
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            <StatCard icon={<Users size={20} />} label="Total abonnés" value={stats?.total || 0} color="var(--teal-900)" />
            <StatCard icon={<TrendingUp size={20} />} label="Actifs" value={stats?.active || 0} color="#16a34a" />
            <StatCard icon={<UserX size={20} />} label="Désabonnés" value={stats?.unsubscribed || 0} color="#dc2626" />
            <StatCard icon={<Calendar size={20} />} label="Ce mois" value={stats?.thisMonth || 0} color="#7c3aed" />
          </div>

          {/* Source breakdown */}
          {stats?.bySource?.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-muted)" }}>Sources :</span>
              {stats.bySource.map((s) => (
                <span key={s.consent_source} className="badge badge--blue">{s.consent_source} ({s.n})</span>
              ))}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[
              { key: "all", label: "Tous" },
              { key: "active", label: "Actifs" },
              { key: "unsubscribed", label: "Désabonnés" },
            ].map((f) => (
              <button
                key={f.key}
                className={`admin-btn ${filter === f.key ? "admin-btn--primary" : "admin-btn--ghost"}`}
                onClick={() => setFilter(f.key)}
                style={{ fontSize: 13, padding: "6px 14px" }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Subscribers Table */}
          {filtered.length === 0 ? (
            <div className="admin-empty">
              <span className="admin-empty-icon"><Mail size={24} /></span>
              Aucun abonné {filter !== "all" ? `avec le filtre « ${filter} »` : "pour le moment"}.
            </div>
          ) : (
            <div className="admin-panel">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>E-mail</th>
                      <th>Source</th>
                      <th>Inscrit le</th>
                      <th>Statut</th>
                      <th className="cell-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td className="cell-title">
                          <strong>{s.email}</strong>
                          <small>{s.ip || ""}</small>
                        </td>
                        <td>
                          <span className="badge badge--blue">{s.consent_source || "—"}</span>
                        </td>
                        <td>{s.subscribed_at ? new Date(s.subscribed_at).toLocaleDateString("fr-FR") : "—"}</td>
                        <td>
                          {s.unsubscribed_at ? (
                            <span className="badge badge--lime">Désabonné</span>
                          ) : (
                            <span className="badge badge--green">Actif</span>
                          )}
                        </td>
                        <td className="cell-actions">
                          <button
                            className="admin-btn admin-btn--icon danger"
                            onClick={() => handleDelete(s)}
                            disabled={busyId === s.id}
                            title="Supprimer"
                          >
                            {busyId === s.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "var(--admin-card)", border: "1px solid var(--admin-border)",
      borderRadius: 12, padding: "20px 18px", display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, display: "grid", placeItems: "center",
        background: `${color}15`, color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: "var(--admin-text)" }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--admin-text-muted)", marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}
