import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Archive,
  ArrowRight,
  CheckCircle2,
  Database,
  FilePenLine,
  FileText,
  GraduationCap,
  Loader2,
  Network,
  Newspaper,
  Pencil,
  UserCog,
  UserPlus,
  UserRoundCheck,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getBlogAdmin,
  getContentAdmin,
  getTrainingRegistrationsAdmin,
  getTrainingsAdmin,
} from "../lib/api";
import { SECTION_LABELS } from "./schemas";

const moduleCards = [
  {
    id: "contenu",
    label: "Contenu du site",
    desc: "Éditez les 25 sections de contenu : textes, icônes, équipe, tarifs…",
    icon: FilePenLine,
  },
  {
    id: "blog",
    label: "Articles",
    desc: "Rédigez, publiez et gérez les articles du blog.",
    icon: Newspaper,
  },
  {
    id: "formations",
    label: "Formations",
    desc: "Créez, modifiez, publiez et suivez les inscriptions aux formations.",
    icon: GraduationCap,
  },
  {
    id: "archivage",
    label: "Archivage électronique",
    desc: "Centralisez et classez les documents officiels.",
    icon: Archive,
  },
  {
    id: "collaboratif",
    label: "Travail collaboratif",
    desc: "Espaces de partage et projets entre membres.",
    icon: Network,
  },
  {
    id: "membres",
    label: "Gestion des membres",
    desc: "Annuaire, adhésions et profils des membres.",
    icon: UserPlus,
  },
  {
    id: "cotisations",
    label: "Cotisations",
    desc: "Suivi des cotisations, échéances et reçus.",
    icon: Wallet,
  },
  {
    id: "profil",
    label: "Mon profil",
    desc: "Changez votre mot de passe et sécurisez votre session.",
    icon: UserCog,
  },
];

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [contentRes, blogRes, trainingRes, registrationRes] = await Promise.all([
          getContentAdmin(),
          getBlogAdmin(),
          getTrainingsAdmin(),
          getTrainingRegistrationsAdmin(),
        ]);
        if (cancelled) return;
        setSections(contentRes.sections || []);
        setPosts(Array.isArray(blogRes) ? blogRes : blogRes.posts || []);
        setTrainings(Array.isArray(trainingRes) ? trainingRes : []);
        setRegistrations(Array.isArray(registrationRes) ? registrationRes : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Impossible de charger les données");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const published = posts.filter((p) => Number(p.published) === 1).length;
  const drafts = posts.length - published;
  const activeTrainings = trainings.filter((training) => Number(training.active) === 1).length;
  const newRegistrations = registrations.filter((registration) => registration.status === "nouvelle").length;
  const lastUpdate = sections.reduce((acc, s) => {
    return s.updated_at && (!acc || s.updated_at > acc) ? s.updated_at : acc;
  }, "");

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h2>Bonjour, {user.name.split(" ")[0]} 👋</h2>
          <p>Voici un aperçu de votre site et de ses contenus.</p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/formations" className="admin-btn admin-btn--soft">
            <GraduationCap size={16} /> Gérer les formations
          </Link>
          <Link to="/admin/blog/nouveau" className="admin-btn admin-btn--primary">
            <FileText size={16} /> Nouvel article
          </Link>
        </div>
      </div>

      {loading && (
        <div className="admin-empty">
          <Loader2 className="spin" size={20} /> Chargement des statistiques…
        </div>
      )}
      {!loading && error && <div className="admin-alert admin-alert--error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="admin-kpis">
            <div className="admin-kpi admin-kpi--brand">
              <div className="admin-kpi-top">
                <div>
                  <p className="admin-kpi-label">Sections de contenu</p>
                  <h4 className="admin-kpi-value">{sections.length}</h4>
                </div>
                <span className="admin-kpi-icon">
                  <Database size={22} />
                </span>
              </div>
              <div className="admin-kpi-foot">
                <span className="badge badge--blue">CMS</span>
                <small>en base MySQL</small>
              </div>
            </div>
            <div className="admin-kpi admin-kpi--success">
              <div className="admin-kpi-top">
                <div>
                  <p className="admin-kpi-label">Formations actives</p>
                  <h4 className="admin-kpi-value">{activeTrainings}</h4>
                </div>
                <span className="admin-kpi-icon">
                  <GraduationCap size={22} />
                </span>
              </div>
              <div className="admin-kpi-foot">
                <span className="badge badge--green">Catalogue</span>
                <small>{trainings.length} formation(s) en base</small>
              </div>
            </div>
            <div className="admin-kpi admin-kpi--warning">
              <div className="admin-kpi-top">
                <div>
                  <p className="admin-kpi-label">Inscriptions formation</p>
                  <h4 className="admin-kpi-value">{registrations.length}</h4>
                </div>
                <span className="admin-kpi-icon">
                  <UserRoundCheck size={22} />
                </span>
              </div>
              <div className="admin-kpi-foot">
                <span className="badge badge--lime">{newRegistrations} nouvelle(s)</span>
                <small>demandes reçues</small>
              </div>
            </div>
            <div className="admin-kpi admin-kpi--error">
              <div className="admin-kpi-top">
                <div>
                  <p className="admin-kpi-label">Dernière mise à jour</p>
                  <h4 className="admin-kpi-value small">
                    {lastUpdate ? formatDate(lastUpdate) : "—"}
                  </h4>
                </div>
                <span className="admin-kpi-icon">
                  <Activity size={22} />
                </span>
              </div>
              <div className="admin-kpi-foot">
                <span className="badge badge--red">MySQL</span>
                <small>données synchronisées</small>
              </div>
            </div>
          </div>

          <div className="admin-panel" style={{ marginBottom: 28 }}>
            <div className="admin-panel-head">
              <div>
                <h3>Rubrique Formations</h3>
                <p>Gestion CRUD du catalogue et suivi des inscriptions.</p>
              </div>
              <Link to="/admin/formations" className="admin-btn admin-btn--primary admin-btn--sm">
                Ouvrir le CRUD <ArrowRight size={14} />
              </Link>
            </div>
            {trainings.length === 0 ? (
              <div className="admin-empty">
                <span className="admin-empty-icon"><GraduationCap size={24} /></span>
                Aucune formation enregistrée.
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Catégorie</th>
                      <th>Niveau</th>
                      <th>Format</th>
                      <th>Statut</th>
                      <th>Demandes</th>
                      <th className="cell-actions">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainings.slice(0, 6).map((training) => (
                      <tr key={training.id}>
                        <td className="cell-title">
                          <strong>{training.title}</strong>
                          <small>{training.slug}</small>
                        </td>
                        <td>{training.category || "—"}</td>
                        <td>{training.level || "—"}</td>
                        <td>{training.format || "—"}</td>
                        <td>
                          {Number(training.active) === 1 ? (
                            <span className="badge badge--green">Active</span>
                          ) : (
                            <span className="badge badge--gray">Inactive</span>
                          )}
                        </td>
                        <td>{training.registrations_count || 0}</td>
                        <td className="cell-actions">
                          <Link to="/admin/formations" className="admin-btn admin-btn--icon" title="Gérer">
                            <Pencil size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-grid">
            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h3>Derniers articles</h3>
                  <p>Les plus récents de votre blog</p>
                </div>
                <Link to="/admin/blog" className="admin-btn admin-btn--ghost admin-btn--sm">
                  Tout voir <ArrowRight size={14} />
                </Link>
              </div>
              {posts.length === 0 ? (
                <div className="admin-empty">
                  <span className="admin-empty-icon"><Newspaper size={24} /></span>
                  Aucun article pour le moment.
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Article</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th className="cell-actions">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td className="cell-title">
                            <strong>{p.title}</strong>
                            <small>{p.category}</small>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-panel">
              <div className="admin-panel-head">
                <div>
                  <h3>Sections récentes</h3>
                  <p>Contenus modifiés récemment</p>
                </div>
                <Link to="/admin/contenu" className="admin-btn admin-btn--ghost admin-btn--sm">
                  Tout voir <ArrowRight size={14} />
                </Link>
              </div>
              {sections.length === 0 ? (
                <div className="admin-empty">
                  <span className="admin-empty-icon"><Database size={24} /></span>
                  Aucune section enregistrée.
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Section</th>
                        <th className="cell-num">Éléments</th>
                        <th>Modifiée le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sections]
                        .sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
                        .slice(0, 5)
                        .map((s) => (
                          <tr key={s.id}>
                            <td className="cell-title">
                              <strong>{SECTION_LABELS[s.name] || s.name}</strong>
                              <small>{s.name}</small>
                            </td>
                            <td className="cell-num">{s.items}</td>
                            <td>{formatDate(s.updated_at)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "4px 0 14px", color: "var(--ta-gray-800)" }}>
            Modules
          </h3>
          <div className="admin-modules-grid">
            {moduleCards.map((m) => {
              const Icon = m.icon;
              return (
                <Link key={m.id} to={`/admin/${m.id}`} className="admin-module-card">
                  <span className="admin-module-icon">
                    <Icon size={21} />
                  </span>
                  <strong>{m.label}</strong>
                  <small>{m.desc}</small>
                  <span className="module-go">
                    Ouvrir le module <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
