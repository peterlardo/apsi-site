import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, initializing, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (initializing) {
    return (
      <div className="admin-loading">
        <Loader2 className="spin" size={20} /> Chargement…
      </div>
    );
  }
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-head">
        <img src="/logo.png" alt="APSI-CG" className="admin-login-logo" />
        <h1>Espace administration</h1>
        <p className="admin-login-sub">Connectez-vous pour accéder au tableau de bord APSI-CG</p>
      </div>

      <div className="admin-login-card">
        {error && <div className="admin-alert admin-alert--error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@apsi-cg.org"
            />
          </label>
          <label className="admin-field">
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>
          <button type="submit" className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
            {busy ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />}
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <Link to="/" className="admin-login-back">← Retour au site public</Link>
      </div>
    </div>
  );
}
