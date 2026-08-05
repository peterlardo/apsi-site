import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Commissions() {
  const { content: { COMMISSIONS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Nos <em>commissions</em></>}
        crumbs={[{ label: "Commissions" }]}
        image={IMAGES.heroCommissions}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Commissions"
            title="Des groupes de travail au service de la sécurité de l'information"
            text="Chaque commission réunit des professionnels bénévoles qui font avancer la mission de l'APSI Congo dans son domaine d'expertise."
          />
          <Reveal>
            <div className="features-grid">
              {COMMISSIONS.map((c, i) => (
                <div className="feature-card" key={i} id={c.id}>
                  <span className="feature-icon"><c.icon size={30} strokeWidth={1.8} /></span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
