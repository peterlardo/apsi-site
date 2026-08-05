import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function PageHero({ title, crumbs, image, className = "" }) {
  const classes = ["page-hero", image ? "page-hero--img" : "", className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {image && <div className="page-hero-bg" style={{ backgroundImage: `url(${image})` }} aria-hidden="true" />}
      <div className="container">
        <h1>{title}</h1>
        <nav className="crumbs" aria-label="Fil d'ariane">
          <Link to="/">Accueil</Link>
          <ChevronRight size={14} />
          {crumbs.map((c, i) => (
            <span key={i}>
              {c.path ? <Link to={c.path}>{c.label}</Link> : <span style={{ color: "var(--lime-400)" }}>{c.label}</span>}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
