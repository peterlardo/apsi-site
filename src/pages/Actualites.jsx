import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Search, Filter } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

const FILTER_ALL = "Toutes";
const POSTS_PER_PAGE = 8;

export default function Actualites() {
  const { content: { BLOG_POSTS, IMAGES } } = useContent();
  const posts = BLOG_POSTS || [];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(FILTER_ALL);
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => [FILTER_ALL, ...new Set(posts.map((p) => p.category).filter(Boolean))],
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchQ = !q || [p.title, p.excerpt, p.category].join(" ").toLowerCase().includes(q);
      const matchCat = category === FILTER_ALL || p.category === category;
      return matchQ && matchCat;
    });
  }, [posts, query, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * POSTS_PER_PAGE;
  const visible = filtered.slice(start, start + POSTS_PER_PAGE);

  return (
    <>
      <PageHero
        title={<>Nos <em>actualités</em></>}
        crumbs={[{ label: "Actualités" }]}
        image={IMAGES.heroBlog}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Actualités"
            title={<>Suivez nos <strong>dernières nouvelles</strong></>}
            text="Restez informé des projets, événements et analyses de l'APSI-CG."
          />

          <Reveal>
            <div className="act-toolbar">
              <label className="act-search">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Rechercher une actualité"
                  aria-label="Rechercher une actualité"
                />
              </label>
              <div className="act-filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`act-tag${category === cat ? " act-tag--active" : ""}`}
                    onClick={() => { setCategory(cat); setPage(1); }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="act-results-info">
            <strong>{filtered.length}</strong>
            <span> actualité{filtered.length > 1 ? "s" : ""}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="act-empty">
              <h3>Aucune actualité trouvée</h3>
              <p>Modifiez votre recherche ou changez de catégorie.</p>
            </div>
          ) : (
            <div className="act-grid">
              {visible.map((b, i) => (
                <Reveal key={b.slug || i} delay={i * 70}>
                  <article className="act-card">
                    <div className="act-card-thumb">
                      <img src={b.img} alt={b.title} loading="lazy" />
                      <span className="act-card-date">
                        <Calendar size={12} /> {b.date}
                      </span>
                    </div>
                    <div className="act-card-body">
                      <span className="act-card-cat">{b.category}</span>
                      <h3><Link to={`/blog/${b.slug}`}>{b.title}</Link></h3>
                      <Link to={`/blog/${b.slug}`} className="link-more">
                        Lire la suite <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="act-pagination" aria-label="Pagination actualités">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Précédent
              </button>
              <div className="act-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === safePage ? "active" : ""}
                    aria-current={p === safePage ? "page" : undefined}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant →
              </button>
            </nav>
          )}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
