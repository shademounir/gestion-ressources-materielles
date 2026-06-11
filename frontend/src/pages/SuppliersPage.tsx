import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';
import {
  createSupplier,
  deactivateSupplier,
  getSupplier,
  getSupplierHistory,
  listSuppliers,
  supplierStatuses,
  type CreateSupplierPayload,
  type ListSuppliersResponse,
  type Supplier,
  type SupplierHistory,
  type SupplierStatus,
} from '../modules/suppliers/suppliersService';
import { getApiErrorMessage } from '../services/apiClient';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { PageHeader } from '../shared/components/PageHeader';
import { PaginationControls } from '../shared/components/PaginationControls';
import { StatusBadge } from '../shared/components/StatusBadge';
import { formatDate } from '../shared/utils/formatters';

const SUPPLIERS_PAGE_SIZE = 8;

const statusLabels: Record<SupplierStatus, string> = {
  ACTIVE: 'Actif',
  INACTIVE: 'Inactif',
};

const emptyForm = {
  name: '',
  contactEmail: '',
  phone: '',
  address: '',
};

type SupplierFormState = typeof emptyForm;
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function normalizeCreateSupplierPayload(form: SupplierFormState): CreateSupplierPayload {
  const payload: CreateSupplierPayload = {
    name: form.name.trim(),
  };
  const contactEmail = form.contactEmail.trim().toLowerCase();
  const phone = form.phone.trim();
  const address = form.address.trim();

  if (contactEmail) {
    payload.contactEmail = contactEmail;
  }

  if (phone) {
    payload.phone = phone;
  }

  if (address) {
    payload.address = address;
  }

  return payload;
}

