import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Star, Phone, ArrowRight, Check, Award,
  ArrowUpRight, Users, Headset, CheckCircle2, ShieldCheck,
  ChevronDown, ChevronUp,
} from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import Counter from "../components/Counter";
import FaqList from "../components/FaqList";
import Carousel from "../components/Carousel";
import CtaSection from "../components/CtaSection";
import Newsletter from "../components/Newsletter";
import { HERO_SLIDES as STATIC_HERO_SLIDES } from "../data/content";
import { useContent } from "../context/ContentContext";

function Stars({ n = 5 }) {
  return (
    <span className="stars" aria-label={`${n} étoiles`}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

function Btn({ to = "/contact", children, className = "", small }) {
  return (
    <Link to={to} className={`btn ${small ? "btn--sm" : ""} ${className}`}>
      <span className="btn-inner">{children}</span>
      <span className="btn-arrow"><ArrowRight size={16} /></span>
    </Link>
  );
}

function HeroSlider({ slides = STATIC_HERO_SLIDES, interval = 6500 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  return (
    <div className="hero-slider" aria-hidden="true">
      {slides.map((src, i) => (
        <div
          key={src}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const {
    content: {
      COMPANY, FEATURES, SERVICES, PROJECTS, PROCESS, BRANDS, BLOG_POSTS, IMAGES, HERO_SLIDES,
    },
  } = useContent();
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <HeroSlider slides={HERO_SLIDES} />
        <div className="container">
          <div>
            <Reveal delay={100}>
              <h1 className="hero-title">
                <strong>Prévenir</strong>,<br />
                <strong>Protéger</strong> et<br />
                <strong>Renforcer</strong> le <em>Cyberespace</em> <span className="outline">Congolais</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="hero-desc">
                L'APSI Congo est en effet née parce que des professionnels de la sécurité de l'information ont
                rejeté le diktat du silence face aux risques numériques.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="hero-ctas">
                <Btn to="/contact" className="btn--member">Devenir membre</Btn>
                <a className="hero-call" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>
                  <span className="hero-call-icon"><Phone size={22} /></span>
                  <span>
                    <small>Appelez-nous</small>
                    <b>{COMPANY.phone}</b>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FEATURES (carrousel 2/vue) ===== */}
      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Nos commissions"
            text="Explorez des approches de sécurité intégrées pour améliorer vos processus, accroître votre productivité et soutenir le développement de votre organisation."
          />
          <Reveal>
            <Carousel slidesPerView={4} gap={16} autoplay={5000}>
              {FEATURES.map((f, i) => (
                <div className="feature-card" key={i}>
                  <span className="feature-icon"><f.icon size={30} strokeWidth={1.8} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  <Link to="/services" className="link-more">
                    En savoir plus <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section section--cream section--about">
        <div className="container about-grid">
          <Reveal className="about-visual">
            <img className="about-img-main" src={IMAGES.aboutMain} alt="Équipe APSI-CG en réunion" loading="lazy" />
            <img className="about-img-small" src={IMAGES.aboutSmall} alt="Atelier de travail" loading="lazy" />
            <div className="about-badge">
              <b>150+</b>
              <small>Nos audits réalisés<br />avec succès</small>
            </div>
          </Reveal>
          <Reveal delay={120} className="about-content">
            <SectionHead
              tag="Qui sommes-nous ?"
              title={<>L'APSI-CG, <strong>une association née d'une conviction</strong></>}
            />
            <p className="lead">
              Une association née d'une conviction — l'APSI-CG est en effet née parce que des
              professionnels de la sécurité de l'information ont rejeté le diktat du silence face
              aux risques numériques.
            </p>
            <p>
              <strong>Sa mission :</strong> faire en sorte que chaque Congolais comprenne l'importance
              de sa sécurité numérique — en valorisant les métiers de la cybersécurité et du cyberdroit,
              en créant des liens entre experts et en sensibilisant le grand public sur les menaces
              cybernétiques et les dispositions protectrices.
            </p>
            <Btn to="/a-propos">En savoir plus</Btn>
          </Reveal>
        </div>
      </section>

      {/* ===== PROJECTS ===== */}
      <section className="section">
        <div className="container">
          <SectionHead
            row
            tag="Derniers travaux"
            title={<strong>Parcourez nos derniers projets créatifs</strong>}
            action={
              <Btn to="/projets" className="btn--outline" small>Voir tous les travaux</Btn>
            }
          />
          <div className="projects-grid">
            {PROJECTS.map((p, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="project-card">
                  <img src={IMAGES[`project${i + 1}`]} alt={p.title} loading="lazy" />
                  <div className="project-overlay">
                    <span className="tag">{p.tag}</span>
                    <h3>{p.title}</h3>
                    <span className="link-more" style={{ marginTop: 12 }}>
                      <ArrowUpRight size={15} /> Voir le projet
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section section--services">
        <div className="container">
          <SectionHead
            row
            tag="Nos services"
            title={<>Des conseillers modernes <strong>expérimentés et chevronnés</strong></>}
            action={
              <Btn to="/services" className="btn--teal" small>Voir tous les services</Btn>
            }
          />
          <div className="services-grid">
            {SERVICES.slice(0, 2).map((s, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="service-card">
                  <span className="num">0{i + 1}</span>
                  <span className="feature-icon"><s.icon size={30} strokeWidth={1.8} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="service-list">
                    {s.points.map((p, j) => (
                      <li key={j}><Check size={15} /> {p}</li>
                    ))}
                  </ul>
                  <Link to="/services" className="link-more">
                    En savoir plus <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
            <Reveal delay={180}>
              <div className="service-cta-card">
                <h3>Besoin de services personnalisés ?</h3>
                <p>Parlons de vos besoins — nous construisons la solution ensemble.</p>
                <div>
                  <Btn to="/contact" small>Contactez-nous</Btn>
                </div>
              </div>
            </Reveal>
          </div>
          <div className={`services-more ${servicesOpen ? "open" : ""}`}>
            {SERVICES.slice(2, 5).map((s, i) => (
              <Reveal key={i + 2} delay={i * 90}>
                <div className="service-card">
                  <span className="num">0{i + 3}</span>
                  <span className="feature-icon"><s.icon size={30} strokeWidth={1.8} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="service-list">
                    {s.points.map((p, j) => (
                      <li key={j}><Check size={15} /> {p}</li>
                    ))}
                  </ul>
                  <Link to="/services" className="link-more">
                    En savoir plus <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <button
            className="services-toggle"
            onClick={() => setServicesOpen(!servicesOpen)}
            aria-expanded={servicesOpen}
            aria-label={servicesOpen ? "Masquer les services" : "Afficher plus de services"}
          >
            {servicesOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="section section--cream section--process">
        <div className="container">
          <SectionHead
            center
            tag="Notre engagement"
            title={<><strong>APSI-CG</strong>, vous accompagne dans <strong>la sensibilisation et la formation</strong></>}
            text="Nous fournissons des services experts en sécurité de l'information pour aider les entreprises à se protéger, à croître et à optimiser leurs opérations."
          />
          <div className="process-grid">
            {PROCESS.map((p, i) => (
              <Reveal key={i} delay={i * 110}>
                <div className="process-step">
                  <span className="num">0{i + 1}.</span>
                  <span className="process-icon"><p.icon size={30} strokeWidth={1.8} /></span>
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

      {/* ===== PARTENAIRES (logos) ===== */}
      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            tag="Nos partenaires"
            title={<>Des organisations qui nous <strong>font confiance</strong></>}
            text="Ils nous ont choisis pour sécuriser leurs systèmes d'information et renforcer leur résilience numérique."
          />
          <Reveal>
            <div className="brands-row">
              {BRANDS.map((b, i) => (
                <span className="brand-item" key={i} title={b.name}>
                  <img src={b.logo} alt={b.name} className="brand-logo" loading="lazy" />
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section className="section">
        <div className="container">
          <SectionHead
            row
            tag="Dernier blog"
            title={<strong>Nos dernières analyses</strong>}
            action={
              <Btn to="/blog" className="btn--outline" small>Voir tous les articles</Btn>
            }
          />
          <div className="blog-grid">
            {BLOG_POSTS.map((b, i) => (
              <Reveal key={i} delay={i * 100}>
                <article className="blog-card">
                  <div className="blog-thumb">
                    <img src={b.img} alt={b.title} loading="lazy" />
                    <span className="blog-meta">{b.date}</span>
                  </div>
                  <div className="blog-body">
                    <span className="blog-cat">{b.category}</span>
                    <h3><Link to="/blog">{b.title}</Link></h3>
                    <p>{b.excerpt}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <Newsletter />
    </>
  );
}
