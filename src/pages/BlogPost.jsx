import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Share2, User, Mail, MessageSquare,
  Send, Clock, Tag, CheckCircle2,
} from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import Newsletter from "../components/Newsletter";
import { getBlogPost } from "../lib/api";
import { useContent } from "../context/ContentContext";

const INITIAL_COMMENT = { name: "", email: "", message: "" };

export default function BlogPost() {
  const { slug } = useParams();
  const { content: { IMAGES, BLOG_POSTS } } = useContent();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState(INITIAL_COMMENT);
  const [comments, setComments] = useState([]);
  const [commentStatus, setCommentStatus] = useState({ type: "", msg: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    getBlogPost(slug)
      .then((data) => {
        if (!mounted) return;
        setPost(data);
        const stored = JSON.parse(localStorage.getItem(`apsi-blog-comments-${slug}`) || "[]");
        if (mounted) setComments(stored);
      })
      .catch(() => {
        if (!mounted) return;
        const fallback = (BLOG_POSTS || []).find((p) => p.slug === slug);
        if (fallback) {
          setPost({ ...fallback, body: "", image: fallback.img || fallback.image || "" });
          const stored = JSON.parse(localStorage.getItem(`apsi-blog-comments-${slug}`) || "[]");
          setComments(stored);
        } else {
          setError("Article introuvable ou indisponible.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  const updateComment = (field, value) => {
    setComment((c) => ({ ...c, [field]: value }));
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.name.trim() || !comment.email.trim() || !comment.message.trim()) {
      setCommentStatus({ type: "err", msg: "Tous les champs sont requis." });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const newComment = {
        ...comment,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        id: Date.now(),
      };
      const updated = [newComment, ...comments];
      setComments(updated);
      localStorage.setItem(`apsi-blog-comments-${slug}`, JSON.stringify(updated));
      setComment(INITIAL_COMMENT);
      setCommentStatus({ type: "ok", msg: "Votre commentaire a été publié." });
      setSubmitting(false);
    }, 600);
  };

  const relatedPosts = (BLOG_POSTS || []).filter((p) => p.slug !== slug).slice(0, 3);

  if (loading) {
    return (
      <>
        <PageHero
          title={<>Chargement...</>}
          crumbs={[{ label: "Blog", path: "/blog" }, { label: "Article" }]}
          image={IMAGES.heroBlog}
        />
        <section className="section">
          <div className="container bp-container">
            <div className="bp-skeleton" />
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
          <div className="container bp-container" style={{ textAlign: "center" }}>
            <div className="bp-empty">
              <MessageSquare size={48} strokeWidth={1.4} />
              <p>{error || "Cet article n'existe pas ou n'est plus publié."}</p>
              <Link to="/blog" className="btn btn--teal">
                <span className="btn-inner">Retour au blog</span>
                <span className="btn-arrow"><ArrowLeft size={16} /></span>
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        crumbs={[{ label: "Blog", path: "/blog" }, { label: post.category || "Article" }]}
        image={post.image || IMAGES.heroBlog}
      />

      <section className="section">
        <div className="container bp-container">
          <Link to="/blog" className="bp-back">
            <ArrowLeft size={16} /> Retour aux articles
          </Link>

          <Reveal>
            <article className="bp-article">
              {/* --- Hero Image --- */}
              {post.image && (
                <div className="bp-hero">
                  <img src={post.image} alt={post.title} />
                  <span className="bp-badge">{post.category}</span>
                </div>
              )}

              {/* --- Article Header --- */}
              <div className="bp-header">
                <div className="bp-meta-row">
                  <span className="bp-meta-item">
                    <Calendar size={14} /> {post.date}
                  </span>
                  <span className="bp-meta-item">
                    <Clock size={14} />
                  </span>
                </div>
                <h3 className="bp-title">{post.title}</h3>
                {post.excerpt && <p className="bp-excerpt">{post.excerpt}</p>}
              </div>

              {/* --- Body --- */}
              <div className="bp-body">
                {(post.body || "").split("\n").filter(Boolean).length > 0 ? (
                  (post.body || "").split("\n").filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <div className="bp-empty-body">
                    <Tag size={20} strokeWidth={1.6} />
                    <p>Cet article n'a pas encore de contenu rédigé.</p>
                  </div>
                )}
              </div>

              {/* --- Footer bar --- */}
              <div className="bp-actions">
                <Link to="/blog" className="btn btn--outline btn--sm">
                  <span className="btn-inner"><ArrowLeft size={15} /> Retour</span>
                </Link>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: post.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      setCommentStatus({ type: "ok", msg: "Lien copié !" });
                      setTimeout(() => setCommentStatus({ type: "", msg: "" }), 2000);
                    }
                  }}
                >
                  <span className="btn-inner"><Share2 size={15} /> Partager</span>
                </button>
              </div>
            </article>
          </Reveal>

          {/* --- Comment Form --- */}
          <Reveal delay={100}>
            <div className="bp-comment-card">
              <div className="bp-comment-head">
                <MessageSquare size={22} strokeWidth={1.8} />
                <div>
                  <h3>Laissez un commentaire</h3>
                  <p>Partagez votre avis ou posez une question sur cet article.</p>
                </div>
              </div>

              {commentStatus.msg && (
                <div className={`form-status ${commentStatus.type === "ok" ? "form-status--ok" : "form-status--err"}`}>
                  {commentStatus.type === "ok" && <CheckCircle2 size={16} style={{ marginRight: 8, verticalAlign: -3 }} />}
                  {commentStatus.msg}
                </div>
              )}

              <form className="bp-comment-form" onSubmit={submitComment}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-name"><User size={14} /> Nom complet</label>
                    <input
                      id="c-name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={comment.name}
                      onChange={(e) => updateComment("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-email"><Mail size={14} /> Email</label>
                    <input
                      id="c-email"
                      type="email"
                      placeholder="jean@exemple.com"
                      value={comment.email}
                      onChange={(e) => updateComment("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="c-msg"><MessageSquare size={14} /> Votre commentaire</label>
                  <textarea
                    id="c-msg"
                    rows={5}
                    placeholder="Écrivez votre commentaire ici..."
                    value={comment.message}
                    onChange={(e) => updateComment("message", e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--teal btn--sm" disabled={submitting}>
                  <span className="btn-inner">{submitting ? "Envoi..." : "Publier le commentaire"}</span>
                  <span className="btn-arrow"><Send size={15} /></span>
                </button>
              </form>
            </div>
          </Reveal>

          {/* --- Existing Comments --- */}
          {comments.length > 0 && (
            <Reveal delay={140}>
              <div className="bp-comments-list">
                <h3 className="bp-comments-title">
                  <MessageSquare size={18} /> {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </h3>
                {comments.map((c) => (
                  <div className="bp-comment" key={c.id}>
                    <div className="bp-comment-avatar">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="bp-comment-content">
                      <div className="bp-comment-top">
                        <strong>{c.name}</strong>
                        <span>{c.date}</span>
                      </div>
                      <p>{c.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* --- Related Posts --- */}
          {relatedPosts.length > 0 && (
            <Reveal delay={160}>
              <div className="bp-related">
                <h3>Autres articles</h3>
                <div className="bp-related-grid">
                  {relatedPosts.map((p) => (
                    <Link to={`/blog/${p.slug}`} className="bp-related-card" key={p.slug}>
                      <div className="bp-related-thumb">
                        <img src={p.img} alt={p.title} loading="lazy" />
                      </div>
                      <div className="bp-related-body">
                        <span className="blog-cat">{p.category}</span>
                        <h4>{p.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <Newsletter />
    </>
  );
}