export function SuppliersPage() {
  const { accessToken } = useAuth();
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [meta, setMeta] = useState<ListSuppliersResponse['meta']>({
    page: 1,
    limit: SUPPLIERS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierHistory, setSupplierHistory] = useState<SupplierHistory | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupplierStatus | ''>('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supplierCountLabel = useMemo(
    () => `${meta.total} fournisseur${meta.total > 1 ? 's' : ''}`,
    [meta.total],
  );

  const fetchSuppliers = useCallback(async () => {
    setIsListLoading(true);
    setErrorMessage(null);

    try {
      const response = await listSuppliers(
        {
          page,
          limit: SUPPLIERS_PAGE_SIZE,
          search,
          status: statusFilter || undefined,
        },
        accessToken,
      );

      setSuppliers(response.data);
      setMeta(response.meta);
    } catch (error) {
      setSuppliers([]);
      setMeta({
        page: 1,
        limit: SUPPLIERS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      });
      setErrorMessage(getApiErrorMessage(error, 'Impossible de charger les fournisseurs.'));
    } finally {
      setIsListLoading(false);
    }
  }, [accessToken, page, search, statusFilter]);

  useEffect(() => {
    void fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (!supplierId) {
      setSelectedSupplier(null);
      setSupplierHistory(null);
      return;
    }

    const currentSupplierId = supplierId;

    async function fetchSupplierDetail() {
      setIsDetailLoading(true);
      setErrorMessage(null);

      try {
        const [supplierDetail, history] = await Promise.all([
          getSupplier(currentSupplierId, accessToken),
          getSupplierHistory(currentSupplierId, accessToken),
        ]);
        setSelectedSupplier(supplierDetail);
        setSupplierHistory(history);
      } catch (error) {
        setSelectedSupplier(null);
        setSupplierHistory(null);
        setErrorMessage(getApiErrorMessage(error, 'Fournisseur introuvable ou indisponible.'));
      } finally {
        setIsDetailLoading(false);
      }
    }

    void fetchSupplierDetail();
  }, [accessToken, supplierId]);

  function updateFormField(field: keyof SupplierFormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleFilterSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setPage(1);
    void fetchSuppliers();
  }

  async function handleCreateSupplier(event: FormSubmitEvent) {
    event.preventDefault();
    const payload = normalizeCreateSupplierPayload(form);

    if (!payload.name) {
      setErrorMessage('Le nom fournisseur est obligatoire.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdSupplier = await createSupplier(payload, accessToken);
      setForm(emptyForm);
      setSelectedSupplier(createdSupplier);
      setSuccessMessage('Fournisseur cree avec succes.');
      await fetchSuppliers();
      void navigate(`/suppliers/${createdSupplier.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Creation fournisseur impossible.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivateSupplier(supplier: Supplier) {
    if (!window.confirm(`Desactiver le fournisseur ${supplier.name} ?`)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedSupplier = await deactivateSupplier(supplier.id, accessToken);
      setSelectedSupplier(updatedSupplier);
      setSuccessMessage('Fournisseur desactive.');
      await fetchSuppliers();

      if (supplierId === supplier.id) {
        const history = await getSupplierHistory(supplier.id, accessToken);
        setSupplierHistory(history);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Desactivation fournisseur impossible.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resources-page" aria-labelledby="suppliers-title">
      <PageHeader
        eyebrow="Referentiel"
        title="Fournisseurs"
        description="Consultez, referencez et suivez les fournisseurs du parc materiel."
        status={supplierCountLabel}
        titleId="suppliers-title"
      />

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <div className="resource-workspace">
        <section className="resource-list-panel" aria-labelledby="suppliers-list-title">
          <div className="section-heading">
            <h2 id="suppliers-list-title">Liste fournisseurs</h2>
            <p>Recherche par nom ou email, avec filtre par statut.</p>
          </div>

          <form className="resource-filters" onSubmit={handleFilterSubmit}>
            <label className="form-field" htmlFor="supplier-search">
              <span>Recherche</span>
              <input
                id="supplier-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom ou email"
              />
            </label>

            <label className="form-field" htmlFor="supplier-status-filter">
              <span>Statut</span>
              <select
                id="supplier-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as SupplierStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tous</option>
                {supplierStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <button className="secondary-action" type="submit">
              Filtrer
            </button>
          </form>

          <div className="resource-table-wrap">
            <table className="resource-table">
              <thead>
                <tr>
                  <th>Fournisseur</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Creation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isListLoading ? (
                  <tr>
                    <td colSpan={5}>Chargement des fournisseurs...</td>
                  </tr>
                ) : null}
                {!isListLoading && suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun fournisseur trouve.</td>
                  </tr>
                ) : null}
                {!isListLoading
                  ? suppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>
                          <Link to={`/suppliers/${supplier.id}`}>{supplier.name}</Link>
                          <span className="table-subtle">{supplier.phone ?? '-'}</span>
                        </td>
                        <td>{supplier.contactEmail ?? '-'}</td>
                        <td>
                          <StatusBadge label={statusLabels[supplier.status]} status={supplier.status} />
                        </td>
                        <td>{formatDate(supplier.createdAt)}</td>
                        <td>
                          <button
                            className="compact-action danger-action"
                            type="button"
                            disabled={isSaving || supplier.status === 'INACTIVE'}
                            onClick={() => void handleDeactivateSupplier(supplier)}
                          >
                            Desactiver
                          </button>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={meta.page}
            totalPages={meta.totalPages}
            isLoading={isListLoading}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            onNext={() => setPage((currentPage) => currentPage + 1)}
          />
        </section>

        <aside className="resource-side-panel">
          <section className="resource-detail-panel" aria-labelledby="supplier-detail-title">
            <div className="section-heading">
              <h2 id="supplier-detail-title">Detail fournisseur</h2>
              <p>Selectionnez un fournisseur pour consulter son historique.</p>
            </div>

            {isDetailLoading ? <p>Chargement du detail...</p> : null}
            {!isDetailLoading && selectedSupplier ? (
              <div className="resource-detail">
                <strong>{selectedSupplier.name}</strong>
                <span>{selectedSupplier.contactEmail ?? 'Email non renseigne'}</span>
                <dl>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <StatusBadge
                        label={statusLabels[selectedSupplier.status]}
                        status={selectedSupplier.status}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>Telephone</dt>
                    <dd>{selectedSupplier.phone ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Adresse</dt>
                    <dd>{selectedSupplier.address ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Creation</dt>
                    <dd>{formatDate(selectedSupplier.createdAt)}</dd>
                  </div>
                </dl>

                <button
                  className="primary-action danger-action"
                  type="button"
                  disabled={isSaving || selectedSupplier.status === 'INACTIVE'}
                  onClick={() => void handleDeactivateSupplier(selectedSupplier)}
                >
                  Desactiver le fournisseur
                </button>
              </div>
            ) : null}
            {!isDetailLoading && !selectedSupplier ? (
              <p className="muted-copy">Aucun fournisseur selectionne.</p>
            ) : null}
          </section>

          <section className="resource-detail-panel" aria-labelledby="supplier-history-title">
            <div className="section-heading">
              <h2 id="supplier-history-title">Historique fournisseur</h2>
              <p>Vue extensible pour offres, appels d'offres et retours maintenance.</p>
            </div>

            {supplierHistory ? (
              <div className="resource-detail">
                <dl>
                  <div>
                    <dt>Derniere mise a jour</dt>
                    <dd>{formatDate(supplierHistory.supplierUpdatedAt)}</dd>
                  </div>
                  <div>
                    <dt>Offres disponibles</dt>
                    <dd>{supplierHistory.offersCount}</dd>
                  </div>
                  <div>
                    <dt>Appels d'offres</dt>
                    <dd>{supplierHistory.tendersCount}</dd>
                  </div>
                  <div>
                    <dt>Retours maintenance</dt>
                    <dd>{supplierHistory.maintenanceReturnsCount}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="muted-copy">Historique indisponible sans fournisseur selectionne.</p>
            )}
          </section>

          <section className="resource-create-panel" aria-labelledby="supplier-create-title">
            <div className="section-heading">
              <h2 id="supplier-create-title">Nouveau fournisseur</h2>
              <p>Le nom est obligatoire. Email, telephone et adresse restent optionnels.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateSupplier(event)}>
              <label className="form-field" htmlFor="supplier-name">
                <span>Nom fournisseur</span>
                <input
                  id="supplier-name"
                  value={form.name}
                  onChange={(event) => updateFormField('name', event.target.value)}
                  placeholder="Tech Solutions Maroc"
                  required
                />
              </label>

              <label className="form-field" htmlFor="supplier-email">
                <span>Email contact</span>
                <input
                  id="supplier-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => updateFormField('contactEmail', event.target.value)}
                  placeholder="contact@fournisseur.local"
                />
              </label>

              <label className="form-field" htmlFor="supplier-phone">
                <span>Telephone</span>
                <input
                  id="supplier-phone"
                  value={form.phone}
                  onChange={(event) => updateFormField('phone', event.target.value)}
                  placeholder="+212 522 000 000"
                />
              </label>

              <label className="form-field" htmlFor="supplier-address">
                <span>Adresse</span>
                <textarea
                  id="supplier-address"
                  value={form.address}
                  onChange={(event) => updateFormField('address', event.target.value)}
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Creer fournisseur'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  );
}
