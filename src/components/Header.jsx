import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import Logo from "./Logo";

const MENU = [
  { label: "Accueil", path: "/" },
  { label: "À propos", path: "/a-propos" },
  {
    label: "Commissions",
    path: "/commissions",
    children: [
      { label: "Formations et certifications", path: "/commissions#formations-certifications" },
      { label: "Veille et Recherches", path: "/commissions#veille-recherches" },
      { label: "Plaidoyer et relations institutionnelles", path: "/commissions#plaidoyer-institutionnel" },
      { label: "Innovation et projets", path: "/commissions#innovation-projets" },
      { label: "Contentieux et Conformité", path: "/commissions#contentieux-conformite" },
      { label: "Communication et Médias", path: "/commissions#communication-medias" },
    ],
  },
  { label: "Formations", path: "/formations" },
  { label: "Notre équipe", path: "/equipe" },
  { label: "Événements", path: "/evenements" },
  { label: "Actualités", path: "/blog" },
  { label: "Téléchargements", path: "/telechargements" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDrop(false);
  }, [location.pathname]);

  return (
    <>
      <header className={`header navbar ${scrolled ? "navbar--scrolled" : ""}`}>
        <div className="container nav">
          <Logo />
          <nav aria-label="Navigation principale">
            <ul className={`nav-links ${open ? "open" : ""}`}>
              {MENU.map((link, i) => (
                <li
                  key={i}
                  onMouseEnter={() => link.children && setDrop(true)}
                  onMouseLeave={() => link.children && setDrop(false)}
                >
                  <NavLink
                    to={link.path}
                    end
                    className={({ isActive }) => `nav-link ${link.children ? "dropdown-parent" : ""} ${isActive ? "active" : ""}`}
                    onClick={() => link.children && setDrop(!drop)}
                  >
                    {link.label}
                    {link.children && <ChevronDown size={14} />}
                  </NavLink>
                  {link.children && (
                    <ul className={`dropdown ${drop ? "open" : ""}`}>
                      {link.children.map((child, j) => (
                        <li key={j}>
                          <Link to={child.path}>{child.label}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-cta">
            <Link to="/contact" className="btn btn--sm btn--member">
              <span className="btn-inner">Devenir membre</span>
              <span className="btn-arrow"><ArrowRight size={16} /></span>
            </Link>
            <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
