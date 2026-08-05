import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Services() {
  const { content: { SERVICES, PROCESS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Nos <em>services</em></>}
        crumbs={[{ label: "Services" }]}
        image={IMAGES.heroServices}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Nos services"
            title="Des solutions complètes de sécurité"
            text="Six domaines d'expertise pour couvrir l'ensemble de vos besoins en sécurité de l'information."
          />
          <div className="services-grid">
            {SERVICES.slice(0, 4).map((s, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className="service-card">
                  <span className="num">0{i + 1}</span>
                  <span className="feature-icon">{(() => { const Icon = s.icon; return <Icon size={30} strokeWidth={1.8} />; })()}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="service-list">
                    {s.points.map((p, j) => (
                      <li key={j}><Check size={15} /> {p}</li>
                    ))}
                  </ul>
                  <Link to="/contact" className="link-more">
                    Demander un devis <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
            <Reveal delay={180}>
              <div className="service-cta-card">
                <h3>Besoin de services personnalisés ?</h3>
                <p>Parlons de vos besoins — nous construisons la solution ensemble.</p>
                <div>
                  <Link to="/contact" className="btn btn--sm">
                    <span className="btn-inner">Contactez-nous</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </Link>
                </div>
              </div>
            </Reveal>
            {SERVICES.slice(4, 6).map((s, i) => (
              <Reveal key={i + 4} delay={(i % 3) * 90}>
                <div className="service-card">
                  <span className="num">0{i + 5}</span>
                  <span className="feature-icon">{(() => { const Icon = s.icon; return <Icon size={30} strokeWidth={1.8} />; })()}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="service-list">
                    {s.points.map((p, j) => (
                      <li key={j}><Check size={15} /> {p}</li>
                    ))}
                  </ul>
                  <Link to="/contact" className="link-more">
                    Demander un devis <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            tag="Notre méthode"
            title="Comment nous travaillons"
            text="Une démarche structurée en trois étapes pour des résultats mesurables."
          />
          <div className="process-grid">
            {PROCESS.map((p, i) => (
              <Reveal key={i} delay={i * 110}>
                <div className="process-step">
                  <span className="num">0{i + 1}.</span>
                  <span className="process-icon">{(() => { const Icon = p.icon; return <Icon size={30} strokeWidth={1.8} />; })()}</span>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <ul className="process-list">
                    {p.points.map((pt, j) => (
                      <li key={j}><Check size={14} /> {pt}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
