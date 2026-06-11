import { apiClient } from '../../services/apiClient';

export const supplierStatuses = ['ACTIVE', 'INACTIVE'] as const;

export type SupplierStatus = (typeof supplierStatuses)[number];

export interface Supplier {
  id: string;
  name: string;
  contactEmail: string | null;
  phone: string | null;
  address: string | null;
  status: SupplierStatus;
  createdAt: string;
}

export interface SupplierHistory {
  supplierIdentity: {
    id: string;
    name: string;
    contactEmail: string | null;
    phone: string | null;
    address: string | null;
  };
  supplierStatus: SupplierStatus;
  supplierCreatedAt: string;
  supplierUpdatedAt: string;
  offersCount: number;
  tendersCount: number;
  maintenanceReturnsCount: number;
}

export interface ListSuppliersResponse {
  data: Supplier[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListSuppliersParams {
  page: number;
  limit: number;
  search?: string;
  status?: SupplierStatus;
}

export interface CreateSupplierPayload {
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

function buildQuery(params: ListSuppliersParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const search = params.search?.trim();

  if (search) {
    searchParams.set('search', search);
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  return searchParams.toString();
}

export function listSuppliers(
  params: ListSuppliersParams,
  accessToken: string | null,
): Promise<ListSuppliersResponse> {
  return apiClient<ListSuppliersResponse>(`/suppliers?${buildQuery(params)}`, {
    accessToken,
  });
}

export function getSupplier(
  supplierId: string,
  accessToken: string | null,
): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${supplierId}`, {
    accessToken,
  });
}

export function getSupplierHistory(
  supplierId: string,
  accessToken: string | null,
): Promise<SupplierHistory> {
  return apiClient<SupplierHistory>(`/suppliers/${supplierId}/history`, {
    accessToken,
  });
}

export function createSupplier(
  payload: CreateSupplierPayload,
  accessToken: string | null,
): Promise<Supplier> {
  return apiClient<Supplier>('/suppliers', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deactivateSupplier(
  supplierId: string,
  accessToken: string | null,
): Promise<Supplier> {
  return apiClient<Supplier>(`/suppliers/${supplierId}/deactivate`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
