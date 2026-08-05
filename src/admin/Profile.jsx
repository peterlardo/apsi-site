import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirm) {
      setError("Les deux mots de passe ne correspondent pas");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      setSuccess("Mot de passe modifié. Vous pouvez vous reconnecter.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      await refreshUser();
    } catch (err) {
      setError(err.message || "Erreur lors du changement de mot de passe");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-panel">
      <div className="admin-panel-head">
        <h2>Mon profil</h2>
        <p>Changer votre mot de passe. Après modification, toutes vos sessions seront déconnectées.</p>
      </div>

      {error && <div className="admin-alert admin-alert--error">{error}</div>}
      {success && <div className="admin-alert admin-alert--success">{success}</div>}

      <form onSubmit={handleSubmit} className="admin-form admin-form--card">
        <label className="admin-field">
          <span>Mot de passe actuel</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <label className="admin-field">
          <span>Nouveau mot de passe (min. 8 caractères)</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className="admin-field">
          <span>Confirmer le nouveau mot de passe</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
          {busy ? <Loader2 className="spin" size={17} /> : <KeyRound size={17} />}
          {busy ? "Enregistrement…" : "Mettre à jour"}
        </button>
      </form>
    </div>
  );
}
