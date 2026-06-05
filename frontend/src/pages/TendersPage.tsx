import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../modules/auth/useAuth';
import { listSuppliers, type Supplier } from '../modules/suppliers/suppliersService';
import {
  createSupplierOffer,
  createTender,
  getTender,
  listDepartmentNeeds,
  listTenderOffers,
  listTenders,
  publishTender,
  selectSupplierOffer,
  tenderStatuses,
  type DepartmentNeedListItem,
  type PaginatedResponse,
  type SupplierOffer,
  type SupplierOfferStatus,
  type TenderDetail,
  type TenderListItem,
  type TenderStatus,
} from '../modules/tenders/tendersService';
import { getApiErrorMessage } from '../services/apiClient';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { PageHeader } from '../shared/components/PageHeader';
import { PaginationControls } from '../shared/components/PaginationControls';
import { StatusBadge } from '../shared/components/StatusBadge';
import { formatCurrency, formatDate } from '../shared/utils/formatters';

const TENDERS_PAGE_SIZE = 8;

const tenderStatusLabels: Record<TenderStatus, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publie',
  AWARDED: 'Attribue',
  CLOSED: 'Clos',
  CANCELLED: 'Annule',
  ARCHIVED: 'Archive',
};

const offerStatusLabels: Record<SupplierOfferStatus, string> = {
  SUBMITTED: 'Soumise',
  UNDER_REVIEW: 'En revue',
  SELECTED: 'Selectionnee',
  REJECTED: 'Rejetee',
  WITHDRAWN: 'Retiree',
};

const emptyTenderForm = {
  needId: '',
  reference: '',
  title: '',
  description: '',
  deadline: '',
};

const emptyOfferForm = {
  supplierId: '',
  amount: '',
  proposedDeliveryDays: '',
  comment: '',
};

type TenderFormState = typeof emptyTenderForm;
type OfferFormState = typeof emptyOfferForm;
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function normalizeTenderPayload(form: TenderFormState) {
  const payload = {
    title: form.title.trim(),
    description: form.description.trim(),
    deadline: form.deadline ? `${form.deadline}:00.000Z` : '',
    needId: form.needId,
    reference: form.reference.trim() || undefined,
  };

  return payload;
}

