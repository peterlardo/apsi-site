import { useState } from "react";
import { Download, Search, Filter } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

const FILTER_ALL = "Tous";

export default function Telechargements() {
  const {
    content: { DOWNLOADS, IMAGES },
  } = useContent();
  const downloads = DOWNLOADS || [];

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(FILTER_ALL);

  const categories = [FILTER_ALL, ...new Set(downloads.map((d) => d.category))];

  const filtered = downloads.filter((d) => {
    const matchesQuery =
      !query.trim() ||
      [d.title, d.description, d.category]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase());
    const matchesCat = category === FILTER_ALL || d.category === category;
    return matchesQuery && matchesCat;
  });

  return (
    <>
      <PageHero
        title={<>Nos <em>téléchargements</em></>}
        crumbs={[{ label: "Téléchargements" }]}
        image={IMAGES.heroTelechargements}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Ressources"
            title={<>Téléchargez nos <strong>documents et outils</strong></>}
            text="Accédez aux statuts, guides, formulaires et ressources de l'APSI-CG pour renforcer votre sécurité numérique."
          />

          <Reveal>
            <div className="dl-toolbar">
              <label className="dl-search">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un document"
                  aria-label="Rechercher un document"
                />
              </label>
              <div className="dl-filters">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`dl-tag${category === cat ? " dl-tag--active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="dl-grid">
              {filtered.length === 0 ? (
                <div className="dl-empty">
                  <h3>Aucun document trouvé</h3>
                  <p>Modifiez votre recherche ou changez de catégorie.</p>
                </div>
              ) : (
                filtered.map((d, i) => (
                  <div className="dl-card" key={i}>
                    <div className="dl-card-icon">
                      <d.icon size={28} strokeWidth={1.8} />
                    </div>
                    <div className="dl-card-body">
                      <span className="dl-card-cat">{d.category}</span>
                      <h3>{d.title}</h3>
                      <p>{d.description}</p>
                    </div>
                    <div className="dl-card-foot">
                      <span className="dl-card-size">{d.fileSize}</span>
                      <a href={d.fileUrl} className="btn btn--sm" download>
                        <span className="btn-inner">Télécharger</span>
                        <span className="btn-arrow"><Download size={15} /></span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
