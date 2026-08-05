import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { getTrainings } from "../lib/api";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import {
  FALLBACK_CATALOG,
  FILTER_ALL,
  TRAININGS_PER_PAGE,
  normalizeTraining,
  trainingKey,
  uniqueValues,
} from "../data/trainingCatalog";

export default function Formations() {
  const [trainings, setTrainings] = useState(FALLBACK_CATALOG);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(FILTER_ALL);
  const [level, setLevel] = useState(FILTER_ALL);
  const [format, setFormat] = useState(FILTER_ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getTrainings()
      .then((rows) => {
        if (!mounted) return;
        const nextTrainings = Array.isArray(rows) ? rows.map(normalizeTraining) : [];
        setTrainings(nextTrainings);
        setStatus({ type: "", message: "" });
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

  const categories = useMemo(() => uniqueValues(trainings, "category"), [trainings]);
  const levels = useMemo(() => uniqueValues(trainings, "level"), [trainings]);
  const formats = useMemo(() => uniqueValues(trainings, "format"), [trainings]);

  const filteredTrainings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return trainings.filter((training) => {
      const matchesQuery = !normalizedQuery || [training.title, training.category, training.text]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesCategory = category === FILTER_ALL || training.category === category;
      const matchesLevel = level === FILTER_ALL || training.level === level;
      const matchesFormat = format === FILTER_ALL || training.format === format;
      return matchesQuery && matchesCategory && matchesLevel && matchesFormat;
    });
  }, [category, format, level, query, trainings]);

  const totalPages = Math.max(1, Math.ceil(filteredTrainings.length / TRAININGS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * TRAININGS_PER_PAGE;
  const visibleTrainings = filteredTrainings.slice(pageStart, pageStart + TRAININGS_PER_PAGE);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, format, level, query]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const resetFilters = () => {
    setQuery("");
    setCategory(FILTER_ALL);
    setLevel(FILTER_ALL);
    setFormat(FILTER_ALL);
  };

  return (
    <>
      <PageHero
        title={<>Nos <em>formations</em></>}
        crumbs={[{ label: "Formations" }]}
        image="/formations-header-watermark.png"
        className="page-hero--formations"
      />

      <section className="section formations-section">
        <div className="container">
          <SectionHead
            center
            tag="Formations"
            title={<>Développez <strong className="training-title-strong">vos compétences en sécurité de l'information</strong></>}
            text="Des parcours concrets pour étudiants, professionnels, entreprises et institutions."
          />

          <Reveal>
            <div className="training-toolbar">
              <label className="training-search">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une formation"
                  aria-label="Rechercher une formation"
                />
              </label>

              <div className="training-filters" aria-label="Filtres formations">
                <label>
                  <span>Catégorie</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)}>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Niveau</span>
                  <select value={level} onChange={(event) => setLevel(event.target.value)}>
                    {levels.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Format</span>
                  <select value={format} onChange={(event) => setFormat(event.target.value)}>
                    {formats.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <button type="button" className="training-reset" onClick={resetFilters}>
                  <Filter size={16} />
                  Réinitialiser
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal className="training-catalog">
            <div className="training-results">
              <strong>{filteredTrainings.length}</strong>
              <span>
                formation{filteredTrainings.length > 1 ? "s" : ""} disponible{filteredTrainings.length > 1 ? "s" : ""}
                {loading ? " · chargement" : ""}
              </span>
              {filteredTrainings.length > 0 && (
                <small>
                  {pageStart + 1}-{Math.min(pageStart + TRAININGS_PER_PAGE, filteredTrainings.length)} affichées
                </small>
              )}
            </div>

            {status.message && (
              <div className={`training-status${status.type === "warning" ? " training-status--warning" : ""}`}>
                {status.message}
              </div>
            )}

            {filteredTrainings.length === 0 ? (
              <div className="training-empty">
                <h3>Aucune formation trouvée</h3>
                <p>Modifiez les filtres pour afficher d'autres parcours.</p>
              </div>
            ) : (
              <>
                <div className="training-grid">
                  {visibleTrainings.map((training) => {
                    const TrainingIcon = training.icon;
                    return (
                      <article className="training-card" key={trainingKey(training)}>
                        <div className="training-card-head">
                          <span className="feature-icon"><TrainingIcon size={27} strokeWidth={1.8} /></span>
                          <span className="training-category">{training.category}</span>
                        </div>
                        <h3>{training.title}</h3>
                        <p>{training.text}</p>
                        <div className="training-meta">
                          <span><Clock size={15} /> {training.duration}</span>
                          <span><CalendarDays size={15} /> {training.nextSession}</span>
                        </div>
                        <div className="training-tags">
                          <span>{training.level}</span>
                          <span>{training.format}</span>
                        </div>
                        <Link className="training-choose" to={`/formations/${training.slug}`}>
                          Consulter les détails <ChevronRight size={15} />
                        </Link>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav className="training-pagination" aria-label="Pagination formations">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={safeCurrentPage === 1}
                    >
                      <ChevronLeft size={16} />
                      Précédent
                    </button>

                    <div className="training-pages">
                      {pageNumbers.map((page) => (
                        <button
                          type="button"
                          key={page}
                          className={page === safeCurrentPage ? "active" : ""}
                          aria-current={page === safeCurrentPage ? "page" : undefined}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={safeCurrentPage === totalPages}
                    >
                      Suivant
                      <ChevronRight size={16} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}