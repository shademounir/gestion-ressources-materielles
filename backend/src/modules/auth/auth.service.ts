import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  getFoundationStatus() {
    return {
      module: 'auth',
      status: 'foundation-ready',
      features: ['jwt-foundation', 'rbac-decorators', 'guards'],
    };
  }
}
