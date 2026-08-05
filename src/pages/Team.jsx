import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Team() {
  const { content: { TEAM, MEMBER_BENEFITS, EXTRA_TEAM, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Notre <em>équipe</em></>}
        crumbs={[{ label: "Pages" }, { label: "Notre équipe" }]}
        image={IMAGES.heroTeam}
      />

      <section className="section team-bureau-section">
        <div className="container">
          <SectionHead
            center
            tag="Bureau exécutif"
            title={<>Le <strong>bureau exécutif</strong></>}
            text="Les membres qui pilotent l'association et ses activités."
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

      <section className="section section--cream team-experts-section">
        <div className="container">
          <SectionHead
            center
            tag="Nos experts dans les commissions"
            title="Nos experts référents"
            text="Des spécialistes reconnus dans leurs domaines respectifs de la sécurité de l'information."
          />
          <div className="team-grid">
            {EXTRA_TEAM.map((m, i) => (
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

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Avantages membres"
            title="Rejoignez une communauté d'experts"
            text="Devenir membre vous ouvre les portes de notre réseau et de nos programmes."
          />
          <div className="features-grid">
            {MEMBER_BENEFITS.map((b, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="feature-card">
                  <span className="feature-icon"><b.icon size={30} strokeWidth={1.8} /></span>
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
                <h3>Vous êtes expert ?</h3>
                <p>Proposez votre candidature et rejoignez le réseau APSI-CG.</p>
                <div>
                  <Link to="/contact" className="btn btn--sm">
                    <span className="btn-inner">Nous contacter</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}







