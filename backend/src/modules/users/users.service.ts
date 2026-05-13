import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getFoundationStatus() {
    return {
      module: 'users',
      status: 'foundation-ready',
      note: 'User business use cases will be implemented story by story.',
    };
  }
}
