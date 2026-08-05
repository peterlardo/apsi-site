import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import {
  createCotisation,
  deleteCotisation,
  getCotisations,
  getCotisationsStats,
  getMembers,
  updateCotisation,
} from "../lib/api";

const EMPTY = {
  member_id: "",
  amount: "",
  period: "",
  due_date: "",
  payment_date: "",
  status: "en_attente",
  method: "",
  receipt_no: "",
  notes: "",
};

const STATUS_LABELS = {
  payee: "Payée",
  en_attente: "En attente",
  retard: "En retard",
};

function formatAmount(v) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(v) || 0);
}

export default function Cotisations() {
  const [list, setList] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: "", year: "" });
  const [searching, setSearching] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [c, s, m] = await Promise.all([getCotisations(filters), getCotisationsStats(), getMembers()]);
      setList(Array.isArray(c) ? c : []);
      setStats(s);
      setMembers(Array.isArray(m) ? m : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les cotisations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearching(true);
      getCotisations(filters)
        .then((c) => setList(Array.isArray(c) ? c : []))
        .catch((err) => setError(err.message || "Erreur de filtre"))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [filters.status, filters.year]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  }

  function openEdit(c) {
    setEditing(c);
    setForm({
      member_id: c.member_id || "",
      amount: c.amount ?? "",
      period: c.period || "",
      due_date: c.due_date ? c.due_date.slice(0, 10) : "",
      payment_date: c.payment_date ? c.payment_date.slice(0, 10) : "",
      status: c.status || "en_attente",
      method: c.method || "",
      receipt_no: c.receipt_no || "",
      notes: c.notes || "",
    });
    setModal(true);
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.member_id || !form.amount) {
      setError("Le membre et le montant sont requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) {
        await updateCotisation(editing.id, payload);
      } else {
        await createCotisation(payload);
      }
      setModal(false);
      setSuccess(editing ? "Cotisation mise à jour." : "Cotisation ajoutée.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c) {
    if (!window.confirm(`Supprimer cette cotisation (${formatAmount(c.amount)} FCFA) ?`)) return;
    setBusyId(c.id);
    setError("");
    try {
      await deleteCotisation(c.id);
      setList((l) => l.filter((x) => x.id !== c.id));
      setSuccess("Cotisation supprimée.");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setBusyId(null);
    }
  }

  const badgeFor = (s) =>
    s === "payee" ? "badge badge--green" : s === "retard" ? "badge badge--blue" : "badge badge--lime";

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Cotisations</h2>
          <p>Suivi des cotisations, échéances, paiements et reçus des membres.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nouvelle cotisation
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      {stats && (
        <div className="admin-kpis">
          <div className="admin-kpi admin-kpi--success">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Encaissé</p>
                <h4 className="admin-kpi-value">{formatAmount(stats.encaisse?.total)} FCFA</h4>
              </div>
              <span className="admin-kpi-icon"><CheckCircle2 size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--green">{stats.encaisse?.n ?? 0} paiements</span>
              <small>cotisations payées</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--warning">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">En attente</p>
                <h4 className="admin-kpi-value">{formatAmount(stats.enAttente?.total)} FCFA</h4>
              </div>
              <span className="admin-kpi-icon"><Clock size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--lime">{stats.enAttente?.n ?? 0} échéances</span>
              <small>à venir</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--brand">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">En retard</p>
                <h4 className="admin-kpi-value">{formatAmount(stats.retard?.total)} FCFA</h4>
              </div>
              <span className="admin-kpi-icon"><AlertTriangle size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--blue">{stats.retard?.n ?? 0} impayés</span>
              <small>relances à faire</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--error">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Membres</p>
                <h4 className="admin-kpi-value">{stats.membres ?? 0}</h4>
              </div>
              <span className="admin-kpi-icon"><Banknote size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <small>membres concernés</small>
            </div>
          </div>
        </div>
      )}

      <div className="admin-filters">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">Tous les statuts</option>
          <option value="payee">Payée</option>
          <option value="en_attente">En attente</option>
          <option value="retard">En retard</option>
        </select>
        <input
          type="text"
          placeholder="Année (ex : 2026)"
          value={filters.year}
          onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          style={{ maxWidth: 140 }}
        />
        {searching && <Loader2 className="spin" size={15} />}
      </div>

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des cotisations…
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty">
          <span className="admin-empty-icon"><Clock size={24} /></span>
          Aucune cotisation trouvée.
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Période</th>
                  <th>Montant</th>
                  <th>Échéance</th>
                  <th>Paiement</th>
                  <th>Statut</th>
                  <th>Reçu</th>
                  <th className="cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td className="cell-title">
                      <span className="member-avatar">
                        {`${(c.first_name || "?")[0]}${(c.last_name || "?")[0]}`.toUpperCase()}
                      </span>
                      <span>
                        <strong>{c.first_name} {c.last_name}</strong>
                        <small>{c.email || ""}</small>
                      </span>
                    </td>
                    <td>{c.period || "—"}</td>
                    <td><strong>{formatAmount(c.amount)} FCFA</strong></td>
                    <td>{c.due_date ? c.due_date.slice(0, 10) : "—"}</td>
                    <td>{c.payment_date ? c.payment_date.slice(0, 10) : "—"}</td>
                    <td><span className={badgeFor(c.status)}>{STATUS_LABELS[c.status] || c.status}</span></td>
                    <td>{c.receipt_no || "—"}</td>
                    <td className="cell-actions">
                      <button className="admin-btn admin-btn--icon" onClick={() => openEdit(c)} title="Modifier">
                        <Pencil size={15} />
                      </button>
                      <button
                        className="admin-btn admin-btn--icon danger"
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c.id}
                        title="Supprimer"
                        style={{ marginLeft: 6 }}
                      >
                        {busyId === c.id ? <Loader2 className="spin" size={15} /> : <Trash2 size={15} />}
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
              <h3>{editing ? "Modifier la cotisation" : "Nouvelle cotisation"}</h3>
              <button className="admin-icon-btn" onClick={() => setModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Membre *</span>
                  <select value={form.member_id} onChange={(e) => setField("member_id", e.target.value)} required>
                    <option value="">— Sélectionner —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-field">
                  <span>Montant (FCFA) *</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    placeholder="Ex : 50000"
                    required
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Période</span>
                  <input
                    type="text"
                    value={form.period}
                    onChange={(e) => setField("period", e.target.value)}
                    placeholder="Ex : 2026"
                  />
                </label>
                <label className="admin-field">
                  <span>Statut</span>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                    <option value="payee">Payée</option>
                    <option value="en_attente">En attente</option>
                    <option value="retard">En retard</option>
                  </select>
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Date d'échéance</span>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setField("due_date", e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Date de paiement</span>
                  <input
                    type="date"
                    value={form.payment_date}
                    onChange={(e) => setField("payment_date", e.target.value)}
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Mode de paiement</span>
                  <select value={form.method} onChange={(e) => setField("method", e.target.value)}>
                    <option value="">—</option>
                    <option value="especes">Espèces</option>
                    <option value="virement">Virement</option>
                    <option value="mobile_money">Mobile money</option>
                    <option value="cheque">Chèque</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>N° de reçu</span>
                  <input
                    type="text"
                    value={form.receipt_no}
                    onChange={(e) => setField("receipt_no", e.target.value)}
                    placeholder="Ex : REC-2026-001"
                  />
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
                  {editing ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
