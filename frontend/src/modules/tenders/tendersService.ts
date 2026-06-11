import { apiClient } from '../../services/apiClient';

export const tenderStatuses = ['DRAFT', 'PUBLISHED', 'AWARDED', 'CLOSED', 'CANCELLED', 'ARCHIVED'] as const;
export const supplierOfferStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN'] as const;
export const needStatuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED_TO_TENDER', 'CANCELLED'] as const;
export const needPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export type TenderStatus = (typeof tenderStatuses)[number];
export type SupplierOfferStatus = (typeof supplierOfferStatuses)[number];
export type NeedStatus = (typeof needStatuses)[number];
export type NeedPriority = (typeof needPriorities)[number];

export interface PaginatedResponse<TItem> {
  data: TItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TenderListItem {
  id: string;
  reference: string;
  title: string;
  status: TenderStatus;
  deadline: string;
  publishedAt: string | null;
  awardedAt: string | null;
  needId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentNeedListItem {
  id: string;
  title: string;
  priority: NeedPriority;
  status: NeedStatus;
  departmentId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierOffer {
  id: string;
  tenderId: string;
  supplierId: string;
  amount: number;
  proposedDeliveryDays: number;
  comment: string | null;
  status: SupplierOfferStatus;
  submittedAt: string;
  selectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenderDetail extends TenderListItem {
  description: string;
  need: {
    id: string;
    title: string;
    priority: NeedPriority;
    status: NeedStatus;
    departmentId: string;
    createdById: string;
    createdAt: string;
  };
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  offers: Array<
    SupplierOffer & {
      supplier: {
        id: string;
        name: string;
        contactEmail: string | null;
        status: string;
      };
    }
  >;
}

export interface TenderListParams {
  page: number;
  limit: number;
  search?: string;
  status?: TenderStatus;
}

export interface DepartmentNeedListParams {
  page: number;
  limit: number;
  status?: NeedStatus;
}

export interface CreateTenderPayload {
  title: string;
  description: string;
  deadline: string;
  needId: string;
  reference?: string;
}

export interface CreateSupplierOfferPayload {
  tenderId: string;
  supplierId: string;
  amount: number;
  proposedDeliveryDays: number;
  comment?: string;
}

function buildQuery(params: object): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) {
      searchParams.set(key, String(value).trim());
    }
  });

  return searchParams.toString();
}

export function listTenders(
  params: TenderListParams,
  accessToken: string | null,
): Promise<PaginatedResponse<TenderListItem>> {
  return apiClient<PaginatedResponse<TenderListItem>>(`/tenders?${buildQuery(params)}`, {
    accessToken,
  });
}

export function getTender(tenderId: string, accessToken: string | null): Promise<TenderDetail> {
  return apiClient<TenderDetail>(`/tenders/${tenderId}`, { accessToken });
}

export function createTender(
  payload: CreateTenderPayload,
  accessToken: string | null,
): Promise<TenderDetail> {
  return apiClient<TenderDetail>('/tenders', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function publishTender(tenderId: string, accessToken: string | null): Promise<TenderDetail> {
  return apiClient<TenderDetail>(`/tenders/${tenderId}/publish`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}

export function listDepartmentNeeds(
  params: DepartmentNeedListParams,
  accessToken: string | null,
): Promise<PaginatedResponse<DepartmentNeedListItem>> {
  return apiClient<PaginatedResponse<DepartmentNeedListItem>>(
    `/department-needs?${buildQuery(params)}`,
    { accessToken },
  );
}

export function listTenderOffers(
  tenderId: string,
  accessToken: string | null,
): Promise<PaginatedResponse<SupplierOffer>> {
  return apiClient<PaginatedResponse<SupplierOffer>>(`/tenders/${tenderId}/offers?page=1&limit=20`, {
    accessToken,
  });
}

export function createSupplierOffer(
  payload: CreateSupplierOfferPayload,
  accessToken: string | null,
): Promise<SupplierOffer> {
  return apiClient<SupplierOffer>('/supplier-offers', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function selectSupplierOffer(
  supplierOfferId: string,
  accessToken: string | null,
): Promise<SupplierOffer> {
  return apiClient<SupplierOffer>(`/supplier-offers/${supplierOfferId}/select`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
