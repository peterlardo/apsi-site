import { useEffect, useMemo, useState } from "react";
import { Calendar, MapPin, Filter, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";
import { getEvents } from "../lib/api";

const trunc = (s, n = 20) => {
  if (!s) return "";
  const w = s.split(/\s+/);
  return w.length <= n ? s : w.slice(0, n).join(" ") + "…";
};

export default function Evenements() {
  const { content: { EVENTS, IMAGES } } = useContent();
  const [apiEvents, setApiEvents] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    getEvents()
      .then((data) => { if (Array.isArray(data) && data.length > 0) setApiEvents(data); })
      .catch(() => {});
  }, []);

  const allEvents = apiEvents || EVENTS || [];

  const categories = useMemo(() => {
    const cats = [...new Set(allEvents.map((e) => e.category).filter(Boolean))];
    return cats.sort();
  }, [allEvents]);

  const filtered = useMemo(() => {
    let list = [...allEvents];
    if (filterCat !== "all") {
      list = list.filter((e) => e.category === filterCat);
    }
    if (sortBy === "newest") {
      list.sort((a, b) => (b.created_at || b.date || "").localeCompare(a.created_at || a.date || ""));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => (a.created_at || a.date || "").localeCompare(b.created_at || b.date || ""));
    } else if (sortBy === "alpha") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return list;
  }, [allEvents, sortBy, filterCat]);

  const isApiData = !!apiEvents;

  return (
    <>
      <PageHero
        title={<>Nos <em>événements</em></>}
        crumbs={[{ label: "Événements" }]}
        image={IMAGES.heroEvenements}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Événements"
            title="Rejoignez la communauté de la sécurité de l'information"
            text="Conférences, ateliers, compétitions : nos événements rassemblent les acteurs de la cybersécurité congolaise."
          />

          {isApiData && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Filter size={15} style={{ color: "var(--teal)" }} />
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--border)",
                    fontSize: 14, fontFamily: "inherit", background: "var(--bg)", color: "var(--text)",
                  }}
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowUpDown size={15} style={{ color: "var(--teal)" }} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1.5px solid var(--border)",
                    fontSize: 14, fontFamily: "inherit", background: "var(--bg)", color: "var(--text)",
                  }}
                >
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="alpha">Alphabétique</option>
                </select>
              </div>
            </div>
          )}

          <Reveal>
            <div className="features-grid">
              {filtered.map((e, i) => (
                <div className="feature-card" key={e.id || i}>
                  {e.image && (
                    <div style={{ width: "100%", height: 180, overflow: "hidden", borderRadius: "var(--radius) var(--radius) 0 0", margin: "-24px -24px 16px" }}>
                      <img src={e.image} alt={e.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                    </div>
                  )}
                  <h3>{e.title}</h3>
                  <p className="event-meta" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--muted)", marginBottom: 10 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} /> {e.date}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={13} /> {e.place}
                    </span>
                  </p>
                  {e.category && (
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "var(--teal-50, #e0f2f1)", color: "var(--teal)", marginBottom: 10 }}>
                      {e.category}
                    </span>
                  )}
                  <p>{isApiData ? trunc(e.text || e.excerpt || "") : (e.text || e.excerpt || "")}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>
              Aucun événement ne correspond à votre filtre.
            </div>
          )}
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
