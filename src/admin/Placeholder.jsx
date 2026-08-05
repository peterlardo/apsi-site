export default function PlaceholderModule({ title, description, icon: Icon }) {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="admin-placeholder">
        <span className="admin-placeholder-icon">
          <Icon size={36} />
        </span>
        <h3>Module « {title} » en préparation</h3>
        <p>
          Cette fonctionnalité est en cours de développement. Elle sera disponible
          prochainement dans l'espace d'administration APSI-CG.
        </p>
      </div>
    </div>
  );
}
