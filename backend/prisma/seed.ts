import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, RoleName, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

interface DemoAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: RoleName;
}

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: 'admin@grm.local',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Administrator',
    roleName: RoleName.ADMIN,
  },
  {
    email: 'manager@grm.local',
    password: 'Manager123!',
    firstName: 'Demo',
    lastName: 'Manager',
    roleName: RoleName.MANAGER,
  },
];

function loadEnvFile(path: string): void {
  if (!existsSync(path)) {
    return;
  }

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(__dirname, '..', '.env'));
loadEnvFile(resolve(__dirname, '..', '..', '.env'));

const prisma = new PrismaClient();

async function ensureRole(roleName: RoleName) {
  const existingRole = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (existingRole) {
    return existingRole;
  }

  return prisma.role.create({
    data: {
      name: roleName,
      description: `Demo ${roleName} role`,
    },
  });
}

async function createDemoAccount(account: DemoAccount): Promise<'created' | 'skipped'> {
  const existingUser = await prisma.user.findUnique({
    where: { email: account.email },
    select: { id: true },
  });

  if (existingUser) {
    return 'skipped';
  }

  const role = await ensureRole(account.roleName);
  const passwordHash = await hash(account.password, 12);

  await prisma.user.create({
    data: {
      email: account.email,
      passwordHash,
      firstName: account.firstName,
      lastName: account.lastName,
      status: UserStatus.ACTIVE,
      roleId: role.id,
    },
  });

  return 'created';
}

async function main(): Promise<void> {
  for (const account of DEMO_ACCOUNTS) {
    const result = await createDemoAccount(account);

    console.info(`Demo account ${account.email}: ${result}`);
  }
}

void main()
  .catch((error: unknown) => {
    console.error('Demo account seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