export function TendersPage() {
  const { accessToken } = useAuth();
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<TenderListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<TenderListItem>['meta']>({
    page: 1,
    limit: TENDERS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [selectedTender, setSelectedTender] = useState<TenderDetail | null>(null);
  const [offers, setOffers] = useState<SupplierOffer[]>([]);
  const [needs, setNeeds] = useState<DepartmentNeedListItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [tenderForm, setTenderForm] = useState<TenderFormState>(emptyTenderForm);
  const [offerForm, setOfferForm] = useState<OfferFormState>(emptyOfferForm);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tenderCountLabel = useMemo(
    () => `${meta.total} appel${meta.total > 1 ? 's' : ''} d'offres`,
    [meta.total],
  );

  const fetchTenders = useCallback(async () => {
    setIsListLoading(true);
    setErrorMessage(null);

    try {
      const response = await listTenders(
        {
          page,
          limit: TENDERS_PAGE_SIZE,
          search,
          status: statusFilter || undefined,
        },
        accessToken,
      );

      setTenders(response.data);
      setMeta(response.meta);
    } catch (error) {
      setTenders([]);
      setMeta({ page: 1, limit: TENDERS_PAGE_SIZE, total: 0, totalPages: 0 });
      setErrorMessage(getApiErrorMessage(error, "Impossible de charger les appels d'offres."));
    } finally {
      setIsListLoading(false);
    }
  }, [accessToken, page, search, statusFilter]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const [needsResponse, suppliersResponse] = await Promise.all([
        listDepartmentNeeds({ page: 1, limit: 50, status: 'SUBMITTED' }, accessToken),
        listSuppliers({ page: 1, limit: 50, status: 'ACTIVE' }, accessToken),
      ]);
      setNeeds(needsResponse.data);
      setSuppliers(suppliersResponse.data);
    } catch {
      setNeeds([]);
      setSuppliers([]);
    }
  }, [accessToken]);

  const fetchTenderDetail = useCallback(
    async (currentTenderId: string) => {
      setIsDetailLoading(true);
      setErrorMessage(null);

      try {
        const [detail, offersResponse] = await Promise.all([
          getTender(currentTenderId, accessToken),
          listTenderOffers(currentTenderId, accessToken),
        ]);
        setSelectedTender(detail);
        setOffers(offersResponse.data);
      } catch (error) {
        setSelectedTender(null);
        setOffers([]);
        setErrorMessage(getApiErrorMessage(error, "Appel d'offres introuvable ou indisponible."));
      } finally {
        setIsDetailLoading(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    void fetchTenders();
  }, [fetchTenders]);

  useEffect(() => {
    void fetchReferenceData();
  }, [fetchReferenceData]);

  useEffect(() => {
    if (!tenderId) {
      setSelectedTender(null);
      setOffers([]);
      return;
    }

    void fetchTenderDetail(tenderId);
  }, [fetchTenderDetail, tenderId]);

  function updateTenderFormField(field: keyof TenderFormState, value: string) {
    setTenderForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function updateOfferFormField(field: keyof OfferFormState, value: string) {
    setOfferForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleFilterSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setPage(1);
    void fetchTenders();
  }

  async function handleCreateTender(event: FormSubmitEvent) {
    event.preventDefault();
    const payload = normalizeTenderPayload(tenderForm);

    if (!payload.needId || !payload.title || !payload.description || !payload.deadline) {
      setErrorMessage('Besoin, titre, description et deadline sont obligatoires.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdTender = await createTender(payload, accessToken);
      setTenderForm(emptyTenderForm);
      setSuccessMessage("Appel d'offres cree avec succes.");
      await fetchTenders();
      void navigate(`/tenders/${createdTender.id}`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Creation de l'appel d'offres impossible."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublishTender(tender: TenderListItem | TenderDetail) {
    if (!window.confirm(`Publier l'appel d'offres ${tender.reference} ?`)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await publishTender(tender.id, accessToken);
      setSuccessMessage("Appel d'offres publie.");
      await fetchTenders();
      if (tenderId) {
        await fetchTenderDetail(tenderId);
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Publication de l'appel d'offres impossible."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateOffer(event: FormSubmitEvent) {
    event.preventDefault();

    if (!selectedTender) {
      return;
    }

    const payload = {
      tenderId: selectedTender.id,
      supplierId: offerForm.supplierId,
      amount: Number(offerForm.amount),
      proposedDeliveryDays: Number(offerForm.proposedDeliveryDays),
      comment: offerForm.comment.trim() || undefined,
    };

    if (!payload.supplierId || payload.amount <= 0 || payload.proposedDeliveryDays <= 0) {
      setErrorMessage('Fournisseur, montant et delai de livraison sont obligatoires.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createSupplierOffer(payload, accessToken);
      setOfferForm(emptyOfferForm);
      setSuccessMessage('Offre fournisseur enregistree.');
      await fetchTenderDetail(selectedTender.id);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Creation de l'offre fournisseur impossible."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectOffer(offer: SupplierOffer) {
    if (!window.confirm('Selectionner cette offre comme gagnante ?')) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await selectSupplierOffer(offer.id, accessToken);
      setSuccessMessage('Offre gagnante selectionnee.');
      if (selectedTender) {
        await fetchTenderDetail(selectedTender.id);
      }
      await fetchTenders();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Selection de l'offre impossible."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resources-page" aria-labelledby="tenders-title">
      <PageHeader
        eyebrow="Achats"
        title="Appels d'offres"
        description="Pilotez les appels d'offres, les offres fournisseurs et la selection gagnante."
        status={tenderCountLabel}
        titleId="tenders-title"
      />

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <div className="resource-workspace">
        <section className="resource-list-panel" aria-labelledby="tenders-list-title">
          <div className="section-heading">
            <h2 id="tenders-list-title">Liste appels d'offres</h2>
            <p>Recherche par reference ou titre, avec filtre par statut.</p>
          </div>

          <form className="resource-filters" onSubmit={handleFilterSubmit}>
            <label className="form-field" htmlFor="tender-search">
              <span>Recherche</span>
              <input
                id="tender-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="AO-... ou titre"
              />
            </label>

            <label className="form-field" htmlFor="tender-status-filter">
              <span>Statut</span>
              <select
                id="tender-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as TenderStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tous</option>
                {tenderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {tenderStatusLabels[status]}
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
                  <th>Reference</th>
                  <th>Titre</th>
                  <th>Statut</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isListLoading ? (
                  <tr>
                    <td colSpan={5}>Chargement des appels d'offres...</td>
                  </tr>
                ) : null}
                {!isListLoading && tenders.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun appel d'offres trouve.</td>
                  </tr>
                ) : null}
                {!isListLoading
                  ? tenders.map((tender) => (
                      <tr key={tender.id}>
                        <td>
                          <Link to={`/tenders/${tender.id}`}>{tender.reference}</Link>
                        </td>
                        <td>{tender.title}</td>
                        <td>
                          <StatusBadge label={tenderStatusLabels[tender.status]} status={tender.status} />
                        </td>
                        <td>{formatDate(tender.deadline)}</td>
                        <td>
                          <button
                            className="compact-action"
                            type="button"
                            disabled={isSaving || tender.status !== 'DRAFT'}
                            onClick={() => void handlePublishTender(tender)}
                          >
                            Publier
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
          <section className="resource-detail-panel" aria-labelledby="tender-detail-title">
            <div className="section-heading">
              <h2 id="tender-detail-title">Detail appel d'offres</h2>
              <p>Selectionnez un appel d'offres pour consulter ses offres.</p>
            </div>

            {isDetailLoading ? <p>Chargement du detail...</p> : null}
            {!isDetailLoading && selectedTender ? (
              <div className="resource-detail">
                <strong>{selectedTender.reference}</strong>
                <span>{selectedTender.title}</span>
                <dl>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <StatusBadge
                        label={tenderStatusLabels[selectedTender.status]}
                        status={selectedTender.status}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>Besoin</dt>
                    <dd>{selectedTender.need.title}</dd>
                  </div>
                  <div>
                    <dt>Description</dt>
                    <dd>{selectedTender.description}</dd>
                  </div>
                  <div>
                    <dt>Createur</dt>
                    <dd>
                      {selectedTender.createdBy.firstName} {selectedTender.createdBy.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt>Deadline</dt>
                    <dd>{formatDate(selectedTender.deadline)}</dd>
                  </div>
                  <div>
                    <dt>Publication</dt>
                    <dd>{formatDate(selectedTender.publishedAt)}</dd>
                  </div>
                  <div>
                    <dt>Attribution</dt>
                    <dd>{formatDate(selectedTender.awardedAt)}</dd>
                  </div>
                </dl>
                <button
                  className="primary-action"
                  type="button"
                  disabled={isSaving || selectedTender.status !== 'DRAFT'}
                  onClick={() => void handlePublishTender(selectedTender)}
                >
                  Publier l'appel d'offres
                </button>
              </div>
            ) : null}
            {!isDetailLoading && !selectedTender ? (
              <p className="muted-copy">Aucun appel d'offres selectionne.</p>
            ) : null}
          </section>

          <section className="resource-detail-panel" aria-labelledby="supplier-offers-title">
            <div className="section-heading">
              <h2 id="supplier-offers-title">Offres fournisseurs</h2>
              <p>Selectionnez une offre gagnante lorsqu'elle est eligible.</p>
            </div>

            {offers.length === 0 ? <p className="muted-copy">Aucune offre fournisseur.</p> : null}
            {offers.map((offer) => (
              <div className="resource-detail" key={offer.id}>
                <strong>{suppliers.find((supplier) => supplier.id === offer.supplierId)?.name ?? offer.supplierId}</strong>
                <span>{formatCurrency(String(offer.amount))}</span>
                <dl>
                  <div>
                    <dt>Statut</dt>
                    <dd>
                      <StatusBadge label={offerStatusLabels[offer.status]} status={offer.status} />
                    </dd>
                  </div>
                  <div>
                    <dt>Delai propose</dt>
                    <dd>{offer.proposedDeliveryDays} jours</dd>
                  </div>
                  <div>
                    <dt>Commentaire</dt>
                    <dd>{offer.comment ?? '-'}</dd>
                  </div>
                </dl>
                <button
                  className="compact-action"
                  type="button"
                  disabled={
                    isSaving ||
                    !selectedTender ||
                    selectedTender.status !== 'PUBLISHED' ||
                    (offer.status !== 'SUBMITTED' && offer.status !== 'UNDER_REVIEW')
                  }
                  onClick={() => void handleSelectOffer(offer)}
                >
                  Selectionner
                </button>
              </div>
            ))}
          </section>

          <section className="resource-create-panel" aria-labelledby="tender-create-title">
            <div className="section-heading">
              <h2 id="tender-create-title">Nouvel appel d'offres</h2>
              <p>Selectionnez un besoin departemental disponible.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateTender(event)}>
              <label className="form-field" htmlFor="tender-need">
                <span>Besoin departemental</span>
                <select
                  id="tender-need"
                  value={tenderForm.needId}
                  onChange={(event) => updateTenderFormField('needId', event.target.value)}
                  required
                >
                  <option value="">Selectionner</option>
                  {needs.map((need) => (
                    <option key={need.id} value={need.id}>
                      {need.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field" htmlFor="tender-reference">
                <span>Reference optionnelle</span>
                <input
                  id="tender-reference"
                  value={tenderForm.reference}
                  onChange={(event) => updateTenderFormField('reference', event.target.value)}
                  placeholder="AO-20260602-0001"
                />
              </label>

              <label className="form-field" htmlFor="tender-title">
                <span>Titre</span>
                <input
                  id="tender-title"
                  value={tenderForm.title}
                  onChange={(event) => updateTenderFormField('title', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="tender-description">
                <span>Description</span>
                <textarea
                  id="tender-description"
                  value={tenderForm.description}
                  onChange={(event) => updateTenderFormField('description', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="tender-deadline">
                <span>Deadline</span>
                <input
                  id="tender-deadline"
                  type="datetime-local"
                  value={tenderForm.deadline}
                  onChange={(event) => updateTenderFormField('deadline', event.target.value)}
                  required
                />
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : "Creer l'appel d'offres"}
              </button>
            </form>
          </section>

          <section className="resource-create-panel" aria-labelledby="offer-create-title">
            <div className="section-heading">
              <h2 id="offer-create-title">Nouvelle offre fournisseur</h2>
              <p>Disponible pour un appel d'offres publie.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateOffer(event)}>
              <label className="form-field" htmlFor="offer-supplier">
                <span>Fournisseur</span>
                <select
                  id="offer-supplier"
                  value={offerForm.supplierId}
                  onChange={(event) => updateOfferFormField('supplierId', event.target.value)}
                  required
                >
                  <option value="">Selectionner</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field" htmlFor="offer-amount">
                <span>Montant</span>
                <input
                  id="offer-amount"
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={offerForm.amount}
                  onChange={(event) => updateOfferFormField('amount', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="offer-delivery-days">
                <span>Delai livraison propose</span>
                <input
                  id="offer-delivery-days"
                  min="1"
                  type="number"
                  value={offerForm.proposedDeliveryDays}
                  onChange={(event) => updateOfferFormField('proposedDeliveryDays', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="offer-comment">
                <span>Commentaire</span>
                <textarea
                  id="offer-comment"
                  value={offerForm.comment}
                  onChange={(event) => updateOfferFormField('comment', event.target.value)}
                />
              </label>

              <button
                className="primary-action"
                type="submit"
                disabled={isSaving || !selectedTender || selectedTender.status !== 'PUBLISHED'}
              >
                {isSaving ? 'Enregistrement...' : "Enregistrer l'offre"}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  );
}
