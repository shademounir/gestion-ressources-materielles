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
});
