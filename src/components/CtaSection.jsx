import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { useContent } from "../context/ContentContext";

export default function CtaSection({ img }) {
  const { content: { IMAGES } } = useContent();
  const src = img || IMAGES.cta;
  return (
    <section className="cta section" style={{ padding: "70px 0" }}>
      <div className="container cta-grid">
        <Reveal>
          <span className="cta-trust">Confiance</span>
          <h2 className="cta-title">
            Rejoignez les 850+ entreprises qui font confiance à nos services
          </h2>
          <p>
            « Transformez votre vision en un véritable succès — nous fournissons des services experts en
            sécurité de l'information pour aider les entreprises à croître et à optimiser leurs opérations. »
          </p>
          <Link to="/contact" className="btn">
            <span className="btn-inner">Prendre contact</span>
            <span className="btn-arrow"><ArrowRight size={16} /></span>
          </Link>
        </Reveal>
        <Reveal delay={150}>
          <img className="cta-img" src={src} alt="Expertise en cybersécurité" loading="lazy" />
        </Reveal>
      </div>
    </section>
  );
}
