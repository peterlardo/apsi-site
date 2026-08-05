import { Link } from "react-router-dom";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";
import FaqList from "../components/FaqList";

export default function Pricing() {
  const { content: { PRICING, FAQS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Tarifs & <em>adhésion</em></>}
        crumbs={[{ label: "Pages" }, { label: "Tarifs" }]}
        image={IMAGES.heroPricing}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Nos tarifs"
            title="Choisissez votre formule d'adhésion"
            text="Des formules simples et transparentes pour les professionnels comme pour les organisations."
          />
          <div className="pricing-grid">
            {PRICING.map((p, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className={`price-card ${p.featured ? "price-card--featured" : ""}`}>
                  {p.featured && <Sparkles size={20} style={{ color: "var(--lime-400)", position: "absolute", top: 26, left: 32 }} />}
                  <span className="price-name">{p.name}</span>
                  <div className="price-amount">
                    <b>{p.price}</b>
                    <span>{p.period}</span>
                  </div>
                  <p className="price-desc">{p.desc}</p>
                  <ul className="price-feats">
                    {p.features.map((f, j) => (
                      <li key={j}>
                        {f.included ? <Check size={17} /> : <X size={17} className="lucide-x" />}
                        <span style={f.included ? {} : { opacity: 0.55 }}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact" className={`btn ${p.featured ? "" : "btn--dark"}`}>
                    <span className="btn-inner">{p.featured ? "Adhérer maintenant" : "Choisir cette formule"}</span>
                    <span className="btn-arrow"><ArrowRight size={16} /></span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            tag="Questions fréquentes"
            title="Questions sur l'adhésion"
            text="Vous hésitez encore ? Voici les réponses aux questions les plus posées."
          />
          <Reveal>
            <FaqList items={FAQS.slice(0, 4)} />
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
