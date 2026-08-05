import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { useContent } from "../context/ContentContext";

const SERVICE_LINKS = [
  { label: "Audit & conformité", path: "/services" },
  { label: "Tests d'intrusion", path: "/services" },
  { label: "Gouvernance des risques", path: "/services" },
  { label: "Formation & sensibilisation", path: "/services" },
  { label: "Réponse aux incidents", path: "/services" },
];

const LEGAL_LINKS = [
  { label: "Politique de confidentialité", path: "/politique-confidentialite" },
  { label: "Gestion des cookies", path: "/cookies" },
  { label: "Mentions légales", path: "/mentions-legales" },
];

export default function Footer() {
  const { content: { COMPANY } } = useContent();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Logo />
            <p>
              Chez APSI-CG, nous croyons que la sécurité de l'information doit être plus qu'une simple
              conformité — elle doit protéger vos données, votre réputation et votre croissance durable.
            </p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Facebook size={14} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={14} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={14} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={14} /></a>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <ul className="footer-links">
              {SERVICE_LINKS.map((l, i) => (
                <li key={i}><Link to={l.path}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Juridique</h4>
            <ul className="footer-links">
              {LEGAL_LINKS.map((l, i) => (
                <li key={i}><Link to={l.path}>{l.label}</Link></li>
              ))}
              <li>
                <button type="button" className="footer-cookie-btn" onClick={() => {
                  const ev = new Event("open-cookie-manager");
                  window.dispatchEvent(ev);
                }}>Gestion des cookies</button>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>
                <Mail size={17} />
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
              <li>
                <Phone size={17} />
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
              </li>
              <li>
                <MapPin size={17} />
                <span>
                  {COMPANY.address}
                  <br />
                  {COMPANY.city}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} <b>APSI-CG</b> — Tous droits réservés
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} style={{ color: "var(--lime-400)" }} /> Association des Professionnels de la
            Sécurité de l'Information du Congo
          </span>
        </div>
      </div>
    </footer>
  );
}
