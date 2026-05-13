import { UserRole } from '../../../shared/enums/user-role.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: UserRole[];
}

export interface AuthenticatedRequest {
  user?: AuthenticatedUser;
}
