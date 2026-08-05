import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: { email: email.trim() },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-head">
        <img src="/logo.png" alt="APSI-CG" className="admin-login-logo" />
        <h1>Mot de passe oublié</h1>
        <p className="admin-login-sub">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
      </div>

      <div className="admin-login-card">
        {success ? (
          <div className="admin-forgot-success">
            <CheckCircle size={48} className="admin-forgot-icon" />
            <h3>Email envoyé !</h3>
            <p>
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="admin-forgot-hint">Vérifiez votre boîte de réception et vos spams.</p>
            <Link to="/admin/login" className="admin-btn admin-btn--primary" style={{ marginTop: 16 }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
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
                  placeholder="votre@email.com"
                />
              </label>
              <button type="submit" className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
                {busy ? <Loader2 className="spin" size={18} /> : <Mail size={18} />}
                {busy ? "Envoi en cours…" : "Envoyer le lien"}
              </button>
            </form>

            <Link to="/admin/login" className="admin-login-back">← Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
}
