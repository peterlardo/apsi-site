import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Evenements() {
  const { content: { EVENTS, IMAGES } } = useContent();
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
          <Reveal>
            <div className="features-grid">
              {EVENTS.map((e, i) => (
                <div className="feature-card" key={i}>
                  <span className="feature-icon"><e.icon size={30} strokeWidth={1.8} /></span>
                  <h3>{e.title}</h3>
                  <p className="event-meta"><b>{e.date}</b> — {e.place}</p>
                  <p>{e.text}</p>
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
