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
});
