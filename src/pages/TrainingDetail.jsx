import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { createTrainingRegistration, getTrainings } from "../lib/api";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Layers3,
  Search,
  UserRoundCheck,
} from "lucide-react";
import {
  FALLBACK_CATALOG,
  FILTER_ALL,
  getTrainingProgram,
  normalizeTraining,
  trainingKey,
  uniqueValues,
} from "../data/trainingCatalog";

const SIDEBAR_TRAININGS_LIMIT = 8;

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phone: "",
  organization: "",
  profile: "Professionnel",
  notes: "",
  consentRgpd: false,
};

export default function TrainingDetail() {
  const { slug } = useParams();
  const [trainings, setTrainings] = useState(FALLBACK_CATALOG);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sidebarQuery, setSidebarQuery] = useState("");
  const [sidebarCategory, setSidebarCategory] = useState(FILTER_ALL);
  const [sidebarLevel, setSidebarLevel] = useState(FILTER_ALL);

  useEffect(() => {
    let mounted = true;

    getTrainings()
      .then((rows) => {
        if (!mounted) return;
        const nextTrainings = Array.isArray(rows) ? rows.map(normalizeTraining) : [];
        setTrainings(nextTrainings.length ? nextTrainings : FALLBACK_CATALOG);
      })
      .catch(() => {
        if (!mounted) return;
        setTrainings(FALLBACK_CATALOG);
        setStatus({ type: "warning", message: "Catalogue local affiché : la base de données n'est pas joignable." });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const training = useMemo(
    () => trainings.find((item) => item.slug === slug) || null,
    [slug, trainings]
  );

  const program = useMemo(() => (training ? getTrainingProgram(training) : []), [training]);
  const sidebarCategories = useMemo(() => uniqueValues(trainings, "category"), [trainings]);
  const sidebarLevels = useMemo(() => uniqueValues(trainings, "level"), [trainings]);
  const filteredSidebarTrainings = useMemo(() => {
    const normalizedQuery = sidebarQuery.trim().toLowerCase();
    return trainings.filter((item) => {
      const matchesQuery = !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery);
      const matchesCategory = sidebarCategory === FILTER_ALL || item.category === sidebarCategory;
      const matchesLevel = sidebarLevel === FILTER_ALL || item.level === sidebarLevel;
      return matchesQuery && matchesCategory && matchesLevel;
    });
  }, [sidebarCategory, sidebarLevel, sidebarQuery, trainings]);

  const visibleSidebarTrainings = filteredSidebarTrainings.slice(0, SIDEBAR_TRAININGS_LIMIT);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetSidebarFilters = () => {
    setSidebarQuery("");
    setSidebarCategory(FILTER_ALL);
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    if (!training) return;

    if (!form.consentRgpd) {
      setStatus({ type: "error", message: "Le consentement au traitement de vos données est obligatoire." });
      return;
    }

    const payload = {
      training_id: training.databaseId,
      training_title: training.title,
      full_name: form.fullName,
      email: form.email,
      phone: form.phone,
      organization: form.organization,
      profile: form.profile,
      notes: form.notes,
      consent_rgpd: 1,
    };

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await createTrainingRegistration(payload);
      setStatus({ type: "success", message: `Inscription enregistrée pour ${training.title}.` });
      setForm(INITIAL_FORM);
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem("apsi-training-registrations") || "[]");
      localStorage.setItem(
        "apsi-training-registrations",
        JSON.stringify([{ ...payload, createdAt: new Date().toISOString() }, ...saved].slice(0, 25))
      );
      setStatus({
        type: "warning",
        message: err?.message || "Serveur indisponible : demande conservée localement.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!training && !loading) {
    return (
      <>
        <PageHero
          title={<>Formation <em>introuvable</em></>}
          crumbs={[{ label: "Formations", path: "/formations" }, { label: "Introuvable" }]}
          image="/formations-header-watermark.png"
          className="page-hero--formations"
        />
        <section className="section formations-section">
          <div className="container">
            <div className="training-empty">
              <h3>Cette formation n'existe pas ou n'est plus publiée.</h3>
              <p>Retournez au catalogue pour consulter les formations disponibles.</p>
              <Link className="training-choose training-detail-back" to="/formations">
                <ArrowLeft size={16} /> Retour aux formations
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const TrainingIcon = training?.icon || GraduationCap;

  return (
    <>
      <PageHero
        title={<>{training?.title || "Détail formation"}</>}
        crumbs={[{ label: "Formations", path: "/formations" }, { label: training?.title || "Détail" }]}
        image="/formations-header-watermark.png"
        className="page-hero--formations"
      />

      <section className="section formations-section training-detail-section">
        <div className="container">
          <Link className="link-more training-detail-back" to="/formations">
            <ArrowLeft size={16} /> Retour aux formations
          </Link>

          <div className="training-detail-layout">
            <div className="training-detail-main">
              <Reveal className="training-detail-overview">
                <div className="training-detail-heading">
                  <span className="feature-icon"><TrainingIcon size={30} strokeWidth={1.8} /></span>
                  <div>
                    <span className="training-category">{training?.category}</span>
                    <h2>{training?.title}</h2>
                    <p>{training?.text}</p>
                  </div>
                </div>

                <div className="training-detail-meta">
                  <span><Clock size={17} /> {training?.duration}</span>
                  <span><CalendarDays size={17} /> {training?.nextSession}</span>
                  <span><Layers3 size={17} /> {training?.level}</span>
                  <span><GraduationCap size={17} /> {training?.format}</span>
                </div>
              </Reveal>

              <Reveal className="training-program" delay={80}>
                <div className="training-register-head">
                  <span className="feature-icon"><CheckCircle2 size={28} strokeWidth={1.8} /></span>
                  <div>
                    <span>Programme</span>
                    <h3>Lire le programme de formation</h3>
                  </div>
                </div>

                <div className="training-program-grid">
                  {program.map((module, index) => (
                    <article className="training-program-card" key={`${module.title}-${index}`}>
                      <strong>{String(index + 1).padStart(2, "0")}</strong>
                      <h4>{module.title}</h4>
                      <ul>
                        {(module.items || []).map((item) => (
                          <li key={item}><CheckCircle2 size={15} /> {item}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </Reveal>

              <Reveal className="training-register training-detail-register" delay={120}>
                <div className="training-register-head">
                  <span className="feature-icon"><UserRoundCheck size={28} strokeWidth={1.8} /></span>
                  <div>
                    <span>Inscription</span>
                    <h3>S'inscrire à cette formation</h3>
                  </div>
                </div>

                {status.message && (
                  <div className={`training-status${status.type === "warning" ? " training-status--warning" : ""}`}>
                    {status.message}
                  </div>
                )}

                <form className="training-form training-form-grid" onSubmit={submitRegistration}>
                  <label>
                    <span>Nom complet</span>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(event) => updateForm("fullName", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Téléphone</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) => updateForm("phone", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Organisation</span>
                    <input
                      type="text"
                      value={form.organization}
                      onChange={(event) => updateForm("organization", event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Profil</span>
                    <select value={form.profile} onChange={(event) => updateForm("profile", event.target.value)}>
                      <option>Professionnel</option>
                      <option>Étudiant</option>
                      <option>Entreprise</option>
                      <option>Institution</option>
                    </select>
                  </label>
                  <label>
                    <span>Formation choisie</span>
                    <input type="text" value={training?.title || ""} readOnly />
                  </label>
                  <label className="training-form-wide">
                    <span>Message</span>
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateForm("notes", event.target.value)}
                      placeholder="Disponibilités, attentes ou besoin d'accompagnement"
                    />
                  </label>
                  <label className="consent-checkbox consent-checkbox--inline">
                    <input
                      type="checkbox"
                      checked={form.consentRgpd}
                      onChange={(event) => updateForm("consentRgpd", event.target.checked)}
                      required
                    />
                    <span>
                      J'accepte que mes données soient traitées pour mon inscription à la formation (RGPD).{" "}
                      <a href="/politique-confidentialite" className="consent-link">En savoir plus</a>
                    </span>
                  </label>
                  <button type="submit" className="btn btn--member training-submit" disabled={submitting || !trainingKey(training)}>
                    <span className="btn-inner">{submitting ? "Enregistrement..." : "Envoyer l'inscription"}</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </button>
                </form>
              </Reveal>
            </div>

            <aside className="training-detail-sidebar" aria-label="Autres formations">
              <div className="training-sidebar-head">
                <h3>Autres formations</h3>
                <span>{visibleSidebarTrainings.length}/{filteredSidebarTrainings.length}</span>
              </div>

              <label className="training-search training-sidebar-search">
                <Search size={17} />
                <input
                  type="search"
                  value={sidebarQuery}
                  onChange={(event) => setSidebarQuery(event.target.value)}
                  placeholder="Nom de la formation"
                  aria-label="Rechercher par nom de formation"
                />
              </label>

              <div className="training-sidebar-filters">
                <label>
                  <span>Catégorie</span>
                  <select value={sidebarCategory} onChange={(event) => setSidebarCategory(event.target.value)}>
                    {sidebarCategories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Niveau</span>
                  <select value={sidebarLevel} onChange={(event) => setSidebarLevel(event.target.value)}>
                    {sidebarLevels.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>

                <button type="button" className="training-reset" onClick={resetSidebarFilters}>
                  <Filter size={15} />
                  Réinitialiser
                </button>
              </div>

              <div className="training-sidebar-list">
                {filteredSidebarTrainings.length === 0 ? (
                  <p>Aucune formation ne correspond aux filtres.</p>
                ) : (
                  visibleSidebarTrainings.map((item) => (
                    <Link
                      key={trainingKey(item)}
                      className={`training-sidebar-item${item.slug === slug ? " active" : ""}`}
                      to={`/formations/${item.slug}`}
                    >
                      <span>{item.category}</span>
                      <strong>{item.title}</strong>
                    </Link>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}