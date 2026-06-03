import { type ComponentProps, useCallback, useEffect, useState } from 'react';
import {
  createMaintenanceIntervention,
  createMaintenanceReport,
  createMaintenanceTicket,
  createSupplierReturn,
  type MaintenancePriority,
  type MaintenanceSeverity,
} from '../modules/maintenance/maintenanceService';
import { listResources, type ResourceListItem } from '../modules/resources/resourcesService';
import { useAuth } from '../modules/auth/useAuth';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];
type MaintenanceAction = 'ticket' | 'report' | 'intervention' | 'supplierReturn';

const maintenancePriorityOptions: Array<{ value: MaintenancePriority; label: string }> = [
  { value: 'LOW', label: 'Basse' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Haute' },
  { value: 'URGENT', label: 'Urgente' },
];

const maintenanceSeverityOptions: Array<{ value: MaintenanceSeverity; label: string }> = [
  { value: 'LOW', label: 'Faible' },
  { value: 'MEDIUM', label: 'Moyenne' },
  { value: 'HIGH', label: 'Elevee' },
  { value: 'CRITICAL', label: 'Critique' },
];

const workflowSteps = [
  {
    title: '1. Signaler une panne',
    description: 'Ouvre un ticket et passe la ressource en maintenance.',
  },
  {
    title: '2. Rediger un constat',
    description: 'Ajoute le diagnostic, la cause probable et la gravite.',
  },
  {
    title: '3. Suivre une intervention',
    description: 'Enregistre le technicien, les dates, le cout et le resultat.',
  },
  {
    title: '4. Retour fournisseur',
    description: 'Trace le transfert vers un fournisseur actif.',
  },
];

function toApiDate(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined;
}

export function MaintenancePage() {
  const { accessToken } = useAuth();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [lastTicketId, setLastTicketId] = useState('');
  const [activeAction, setActiveAction] = useState<MaintenanceAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [ticketResourceId, setTicketResourceId] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPriority, setTicketPriority] = useState<MaintenancePriority>('MEDIUM');

  const [reportTicketId, setReportTicketId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [probableCause, setProbableCause] = useState('');
  const [severity, setSeverity] = useState<MaintenanceSeverity>('MEDIUM');
  const [recommendations, setRecommendations] = useState('');

  const [interventionTicketId, setInterventionTicketId] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [interventionDescription, setInterventionDescription] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [interventionCost, setInterventionCost] = useState('');
  const [interventionResult, setInterventionResult] = useState('');

  const [supplierReturnTicketId, setSupplierReturnTicketId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [sentAt, setSentAt] = useState('');
  const [expectedReturnAt, setExpectedReturnAt] = useState('');
  const [supplierReturnComment, setSupplierReturnComment] = useState('');

  const isSaving = activeAction !== null;

  const fetchResources = useCallback(async () => {
    try {
      const response = await listResources(
        {
          page: 1,
          limit: 50,
        },
        accessToken,
      );
      setResources(response.data);
    } catch {
      setErrorMessage(
        'Les ressources ne peuvent pas etre chargees. Vous pouvez saisir un UUID manuellement.',
      );
    }
  }, [accessToken]);

  useEffect(() => {
    void fetchResources();
  }, [fetchResources]);

  function startAction(action: MaintenanceAction) {
    setActiveAction(action);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function finishAction() {
    setActiveAction(null);
  }

  async function handleCreateTicket(event: FormSubmitEvent) {
    event.preventDefault();

    if (!ticketResourceId.trim() || !ticketDescription.trim()) {
      setErrorMessage('Ressource et description sont obligatoires.');
      return;
    }

    startAction('ticket');

    try {
      const ticket = await createMaintenanceTicket(
        {
          resourceId: ticketResourceId.trim(),
          description: ticketDescription.trim(),
          priority: ticketPriority,
        },
        accessToken,
      );
      setLastTicketId(ticket.id);
      setReportTicketId(ticket.id);
      setInterventionTicketId(ticket.id);
      setSupplierReturnTicketId(ticket.id);
      setTicketDescription('');
      setSuccessMessage(`Ticket de maintenance cree : ${ticket.id}`);
      await fetchResources();
    } catch {
      setErrorMessage(
        'Signalement impossible. Verifiez que la ressource existe et n est pas archivee ou deja en maintenance.',
      );
    } finally {
      finishAction();
    }
  }

  async function handleCreateReport(event: FormSubmitEvent) {
    event.preventDefault();

    if (!reportTicketId.trim() || !diagnosis.trim() || !probableCause.trim()) {
      setErrorMessage('Ticket, diagnostic et cause probable sont obligatoires.');
      return;
    }

    startAction('report');

    try {
      const report = await createMaintenanceReport(
        reportTicketId.trim(),
        {
          diagnosis: diagnosis.trim(),
          probableCause: probableCause.trim(),
          severity,
          ...(recommendations.trim() ? { recommendations: recommendations.trim() } : {}),
        },
        accessToken,
      );
      setRecommendations('');
      setSuccessMessage(`Constat cree pour le ticket ${report.maintenanceTicket.id}.`);
    } catch {
      setErrorMessage('Constat impossible. Verifiez le ticket et son statut.');
    } finally {
      finishAction();
    }
  }

  async function handleCreateIntervention(event: FormSubmitEvent) {
    event.preventDefault();
    const apiStartedAt = toApiDate(startedAt);
    const apiCompletedAt = toApiDate(completedAt);

    if (
      !interventionTicketId.trim() ||
      !technicianName.trim() ||
      !interventionDescription.trim() ||
      !apiStartedAt
    ) {
      setErrorMessage('Ticket, technicien, description et date de debut sont obligatoires.');
      return;
    }

    startAction('intervention');

    try {
      const intervention = await createMaintenanceIntervention(
        interventionTicketId.trim(),
        {
          technicianName: technicianName.trim(),
          description: interventionDescription.trim(),
          startedAt: apiStartedAt,
          ...(apiCompletedAt ? { completedAt: apiCompletedAt } : {}),
          ...(interventionCost.trim() ? { cost: Number(interventionCost) } : {}),
          ...(interventionResult.trim() ? { result: interventionResult.trim() } : {}),
        },
        accessToken,
      );
      setSuccessMessage(`Intervention creee : ${intervention.id}.`);
    } catch {
      setErrorMessage('Intervention impossible. Verifiez que le ticket possede deja un constat.');
    } finally {
      finishAction();
    }
  }

  async function handleCreateSupplierReturn(event: FormSubmitEvent) {
    event.preventDefault();
    const apiSentAt = toApiDate(sentAt);
    const apiExpectedReturnAt = toApiDate(expectedReturnAt);

    if (
      !supplierReturnTicketId.trim() ||
      !supplierId.trim() ||
      !returnReason.trim() ||
      !apiSentAt
    ) {
      setErrorMessage('Ticket, fournisseur, motif et date d envoi sont obligatoires.');
      return;
    }

    startAction('supplierReturn');

    try {
      const supplierReturn = await createSupplierReturn(
        supplierReturnTicketId.trim(),
        {
          supplierId: supplierId.trim(),
          reason: returnReason.trim(),
          sentAt: apiSentAt,
          ...(apiExpectedReturnAt ? { expectedReturnAt: apiExpectedReturnAt } : {}),
          ...(supplierReturnComment.trim() ? { comment: supplierReturnComment.trim() } : {}),
        },
        accessToken,
      );
      setSuccessMessage(`Retour fournisseur cree : ${supplierReturn.id}.`);
    } catch {
      setErrorMessage(
        'Retour fournisseur impossible. Verifiez le ticket, le fournisseur actif et les preconditions maintenance.',
      );
    } finally {
      finishAction();
    }
  }

  return (
    <section className="resources-page" aria-labelledby="maintenance-title">
      <div className="resource-page-header">
        <div>
          <span className="dashboard-eyebrow">Maintenance</span>
          <h1 id="maintenance-title">Gestion de la maintenance</h1>
          <p>
            Pilotez le cycle de maintenance par actions successives : panne, constat,
            intervention et retour fournisseur.
          </p>
        </div>
        <span className="dashboard-status">
          {lastTicketId ? `Ticket ${lastTicketId}` : 'Workflow actionnel'}
        </span>
      </div>

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <div className="maintenance-grid">
        {workflowSteps.map((step) => (
          <article className="operation-card" key={step.title}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </article>
        ))}
      </div>

      <div className="resource-workspace maintenance-workspace">
        <div className="maintenance-actions">
          <section className="resource-create-panel" aria-labelledby="maintenance-ticket-title">
            <div className="section-heading">
              <h2 id="maintenance-ticket-title">Signaler une panne</h2>
              <p>Selectionnez une ressource ou saisissez son UUID si elle n apparait pas.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateTicket(event)}>
              <label className="form-field" htmlFor="ticket-resource">
                <span>Ressource</span>
                <select
                  id="ticket-resource"
                  value={ticketResourceId}
                  onChange={(event) => setTicketResourceId(event.target.value)}
                >
                  <option value="">Selectionner une ressource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.inventoryCode} - {resource.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field" htmlFor="ticket-resource-id">
                <span>Resource ID</span>
                <input
                  id="ticket-resource-id"
                  value={ticketResourceId}
                  onChange={(event) => setTicketResourceId(event.target.value)}
                  placeholder="UUID ressource"
                  required
                />
              </label>

              <label className="form-field" htmlFor="ticket-priority">
                <span>Priorite</span>
                <select
                  id="ticket-priority"
                  value={ticketPriority}
                  onChange={(event) => setTicketPriority(event.target.value as MaintenancePriority)}
                >
                  {maintenancePriorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field" htmlFor="ticket-description">
                <span>Description panne</span>
                <textarea
                  id="ticket-description"
                  value={ticketDescription}
                  onChange={(event) => setTicketDescription(event.target.value)}
                  required
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {activeAction === 'ticket' ? 'Signalement...' : 'Signaler la panne'}
              </button>
            </form>
          </section>

          <section className="resource-create-panel" aria-labelledby="maintenance-report-title">
            <div className="section-heading">
              <h2 id="maintenance-report-title">Rediger un constat</h2>
              <p>Le ticket doit etre ouvert ou en cours.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateReport(event)}>
              <label className="form-field" htmlFor="report-ticket-id">
                <span>Ticket ID</span>
                <input
                  id="report-ticket-id"
                  value={reportTicketId}
                  onChange={(event) => setReportTicketId(event.target.value)}
                  placeholder="UUID ticket"
                  required
                />
              </label>

              <label className="form-field" htmlFor="report-diagnosis">
                <span>Diagnostic</span>
                <textarea
                  id="report-diagnosis"
                  value={diagnosis}
                  onChange={(event) => setDiagnosis(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="report-cause">
                <span>Cause probable</span>
                <textarea
                  id="report-cause"
                  value={probableCause}
                  onChange={(event) => setProbableCause(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="report-severity">
                <span>Gravite</span>
                <select
                  id="report-severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as MaintenanceSeverity)}
                >
                  {maintenanceSeverityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field" htmlFor="report-recommendations">
                <span>Recommandations</span>
                <textarea
                  id="report-recommendations"
                  value={recommendations}
                  onChange={(event) => setRecommendations(event.target.value)}
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {activeAction === 'report' ? 'Creation...' : 'Creer le constat'}
              </button>
            </form>
          </section>

          <section className="resource-create-panel" aria-labelledby="maintenance-intervention-title">
            <div className="section-heading">
              <h2 id="maintenance-intervention-title">Suivre une intervention</h2>
              <p>Un constat doit deja exister pour le ticket.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateIntervention(event)}>
              <label className="form-field" htmlFor="intervention-ticket-id">
                <span>Ticket ID</span>
                <input
                  id="intervention-ticket-id"
                  value={interventionTicketId}
                  onChange={(event) => setInterventionTicketId(event.target.value)}
                  placeholder="UUID ticket"
                  required
                />
              </label>

              <label className="form-field" htmlFor="intervention-technician">
                <span>Technicien</span>
                <input
                  id="intervention-technician"
                  value={technicianName}
                  onChange={(event) => setTechnicianName(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="intervention-description">
                <span>Description intervention</span>
                <textarea
                  id="intervention-description"
                  value={interventionDescription}
                  onChange={(event) => setInterventionDescription(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="intervention-started-at">
                <span>Date debut</span>
                <input
                  id="intervention-started-at"
                  type="datetime-local"
                  value={startedAt}
                  onChange={(event) => setStartedAt(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="intervention-completed-at">
                <span>Date fin</span>
                <input
                  id="intervention-completed-at"
                  type="datetime-local"
                  value={completedAt}
                  onChange={(event) => setCompletedAt(event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="intervention-cost">
                <span>Cout</span>
                <input
                  id="intervention-cost"
                  min="0"
                  step="0.01"
                  type="number"
                  value={interventionCost}
                  onChange={(event) => setInterventionCost(event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="intervention-result">
                <span>Resultat</span>
                <textarea
                  id="intervention-result"
                  value={interventionResult}
                  onChange={(event) => setInterventionResult(event.target.value)}
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {activeAction === 'intervention' ? 'Enregistrement...' : 'Enregistrer intervention'}
              </button>
            </form>
          </section>

          <section className="resource-create-panel" aria-labelledby="maintenance-supplier-return-title">
            <div className="section-heading">
              <h2 id="maintenance-supplier-return-title">Retour fournisseur</h2>
              <p>Le fournisseur doit etre actif et le ticket deja documente.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateSupplierReturn(event)}>
              <label className="form-field" htmlFor="supplier-return-ticket-id">
                <span>Ticket ID</span>
                <input
                  id="supplier-return-ticket-id"
                  value={supplierReturnTicketId}
                  onChange={(event) => setSupplierReturnTicketId(event.target.value)}
                  placeholder="UUID ticket"
                  required
                />
              </label>

              <label className="form-field" htmlFor="supplier-id">
                <span>Supplier ID</span>
                <input
                  id="supplier-id"
                  value={supplierId}
                  onChange={(event) => setSupplierId(event.target.value)}
                  placeholder="UUID fournisseur"
                  required
                />
              </label>

              <label className="form-field" htmlFor="supplier-return-reason">
                <span>Motif</span>
                <textarea
                  id="supplier-return-reason"
                  value={returnReason}
                  onChange={(event) => setReturnReason(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="supplier-return-sent-at">
                <span>Date envoi</span>
                <input
                  id="supplier-return-sent-at"
                  type="datetime-local"
                  value={sentAt}
                  onChange={(event) => setSentAt(event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="supplier-return-expected-at">
                <span>Date retour prevue</span>
                <input
                  id="supplier-return-expected-at"
                  type="datetime-local"
                  value={expectedReturnAt}
                  onChange={(event) => setExpectedReturnAt(event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="supplier-return-comment">
                <span>Commentaire</span>
                <textarea
                  id="supplier-return-comment"
                  value={supplierReturnComment}
                  onChange={(event) => setSupplierReturnComment(event.target.value)}
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {activeAction === 'supplierReturn' ? 'Declaration...' : 'Declarer retour fournisseur'}
              </button>
            </form>
          </section>
        </div>

        <aside className="resource-side-panel">
          <section className="resource-detail-panel" aria-labelledby="maintenance-limits-title">
            <div className="section-heading">
              <h2 id="maintenance-limits-title">Limite API actuelle</h2>
              <p>
                Aucun endpoint de liste ou detail maintenance n est expose. Cette page reste donc
                orientee actions et prete a brancher sur un futur GET /maintenance-tickets.
              </p>
            </div>
            <div className="resource-detail">
              <dl>
                <div>
                  <dt>Lecture tickets</dt>
                  <dd>Non disponible</dd>
                </div>
                <div>
                  <dt>Lecture detail</dt>
                  <dd>Non disponible</dd>
                </div>
                <div>
                  <dt>Creation</dt>
                  <dd>Disponible</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="resource-detail-panel" aria-labelledby="maintenance-last-ticket-title">
            <div className="section-heading">
              <h2 id="maintenance-last-ticket-title">Dernier ticket</h2>
              <p>Utilise pour pre-remplir les etapes suivantes apres signalement.</p>
            </div>
            <p className="muted-copy">{lastTicketId || 'Aucun ticket cree dans cette session.'}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
