import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { token, newPassword: password },
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <div className="admin-login">
        <div className="admin-login-head">
          <img src="/logo.png" alt="APSI-CG" className="admin-login-logo" />
          <h1>Lien invalide</h1>
          <p className="admin-login-sub">Aucun jeton de réinitialisation trouvé dans l'URL.</p>
        </div>
        <div className="admin-login-card">
          <Link to="/admin/forgot-password" className="admin-btn admin-btn--primary admin-btn--block">
            Demander un nouveau lien
          </Link>
          <Link to="/admin/login" className="admin-login-back">← Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login">
      <div className="admin-login-head">
        <img src="/logo.png" alt="APSI-CG" className="admin-login-logo" />
        <h1>Nouveau mot de passe</h1>
        <p className="admin-login-sub">Choisissez un nouveau mot de passe pour votre compte.</p>
      </div>

      <div className="admin-login-card">
        {success ? (
          <div className="admin-forgot-success">
            <CheckCircle size={48} className="admin-forgot-icon" />
            <h3>Mot de passe réinitialisé !</h3>
            <p>Votre mot de passe a été mis à jour avec succès.</p>
            <Link to="/admin/login" className="admin-btn admin-btn--primary" style={{ marginTop: 16 }}>
              Se connecter
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="admin-alert admin-alert--error">{error}</div>}

            <form onSubmit={handleSubmit} className="admin-form">
              <label className="admin-field">
                <span>Nouveau mot de passe</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </label>
              <label className="admin-field">
                <span>Confirmer le mot de passe</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </label>
              <button type="submit" className="admin-btn admin-btn--primary admin-btn--block" disabled={busy}>
                {busy ? <Loader2 className="spin" size={18} /> : <Lock size={18} />}
                {busy ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
              </button>
            </form>

            <Link to="/admin/login" className="admin-login-back">← Retour à la connexion</Link>
          </>
        )}
      </div>
    </div>
  );
}
