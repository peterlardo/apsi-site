import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Projects() {
  const { content: { PROJECTS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Nos <em>projets</em></>}
        crumbs={[{ label: "Pages" }, { label: "Nos projets" }]}
        image={IMAGES.heroProjects}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Projets récents"
            title="Parcourez nos projets récents"
            text="Des missions concrètes menées auprès d'organisations publiques et privées au Congo."
          />
          <div className="projects-grid">
            {PROJECTS.map((p, i) => (
              <Reveal key={i} delay={(i % 4) * 90}>
                <div className="project-card">
                  <img src={IMAGES[`project${i + 1}`]} alt={p.title} loading="lazy" />
                  <div className="project-overlay">
                    <span className="tag">{p.tag}</span>
                    <h3>{p.title}</h3>
                    <p style={{ color: "#9aa7c2", fontSize: 13.5, marginTop: 8 }}>{p.text}</p>
                    <span className="link-more" style={{ marginTop: 12 }}>
                      <ArrowUpRight size={15} /> Étude de cas
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 56 }}>
            <Reveal>
              <Link to="/contact" className="btn">
                <span className="btn-inner">Discuter de votre projet</span>
                <span className="btn-arrow"><ArrowRight size={16} /></span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
