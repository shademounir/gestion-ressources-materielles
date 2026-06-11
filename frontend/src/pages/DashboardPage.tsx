import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getDashboardMetrics,
  type DashboardKpi,
} from '../modules/dashboard/dashboardService';
import { useAuth } from '../modules/auth/useAuth';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { PageHeader } from '../shared/components/PageHeader';

const initialDashboardKpis: DashboardKpi[] = [
  {
    label: 'Ressources totales',
    value: '-',
    trend: 'Chargement',
  },
  {
    label: 'Ressources disponibles',
    value: '-',
    trend: 'Chargement',
  },
  {
    label: 'Notifications non lues',
    value: '-',
    trend: 'Chargement',
  },
  {
    label: 'Affectations actives',
    value: '-',
    trend: 'Chargement',
  },
  {
    label: 'Tickets maintenance ouverts',
    value: '-',
    trend: 'Chargement',
  },
];

const operations = [
  {
    label: 'Inventaire des ressources',
    status: 'Disponible',
    path: '/resources',
  },
  {
    label: 'Affectations utilisateurs',
    status: 'Disponible',
    path: '/assignments',
  },
  {
    label: 'Maintenance et retours',
    status: 'Disponible',
    path: '/maintenance',
  },
  {
    label: "Fournisseurs et appels d'offres",
    status: 'Disponible',
    path: '/tenders',
  },
];

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [dashboardKpis, setDashboardKpis] = useState<DashboardKpi[]>(initialDashboardKpis);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardMetrics() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const metrics = await getDashboardMetrics(accessToken);

        if (!isMounted) {
          return;
        }

        setDashboardKpis(metrics.kpis);
        setErrorMessage(
          metrics.hasPartialError
            ? 'Certains indicateurs dashboard sont temporairement indisponibles.'
            : null,
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchDashboardMetrics();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  return (
    <section className="dashboard-page" aria-labelledby="dashboard-title">
      <PageHeader
        eyebrow="Tableau de bord"
        title="Pilotage des ressources materielles"
        description="Vue d'accueil pour suivre les indicateurs principaux et acceder aux modules de gestion."
        status={isLoading ? 'Chargement' : 'Donnees API'}
        titleId="dashboard-title"
      />

      <FeedbackMessage errorMessage={errorMessage} successMessage={null} />

      <div className="kpi-grid" aria-label="Indicateurs principaux">
        {dashboardKpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <span>{kpi.label}</span>
            <strong className={kpi.isFallback ? 'kpi-fallback-value' : undefined}>
              {isLoading && !kpi.isFallback ? '...' : kpi.value}
            </strong>
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
            <article className="operation-card" key={operation.label}>
              <strong>{operation.label}</strong>
              <span>{operation.status}</span>
              {operation.path ? (
                <Link className="secondary-link-action compact-action" to={operation.path}>
                  Ouvrir
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
