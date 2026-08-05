import { Link } from "react-router-dom";

export default function Logo({ light = true }) {
  return (
    <Link to="/" className="logo logo--img" aria-label="APSI-CG — Accueil">
      <img src="/logo.png" alt="APSI-CG — Association des Professionnels de la Sécurité de l'Information du Congo" />
    </Link>
  );
}
