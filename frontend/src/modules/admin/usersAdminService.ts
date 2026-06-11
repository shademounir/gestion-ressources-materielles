import { apiClient } from '../../services/apiClient';

export const userRoles = ['ADMIN', 'MANAGER', 'USER'] as const;
export const userStatuses = ['ACTIVE', 'INACTIVE'] as const;

export type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
}

export interface ListUsersResponse {
  data: AdminUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

function buildQuery(params: ListUsersParams): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const search = params.search?.trim();

  if (search) {
    searchParams.set('search', search);
  }

  if (params.role) {
    searchParams.set('role', params.role);
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  return searchParams.toString();
}

export function listUsers(
  params: ListUsersParams,
  accessToken: string | null,
): Promise<ListUsersResponse> {
  return apiClient<ListUsersResponse>(`/users?${buildQuery(params)}`, {
    accessToken,
  });
}

export function getUser(userId: string, accessToken: string | null): Promise<AdminUser> {
  return apiClient<AdminUser>(`/users/${userId}`, {
    accessToken,
  });
}

export function createUser(
  payload: CreateUserPayload,
  accessToken: string | null,
): Promise<AdminUser> {
  return apiClient<AdminUser>('/users', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUserRole(
  userId: string,
  role: UserRole,
  accessToken: string | null,
): Promise<AdminUser> {
  return apiClient<AdminUser>(`/users/${userId}/role`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function deactivateUser(
  userId: string,
  accessToken: string | null,
): Promise<AdminUser> {
  return apiClient<AdminUser>(`/users/${userId}/deactivate`, {
    accessToken,
    method: 'PATCH',
    body: JSON.stringify({}),
  });
}
