import { apiClient } from '../../services/apiClient';

export const maintenancePriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const maintenanceSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type MaintenancePriority = (typeof maintenancePriorities)[number];
export type MaintenanceSeverity = (typeof maintenanceSeverities)[number];

export interface CreateMaintenanceTicketPayload {
  resourceId: string;
  description: string;
  priority: MaintenancePriority;
}

export interface MaintenanceTicketResponse {
  id: string;
  resourceId: string;
  reportedById: string;
  description: string;
  priority: MaintenancePriority;
  status: string;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceReportPayload {
  diagnosis: string;
  probableCause: string;
  severity: MaintenanceSeverity;
  recommendations?: string;
}

export interface MaintenanceReportResponse {
  id: string;
  diagnosis: string;
  probableCause: string;
  severity: MaintenanceSeverity;
  recommendations: string | null;
  reportedAt: string;
  maintenanceTicket: {
    id: string;
    status: string;
    priority: MaintenancePriority;
    openedAt: string;
  };
}

export interface CreateMaintenanceInterventionPayload {
  technicianName: string;
  description: string;
  startedAt: string;
  completedAt?: string;
  cost?: number;
  result?: string;
}

export interface MaintenanceInterventionResponse {
  id: string;
  maintenanceTicketId: string;
  technicianName: string;
  description: string;
  startedAt: string;
  completedAt: string | null;
  cost: string | null;
  result: string | null;
  createdAt: string;
  updatedAt: string;
  maintenanceTicket: {
    id: string;
    status: string;
    priority: MaintenancePriority;
    openedAt: string;
  };
}

export interface CreateSupplierReturnPayload {
  supplierId: string;
  reason: string;
  sentAt: string;
  expectedReturnAt?: string;
  comment?: string;
}

export interface SupplierReturnResponse {
  id: string;
  maintenanceTicketId: string;
  resourceId: string;
  supplierId: string;
  reason: string;
  sentAt: string;
  expectedReturnAt: string | null;
  actualReturnAt: string | null;
  status: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export function createMaintenanceTicket(
  payload: CreateMaintenanceTicketPayload,
  accessToken: string | null,
): Promise<MaintenanceTicketResponse> {
  return apiClient<MaintenanceTicketResponse>('/maintenance-tickets', {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createMaintenanceReport(
  ticketId: string,
  payload: CreateMaintenanceReportPayload,
  accessToken: string | null,
): Promise<MaintenanceReportResponse> {
  return apiClient<MaintenanceReportResponse>(`/maintenance-tickets/${ticketId}/report`, {
    accessToken,
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createMaintenanceIntervention(
  ticketId: string,
  payload: CreateMaintenanceInterventionPayload,
  accessToken: string | null,
): Promise<MaintenanceInterventionResponse> {
  return apiClient<MaintenanceInterventionResponse>(
    `/maintenance-tickets/${ticketId}/intervention`,
    {
      accessToken,
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function createSupplierReturn(
  ticketId: string,
  payload: CreateSupplierReturnPayload,
  accessToken: string | null,
): Promise<SupplierReturnResponse> {
  return apiClient<SupplierReturnResponse>(
    `/maintenance-tickets/${ticketId}/supplier-return`,
    {
      accessToken,
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}
