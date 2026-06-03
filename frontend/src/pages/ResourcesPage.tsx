import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createResource,
  getResource,
  listResources,
  resourceStatuses,
  type CreateResourcePayload,
  type ResourceDetail,
  type ResourceListItem,
  type ResourceListResponse,
  type ResourceStatus,
  updateResourceStatus,
} from '../modules/resources/resourcesService';
import { useAuth } from '../modules/auth/useAuth';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { formatCurrency, formatDate } from '../shared/utils/formatters';

const RESOURCE_PAGE_SIZE = 8;

const statusLabels: Record<ResourceStatus, string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED: 'Affectee',
  UNDER_MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Hors service',
  ARCHIVED: 'Archivee',
};

const emptyForm = {
  name: '',
  inventoryCode: '',
  category: '',
  description: '',
  serialNumber: '',
  acquisitionDate: '',
  acquisitionValue: '',
  supplierId: '',
};

type ResourceFormState = typeof emptyForm;
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function normalizeResourcePayload(form: ResourceFormState): CreateResourcePayload {
  const payload: CreateResourcePayload = {
    name: form.name.trim(),
    inventoryCode: form.inventoryCode.trim(),
    category: form.category.trim(),
  };

  if (form.description.trim()) {
    payload.description = form.description.trim();
  }

  if (form.serialNumber.trim()) {
    payload.serialNumber = form.serialNumber.trim();
  }

  if (form.acquisitionDate) {
    payload.acquisitionDate = `${form.acquisitionDate}T00:00:00.000Z`;
  }

  if (form.acquisitionValue) {
    payload.acquisitionValue = Number(form.acquisitionValue);
  }

  if (form.supplierId.trim()) {
    payload.supplierId = form.supplierId.trim();
  }

  return payload;
}

