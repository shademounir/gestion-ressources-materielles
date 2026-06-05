import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const loginResponse = {
  accessToken: 'valid-access-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: {
    id: 'user-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
};

const resourceListResponse = {
  data: [
    {
      id: 'resource-1',
      inventoryCode: 'INV-INFO-2026-0001',
      name: 'PC Dell Latitude',
      category: 'Informatique',
      status: 'AVAILABLE',
      supplierId: null,
      createdAt: '2026-06-01T10:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const userListResponse = {
  data: [
    {
      id: 'managed-user-1',
      firstName: 'Demo',
      lastName: 'Manager',
      email: 'manager@grm.local',
      role: 'MANAGER',
      isActive: true,
      department: null,
      createdAt: '2026-06-01T10:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const managedUserDetailResponse = {
  ...userListResponse.data[0],
  department: {
    id: 'department-1',
    name: 'Informatique',
  },
};

const createdUserResponse = {
  id: 'managed-user-2',
  firstName: 'Nadia',
  lastName: 'Saidi',
  email: 'nadia.saidi@grm.local',
  role: 'USER',
  isActive: true,
  department: null,
  createdAt: '2026-06-05T09:00:00.000Z',
};

const supplierListResponse = {
  data: [
    {
      id: 'supplier-1',
      name: 'Tech Solutions Maroc',
      contactEmail: 'contact@techsolutions.test',
      phone: '+212 522 000 000',
      address: 'Casablanca, Maroc',
      status: 'ACTIVE',
      createdAt: '2026-06-02T11:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const supplierDetailResponse = supplierListResponse.data[0];

const supplierHistoryResponse = {
  supplierIdentity: {
    id: 'supplier-1',
    name: 'Tech Solutions Maroc',
    contactEmail: 'contact@techsolutions.test',
    phone: '+212 522 000 000',
    address: 'Casablanca, Maroc',
  },
  supplierStatus: 'ACTIVE',
  supplierCreatedAt: '2026-06-02T11:00:00.000Z',
  supplierUpdatedAt: '2026-06-02T11:30:00.000Z',
  offersCount: 0,
  tendersCount: 0,
  maintenanceReturnsCount: 0,
};

const createdSupplierResponse = {
  id: 'supplier-2',
  name: 'Office Market',
  contactEmail: 'office@market.test',
  phone: '+212 522 111 111',
  address: 'Rabat, Maroc',
  status: 'ACTIVE',
  createdAt: '2026-06-05T09:00:00.000Z',
};

const departmentNeedListResponse = {
  data: [
    {
      id: 'need-1',
      title: 'Equipement salle informatique',
      priority: 'HIGH',
      status: 'SUBMITTED',
      departmentId: 'department-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T10:00:00.000Z',
      updatedAt: '2026-06-02T10:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 50,
    total: 1,
    totalPages: 1,
  },
};

const tenderListResponse = {
  data: [
    {
      id: 'tender-1',
      reference: 'AO-20260602-0001',
      title: 'Appel offres salle informatique',
      status: 'DRAFT',
      deadline: '2026-07-15T12:00:00.000Z',
      publishedAt: null,
      awardedAt: null,
      needId: 'need-1',
      createdById: 'user-1',
      createdAt: '2026-06-02T12:00:00.000Z',
      updatedAt: '2026-06-02T12:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const tenderDetailResponse = {
  ...tenderListResponse.data[0],
  description: 'Acquisition de postes informatiques pour la salle A12.',
  need: {
    id: 'need-1',
    title: 'Equipement salle informatique',
    priority: 'HIGH',
    status: 'SUBMITTED',
    departmentId: 'department-1',
    createdById: 'user-1',
    createdAt: '2026-06-02T10:00:00.000Z',
  },
  createdBy: {
    id: 'user-1',
    firstName: 'Demo',
    lastName: 'Manager',
    email: 'manager@grm.local',
  },
  offers: [],
};

const supplierOfferListResponse = {
  data: [
    {
      id: 'offer-1',
      tenderId: 'tender-1',
      supplierId: 'supplier-1',
      amount: 125000,
      proposedDeliveryDays: 30,
      comment: 'Livraison possible en deux lots.',
      status: 'SUBMITTED',
      submittedAt: '2026-06-02T14:00:00.000Z',
      selectedAt: null,
      createdAt: '2026-06-02T14:00:00.000Z',
      updatedAt: '2026-06-02T14:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  },
};

const createdTenderResponse = {
  ...tenderDetailResponse,
  id: 'tender-2',
  reference: 'AO-20260605-0002',
  title: 'Nouveau lot informatique',
};

const publishedTenderResponse = {
  ...tenderDetailResponse,
  status: 'PUBLISHED',
  publishedAt: '2026-06-02T13:00:00.000Z',
};

const selectedSupplierOfferResponse = {
  ...supplierOfferListResponse.data[0],
  status: 'SELECTED',
  selectedAt: '2026-06-02T15:00:00.000Z',
};

const emptyResourceListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  },
};

const resourceDetailResponse = {
  id: 'resource-1',
  inventoryCode: 'INV-INFO-2026-0001',
  name: 'PC Dell Latitude',
  category: 'Informatique',
  status: 'AVAILABLE',
  supplierId: null,
  description: 'Poste informatique de salle',
  serialNumber: 'SN-001',
  acquisitionDate: '2026-06-01T00:00:00.000Z',
  acquisitionValue: '12500',
  supplier: null,
  createdAt: '2026-06-01T10:00:00.000Z',
  updatedAt: '2026-06-01T10:00:00.000Z',
};

const createdResourceResponse = {
  ...resourceDetailResponse,
  id: 'resource-2',
  inventoryCode: 'INV-INFO-2026-0002',
  name: 'Ecran Dell',
  serialNumber: null,
  acquisitionDate: null,
  acquisitionValue: null,
};

const assignmentHistoryResponse = {
  data: [
    {
      id: 'assignment-1',
      resourceId: 'resource-1',
      userId: 'assigned-user-1',
      resourceName: 'PC Dell Latitude',
      inventoryCode: 'INV-INFO-2026-0001',
      userFullName: 'Demo Manager',
      status: 'ACTIVE',
      assignedAt: '2026-06-03T09:00:00.000Z',
      returnedAt: null,
      comment: 'Affectation laboratoire',
      returnComment: null,
      createdAt: '2026-06-03T09:00:00.000Z',
      updatedAt: '2026-06-03T09:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const assignmentDetailResponse = {
  id: 'assignment-1',
  status: 'ACTIVE',
  assignedAt: '2026-06-03T09:00:00.000Z',
  returnedAt: null,
  comment: 'Affectation laboratoire',
  returnComment: null,
  createdAt: '2026-06-03T09:00:00.000Z',
  updatedAt: '2026-06-03T09:00:00.000Z',
  resource: {
    id: 'resource-1',
    inventoryCode: 'INV-INFO-2026-0001',
    name: 'PC Dell Latitude',
    category: 'Informatique',
    status: 'ASSIGNED',
  },
  user: {
    id: 'assigned-user-1',
    firstName: 'Demo',
    lastName: 'Manager',
    email: 'manager@grm.local',
  },
};

const createdAssignmentResponse = {
  id: 'assignment-2',
  resourceId: 'resource-1',
  userId: 'assigned-user-2',
  assignedAt: '2026-06-04T09:00:00.000Z',
  returnedAt: null,
  status: 'ACTIVE',
  comment: 'Nouvelle affectation',
  returnComment: null,
  createdAt: '2026-06-04T09:00:00.000Z',
  updatedAt: '2026-06-04T09:00:00.000Z',
};

const createdAssignmentDetailResponse = {
  ...assignmentDetailResponse,
  id: 'assignment-2',
  comment: 'Nouvelle affectation',
  user: {
    id: 'assigned-user-2',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@grm.local',
  },
};

const createdMaintenanceTicketResponse = {
  id: 'ticket-1',
  resourceId: 'resource-1',
  reportedById: 'user-1',
  description: 'Ecran noir au demarrage',
  priority: 'HIGH',
  status: 'OPEN',
  openedAt: '2026-06-03T09:00:00.000Z',
  closedAt: null,
  createdAt: '2026-06-03T09:00:00.000Z',
  updatedAt: '2026-06-03T09:00:00.000Z',
};

const createdMaintenanceReportResponse = {
  id: 'report-1',
  diagnosis: 'Carte mere defectueuse',
  probableCause: 'Surtension probable',
  severity: 'HIGH',
  recommendations: 'Remplacer la carte mere',
  reportedAt: '2026-06-03T10:00:00.000Z',
  maintenanceTicket: {
    id: 'ticket-1',
    status: 'OPEN',
    priority: 'HIGH',
    openedAt: '2026-06-03T09:00:00.000Z',
  },
};

const createdMaintenanceInterventionResponse = {
  id: 'intervention-1',
  maintenanceTicketId: 'ticket-1',
  technicianName: 'Technicien Demo',
  description: 'Remplacement alimentation',
  startedAt: '2026-06-03T11:00:00.000Z',
  completedAt: null,
  cost: '450',
  result: 'Test OK',
  createdAt: '2026-06-03T11:00:00.000Z',
  updatedAt: '2026-06-03T11:00:00.000Z',
  maintenanceTicket: {
    id: 'ticket-1',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    openedAt: '2026-06-03T09:00:00.000Z',
  },
};

const createdSupplierReturnResponse = {
  id: 'supplier-return-1',
  maintenanceTicketId: 'ticket-1',
  resourceId: 'resource-1',
  supplierId: 'supplier-1',
  reason: 'Panne sous garantie',
  sentAt: '2026-06-03T12:00:00.000Z',
  expectedReturnAt: null,
  actualReturnAt: null,
  status: 'SENT_TO_SUPPLIER',
  comment: 'Bon de prise en charge joint',
  createdAt: '2026-06-03T12:00:00.000Z',
  updatedAt: '2026-06-03T12:00:00.000Z',
};

const notificationListResponse = {
  data: [
    {
      id: 'notification-1',
      recipientId: 'user-1',
      type: 'RESOURCE_ASSIGNED',
      title: 'Ressource affectee',
      message: 'Une ressource materielle a ete affectee a un utilisateur.',
      entityType: 'RESOURCE_ASSIGNMENT',
      entityId: 'assignment-1',
      readAt: null,
      createdAt: '2026-06-04T09:00:00.000Z',
      updatedAt: '2026-06-04T09:00:00.000Z',
    },
  ],
  meta: {
    page: 1,
    limit: 8,
    total: 1,
    totalPages: 1,
  },
};

const readNotificationResponse = {
  ...notificationListResponse.data[0],
  readAt: '2026-06-04T09:20:00.000Z',
  updatedAt: '2026-06-04T09:20:00.000Z',
};

const emptyNotificationListResponse = {
  data: [],
  meta: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 0,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Login page', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    window.history.pushState({}, '', '/login');
    window.sessionStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the login form', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /maroc ynov campus/i })).toBeInTheDocument();
  });

  it('validates credentials before calling the API', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/adresse email valide/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in and redirects to the dashboard', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByRole('heading', { name: /pilotage des ressources materielles/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /navigation principale/i })).toBeInTheDocument();
    expect(screen.getByText(/ressources totales/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'SecurePassword123!',
        }),
      }),
    );
  });

  it('loads dashboard KPI from available APIs with clean fallbacks', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.includes('/resources?') && url.includes('status=AVAILABLE')) {
        return Promise.resolve(
          jsonResponse({
            data: [],
            meta: {
              page: 1,
              limit: 1,
              total: 3,
              totalPages: 3,
            },
          }),
        );
      }

      if (url.includes('/resources?')) {
        return Promise.resolve(
          jsonResponse({
            data: [],
            meta: {
              page: 1,
              limit: 1,
              total: 9,
              totalPages: 9,
            },
          }),
        );
      }

      if (url.endsWith('/notifications/unread-count')) {
        return Promise.resolve(jsonResponse({ unreadCount: 2 }));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(
      await screen.findByRole('heading', { name: /pilotage des ressources materielles/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Donnees API')).toBeInTheDocument();

    const kpis = screen.getByLabelText(/indicateurs principaux/i);

    expect(within(kpis).getByText('Ressources totales')).toBeInTheDocument();
    expect(within(kpis).getByText('9')).toBeInTheDocument();
    expect(within(kpis).getByText('Ressources disponibles')).toBeInTheDocument();
    expect(within(kpis).getByText('3')).toBeInTheDocument();
    expect(within(kpis).getByText('Notifications non lues')).toBeInTheDocument();
    expect(within(kpis).getByText('2')).toBeInTheDocument();
    expect(within(kpis).getAllByText('A connecter')).toHaveLength(2);
  });

  it('keeps the authenticated session after application remount', async () => {
    window.history.pushState({}, '', '/dashboard');
    window.sessionStorage.setItem(
      'grm.auth.session',
      JSON.stringify({
        accessToken: loginResponse.accessToken,
        expiresAt: Date.now() + loginResponse.expiresIn * 1000,
        user: loginResponse.user,
      }),
    );

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /pilotage des ressources materielles/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/notifications/unread-count',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-access-token',
        }) as HeadersInit,
      }),
    );
  });

  it('clears an expired authenticated session before rendering protected pages', async () => {
    window.history.pushState({}, '', '/dashboard');
    window.sessionStorage.setItem(
      'grm.auth.session',
      JSON.stringify({
        accessToken: loginResponse.accessToken,
        expiresAt: Date.now() - 1_000,
        user: loginResponse.user,
      }),
    );

    render(<App />);

    expect(await screen.findByRole('heading', { name: /connexion/i })).toBeInTheDocument();
    expect(window.sessionStorage.getItem('grm.auth.session')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a clear error when credentials are rejected', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/identifiants invalides/i);
  });

  it('logs out from the authenticated layout', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('button', { name: /deconnexion/i }));

    expect(await screen.findByRole('heading', { name: /connexion/i })).toBeInTheDocument();
  });

  it('manages resources from the authenticated UI', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.includes('/resources?')) {
        return Promise.resolve(jsonResponse(resourceListResponse));
      }

      if (url.endsWith('/resources/resource-1/status') && method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({
            ...resourceDetailResponse,
            status: 'OUT_OF_SERVICE',
          }),
        );
      }

      if (url.endsWith('/resources/resource-1')) {
        return Promise.resolve(jsonResponse(resourceDetailResponse));
      }

      if (url.endsWith('/resources/resource-2')) {
        return Promise.resolve(jsonResponse(createdResourceResponse));
      }

      if (url.endsWith('/resources') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdResourceResponse, 201));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /ressources/i }));

    expect(await screen.findByRole('heading', { name: /ressources materielles/i })).toBeInTheDocument();
    expect(await screen.findByText('INV-INFO-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('PC Dell Latitude')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /inv-info-2026-0001/i }));

    expect(await screen.findByText('Poste informatique de salle')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/modifier le statut/i), 'OUT_OF_SERVICE');
    await user.click(screen.getByRole('button', { name: /mettre a jour/i }));

    expect(await screen.findByText(/statut de la ressource mis a jour/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources/resource-1/status',
      expect.objectContaining({
        body: JSON.stringify({ status: 'OUT_OF_SERVICE' }),
        method: 'PATCH',
      }),
    );

    const createRegion = screen.getByRole('region', { name: /nouvelle ressource/i });

    await user.type(within(createRegion).getByLabelText(/^nom$/i), 'Ecran Dell');
    await user.type(
      within(createRegion).getByLabelText(/reference inventaire/i),
      'INV-INFO-2026-0002',
    );
    await user.type(within(createRegion).getByLabelText(/^categorie$/i), 'Informatique');
    await user.click(within(createRegion).getByRole('button', { name: /creer la ressource/i }));

    expect(await screen.findByText(/ressource creee avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Ecran Dell',
          inventoryCode: 'INV-INFO-2026-0002',
          category: 'Informatique',
        }),
        method: 'POST',
      }),
    );
  });

  it('loads an empty resources inventory without showing an error', async () => {
    window.history.pushState({}, '', '/resources');
    window.sessionStorage.setItem(
      'grm.auth.session',
      JSON.stringify({
        accessToken: loginResponse.accessToken,
        expiresAt: Date.now() + loginResponse.expiresIn * 1000,
        user: loginResponse.user,
      }),
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(emptyResourceListResponse));

    render(<App />);

    expect(await screen.findByRole('heading', { name: /ressources materielles/i })).toBeInTheDocument();
    expect(await screen.findByText(/aucune ressource trouvee/i)).toBeInTheDocument();
    expect(screen.queryByText(/impossible de charger l'inventaire/i)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources?page=1&limit=8&createdAtSort=desc',
      expect.any(Object),
    );
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers).toMatchObject({
      Authorization: 'Bearer valid-access-token',
    });
  });

  it('validates a short inventory code before creating a resource', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/resources');
    window.sessionStorage.setItem(
      'grm.auth.session',
      JSON.stringify({
        accessToken: loginResponse.accessToken,
        expiresAt: Date.now() + loginResponse.expiresIn * 1000,
        user: loginResponse.user,
      }),
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(emptyResourceListResponse));

    render(<App />);

    const createRegion = await screen.findByRole('region', { name: /nouvelle ressource/i });

    await user.type(within(createRegion).getByLabelText(/^nom$/i), 'Ecran Dell 24 pouces');
    await user.type(within(createRegion).getByLabelText(/reference inventaire/i), 'A');
    await user.type(within(createRegion).getByLabelText(/^categorie$/i), 'Informatique');
    await user.click(within(createRegion).getByRole('button', { name: /creer la ressource/i }));

    expect(
      await screen.findByText(/la reference inventaire doit contenir au moins 2 caracteres/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('shows API validation messages when resource creation is rejected', async () => {
    const user = userEvent.setup();
    window.history.pushState({}, '', '/resources');
    window.sessionStorage.setItem(
      'grm.auth.session',
      JSON.stringify({
        accessToken: loginResponse.accessToken,
        expiresAt: Date.now() + loginResponse.expiresIn * 1000,
        user: loginResponse.user,
      }),
    );
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.includes('/resources?')) {
        return Promise.resolve(jsonResponse(emptyResourceListResponse));
      }

      if (url.endsWith('/resources') && method === 'POST') {
        return Promise.resolve(
          jsonResponse(
            {
              message: ['Une ressource avec cette reference inventaire existe deja.'],
            },
            409,
          ),
        );
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    const createRegion = await screen.findByRole('region', { name: /nouvelle ressource/i });

    await user.type(within(createRegion).getByLabelText(/^nom$/i), '  Ecran Dell 24 pouces  ');
    await user.type(
      within(createRegion).getByLabelText(/reference inventaire/i),
      '  INV-SCREEN-2026-0001  ',
    );
    await user.type(within(createRegion).getByLabelText(/^categorie$/i), '  Informatique  ');
    await user.click(within(createRegion).getByRole('button', { name: /creer la ressource/i }));

    expect(
      await screen.findByText(/une ressource avec cette reference inventaire existe deja/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resources',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Ecran Dell 24 pouces',
          inventoryCode: 'INV-SCREEN-2026-0001',
          category: 'Informatique',
        }),
        method: 'POST',
      }),
    );
  });

  it('manages resource assignments from the authenticated UI', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.includes('/resources?')) {
        return Promise.resolve(jsonResponse(resourceListResponse));
      }

      if (url.includes('/resources/resource-1/assignments?')) {
        return Promise.resolve(jsonResponse(assignmentHistoryResponse));
      }

      if (url.endsWith('/resource-assignments/assignment-1/return') && method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({
            ...assignmentHistoryResponse.data[0],
            status: 'RETURNED',
            returnedAt: '2026-06-04T10:00:00.000Z',
            returnComment: 'Retour OK',
          }),
        );
      }

      if (url.endsWith('/resource-assignments/assignment-1')) {
        return Promise.resolve(jsonResponse(assignmentDetailResponse));
      }

      if (url.endsWith('/resource-assignments/assignment-2')) {
        return Promise.resolve(jsonResponse(createdAssignmentDetailResponse));
      }

      if (url.endsWith('/resource-assignments') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdAssignmentResponse, 201));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /affectations/i }));

    expect(await screen.findByRole('heading', { name: /gestion des affectations/i })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/^ressource$/i), 'resource-1');

    expect(await screen.findByText('Demo Manager')).toBeInTheDocument();
    expect(screen.getByText('Affectation laboratoire')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /inv-info-2026-0001/i }));

    expect(await screen.findByText('manager@grm.local')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/^commentaire retour$/i), 'Retour OK');
    await user.click(screen.getByRole('button', { name: /retourner la ressource/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(await screen.findByText(/ressource retournee avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resource-assignments/assignment-1/return',
      expect.objectContaining({
        body: JSON.stringify({ returnComment: 'Retour OK' }),
        method: 'PATCH',
      }),
    );

    await user.type(screen.getByLabelText(/utilisateur id/i), 'assigned-user-2');
    await user.type(screen.getByLabelText(/^commentaire$/i), 'Nouvelle affectation');
    await user.click(screen.getByRole('button', { name: /affecter la ressource/i }));

    expect(await screen.findByText(/affectation creee avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/resource-assignments',
      expect.objectContaining({
        body: JSON.stringify({
          resourceId: 'resource-1',
          userId: 'assigned-user-2',
          comment: 'Nouvelle affectation',
        }),
        method: 'POST',
      }),
    );

    confirmSpy.mockRestore();
  });

  it('manages maintenance actions from the authenticated UI', async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.includes('/resources?')) {
        return Promise.resolve(jsonResponse(resourceListResponse));
      }

      if (url.endsWith('/maintenance-tickets') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdMaintenanceTicketResponse, 201));
      }

      if (url.endsWith('/maintenance-tickets/ticket-1/report') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdMaintenanceReportResponse, 201));
      }

      if (url.endsWith('/maintenance-tickets/ticket-1/intervention') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdMaintenanceInterventionResponse, 201));
      }

      if (url.endsWith('/maintenance-tickets/ticket-1/supplier-return') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdSupplierReturnResponse, 201));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /maintenance/i }));

    expect(await screen.findByRole('heading', { name: /gestion de la maintenance/i })).toBeInTheDocument();
    expect(screen.getByText(/aucun endpoint de liste ou detail maintenance/i)).toBeInTheDocument();

    const ticketRegion = screen.getByRole('region', { name: /signaler une panne/i });
    await user.selectOptions(within(ticketRegion).getByLabelText(/^ressource$/i), 'resource-1');
    await user.selectOptions(within(ticketRegion).getByLabelText(/priorite/i), 'HIGH');
    await user.type(
      within(ticketRegion).getByLabelText(/description panne/i),
      'Ecran noir au demarrage',
    );
    await user.click(within(ticketRegion).getByRole('button', { name: /signaler la panne/i }));

    expect(await screen.findByText(/ticket de maintenance cree/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/maintenance-tickets',
      expect.objectContaining({
        body: JSON.stringify({
          resourceId: 'resource-1',
          description: 'Ecran noir au demarrage',
          priority: 'HIGH',
        }),
        method: 'POST',
      }),
    );

    const reportRegion = screen.getByRole('region', { name: /rediger un constat/i });
    await user.type(within(reportRegion).getByLabelText(/diagnostic/i), 'Carte mere defectueuse');
    await user.type(within(reportRegion).getByLabelText(/cause probable/i), 'Surtension probable');
    await user.selectOptions(within(reportRegion).getByLabelText(/gravite/i), 'HIGH');
    await user.type(
      within(reportRegion).getByLabelText(/recommandations/i),
      'Remplacer la carte mere',
    );
    await user.click(within(reportRegion).getByRole('button', { name: /creer le constat/i }));

    expect(await screen.findByText(/constat cree pour le ticket ticket-1/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/maintenance-tickets/ticket-1/report',
      expect.objectContaining({
        body: JSON.stringify({
          diagnosis: 'Carte mere defectueuse',
          probableCause: 'Surtension probable',
          severity: 'HIGH',
          recommendations: 'Remplacer la carte mere',
        }),
        method: 'POST',
      }),
    );

    const interventionRegion = screen.getByRole('region', {
      name: /suivre une intervention/i,
    });
    await user.type(within(interventionRegion).getByLabelText(/technicien/i), 'Technicien Demo');
    await user.type(
      within(interventionRegion).getByLabelText(/description intervention/i),
      'Remplacement alimentation',
    );
    await user.type(within(interventionRegion).getByLabelText(/date debut/i), '2026-06-03T11:00');
    await user.type(within(interventionRegion).getByLabelText(/cout/i), '450');
    await user.type(within(interventionRegion).getByLabelText(/resultat/i), 'Test OK');
    await user.click(
      within(interventionRegion).getByRole('button', { name: /enregistrer intervention/i }),
    );

    expect(await screen.findByText(/intervention creee/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/maintenance-tickets/ticket-1/intervention',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    const supplierReturnRegion = screen.getByRole('region', { name: /retour fournisseur/i });
    await user.type(within(supplierReturnRegion).getByLabelText(/supplier id/i), 'supplier-1');
    await user.type(within(supplierReturnRegion).getByLabelText(/motif/i), 'Panne sous garantie');
    await user.type(
      within(supplierReturnRegion).getByLabelText(/date envoi/i),
      '2026-06-03T12:00',
    );
    await user.type(
      within(supplierReturnRegion).getByLabelText(/commentaire/i),
      'Bon de prise en charge joint',
    );
    await user.click(
      within(supplierReturnRegion).getByRole('button', {
        name: /declarer retour fournisseur/i,
      }),
    );

    expect(await screen.findByText(/retour fournisseur cree/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/maintenance-tickets/ticket-1/supplier-return',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  }, 10_000);

  it('shows notifications and marks one as read from the authenticated UI', async () => {
    const user = userEvent.setup();
    let notificationRead = false;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.endsWith('/notifications/unread-count')) {
        return Promise.resolve(jsonResponse({ unreadCount: notificationRead ? 0 : 1 }));
      }

      if (url.includes('/notifications?')) {
        return Promise.resolve(
          jsonResponse(notificationRead ? emptyNotificationListResponse : notificationListResponse),
        );
      }

      if (url.endsWith('/notifications/notification-1/read') && method === 'PATCH') {
        notificationRead = true;
        return Promise.resolve(jsonResponse(readNotificationResponse));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /notifications/i }));

    expect(await screen.findByRole('heading', { name: /centre de notifications/i })).toBeInTheDocument();
    expect(await screen.findByText('Ressource affectee')).toBeInTheDocument();
    expect(screen.getByText(/une ressource materielle a ete affectee/i)).toBeInTheDocument();
    expect(screen.getByText(/1 non lues/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /marquer comme lue/i }));

    expect(await screen.findByText(/notification marquee comme lue/i)).toBeInTheDocument();
    expect(await screen.findByText(/^Aucune notification$/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/notifications/notification-1/read',
      expect.objectContaining({
        method: 'PATCH',
      }),
    );
  });

  it('manages suppliers from the authenticated UI', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.endsWith('/notifications/unread-count')) {
        return Promise.resolve(jsonResponse({ unreadCount: 0 }));
      }

      if (url.includes('/suppliers?')) {
        return Promise.resolve(jsonResponse(supplierListResponse));
      }

      if (url.endsWith('/suppliers/supplier-1/history')) {
        return Promise.resolve(jsonResponse(supplierHistoryResponse));
      }

      if (url.endsWith('/suppliers/supplier-2/history')) {
        return Promise.resolve(
          jsonResponse({
            ...supplierHistoryResponse,
            supplierIdentity: {
              id: 'supplier-2',
              name: 'Office Market',
              contactEmail: 'office@market.test',
              phone: '+212 522 111 111',
              address: 'Rabat, Maroc',
            },
          }),
        );
      }

      if (url.endsWith('/suppliers/supplier-1/deactivate') && method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({
            ...supplierDetailResponse,
            status: 'INACTIVE',
          }),
        );
      }

      if (url.endsWith('/suppliers/supplier-1')) {
        return Promise.resolve(jsonResponse(supplierDetailResponse));
      }

      if (url.endsWith('/suppliers/supplier-2')) {
        return Promise.resolve(jsonResponse(createdSupplierResponse));
      }

      if (url.endsWith('/suppliers') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdSupplierResponse, 201));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /fournisseurs/i }));

    expect(await screen.findByRole('heading', { name: /^fournisseurs$/i })).toBeInTheDocument();
    expect(await screen.findByText('Tech Solutions Maroc')).toBeInTheDocument();
    expect(screen.getByText('contact@techsolutions.test')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /tech solutions maroc/i }));

    expect(await screen.findByText('Casablanca, Maroc')).toBeInTheDocument();
    expect(screen.getByText(/offres disponibles/i)).toBeInTheDocument();

    const createRegion = screen.getByRole('region', { name: /nouveau fournisseur/i });
    await user.type(within(createRegion).getByLabelText(/nom fournisseur/i), 'Office Market');
    await user.type(within(createRegion).getByLabelText(/email contact/i), ' OFFICE@Market.Test ');
    await user.type(within(createRegion).getByLabelText(/telephone/i), '+212 522 111 111');
    await user.type(within(createRegion).getByLabelText(/adresse/i), 'Rabat, Maroc');
    await user.click(within(createRegion).getByRole('button', { name: /creer fournisseur/i }));

    expect(await screen.findByText(/fournisseur cree avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/suppliers',
      expect.objectContaining({
        body: JSON.stringify({
          name: 'Office Market',
          contactEmail: 'office@market.test',
          phone: '+212 522 111 111',
          address: 'Rabat, Maroc',
        }),
        method: 'POST',
      }),
    );

    await user.click(screen.getByRole('button', { name: /^desactiver$/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(await screen.findByText(/fournisseur desactive/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/suppliers/supplier-1/deactivate',
      expect.objectContaining({
        method: 'PATCH',
      }),
    );

    confirmSpy.mockRestore();
  });

  it('manages tenders and supplier offers from the authenticated UI', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    let tenderPublished = false;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.endsWith('/notifications/unread-count')) {
        return Promise.resolve(jsonResponse({ unreadCount: 0 }));
      }

      if (url.includes('/department-needs?')) {
        return Promise.resolve(jsonResponse(departmentNeedListResponse));
      }

      if (url.includes('/suppliers?')) {
        return Promise.resolve(jsonResponse(supplierListResponse));
      }

      if (url.includes('/tenders?')) {
        return Promise.resolve(jsonResponse(tenderListResponse));
      }

      if (url.endsWith('/tenders/tender-1/offers?page=1&limit=20')) {
        return Promise.resolve(jsonResponse(supplierOfferListResponse));
      }

      if (url.endsWith('/tenders/tender-1/publish') && method === 'PATCH') {
        tenderPublished = true;
        return Promise.resolve(jsonResponse(publishedTenderResponse));
      }

      if (url.endsWith('/supplier-offers/offer-1/select') && method === 'PATCH') {
        return Promise.resolve(jsonResponse(selectedSupplierOfferResponse));
      }

      if (url.endsWith('/supplier-offers') && method === 'POST') {
        return Promise.resolve(
          jsonResponse(
            {
              ...supplierOfferListResponse.data[0],
              id: 'offer-2',
              amount: 99000,
              proposedDeliveryDays: 20,
            },
            201,
          ),
        );
      }

      if (url.endsWith('/tenders') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdTenderResponse, 201));
      }

      if (url.endsWith('/tenders/tender-2')) {
        return Promise.resolve(jsonResponse(createdTenderResponse));
      }

      if (url.endsWith('/tenders/tender-2/offers?page=1&limit=20')) {
        return Promise.resolve(jsonResponse({ ...supplierOfferListResponse, data: [] }));
      }

      if (url.endsWith('/tenders/tender-1')) {
        return Promise.resolve(jsonResponse(tenderPublished ? publishedTenderResponse : tenderDetailResponse));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /appels d'offres/i }));

    expect(await screen.findByRole('heading', { name: /^appels d'offres$/i })).toBeInTheDocument();
    expect(await screen.findByText('AO-20260602-0001')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /ao-20260602-0001/i }));

    expect(await screen.findByText('Acquisition de postes informatiques pour la salle A12.')).toBeInTheDocument();
    expect(await screen.findByText('Livraison possible en deux lots.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^publier$/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(
      await screen.findByText(
        (_content, element) =>
          element?.getAttribute('role') === 'status' &&
          /appel d'offres publie/i.test(element.textContent ?? ''),
      ),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/tenders/tender-1/publish',
      expect.objectContaining({ method: 'PATCH' }),
    );

    const createTenderRegion = screen.getByRole('region', { name: /nouvel appel d'offres/i });
    await user.selectOptions(
      within(createTenderRegion).getByLabelText(/besoin departemental/i),
      'need-1',
    );
    await user.type(within(createTenderRegion).getByLabelText(/^titre$/i), 'Nouveau lot informatique');
    await user.type(
      within(createTenderRegion).getByLabelText(/^description$/i),
      'Acquisition complementaire pour salles pedagogiques',
    );
    await user.type(within(createTenderRegion).getByLabelText(/deadline/i), '2026-07-20T12:00');
    await user.click(within(createTenderRegion).getByRole('button', { name: /creer l'appel/i }));

    expect(await screen.findByText(/appel d'offres cree avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/tenders',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    window.history.pushState({}, '', '/tenders/tender-1');
    await user.click(screen.getByRole('link', { name: /ao-20260602-0001/i }));

    const createOfferRegion = screen.getByRole('region', { name: /nouvelle offre fournisseur/i });
    await user.selectOptions(within(createOfferRegion).getByLabelText(/^fournisseur$/i), 'supplier-1');
    await user.type(within(createOfferRegion).getByLabelText(/^montant$/i), '99000');
    await user.type(within(createOfferRegion).getByLabelText(/delai livraison/i), '20');
    await user.click(within(createOfferRegion).getByRole('button', { name: /enregistrer l'offre/i }));

    expect(await screen.findByText(/offre fournisseur enregistree/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/supplier-offers',
      expect.objectContaining({
        body: JSON.stringify({
          tenderId: 'tender-1',
          supplierId: 'supplier-1',
          amount: 99000,
          proposedDeliveryDays: 20,
        }),
        method: 'POST',
      }),
    );

    await user.click(screen.getByRole('button', { name: /selectionner/i }));

    expect(await screen.findByText(/offre gagnante selectionnee/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/supplier-offers/offer-1/select',
      expect.objectContaining({ method: 'PATCH' }),
    );

    confirmSpy.mockRestore();
  }, 12_000);

  it('manages users from the admin UI', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' || input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? 'GET';

      if (url.endsWith('/auth/login')) {
        return Promise.resolve(jsonResponse(loginResponse));
      }

      if (url.endsWith('/notifications/unread-count')) {
        return Promise.resolve(jsonResponse({ unreadCount: 0 }));
      }

      if (url.includes('/users?')) {
        return Promise.resolve(jsonResponse(userListResponse));
      }

      if (url.endsWith('/users/managed-user-1/role') && method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({
            ...userListResponse.data[0],
            role: 'USER',
          }),
        );
      }

      if (url.endsWith('/users/managed-user-1/deactivate') && method === 'PATCH') {
        return Promise.resolve(
          jsonResponse({
            ...userListResponse.data[0],
            isActive: false,
          }),
        );
      }

      if (url.endsWith('/users/managed-user-1')) {
        return Promise.resolve(jsonResponse(managedUserDetailResponse));
      }

      if (url.endsWith('/users') && method === 'POST') {
        return Promise.resolve(jsonResponse(createdUserResponse, 201));
      }

      return Promise.resolve(new Response(null, { status: 404 }));
    });

    render(<App />);

    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/mot de passe/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /se connecter/i }));
    await screen.findByRole('heading', { name: /pilotage des ressources materielles/i });

    await user.click(screen.getByRole('link', { name: /administration/i }));

    expect(await screen.findByRole('heading', { name: /^utilisateurs$/i })).toBeInTheDocument();
    expect(await screen.findByText('manager@grm.local')).toBeInTheDocument();
    expect(screen.getByText(/1 utilisateur/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /demo manager/i }));

    expect(await screen.findByText('Informatique')).toBeInTheDocument();

    const createRegion = screen.getByRole('region', { name: /nouvel utilisateur/i });
    await user.type(within(createRegion).getByLabelText(/prenom/i), 'Nadia');
    await user.type(within(createRegion).getByLabelText(/^nom$/i), 'Saidi');
    await user.type(within(createRegion).getByLabelText(/^email$/i), 'Nadia.Saidi@GRM.local');
    await user.type(
      within(createRegion).getByLabelText(/mot de passe initial/i),
      'ChangeMe123!',
    );
    await user.selectOptions(within(createRegion).getByLabelText(/role initial/i), 'USER');
    await user.click(within(createRegion).getByRole('button', { name: /creer utilisateur/i }));

    expect(await screen.findByText(/utilisateur cree avec succes/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/users',
      expect.objectContaining({
        body: JSON.stringify({
          firstName: 'Nadia',
          lastName: 'Saidi',
          email: 'nadia.saidi@grm.local',
          password: 'ChangeMe123!',
          role: 'USER',
          isActive: true,
        }),
        method: 'POST',
      }),
    );

    await user.selectOptions(screen.getByLabelText(/role de manager@grm.local/i), 'USER');
    await user.click(screen.getByRole('button', { name: /appliquer/i }));

    expect(await screen.findByText(/role utilisateur mis a jour/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/users/managed-user-1/role',
      expect.objectContaining({
        body: JSON.stringify({ role: 'USER' }),
        method: 'PATCH',
      }),
    );

    await user.click(screen.getByRole('button', { name: /desactiver/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(await screen.findByText(/utilisateur desactive/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/users/managed-user-1/deactivate',
      expect.objectContaining({
        method: 'PATCH',
      }),
    );

    confirmSpy.mockRestore();
  });
});
