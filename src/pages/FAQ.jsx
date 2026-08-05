import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import FaqList from "../components/FaqList";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function FAQ() {
  const { content: { FAQS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Questions <em>fréquentes</em></>}
        crumbs={[{ label: "Pages" }, { label: "FAQ" }]}
        image={IMAGES.heroFaq}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="FAQ"
            title="Tout ce que vous devez savoir"
            text="Trouvez des réponses claires aux questions les plus courantes sur nos services, notre processus et nos solutions."
          />
          <Reveal>
            <FaqList items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CtaSection />
      <Newsletter />
    </>
  );
}
