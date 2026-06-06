import { apiClient } from '../../services/apiClient';
import { type ResourceStatus } from '../resources/resourcesService';

export const assignmentStatuses = ['ACTIVE', 'RETURNED', 'CANCELLED'] as const;

export type AssignmentStatus = (typeof assignmentStatuses)[number];

export interface CreateAssignmentPayload {
  resourceId: string;
  userId: string;
  comment?: string;
}

export interface ReturnAssignmentPayload {
  returnComment?: string;
}

export interface AssignmentResponse {
  id: string;
  resourceId: string;
  userId: string;
  assignedAt: string;
  returnedAt: string | null;
  status: AssignmentStatus;
  comment: string | null;
  returnComment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentHistoryItem extends AssignmentResponse {
  resourceName: string;
  inventoryCode: string;
  userFullName: string;
}

export interface AssignmentHistoryResponse {
  data: AssignmentHistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AssignmentDetail {
  id: string;
  status: AssignmentStatus;
  assignedAt: string;
  returnedAt: string | null;
  comment: string | null;
  returnComment: string | null;
  createdAt: string;
  updatedAt: string;
  resource: {
    id: string;
    inventoryCode: string;
    name: string;
    category: string;
    status: ResourceStatus;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CountResponse {
  count: number;
}

export function getActiveAssignmentCount(
  accessToken: string | null,
): Promise<CountResponse> {
  return apiClient<CountResponse>('/resource-assignments/active-count', {
    accessToken,
  });
}

export function createAssignment(
  payload: CreateAssignmentPayload,
  accessToken: string | null,
): Promise<AssignmentResponse> {
  return apiClient<AssignmentResponse>('/resource-assignments', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function returnAssignment(
  assignmentId: string,
  payload: ReturnAssignmentPayload,
  accessToken: string | null,
): Promise<AssignmentResponse> {
  return apiClient<AssignmentResponse>(`/resource-assignments/${assignmentId}/return`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getAssignment(
  assignmentId: string,
  accessToken: string | null,
): Promise<AssignmentDetail> {
  return apiClient<AssignmentDetail>(`/resource-assignments/${assignmentId}`, {
    accessToken,
  });
}

export function listResourceAssignments(
  resourceId: string,
  page: number,
  limit: number,
  accessToken: string | null,
): Promise<AssignmentHistoryResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiClient<AssignmentHistoryResponse>(
    `/resources/${resourceId}/assignments?${query.toString()}`,
    { accessToken },
  );
}
