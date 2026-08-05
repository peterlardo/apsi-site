import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  createMember,
  deleteMember,
  getMembers,
  getMembersStats,
  updateMember,
} from "../lib/api";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  profession: "",
  company: "",
  member_since: "",
  status: "actif",
  notes: "",
};

function initials(m) {
  return `${(m.first_name || "?")[0]}${(m.last_name || "?")[0]}`.toUpperCase();
}

function formatAmount(v) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(v) || 0);
}

export default function Membres() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [m, s] = await Promise.all([getMembers(), getMembersStats()]);
      setMembers(Array.isArray(m) ? m : []);
      setStats(s);
    } catch (err) {
      setError(err.message || "Impossible de charger les membres");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }

  function openEdit(m) {
    setEditing(m);
    setForm({
      first_name: m.first_name || "",
      last_name: m.last_name || "",
      email: m.email || "",
      phone: m.phone || "",
      profession: m.profession || "",
      company: m.company || "",
      member_since: m.member_since ? m.member_since.slice(0, 10) : "",
      status: m.status || "actif",
      notes: m.notes || "",
    });
    setModal(true);
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Le prénom et le nom sont requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateMember(editing.id, form);
      } else {
        await createMember(form);
      }
      setModal(false);
      setSuccess(editing ? "Membre mis à jour." : "Membre ajouté.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(m) {
    if (!window.confirm(`Supprimer le membre « ${m.first_name} ${m.last_name} » ?`)) return;
    setBusyId(m.id);
    setError("");
    try {
      await deleteMember(m.id);
      setMembers((list) => list.filter((x) => x.id !== m.id));
      setSuccess("Membre supprimé.");
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
          <h2>Gestion des membres</h2>
          <p>Annuaire des membres, adhésions et profils au sein de l'association.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nouveau membre
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
                <p className="admin-kpi-label">Membres au total</p>
                <h4 className="admin-kpi-value">{stats.total}</h4>
              </div>
              <span className="admin-kpi-icon"><Users size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--blue">Annuaire</span>
              <small>membres inscrits</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--success">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Membres actifs</p>
                <h4 className="admin-kpi-value">{stats.actifs}</h4>
              </div>
              <span className="admin-kpi-icon"><CheckCircle2 size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--green">Actifs</span>
              <small>statut actif</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--warning">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Cotisations payées</p>
                <h4 className="admin-kpi-value">{formatAmount(stats.cotisations?.totalPaye)} FCFA</h4>
              </div>
              <span className="admin-kpi-icon"><Wallet size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--lime">{stats.cotisations?.payees ?? 0} reçus</span>
              <small>total encaissé</small>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des membres…
        </div>
      ) : members.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><UserPlus size={24} /></span>
          Aucun membre pour le moment.
          <br />
          <button className="admin-btn admin-btn--soft admin-btn--sm" style={{ marginTop: 14 }} onClick={openCreate}>
            <Plus size={14} /> Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Contact</th>
                  <th>Profession</th>
                  <th>Depuis</th>
                  <th>Statut</th>
                  <th>Cotisé</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="cell-title">
                      <span className="member-avatar">{initials(m)}</span>
                      <span>
                        <strong>{m.first_name} {m.last_name}</strong>
                        <small>{m.company || "—"}</small>
                      </span>
                    </td>
                    <td>
                      <strong>{m.email || "—"}</strong>
                      <small>{m.phone || ""}</small>
                    </td>
                    <td>{m.profession || "—"}</td>
                    <td>{m.member_since ? m.member_since.slice(0, 10) : "—"}</td>
                    <td>
                      {m.status === "actif" ? (
                        <span className="badge badge--green">Actif</span>
                      ) : (
                        <span className="badge badge--lime">Inactif</span>
                      )}
                    </td>
                    <td>{formatAmount(m.total_cotise)} FCFA</td>
                    <td className="cell-actions">
                      <button
                        className="admin-btn admin-btn--icon"
                        onClick={() => openEdit(m)}
                        title="Modifier"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="admin-btn admin-btn--icon danger"
                        onClick={() => handleDelete(m)}
                        disabled={busyId === m.id}
                        title="Supprimer"
                        style={{ marginLeft: 6 }}
                      >
                        {busyId === m.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
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
              <h3>{editing ? "Modifier le membre" : "Nouveau membre"}</h3>
              <button className="admin-icon-btn" onClick={() => setModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Prénom *</span>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setField("first_name", e.target.value)}
                    placeholder="Ex : Jean"
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Nom *</span>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setField("last_name", e.target.value)}
                    placeholder="Ex : Mboungou"
                    required
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="membre@exemple.com"
                  />
                </label>
                <label className="admin-field">
                  <span>Téléphone</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="+242 06 000 00 00"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Profession</span>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={(e) => setField("profession", e.target.value)}
                    placeholder="Ex : Ingénieur cybersécurité"
                  />
                </label>
                <label className="admin-field">
                  <span>Organisation</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    placeholder="Ex : Banque Nationale"
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Adhésion (date)</span>
                  <input
                    type="date"
                    value={form.member_since}
                    onChange={(e) => setField("member_since", e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Statut</span>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </label>
              </div>
              <label className="admin-field">
                <span>Notes</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  placeholder="Informations complémentaires…"
                />
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  {editing ? "Enregistrer" : "Ajouter le membre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
