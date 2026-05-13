import 'reflect-metadata';
import { UserRole } from '../../shared/enums/user-role.enum';
import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles decorator', () => {
  it('stores required roles metadata on a route handler', () => {
    class TestController {
      @Roles(UserRole.ADMIN, UserRole.MANAGER)
      protectedRoute() {
        return 'protected';
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      'protectedRoute',
    );
    const handler: unknown = descriptor?.value;

    if (typeof handler !== 'function') {
      throw new Error('Expected protectedRoute handler to be a function');
    }

    const metadata = Reflect.getMetadata(ROLES_KEY, handler) as UserRole[];

    expect(metadata).toEqual([UserRole.ADMIN, UserRole.MANAGER]);
  });
});
