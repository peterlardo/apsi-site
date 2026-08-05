import { Link } from "react-router-dom";
import { Check, ArrowRight, Quote } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import Counter from "../components/Counter";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function About() {
  const { content: { TEAM, STATS, IMAGES, MEMBER_BENEFITS, VALUES } } = useContent();
  return (
    <>
      <PageHero
        title={<>À propos d'<em>APSI-CG</em></>}
        crumbs={[{ label: "À propos" }]}
        image={IMAGES.heroAbout}
      />

      {/* Intro */}
      <section className="section">
        <div className="container about-grid">
          <Reveal className="about-visual">
            <img className="about-img-main" src={IMAGES.aboutMain} alt="Équipe APSI-CG" loading="lazy" />
            <img className="about-img-small" src={IMAGES.aboutSmall} alt="Collaboration" loading="lazy" />
            <div className="about-badge">
              <b>10+</b>
              <small>Années d'expertise<br />au service du Congo</small>
            </div>
          </Reveal>
          <Reveal delay={120} className="about-content">
            <SectionHead tag="Qui sommes-nous ?" title={<strong>Notre histoire, notre engagement</strong>} />
            <p className="lead">
              Fondée à Brazzaville, l'Association des Professionnels de la Sécurité de l'Information du
              Congo (APSI-CG) regroupe les experts, chercheurs et passionnés de cybersécurité.
            </p>
            <p>
              Nous croyons en une approche collaborative : professionnels du secteur, entreprises et
              institutions publiques unis pour bâtir un écosystème numérique congolais sûr et prospère.
              Notre réseau compte aujourd'hui plus de 850 professionnels et membres actifs.
            </p>
            <ul className="check-list">
              <li><Check size={18} /> Réseau de 850+ professionnels</li>
              <li><Check size={18} /> Partenariats institutionnels</li>
              <li><Check size={18} /> Veille et recherche active</li>
              <li><Check size={18} /> Événements et conférences</li>
            </ul>
            <Link to="/contact" className="btn">
              <span className="btn-inner">Devenir membre</span>
              <span className="btn-arrow"><ArrowRight size={16} /></span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Mission / vision / valeurs */}
      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            tag="Ce qui nous anime"
            title={<strong>Mission, vision et valeurs</strong>}
            text="Trois piliers guident chacune de nos décisions et de nos actions quotidiennes."
          />
          <div className="team-values">
            {VALUES.map((v, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="feature-card" style={{ textAlign: "center" }}>
                <span className="feature-icon" style={{ marginInline: "auto" }}>
                    {(() => { const Icon = v.icon; return <Icon size={30} strokeWidth={1.8} />; })()}
                  </span>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats section" style={{ padding: "30px 0", marginTop: "60px" }}>
        <div className="container stats-grid">
          {STATS.map((s, i) => (
            <Reveal key={i} delay={i * 90}>
              <div className="stat">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} />
                <span>{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Avantages membres"
            title={<strong>Pourquoi rejoindre APSI-CG ?</strong>}
            text="Rejoignez une communauté dynamique et bénéficiez d'avantages concrets pour votre carrière ou votre organisation."
          />
          <div className="features-grid">
            {MEMBER_BENEFITS.map((b, i) => (
              <Reveal key={i} delay={i * 90} className="reveal-delay">
                <div className="feature-card">
                  <span className="feature-icon">{(() => { const Icon = b.icon; return <Icon size={30} strokeWidth={1.8} />; })()}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                  <Link to="/tarifs" className="link-more">
                    Voir les tarifs <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
            <Reveal delay={270}>
              <div className="service-cta-card">
                <h3>Rejoignez notre communauté</h3>
                <p>850+ professionnels de la sécurité de l'information vous attendent.</p>
                <div>
                  <Link to="/tarifs" className="btn btn--sm">
                    <span className="btn-inner">Adhérer maintenant</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-banner section" style={{ padding: "60px 0" }}>
        <div className="container quote-inner">
          <Reveal>
            <p className="quote-text">
              <Quote size={26} />
              « La cybersécurité est l'affaire de tous — notre association en fait une force collective. »
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="quote-author">
              <img src="https://www.lhorizonafricain.com/wp-content/uploads/2025/10/Murphy-Semo-1.webp" alt="Murphy SEMO" loading="lazy" />
              <div>
                <b>Murphy SEMO</b>
                <small>Président — APSI-CG</small>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team preview */}
      <section className="section section--cream">
        <div className="container">
          <SectionHead
            row
            tag="Notre équipe"
            title="Les visages de notre bureau exécutif"
            action={
              <Link to="/equipe" className="btn btn--outline btn--sm">
                <span className="btn-inner">Voir toute l'équipe</span>
                <span className="btn-arrow"><ArrowRight size={16} /></span>
              </Link>
            }
          />
          <div className="team-grid">
            {TEAM.map((m, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="team-card">
                  <div className="team-photo">
                    <img src={m.img} alt={m.name} loading="lazy" />
                  </div>
                  <div className="team-info">
                    <h3>{m.name}</h3>
                    <span>{m.role}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection img={IMAGES.choose} />
      <Newsletter />
    </>
  );
}


