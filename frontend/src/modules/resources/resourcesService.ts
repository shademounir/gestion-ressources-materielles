import { apiClient } from '../../services/apiClient';

export const resourceStatuses = [
  'AVAILABLE',
  'ASSIGNED',
  'UNDER_MAINTENANCE',
  'OUT_OF_SERVICE',
  'ARCHIVED',
] as const;

export type ResourceStatus = (typeof resourceStatuses)[number];

export interface ResourceListItem {
  id: string;
  inventoryCode: string;
  name: string;
  category: string;
  status: ResourceStatus;
  supplierId: string | null;
  createdAt: string;
}

export interface ResourceSupplier {
  id: string;
  name: string;
  contactEmail: string | null;
  phone: string | null;
  status: string;
}

export interface ResourceDetail extends ResourceListItem {
  description: string | null;
  serialNumber: string | null;
  acquisitionDate: string | null;
  acquisitionValue: string | null;
  supplier: ResourceSupplier | null;
  updatedAt: string;
}

export interface ResourceListResponse {
  data: ResourceListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListResourcesParams {
  page: number;
  limit: number;
  search?: string;
  status?: ResourceStatus;
  category?: string;
}

export interface CreateResourcePayload {
  name: string;
  inventoryCode: string;
  category: string;
  description?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  acquisitionValue?: number;
  supplierId?: string;
}

function buildQuery(params: ListResourcesParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    createdAtSort: 'desc',
  });
  const search = params.search?.trim();
  const category = params.category?.trim();

  if (search) {
    if (search.toUpperCase().startsWith('INV')) {
      searchParams.set('inventoryCode', search);
    } else {
      searchParams.set('name', search);
    }
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (category) {
    searchParams.set('category', category);
  }

  return searchParams.toString();
}

export function listResources(
  params: ListResourcesParams,
  accessToken: string | null,
): Promise<ResourceListResponse> {
  return apiClient<ResourceListResponse>(`/resources?${buildQuery(params)}`, {
    accessToken,
  });
}

export function getResource(
  resourceId: string,
  accessToken: string | null,
): Promise<ResourceDetail> {
  return apiClient<ResourceDetail>(`/resources/${resourceId}`, {
    accessToken,
  });
}

export function createResource(
  payload: CreateResourcePayload,
  accessToken: string | null,
): Promise<ResourceDetail> {
  return apiClient<ResourceDetail>('/resources', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateResourceStatus(
  resourceId: string,
  status: ResourceStatus,
  accessToken: string | null,
): Promise<ResourceDetail> {
  return apiClient<ResourceDetail>(`/resources/${resourceId}/status`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