export function ResourcesPage() {
  const { accessToken } = useAuth();
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [meta, setMeta] = useState<ResourceListResponse['meta']>({
    page: 1,
    limit: RESOURCE_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [selectedResource, setSelectedResource] = useState<ResourceDetail | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResourceStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ResourceFormState>(emptyForm);
  const [statusToApply, setStatusToApply] = useState<ResourceStatus>('AVAILABLE');
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(new Set(resources.map((resource) => resource.category))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [resources],
  );

  const fetchResources = useCallback(async () => {
    setIsListLoading(true);
    setErrorMessage(null);

    try {
      const response = await listResources(
        {
          page,
          limit: RESOURCE_PAGE_SIZE,
          search,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        },
        accessToken,
      );

      setResources(response.data);
      setMeta(response.meta);
    } catch {
      setErrorMessage("Impossible de charger l'inventaire des ressources.");
    } finally {
      setIsListLoading(false);
    }
  }, [accessToken, categoryFilter, page, search, statusFilter]);

  useEffect(() => {
    void fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (!resourceId) {
      setSelectedResource(null);
      return;
    }

    const selectedResourceId = resourceId;

    async function fetchDetail() {
      setIsDetailLoading(true);
      setErrorMessage(null);

      try {
        const detail = await getResource(selectedResourceId, accessToken);
        setSelectedResource(detail);
        setStatusToApply(detail.status);
      } catch {
        setErrorMessage('Ressource introuvable ou indisponible.');
      } finally {
        setIsDetailLoading(false);
      }
    }

    void fetchDetail();
  }, [accessToken, resourceId]);

  function updateFormField(field: keyof ResourceFormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleFilterSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setPage(1);
    void fetchResources();
  }

  async function handleCreateResource(event: FormSubmitEvent) {
    event.preventDefault();
    const payload = normalizeResourcePayload(form);

    if (!payload.name || !payload.inventoryCode || !payload.category) {
      setErrorMessage('Nom, reference inventaire et categorie sont obligatoires.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdResource = await createResource(payload, accessToken);
      setForm(emptyForm);
      setSuccessMessage('Ressource creee avec succes.');
      await fetchResources();
      void navigate(`/resources/${createdResource.id}`);
    } catch {
      setErrorMessage('Creation impossible. Verifiez les champs ou la reference inventaire.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusUpdate() {
    if (!selectedResource) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedResource = await updateResourceStatus(
        selectedResource.id,
        statusToApply,
        accessToken,
      );
      setSelectedResource(updatedResource);
      setSuccessMessage('Statut de la ressource mis a jour.');
      await fetchResources();
    } catch {
      setErrorMessage('Modification du statut impossible.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resources-page" aria-labelledby="resources-title">
      <div className="resource-page-header">
        <div>
          <span className="dashboard-eyebrow">Inventaire</span>
          <h1 id="resources-title">Ressources materielles</h1>
          <p>Consultez, creez et mettez a jour l'etat des ressources du parc materiel.</p>
        </div>
        <span className="dashboard-status">{meta.total} ressources</span>
      </div>

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <div className="resource-workspace">
        <section className="resource-list-panel" aria-labelledby="resource-list-title">
          <div className="section-heading">
            <h2 id="resource-list-title">Inventaire</h2>
            <p>Recherche par nom ou reference inventaire, avec filtres simples.</p>
          </div>

          <form className="resource-filters" onSubmit={handleFilterSubmit}>
            <label className="form-field" htmlFor="resource-search">
              <span>Recherche</span>
              <input
                id="resource-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom ou INV-..."
              />
            </label>

            <label className="form-field" htmlFor="status-filter">
              <span>Statut</span>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as ResourceStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tous</option>
                {resourceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="category-filter">
              <span>Categorie</span>
              <input
                id="category-filter"
                list="resource-categories"
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(1);
                }}
                placeholder="Informatique"
              />
              <datalist id="resource-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>

            <button className="secondary-action" type="submit">
              Filtrer
            </button>
          </form>

          <div className="resource-table-wrap">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Nom</th>
                  <th>Categorie</th>
                  <th>Statut</th>
                  <th>Creation</th>
                </tr>
              </thead>
              <tbody>
                {isListLoading ? (
                  <tr>
                    <td colSpan={5}>Chargement des ressources...</td>
                  </tr>
                ) : null}
                {!isListLoading && resources.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucune ressource trouvee.</td>
                  </tr>
                ) : null}
                {!isListLoading
                  ? resources.map((resource) => (
                      <tr key={resource.id}>
                        <td>
                          <Link to={`/resources/${resource.id}`}>{resource.inventoryCode}</Link>
                        </td>
                        <td>{resource.name}</td>
                        <td>{resource.category}</td>
                        <td>
                          <span className={`status-badge status-${resource.status.toLowerCase()}`}>
                            {statusLabels[resource.status]}
                          </span>
                        </td>
                        <td>{formatDate(resource.createdAt)}</td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={page <= 1 || isListLoading}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            >
              Precedent
            </button>
            <span>
              Page {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= Math.max(meta.totalPages, 1) || isListLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </section>

        <aside className="resource-side-panel">
          <section className="resource-detail-panel" aria-labelledby="resource-detail-title">
            <div className="section-heading">
              <h2 id="resource-detail-title">Detail ressource</h2>
              <p>Selectionnez une ligne pour afficher le detail.</p>
            </div>

            {isDetailLoading ? <p>Chargement du detail...</p> : null}
            {!isDetailLoading && selectedResource ? (
              <div className="resource-detail">
                <strong>{selectedResource.name}</strong>
                <span>{selectedResource.inventoryCode}</span>
                <dl>
                  <div>
                    <dt>Categorie</dt>
                    <dd>{selectedResource.category}</dd>
                  </div>
                  <div>
                    <dt>Description</dt>
                    <dd>{selectedResource.description ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <span className={`status-badge status-${selectedResource.status.toLowerCase()}`}>
                        {statusLabels[selectedResource.status]}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Numero de serie</dt>
                    <dd>{selectedResource.serialNumber ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Date acquisition</dt>
                    <dd>{formatDate(selectedResource.acquisitionDate)}</dd>
                  </div>
                  <div>
                    <dt>Valeur acquisition</dt>
                    <dd>{formatCurrency(selectedResource.acquisitionValue)}</dd>
                  </div>
                  <div>
                    <dt>Fournisseur</dt>
                    <dd>{selectedResource.supplier?.name ?? selectedResource.supplierId ?? '-'}</dd>
                  </div>
                </dl>

                <label className="form-field" htmlFor="resource-status-update">
                  <span>Modifier le statut</span>
                  <select
                    id="resource-status-update"
                    value={statusToApply}
                    onChange={(event) => setStatusToApply(event.target.value as ResourceStatus)}
                  >
                    {resourceStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="primary-action"
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleStatusUpdate()}
                >
                  Mettre a jour
                </button>
                <Link className="secondary-link-action" to={`/assignments?resourceId=${selectedResource.id}`}>
                  Voir les affectations
                </Link>
              </div>
            ) : null}
            {!isDetailLoading && !selectedResource ? (
              <p className="muted-copy">Aucun detail selectionne.</p>
            ) : null}
          </section>

          <section className="resource-create-panel" aria-labelledby="resource-create-title">
            <div className="section-heading">
              <h2 id="resource-create-title">Nouvelle ressource</h2>
              <p>Les champs nom, reference et categorie sont obligatoires.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateResource(event)}>
              <label className="form-field" htmlFor="resource-name">
                <span>Nom</span>
                <input
                  id="resource-name"
                  value={form.name}
                  onChange={(event) => updateFormField('name', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="resource-inventory-code">
                <span>Reference inventaire</span>
                <input
                  id="resource-inventory-code"
                  value={form.inventoryCode}
                  onChange={(event) => updateFormField('inventoryCode', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="resource-category">
                <span>Categorie</span>
                <input
                  id="resource-category"
                  value={form.category}
                  onChange={(event) => updateFormField('category', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="resource-description">
                <span>Description</span>
                <textarea
                  id="resource-description"
                  value={form.description}
                  onChange={(event) => updateFormField('description', event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="resource-serial-number">
                <span>Numero de serie</span>
                <input
                  id="resource-serial-number"
                  value={form.serialNumber}
                  onChange={(event) => updateFormField('serialNumber', event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="resource-acquisition-date">
                <span>Date acquisition</span>
                <input
                  id="resource-acquisition-date"
                  type="date"
                  value={form.acquisitionDate}
                  onChange={(event) => updateFormField('acquisitionDate', event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="resource-acquisition-value">
                <span>Valeur acquisition</span>
                <input
                  id="resource-acquisition-value"
                  min="0"
                  step="0.01"
                  type="number"
                  value={form.acquisitionValue}
                  onChange={(event) => updateFormField('acquisitionValue', event.target.value)}
                />
              </label>

              <label className="form-field" htmlFor="resource-supplier-id">
                <span>Fournisseur ID</span>
                <input
                  id="resource-supplier-id"
                  value={form.supplierId}
                  onChange={(event) => updateFormField('supplierId', event.target.value)}
                  placeholder="UUID optionnel"
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Creer la ressource'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  );
}
