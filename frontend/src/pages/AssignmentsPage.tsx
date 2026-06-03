import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createAssignment,
  getAssignment,
  listResourceAssignments,
  returnAssignment,
  type AssignmentDetail,
  type AssignmentHistoryItem,
  type AssignmentHistoryResponse,
  type AssignmentStatus,
} from '../modules/assignments/assignmentsService';
import { listResources, type ResourceListItem } from '../modules/resources/resourcesService';
import { useAuth } from '../modules/auth/useAuth';

const ASSIGNMENT_PAGE_SIZE = 8;
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  ACTIVE: 'Active',
  RETURNED: 'Retournee',
  CANCELLED: 'Annulee',
};

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

export function AssignmentsPage() {
  const { accessToken } = useAuth();
  const { assignmentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState(
    searchParams.get('resourceId') ?? '',
  );
  const [history, setHistory] = useState<AssignmentHistoryItem[]>([]);
  const [meta, setMeta] = useState<AssignmentHistoryResponse['meta']>({
    page: 1,
    limit: ASSIGNMENT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [detail, setDetail] = useState<AssignmentDetail | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState('');
  const [assignmentComment, setAssignmentComment] = useState('');
  const [returnComment, setReturnComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredHistory = useMemo(
    () =>
      history.filter((assignment) => {
        const matchesStatus = statusFilter ? assignment.status === statusFilter : true;
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch = normalizedSearch
          ? `${assignment.userFullName} ${assignment.inventoryCode} ${assignment.resourceName}`
              .toLowerCase()
              .includes(normalizedSearch)
          : true;

        return matchesStatus && matchesSearch;
      }),
    [history, search, statusFilter],
  );

  const selectedResource = resources.find((resource) => resource.id === selectedResourceId);

  const fetchResources = useCallback(async () => {
    setErrorMessage(null);

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
      setErrorMessage('Impossible de charger les ressources disponibles.');
    }
  }, [accessToken]);

  const fetchHistory = useCallback(async () => {
    if (!selectedResourceId) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listResourceAssignments(
        selectedResourceId,
        page,
        ASSIGNMENT_PAGE_SIZE,
        accessToken,
      );
      setHistory(response.data);
      setMeta(response.meta);
    } catch {
      setErrorMessage("Impossible de charger l'historique des affectations.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, selectedResourceId]);

  useEffect(() => {
    void fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!assignmentId) {
      setDetail(null);
      return;
    }

    const selectedAssignmentId = assignmentId;

    async function fetchDetail() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const assignmentDetail = await getAssignment(selectedAssignmentId, accessToken);
        setDetail(assignmentDetail);
        setSelectedResourceId(assignmentDetail.resource.id);
      } catch {
        setErrorMessage('Affectation introuvable ou indisponible.');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchDetail();
  }, [accessToken, assignmentId]);

  async function handleCreateAssignment(event: FormSubmitEvent) {
    event.preventDefault();

    if (!selectedResourceId || !userId.trim()) {
      setErrorMessage('Ressource et utilisateur sont obligatoires.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdAssignment = await createAssignment(
        {
          resourceId: selectedResourceId,
          userId: userId.trim(),
          ...(assignmentComment.trim() ? { comment: assignmentComment.trim() } : {}),
        },
        accessToken,
      );
      setUserId('');
      setAssignmentComment('');
      setSuccessMessage('Affectation creee avec succes.');
      await fetchHistory();
      void navigate(`/assignments/${createdAssignment.id}`);
    } catch {
      setErrorMessage(
        "Creation impossible. Verifiez que la ressource est disponible et que l'utilisateur existe.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReturnAssignment(targetAssignmentId: string) {
    if (!window.confirm('Confirmer le retour de cette ressource ?')) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await returnAssignment(
        targetAssignmentId,
        returnComment.trim() ? { returnComment: returnComment.trim() } : {},
        accessToken,
      );
      setReturnComment('');
      setSuccessMessage('Ressource retournee avec succes.');
      await fetchHistory();

      if (assignmentId === targetAssignmentId) {
        const updatedDetail = await getAssignment(targetAssignmentId, accessToken);
        setDetail(updatedDetail);
      }
    } catch {
      setErrorMessage('Retour impossible pour cette affectation.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resources-page" aria-labelledby="assignments-title">
      <div className="resource-page-header">
        <div>
          <span className="dashboard-eyebrow">Affectations</span>
          <h1 id="assignments-title">Gestion des affectations</h1>
          <p>
            Affectez une ressource disponible, suivez son historique et traitez les retours.
          </p>
        </div>
        <span className="dashboard-status">
          {selectedResource ? selectedResource.inventoryCode : 'Ressource a selectionner'}
        </span>
      </div>

      {(errorMessage || successMessage) && (
        <div
          className={successMessage ? 'feedback-message feedback-success' : 'feedback-message'}
          role="status"
        >
          {successMessage ?? errorMessage}
        </div>
      )}

      <div className="resource-workspace">
        <section className="resource-list-panel" aria-labelledby="assignment-history-title">
          <div className="section-heading">
            <h2 id="assignment-history-title">Historique par ressource</h2>
            <p>
              Le backend ne fournit pas encore de liste globale ; l'historique est charge par
              ressource.
            </p>
          </div>

          <form className="resource-filters" onSubmit={(event) => event.preventDefault()}>
            <label className="form-field" htmlFor="assignment-resource">
              <span>Ressource</span>
              <select
                id="assignment-resource"
                value={selectedResourceId}
                onChange={(event) => {
                  setSelectedResourceId(event.target.value);
                  setPage(1);
                  void navigate('/assignments');
                }}
              >
                <option value="">Selectionner</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.inventoryCode} - {resource.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="assignment-status-filter">
              <span>Statut</span>
              <select
                id="assignment-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as AssignmentStatus | '')}
              >
                <option value="">Tous</option>
                <option value="ACTIVE">Active</option>
                <option value="RETURNED">Retournee</option>
                <option value="CANCELLED">Annulee</option>
              </select>
            </label>

            <label className="form-field" htmlFor="assignment-search">
              <span>Recherche</span>
              <input
                id="assignment-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Utilisateur ou inventaire"
              />
            </label>
          </form>

          <div className="resource-table-wrap">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Ressource</th>
                  <th>Utilisateur</th>
                  <th>Statut</th>
                  <th>Affectee le</th>
                  <th>Retournee le</th>
                  <th>Commentaire</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7}>Chargement des affectations...</td>
                  </tr>
                ) : null}
                {!isLoading && filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7}>Aucune affectation a afficher.</td>
                  </tr>
                ) : null}
                {!isLoading
                  ? filteredHistory.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>
                          <Link to={`/assignments/${assignment.id}`}>
                            {assignment.inventoryCode}
                          </Link>
                          <span className="table-subtle">{assignment.resourceName}</span>
                        </td>
                        <td>{assignment.userFullName}</td>
                        <td>
                          <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                            {assignmentStatusLabels[assignment.status]}
                          </span>
                        </td>
                        <td>{formatDate(assignment.assignedAt)}</td>
                        <td>{formatDate(assignment.returnedAt)}</td>
                        <td>{assignment.comment ?? '-'}</td>
                        <td>
                          <button
                            className="secondary-action compact-action"
                            type="button"
                            disabled={assignment.status !== 'ACTIVE' || isSaving}
                            onClick={() => void handleReturnAssignment(assignment.id)}
                          >
                            Retourner
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            >
              Precedent
            </button>
            <span>
              Page {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= Math.max(meta.totalPages, 1) || isLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </section>

        <aside className="resource-side-panel">
          <section className="resource-create-panel" aria-labelledby="assignment-create-title">
            <div className="section-heading">
              <h2 id="assignment-create-title">Nouvelle affectation</h2>
              <p>La selection utilisateur reste manuelle tant qu'aucune API liste utilisateurs n'est exposee.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateAssignment(event)}>
              <label className="form-field" htmlFor="assignment-user-id">
                <span>Utilisateur ID</span>
                <input
                  id="assignment-user-id"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  placeholder="UUID utilisateur"
                  required
                />
              </label>

              <label className="form-field" htmlFor="assignment-comment">
                <span>Commentaire</span>
                <textarea
                  id="assignment-comment"
                  value={assignmentComment}
                  onChange={(event) => setAssignmentComment(event.target.value)}
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {isSaving ? 'Affectation...' : 'Affecter la ressource'}
              </button>
            </form>
          </section>

          <section className="resource-detail-panel" aria-labelledby="assignment-detail-title">
            <div className="section-heading">
              <h2 id="assignment-detail-title">Detail affectation</h2>
              <p>Consultez les informations utilisateur et ressource.</p>
            </div>

            {detail ? (
              <div className="resource-detail">
                <strong>{detail.resource.name}</strong>
                <span>{detail.resource.inventoryCode}</span>
                <dl>
                  <div>
                    <dt>Utilisateur</dt>
                    <dd>
                      {detail.user.firstName} {detail.user.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{detail.user.email}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <span className={`status-badge status-${detail.status.toLowerCase()}`}>
                        {assignmentStatusLabels[detail.status]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Affectee le</dt>
                    <dd>{formatDate(detail.assignedAt)}</dd>
                  </div>
                  <div>
                    <dt>Retournee le</dt>
                    <dd>{formatDate(detail.returnedAt)}</dd>
                  </div>
                  <div>
                    <dt>Commentaire</dt>
                    <dd>{detail.comment ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Commentaire retour</dt>
                    <dd>{detail.returnComment ?? '-'}</dd>
                  </div>
                </dl>

                <label className="form-field" htmlFor="return-comment">
                  <span>Commentaire retour</span>
                  <textarea
                    id="return-comment"
                    value={returnComment}
                    onChange={(event) => setReturnComment(event.target.value)}
                  />
                </label>
                <button
                  className="primary-action"
                  type="button"
                  disabled={detail.status !== 'ACTIVE' || isSaving}
                  onClick={() => void handleReturnAssignment(detail.id)}
                >
                  Retourner la ressource
                </button>
              </div>
            ) : (
              <p className="muted-copy">Selectionnez une affectation pour afficher son detail.</p>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
