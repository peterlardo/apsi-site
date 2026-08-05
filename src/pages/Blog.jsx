import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import PageHero from "../components/PageHero";
import Newsletter from "../components/Newsletter";
import { useContent } from "../context/ContentContext";

export default function Blog() {
  const { content: { BLOG_POSTS, IMAGES } } = useContent();
  return (
    <>
      <PageHero
        title={<>Notre <em>blog</em></>}
        crumbs={[{ label: "Blog" }]}
        image={IMAGES.heroBlog}
      />

      <section className="section">
        <div className="container">
          <SectionHead
            center
            tag="Actualités & analyses"
            title="Lisez nos dernières analyses"
            text="Des articles d'experts sur la cybersécurité, la réglementation et les bonnes pratiques."
          />
          <div className="blog-grid">
            {BLOG_POSTS.map((b, i) => (
              <Reveal key={i} delay={i * 100}>
                <article className="blog-card">
                  <div className="blog-thumb">
                    <img src={b.img} alt={b.title} loading="lazy" />
                    <span className="blog-meta">
                      <Calendar size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
                      {b.date}
                    </span>
                  </div>
                  <div className="blog-body">
                    <span className="blog-cat">{b.category}</span>
                    <h3><Link to={`/blog/${b.slug}`}>{b.title}</Link></h3>
                    <p>{b.excerpt}</p>
                    <Link to={`/blog/${b.slug}`} className="link-more" style={{ marginTop: 16 }}>
                      Lire l'article <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
