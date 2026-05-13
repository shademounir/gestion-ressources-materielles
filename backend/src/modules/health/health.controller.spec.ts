import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns the service health foundation', async () => {
    const prismaService = {
      $queryRaw: () => Promise.resolve([{ value: 1 }]),
    };
    const controller = new HealthController(prismaService as never);

    await expect(controller.check()).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'connected',
        service: 'gestion-ressources-materielles-api',
      }),
    );
  });
});
