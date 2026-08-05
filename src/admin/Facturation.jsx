import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  getInvoicesStats,
  getMembers,
  updateInvoice,
} from "../lib/api";

const STATUS_LABELS = {
  emise: "Émise",
  payee: "Payée",
  impayee: "Impayée",
};

const formatAmount = (n) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(n || 0)) + " FCFA";

export default function Facturation() {
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    number: "",
    member_id: "",
    title: "",
    amount: "",
    issue_date: "",
    due_date: "",
    status: "emise",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [list, st] = await Promise.all([getInvoices({ status: statusFilter, q: search }), getInvoicesStats()]);
      setInvoices(Array.isArray(list) ? list : []);
      setStats(st || null);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Impossible de charger les factures");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    getMembers()
      .then((m) => setMembers(Array.isArray(m) ? m : []))
      .catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ number: "", member_id: "", title: "", amount: "", issue_date: "", due_date: "", status: "emise", notes: "" });
    setModal(true);
  }

  function openEdit(f) {
    setEditing(f);
    setForm({
      number: f.number || "",
      member_id: f.member_id != null ? String(f.member_id) : "",
      title: f.title || "",
      amount: f.amount != null ? String(f.amount) : "",
      issue_date: f.issue_date ? f.issue_date.slice(0, 10) : "",
      due_date: f.due_date ? f.due_date.slice(0, 10) : "",
      status: f.status || "emise",
      notes: f.notes || "",
    });
    setModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      setError("Le titre et le montant sont requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        member_id: form.member_id ? Number(form.member_id) : null,
        amount: Number(form.amount),
      };
      if (editing) {
        await updateInvoice(editing.id, payload);
      } else {
        await createInvoice(payload);
      }
      setModal(false);
      setSuccess(editing ? "Facture mise à jour." : "Facture créée.");
      setTimeout(() => setSuccess(""), 3500);
      await load();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(f) {
    if (!window.confirm(`Supprimer la facture ${f.number} ?`)) return;
    setBusyId(f.id);
    setError("");
    try {
      await deleteInvoice(f.id);
      setInvoices((l) => l.filter((x) => x.id !== f.id));
      setSuccess("Facture supprimée.");
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
          <h2>Facturation</h2>
          <p>Émission et suivi des factures, paiements et reçus des membres.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>
            <Plus size={16} /> Nouvelle facture
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
                <p className="admin-kpi-label">Factures au total</p>
                <h4 className="admin-kpi-value">{stats.total}</h4>
              </div>
              <span className="admin-kpi-icon"><Receipt size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--blue">Total</span>
              <small>{formatAmount(stats.totalMontant)}</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--success">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Payées</p>
                <h4 className="admin-kpi-value">{stats.payees.n}</h4>
              </div>
              <span className="admin-kpi-icon"><CheckCircle2 size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--green">Encaissé</span>
              <small>{formatAmount(stats.payees.total)}</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--warning">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Émises en attente</p>
                <h4 className="admin-kpi-value">{stats.emises.n}</h4>
              </div>
              <span className="admin-kpi-icon"><FileText size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--lime">À encaisser</span>
              <small>{formatAmount(stats.emises.total)}</small>
            </div>
          </div>
          <div className="admin-kpi admin-kpi--error">
            <div className="admin-kpi-top">
              <div>
                <p className="admin-kpi-label">Impayées</p>
                <h4 className="admin-kpi-value">{stats.impayees.n}</h4>
              </div>
              <span className="admin-kpi-icon"><AlertCircle size={22} /></span>
            </div>
            <div className="admin-kpi-foot">
              <span className="badge badge--blue">En retard</span>
              <small>{formatAmount(stats.impayees.total)}</small>
            </div>
          </div>
        </div>
      )}

      <div className="admin-filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="emise">Émise</option>
          <option value="payee">Payée</option>
          <option value="impayee">Impayée</option>
        </select>
        <div className="admin-search">
          <TrendingUp size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une facture…"
            aria-label="Rechercher"
          />
        </div>
      </div>

      <div className="admin-panel">
        {loading ? (
          <div className="admin-empty">
            <Loader2 className="spin" size={20} /> Chargement…
          </div>
        ) : invoices.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty-icon"><Receipt size={24} /></span>
            Aucune facture.
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Membre</th>
                  <th>Montant</th>
                  <th>Émise le</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th style={{ width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="cell-title">
                        <span className="doc-icon"><FileText size={16} /></span>
                        <span>
                          <strong>{f.title}</strong>
                          <small>{f.number}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      {f.first_name ? (
                        <div className="cell-title">
                          <span className="member-avatar">
                            {f.first_name.charAt(0)}
                            {f.last_name ? f.last_name.charAt(0) : ""}
                          </span>
                          <span>
                            <strong>{f.first_name} {f.last_name}</strong>
                            {f.email && <small>{f.email}</small>}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <strong>{formatAmount(f.amount)}</strong>
                    </td>
                    <td>{f.issue_date ? f.issue_date.slice(0, 10) : "—"}</td>
                    <td>{f.due_date ? f.due_date.slice(0, 10) : "—"}</td>
                    <td>
                      <span className={`badge ${f.status === "payee" ? "badge--green" : f.status === "impayee" ? "badge--blue" : "badge--lime"}`}>
                        {STATUS_LABELS[f.status] || f.status}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="admin-btn admin-btn--icon" title="Modifier" onClick={() => openEdit(f)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className="admin-btn admin-btn--icon danger"
                          title="Supprimer"
                          disabled={busyId === f.id}
                          onClick={() => handleDelete(f)}
                        >
                          {busyId === f.id ? <Loader2 className="spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="admin-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="admin-modal">
            <div className="admin-modal-head">
              <h3>{editing ? "Modifier la facture" : "Nouvelle facture"}</h3>
              <button className="admin-icon-btn" onClick={() => setModal(false)} title="Fermer">
                <X size={17} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Numéro</span>
                  <input
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    placeholder="Auto (FAC-2026-0001)"
                  />
                </label>
                <label className="admin-field">
                  <span>Membre</span>
                  <select
                    value={form.member_id}
                    onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
                  >
                    <option value="">— Aucun —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.first_name} {m.last_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="admin-field">
                <span>Libellé *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ex : Cotisation annuelle 2026"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Montant (FCFA) *</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="Ex : 50000"
                  required
                />
              </label>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Date d'émission</span>
                  <input
                    type="date"
                    value={form.issue_date}
                    onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                  />
                </label>
                <label className="admin-field">
                  <span>Date d'échéance</span>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="admin-field">
                  <span>Statut</span>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="emise">Émise</option>
                    <option value="payee">Payée</option>
                    <option value="impayee">Impayée</option>
                  </select>
                </label>
              </div>
              <label className="admin-field">
                <span>Notes</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Informations complémentaires…"
                />
              </label>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  {editing ? "Enregistrer" : "Créer la facture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
