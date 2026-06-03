const dashboardKpis = [
  {
    label: 'Ressources totales',
    value: '128',
    trend: 'Inventaire consolide',
  },
  {
    label: 'Ressources disponibles',
    value: '84',
    trend: 'Pretes a affecter',
  },
  {
    label: 'Affectations actives',
    value: '36',
    trend: 'Utilisateurs equipes',
  },
  {
    label: 'Tickets maintenance ouverts',
    value: '8',
    trend: 'Suivi prioritaire',
  },
];

const operations = [
  'Inventaire des ressources',
  'Affectations utilisateurs',
  'Maintenance et retours',
  "Fournisseurs et appels d'offres",
];

export function DashboardPage() {
  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Tableau de bord</span>
          <h1 id="dashboard-title">Pilotage des ressources materielles</h1>
          <p>
            Vue d'accueil pour suivre les indicateurs principaux et acceder aux futurs modules de
            gestion.
          </p>
        </div>
        <span className="dashboard-status">Donnees demo</span>
      </div>

      <div className="kpi-grid" aria-label="Indicateurs principaux">
        {dashboardKpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong>{kpi.value}</strong>
            <p>{kpi.trend}</p>
          </article>
        ))}
      </div>

      <section className="dashboard-section" aria-labelledby="operations-title">
        <div className="section-heading">
          <h2 id="operations-title">Modules operationnels</h2>
          <p>Navigation preparee pour les ecrans metier des prochaines stories.</p>
        </div>
        <div className="operations-grid">
          {operations.map((operation) => (
            <article className="operation-card" key={operation}>
              <strong>{operation}</strong>
              <span>Pret a connecter</span>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
