import { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUser,
  deactivateUser,
  getUser,
  listUsers,
  updateUserRole,
  userRoles,
  type AdminUser,
  type CreateUserPayload,
  type ListUsersResponse,
  type UserRole,
  type UserStatus,
} from '../modules/admin/usersAdminService';
import { useAuth } from '../modules/auth/useAuth';
import { getApiErrorMessage } from '../services/apiClient';
import { FeedbackMessage } from '../shared/components/FeedbackMessage';
import { formatDate } from '../shared/utils/formatters';

const USERS_PAGE_SIZE = 8;

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrateur',
  MANAGER: 'Manager',
  USER: 'Utilisateur',
};

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'USER' as UserRole,
  isActive: true,
};

type UserFormState = typeof emptyForm;
type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function getUserStatus(user: AdminUser): UserStatus {
  return user.isActive ? 'ACTIVE' : 'INACTIVE';
}

function normalizeCreateUserPayload(form: UserFormState): CreateUserPayload {
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(),
    password: form.password,
    role: form.role,
    isActive: form.isActive,
  };
}

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<ListUsersResponse['meta']>({
    page: 1,
    limit: USERS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [roleChanges, setRoleChanges] = useState<Record<string, UserRole>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const userCountLabel = useMemo(
    () => `${meta.total} utilisateur${meta.total > 1 ? 's' : ''}`,
    [meta.total],
  );

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listUsers(
        {
          page,
          limit: USERS_PAGE_SIZE,
          search,
          role: roleFilter || undefined,
          status: statusFilter || undefined,
        },
        accessToken,
      );

      setUsers(response.data);
      setMeta(response.meta);
      setRoleChanges(
        response.data.reduce<Record<string, UserRole>>((changes, user) => {
          changes[user.id] = user.role;
          return changes;
        }, {}),
      );
    } catch (error) {
      setUsers([]);
      setMeta({
        page: 1,
        limit: USERS_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      });
      setErrorMessage(getApiErrorMessage(error, 'Impossible de charger les utilisateurs.'));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, page, roleFilter, search, statusFilter]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  function updateFormField(field: keyof UserFormState, value: string | boolean) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleFilterSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    setPage(1);
    void fetchUsers();
  }

  async function handleCreateUser(event: FormSubmitEvent) {
    event.preventDefault();
    const payload = normalizeCreateUserPayload(form);

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
      setErrorMessage('Prenom, nom, email et mot de passe sont obligatoires.');
      return;
    }

    if (payload.password.length < 8) {
      setErrorMessage('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const createdUser = await createUser(payload, accessToken);
      setForm(emptyForm);
      setSelectedUser(createdUser);
      setSuccessMessage('Utilisateur cree avec succes.');
      await fetchUsers();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Creation utilisateur impossible.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectUser(userId: string) {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const detail = await getUser(userId, accessToken);
      setSelectedUser(detail);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Utilisateur introuvable.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRoleUpdate(user: AdminUser) {
    const nextRole = roleChanges[user.id] ?? user.role;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await updateUserRole(user.id, nextRole, accessToken);
      setSelectedUser(updatedUser);
      setSuccessMessage('Role utilisateur mis a jour.');
      await fetchUsers();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Modification du role impossible.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivate(user: AdminUser) {
    if (!window.confirm(`Desactiver le compte ${user.email} ?`)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updatedUser = await deactivateUser(user.id, accessToken);
      setSelectedUser(updatedUser);
      setSuccessMessage('Utilisateur desactive.');
      await fetchUsers();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Desactivation utilisateur impossible.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="resources-page" aria-labelledby="admin-users-title">
      <div className="resource-page-header">
        <div>
          <span className="dashboard-eyebrow">Administration</span>
          <h1 id="admin-users-title">Utilisateurs</h1>
          <p>Administrez les comptes, les roles et l'etat des utilisateurs applicatifs.</p>
        </div>
        <span className="dashboard-status">{userCountLabel}</span>
      </div>

      <FeedbackMessage errorMessage={errorMessage} successMessage={successMessage} />

      <div className="resource-workspace">
        <section className="resource-list-panel" aria-labelledby="admin-users-list-title">
          <div className="section-heading">
            <h2 id="admin-users-list-title">Liste utilisateurs</h2>
            <p>Recherche par email, prenom ou nom, avec filtres role et statut.</p>
          </div>

          <form className="resource-filters" onSubmit={handleFilterSubmit}>
            <label className="form-field" htmlFor="admin-user-search">
              <span>Recherche</span>
              <input
                id="admin-user-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Email, prenom ou nom"
              />
            </label>

            <label className="form-field" htmlFor="admin-role-filter">
              <span>Role</span>
              <select
                id="admin-role-filter"
                value={roleFilter}
                onChange={(event) => {
                  setRoleFilter(event.target.value as UserRole | '');
                  setPage(1);
                }}
              >
                <option value="">Tous</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field" htmlFor="admin-status-filter">
              <span>Statut</span>
              <select
                id="admin-status-filter"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as UserStatus | '');
                  setPage(1);
                }}
              >
                <option value="">Tous</option>
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
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
                  <th>Utilisateur</th>
                  <th>Role</th>
                  <th>Statut</th>
                  <th>Creation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5}>Chargement des utilisateurs...</td>
                  </tr>
                ) : null}
                {!isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun utilisateur trouve.</td>
                  </tr>
                ) : null}
                {!isLoading
                  ? users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <button
                            className="table-link-button"
                            type="button"
                            onClick={() => void handleSelectUser(user.id)}
                          >
                            {user.firstName} {user.lastName}
                          </button>
                          <span className="table-subtle">{user.email}</span>
                        </td>
                        <td>
                          <span className="role-badge">{roleLabels[user.role]}</span>
                        </td>
                        <td>
                          <span className={`status-badge status-${getUserStatus(user).toLowerCase()}`}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <select
                              aria-label={`Role de ${user.email}`}
                              value={roleChanges[user.id] ?? user.role}
                              onChange={(event) =>
                                setRoleChanges((currentChanges) => ({
                                  ...currentChanges,
                                  [user.id]: event.target.value as UserRole,
                                }))
                              }
                            >
                              {userRoles.map((role) => (
                                <option key={role} value={role}>
                                  {roleLabels[role]}
                                </option>
                              ))}
                            </select>
                            <button
                              className="compact-action"
                              type="button"
                              disabled={isSaving || (roleChanges[user.id] ?? user.role) === user.role}
                              onClick={() => void handleRoleUpdate(user)}
                            >
                              Appliquer
                            </button>
                            <button
                              className="compact-action danger-action"
                              type="button"
                              disabled={isSaving || !user.isActive}
                              onClick={() => void handleDeactivate(user)}
                            >
                              Desactiver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            >
              Precedent
            </button>
            <span>
              Page {meta.page} / {Math.max(meta.totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= Math.max(meta.totalPages, 1) || isLoading}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Suivant
            </button>
          </div>
        </section>

        <aside className="resource-side-panel">
          <section className="resource-detail-panel" aria-labelledby="admin-user-detail-title">
            <div className="section-heading">
              <h2 id="admin-user-detail-title">Detail utilisateur</h2>
              <p>Selectionnez un utilisateur pour consulter son profil.</p>
            </div>

            {selectedUser ? (
              <div className="resource-detail">
                <strong>
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>
                <span>{selectedUser.email}</span>
                <dl>
                  <div>
                    <dt>Role</dt>
                    <dd>{roleLabels[selectedUser.role]}</dd>
                  </div>
                  <div>
                    <dt>Statut</dt>
                    <dd>{selectedUser.isActive ? 'Actif' : 'Inactif'}</dd>
                  </div>
                  <div>
                    <dt>Departement</dt>
                    <dd>{selectedUser.department?.name ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>Creation</dt>
                    <dd>{formatDate(selectedUser.createdAt)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="muted-copy">Aucun utilisateur selectionne.</p>
            )}
          </section>

          <section className="resource-create-panel" aria-labelledby="admin-user-create-title">
            <div className="section-heading">
              <h2 id="admin-user-create-title">Nouvel utilisateur</h2>
              <p>Creer un compte applicatif avec un role initial.</p>
            </div>

            <form className="resource-create-form" onSubmit={(event) => void handleCreateUser(event)}>
              <label className="form-field" htmlFor="admin-first-name">
                <span>Prenom</span>
                <input
                  id="admin-first-name"
                  value={form.firstName}
                  onChange={(event) => updateFormField('firstName', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="admin-last-name">
                <span>Nom</span>
                <input
                  id="admin-last-name"
                  value={form.lastName}
                  onChange={(event) => updateFormField('lastName', event.target.value)}
                  required
                />
              </label>

              <label className="form-field" htmlFor="admin-email">
                <span>Email</span>
                <input
                  id="admin-email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateFormField('email', event.target.value)}
                  placeholder="utilisateur@grm.local"
                  required
                />
              </label>

              <label className="form-field" htmlFor="admin-password">
                <span>Mot de passe initial</span>
                <input
                  id="admin-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateFormField('password', event.target.value)}
                  minLength={8}
                  required
                />
              </label>

              <label className="form-field" htmlFor="admin-role">
                <span>Role initial</span>
                <select
                  id="admin-role"
                  value={form.role}
                  onChange={(event) => updateFormField('role', event.target.value)}
                >
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="checkbox-field" htmlFor="admin-is-active">
                <input
                  id="admin-is-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => updateFormField('isActive', event.target.checked)}
                />
                <span>Compte actif</span>
              </label>

              <button className="primary-action" type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Creer utilisateur'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  );
}
