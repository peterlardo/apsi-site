import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Newsletter from "../components/Newsletter";
import { getBlogPost } from "../lib/api";
import { useContent } from "../context/ContentContext";

export default function BlogPost() {
  const { slug } = useParams();
  const { content: { IMAGES } } = useContent();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getBlogPost(slug)
      .then((data) => {
        if (!mounted) return;
        setPost(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Article introuvable ou indisponible.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <>
        <PageHero
          title={<>Chargement...</>}
          crumbs={[{ label: "Blog", path: "/blog" }, { label: "Article" }]}
          image={IMAGES.heroBlog}
        />
        <section className="section">
          <div className="container">
            <p style={{ textAlign: "center", color: "var(--text)" }}>Chargement de l'article...</p>
          </div>
        </section>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <PageHero
          title={<>Article <em>introuvable</em></>}
          crumbs={[{ label: "Blog", path: "/blog" }, { label: "Introuvable" }]}
          image={IMAGES.heroBlog}
        />
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <p style={{ color: "var(--text)", marginBottom: 24 }}>{error || "Cet article n'existe pas."}</p>
            <Link to="/blog" className="btn btn--teal">
              <span className="btn-inner">Retour au blog</span>
              <span className="btn-arrow"><ArrowLeft size={16} /></span>
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={post.title}
        crumbs={[{ label: "Blog", path: "/blog" }, { label: post.title }]}
        image={post.image || IMAGES.heroBlog}
      />

      <section className="section">
        <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link to="/blog" className="link-more" style={{ marginBottom: 24, display: "inline-flex" }}>
            <ArrowLeft size={15} /> Retour aux articles
          </Link>

          <Reveal>
            <article className="blog-post-full">
              <div className="blog-post-meta">
                <span className="blog-cat">{post.category}</span>
                <span className="blog-post-date">
                  <Calendar size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
                  {post.date}
                </span>
              </div>

              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="blog-post-hero-img"
                  loading="lazy"
                />
              )}

              <div className="blog-post-body">
                {(post.body || "").split("\n").filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
                {!post.body && (
                  <p style={{ color: "var(--text-light)", fontStyle: "italic" }}>
                    Cet article n'a pas encore de contenu complet.
                  </p>
                )}
              </div>

              <div className="blog-post-footer">
                <Link to="/blog" className="btn btn--outline btn--sm">
                  <span className="btn-inner">Retour au blog</span>
                  <span className="btn-arrow"><ArrowLeft size={16} /></span>
                </Link>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <span className="btn-inner"><Share2 size={15} style={{ marginRight: 6 }} /> Partager</span>
                </button>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
