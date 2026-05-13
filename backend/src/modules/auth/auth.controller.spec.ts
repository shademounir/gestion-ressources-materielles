import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserRole } from '../../shared/enums/user-role.enum';

describe('AuthController', () => {
  it('delegates login to AuthService', async () => {
    const loginResponse: LoginResponseDto = {
      accessToken: 'signed-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'user-1',
        email: 'admin@faculty.test',
        firstName: 'Amina',
        lastName: 'Bennani',
        role: UserRole.ADMIN,
      },
    };
    const loginMock = jest.fn().mockResolvedValue(loginResponse);
    const authService = {
      login: loginMock,
      getFoundationStatus: jest.fn(),
    } as unknown as AuthService;
    const controller = new AuthController(authService);

    const result = await controller.login({
      email: 'admin@faculty.test',
      password: 'ValidPass123!',
    });

    expect(loginMock).toHaveBeenCalledWith({
      email: 'admin@faculty.test',
      password: 'ValidPass123!',
    });
    expect(result).toEqual(loginResponse);
  });

  it('delegates logout to AuthService with the authenticated user context', () => {
    const logoutResponse = {
      message: 'Deconnexion effectuee.',
      loggedOutAt: '2026-05-13T14:30:00.000Z',
      sessionState: 'CLIENT_CONTEXT_CLEARED' as const,
      refreshTokenRevoked: false,
    };
    const logoutMock = jest.fn().mockReturnValue(logoutResponse);
    const authService = {
      logout: logoutMock,
      login: jest.fn(),
      getFoundationStatus: jest.fn(),
    } as unknown as AuthService;
    const controller = new AuthController(authService);
    const request = {
      user: {
        userId: 'user-1',
        email: 'admin@faculty.test',
        roles: [UserRole.ADMIN],
      },
    };

    const result = controller.logout(request);

    expect(logoutMock).toHaveBeenCalledWith(request.user);
    expect(result).toEqual(logoutResponse);
  });
});
