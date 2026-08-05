import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Braces,
  FilePenLine,
  Image as ImageIcon,
  List,
  ListOrdered,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { getContentAdmin } from "../lib/api";
import { getSchema } from "./schemas";

const kindIcon = {
  object: Braces,
  list: List,
  strings: ListOrdered,
  keyvalues: ImageIcon,
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Contenu() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getContentAdmin();
      setSections(res.sections || []);
    } catch (err) {
      setError(err.message || "Impossible de charger le contenu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = sections.filter((s) => {
    const label = (getSchema(s.name)?.label || s.name).toLowerCase();
    return label.includes(query.toLowerCase()) || s.name.includes(query.toLowerCase());
  });

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Contenu du site</h2>
          <p>Toutes les données affichées sur les pages publiques, enregistrées dans MySQL.</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-btn admin-btn--ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
          </button>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}

      <div className="admin-field" style={{ marginBottom: 18 }}>
        <div style={{ position: "relative" }}>
          <Search
            size={17}
            style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--admin-muted)" }}
          />
          <input
            className="admin-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une section…"
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des sections…
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">Aucune section trouvée.</div>
      ) : (
        <div className="admin-sections-list">
          {filtered.map((s) => {
            const schema = getSchema(s.name);
            const KindIcon = kindIcon[schema?.kind] || Braces;
            return (
              <Link key={s.id} to={`/admin/contenu/${s.name}`} className="admin-section-row">
                <span className="admin-section-type">
                  <KindIcon size={20} />
                </span>
                <span className="admin-section-main">
                  <strong>{schema?.label || s.name}</strong>
                  <small>
                    {s.name} · {schema?.kind === "object" ? "objet" : schema?.kind === "keyvalues" ? "images" : schema?.kind === "strings" ? "textes" : "liste"}
                  </small>
                </span>
                <span className="admin-section-meta">
                  <span className="badge badge--gray">{s.items} éléments</span>
                  <small style={{ color: "var(--admin-muted)" }}>{formatDate(s.updated_at)}</small>
                  <span className="admin-section-edit admin-btn admin-btn--soft admin-btn--sm">
                    <FilePenLine size={14} /> Éditer
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
