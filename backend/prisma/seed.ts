import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  DepartmentStatus,
  MaintenancePriority,
  MaintenanceSeverity,
  MaintenanceTicketStatus,
  NeedPriority,
  NeedStatus,
  NotificationEntityType,
  NotificationType,
  Prisma,
  PrismaClient,
  ResourceAssignmentStatus,
  ResourceStatus,
  RoleName,
  SupplierOfferStatus,
  SupplierStatus,
  TenderStatus,
  UserStatus,
} from '@prisma/client';
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
  {
    email: 'technicien@grm.local',
    password: 'Technicien123!',
    firstName: 'Demo',
    lastName: 'Technicien',
    roleName: RoleName.USER,
  },
  {
    email: 'employe1@grm.local',
    password: 'Employe123!',
    firstName: 'Salma',
    lastName: 'Employe',
    roleName: RoleName.USER,
  },
  {
    email: 'employe2@grm.local',
    password: 'Employe123!',
    firstName: 'Youssef',
    lastName: 'Employe',
    roleName: RoleName.USER,
  },
];

const DEMO_RESOURCES = [
  {
    inventoryCode: 'INV-DEMO-2026-0001',
    name: 'Ordinateur Dell Latitude',
    category: 'Informatique',
    description: 'Poste portable de demonstration pour les affectations.',
    serialNumber: 'DEMO-DELL-LATITUDE-001',
  },
  {
    inventoryCode: 'INV-DEMO-2026-0002',
    name: 'Ecran Dell 24 pouces',
    category: 'Informatique',
    description: 'Ecran de demonstration pour bureau administratif.',
    serialNumber: 'DEMO-DELL-SCREEN-002',
  },
  {
    inventoryCode: 'INV-DEMO-2026-0003',
    name: 'Imprimante HP',
    category: 'Impression',
    description: 'Imprimante partagée de demonstration.',
    serialNumber: 'DEMO-HP-PRINTER-003',
  },
  {
    inventoryCode: 'INV-DEMO-2026-0004',
    name: 'Videoprojecteur Epson',
    category: 'Audiovisuel',
    description: 'Videoprojecteur de salle de conference.',
    serialNumber: 'DEMO-EPSON-004',
  },
  {
    inventoryCode: 'INV-DEMO-2026-0005',
    name: 'Switch Cisco',
    category: 'Reseau',
    description: 'Switch de demonstration pour salle reseau.',
    serialNumber: 'DEMO-CISCO-005',
  },
] as const;

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

async function ensureDepartment() {
  const existingDepartment = await prisma.department.findUnique({
    where: { name: 'Departement Informatique Demo' },
  });

  if (existingDepartment) {
    return existingDepartment;
  }

  return prisma.department.create({
    data: {
      name: 'Departement Informatique Demo',
      description: 'Departement de demonstration pour la recette fonctionnelle.',
      status: DepartmentStatus.ACTIVE,
    },
  });
}

async function ensureSuppliers() {
  const suppliers = [
    {
      name: 'Dell Maroc',
      contactEmail: 'contact.demo@dell-maroc.local',
      phone: '+212 500 000 001',
      address: 'Casablanca',
    },
    {
      name: 'HP Maroc',
      contactEmail: 'contact.demo@hp-maroc.local',
      phone: '+212 500 000 002',
      address: 'Rabat',
    },
    {
      name: 'Cisco Partner Maroc',
      contactEmail: 'contact.demo@cisco-partner.local',
      phone: '+212 500 000 003',
      address: 'Casablanca',
    },
  ];

  for (const supplier of suppliers) {
    const existingSupplier = await prisma.supplier.findUnique({
      where: { name: supplier.name },
    });

    if (!existingSupplier) {
      await prisma.supplier.create({
        data: {
          ...supplier,
          status: SupplierStatus.ACTIVE,
        },
      });
    }
  }
}

async function ensureResources() {
  const dellSupplier = await prisma.supplier.findUnique({
    where: { name: 'Dell Maroc' },
    select: { id: true },
  });

  const hpSupplier = await prisma.supplier.findUnique({
    where: { name: 'HP Maroc' },
    select: { id: true },
  });

  const ciscoSupplier = await prisma.supplier.findUnique({
    where: { name: 'Cisco Partner Maroc' },
    select: { id: true },
  });

  const supplierByInventoryCode: Record<string, string | undefined> = {
    'INV-DEMO-2026-0001': dellSupplier?.id,
    'INV-DEMO-2026-0002': dellSupplier?.id,
    'INV-DEMO-2026-0003': hpSupplier?.id,
    'INV-DEMO-2026-0005': ciscoSupplier?.id,
  };

  for (const resource of DEMO_RESOURCES) {
    const existingResource = await prisma.resource.findUnique({
      where: { inventoryCode: resource.inventoryCode },
      select: { id: true },
    });

    if (!existingResource) {
      await prisma.resource.create({
        data: {
          ...resource,
          status: ResourceStatus.AVAILABLE,
          supplierId: supplierByInventoryCode[resource.inventoryCode],
          acquisitionDate: new Date('2026-01-15T00:00:00.000Z'),
          acquisitionValue: new Prisma.Decimal(4500),
        },
      });
    }
  }
}

async function ensureNeeds(departmentId: string, createdById: string) {
  const needs = [
    {
      title: 'Renouvellement parc informatique salle formation',
      justification: 'Moderniser les postes de formation pour les ateliers pratiques.',
      priority: NeedPriority.HIGH,
      items: [
        { designation: 'PC portables', quantity: 10, estimatedUnitPrice: 7500 },
        { designation: 'Ecrans 24 pouces', quantity: 10, estimatedUnitPrice: 1500 },
      ],
    },
    {
      title: 'Acquisition videoprojecteur salle conference',
      justification: 'Equiper la salle conference pour les soutenances et reunions.',
      priority: NeedPriority.MEDIUM,
      items: [
        { designation: 'Videoprojecteur', quantity: 1, estimatedUnitPrice: 9000 },
        { designation: 'Support plafond', quantity: 1, estimatedUnitPrice: 1200 },
      ],
    },
  ];

  for (const need of needs) {
    const existingNeed = await prisma.need.findFirst({
      where: { title: need.title },
      select: { id: true },
    });

    if (!existingNeed) {
      await prisma.need.create({
        data: {
          title: need.title,
          justification: need.justification,
          priority: need.priority,
          status: NeedStatus.SUBMITTED,
          departmentId,
          createdById,
          items: {
            create: need.items.map((item) => ({
              ...item,
              estimatedUnitPrice: new Prisma.Decimal(item.estimatedUnitPrice),
            })),
          },
        },
      });
    }
  }
}

async function ensureAssignment(
  inventoryCode: string,
  userEmail: string,
  status: ResourceAssignmentStatus,
  comment: string,
) {
  const [resource, user] = await Promise.all([
    prisma.resource.findUnique({ where: { inventoryCode } }),
    prisma.user.findUnique({ where: { email: userEmail } }),
  ]);

  if (!resource || !user) {
    return;
  }

  const existingAssignment = await prisma.resourceAssignment.findFirst({
    where: { resourceId: resource.id, userId: user.id, comment },
    select: { id: true },
  });

  if (existingAssignment) {
    return;
  }

  await prisma.resourceAssignment.create({
    data: {
      resourceId: resource.id,
      userId: user.id,
      status,
      comment,
      returnedAt:
        status === ResourceAssignmentStatus.RETURNED
          ? new Date('2026-03-20T10:00:00.000Z')
          : null,
      returnComment:
        status === ResourceAssignmentStatus.RETURNED
          ? 'Retour demo en bon etat.'
          : null,
    },
  });

  if (status === ResourceAssignmentStatus.ACTIVE) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: { status: ResourceStatus.ASSIGNED },
    });
  }
}

async function ensureMaintenanceTicket(
  inventoryCode: string,
  reportedByEmail: string,
  status: MaintenanceTicketStatus,
  description: string,
) {
  const [resource, reporter] = await Promise.all([
    prisma.resource.findUnique({ where: { inventoryCode } }),
    prisma.user.findUnique({ where: { email: reportedByEmail } }),
  ]);

  if (!resource || !reporter) {
    return null;
  }

  let ticket = await prisma.maintenanceTicket.findFirst({
    where: { resourceId: resource.id, description },
  });

  if (!ticket) {
    ticket = await prisma.maintenanceTicket.create({
      data: {
        resourceId: resource.id,
        reportedById: reporter.id,
        description,
        priority: MaintenancePriority.HIGH,
        status,
        closedAt:
          status === MaintenanceTicketStatus.CLOSED
            ? new Date('2026-04-05T16:00:00.000Z')
            : null,
      },
    });
  }

  if (
    status === MaintenanceTicketStatus.OPEN ||
    status === MaintenanceTicketStatus.IN_PROGRESS
  ) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: { status: ResourceStatus.UNDER_MAINTENANCE },
    });
  }

  return ticket;
}

async function ensureMaintenanceDemo(managerId: string) {
  const tickets = [
    await ensureMaintenanceTicket(
      'INV-DEMO-2026-0004',
      'manager@grm.local',
      MaintenanceTicketStatus.OPEN,
      'Image projetee instable pendant les presentations.',
    ),
    await ensureMaintenanceTicket(
      'INV-DEMO-2026-0005',
      'manager@grm.local',
      MaintenanceTicketStatus.IN_PROGRESS,
      'Ports reseau intermittents sur le switch.',
    ),
    await ensureMaintenanceTicket(
      'INV-DEMO-2026-0003',
      'manager@grm.local',
      MaintenanceTicketStatus.CLOSED,
      'Bourrage papier recurrent resolu.',
    ),
  ].filter(Boolean);

  for (const ticket of tickets) {
    if (!ticket) {
      continue;
    }

    const existingReport = await prisma.maintenanceReport.findUnique({
      where: { maintenanceTicketId: ticket.id },
      select: { id: true },
    });

    if (!existingReport) {
      await prisma.maintenanceReport.create({
        data: {
          maintenanceTicketId: ticket.id,
          authorId: managerId,
          diagnosis: 'Diagnostic demo realise par le service technique.',
          probableCause: 'Usure ou configuration materielle a verifier.',
          severity:
            ticket.status === MaintenanceTicketStatus.OPEN
              ? MaintenanceSeverity.HIGH
              : MaintenanceSeverity.MEDIUM,
          recommendations: 'Planifier une intervention et suivre le ticket.',
        },
      });
    }

    const existingIntervention = await prisma.maintenanceIntervention.findFirst({
      where: {
        maintenanceTicketId: ticket.id,
        description: 'Intervention demo de verification et correction.',
      },
      select: { id: true },
    });

    if (!existingIntervention && ticket.status !== MaintenanceTicketStatus.OPEN) {
      await prisma.maintenanceIntervention.create({
        data: {
          maintenanceTicketId: ticket.id,
          technicianName: 'Technicien demo',
          description: 'Intervention demo de verification et correction.',
          startedAt: new Date('2026-04-04T09:00:00.000Z'),
          completedAt:
            ticket.status === MaintenanceTicketStatus.CLOSED
              ? new Date('2026-04-04T11:00:00.000Z')
              : null,
          cost: new Prisma.Decimal(350),
          result:
            ticket.status === MaintenanceTicketStatus.CLOSED
              ? 'Incident resolu.'
              : 'Intervention en cours de suivi.',
        },
      });
    }
  }
}

async function ensureTendersAndOffers(managerId: string) {
  const [needFormation, needProjector] = await Promise.all([
    prisma.need.findFirst({
      where: { title: 'Renouvellement parc informatique salle formation' },
    }),
    prisma.need.findFirst({
      where: { title: 'Acquisition videoprojecteur salle conference' },
    }),
  ]);

  if (!needFormation || !needProjector) {
    return;
  }

  const draftTender = await prisma.tender.upsert({
    where: { reference: 'AO-DEMO-2026-DRAFT' },
    update: {},
    create: {
      reference: 'AO-DEMO-2026-DRAFT',
      title: 'Renouvellement parc informatique',
      description: 'Appel d offres demo en brouillon pour la salle formation.',
      status: TenderStatus.DRAFT,
      deadline: new Date('2026-08-30T12:00:00.000Z'),
      needId: needFormation.id,
      createdById: managerId,
    },
  });

  const publishedTender = await prisma.tender.upsert({
    where: { reference: 'AO-DEMO-2026-PUBLISHED' },
    update: {},
    create: {
      reference: 'AO-DEMO-2026-PUBLISHED',
      title: 'Equipement audiovisuel salle conference',
      description: 'Appel d offres demo publie pour la salle conference.',
      status: TenderStatus.PUBLISHED,
      deadline: new Date('2026-09-15T12:00:00.000Z'),
      publishedAt: new Date('2026-06-01T09:00:00.000Z'),
      needId: needProjector.id,
      createdById: managerId,
    },
  });

  const [dell, hp] = await Promise.all([
    prisma.supplier.findUnique({ where: { name: 'Dell Maroc' } }),
    prisma.supplier.findUnique({ where: { name: 'HP Maroc' } }),
  ]);

  if (dell && hp) {
    await prisma.supplierOffer.upsert({
      where: {
        tenderId_supplierId: {
          tenderId: publishedTender.id,
          supplierId: dell.id,
        },
      },
      update: {},
      create: {
        tenderId: publishedTender.id,
        supplierId: dell.id,
        amount: new Prisma.Decimal(120000),
        proposedDeliveryDays: 21,
        comment: 'Offre demo selectionnee pour la soutenance.',
        status: SupplierOfferStatus.SELECTED,
        selectedAt: new Date('2026-06-02T10:00:00.000Z'),
      },
    });

    await prisma.supplierOffer.upsert({
      where: {
        tenderId_supplierId: {
          tenderId: publishedTender.id,
          supplierId: hp.id,
        },
      },
      update: {},
      create: {
        tenderId: publishedTender.id,
        supplierId: hp.id,
        amount: new Prisma.Decimal(128000),
        proposedDeliveryDays: 30,
        comment: 'Offre demo rejetee apres comparaison.',
        status: SupplierOfferStatus.REJECTED,
      },
    });
  }

  await ensureNotification(
    NotificationType.RESOURCE_ASSIGNED,
    'Appel d offres publie',
    'Un appel d offres demo est disponible pour consultation.',
    NotificationEntityType.RESOURCE,
    draftTender.id,
    null,
  );
}

async function ensureNotification(
  type: NotificationType,
  title: string,
  message: string,
  entityType: NotificationEntityType,
  entityId: string,
  recipientId: string | null,
) {
  const existingNotification = await prisma.notification.findFirst({
    where: { type, title, entityId, recipientId },
    select: { id: true },
  });

  if (existingNotification) {
    return;
  }

  await prisma.notification.create({
    data: {
      type,
      title,
      message,
      entityType,
      entityId,
      recipientId,
    },
  });
}

async function ensureNotifications(managerId: string) {
  const [assignment, returnedAssignment, ticket, intervention] = await Promise.all([
    prisma.resourceAssignment.findFirst({
      where: { status: ResourceAssignmentStatus.ACTIVE },
      select: { id: true, userId: true },
    }),
    prisma.resourceAssignment.findFirst({
      where: { status: ResourceAssignmentStatus.RETURNED },
      select: { id: true, userId: true },
    }),
    prisma.maintenanceTicket.findFirst({
      where: { status: MaintenanceTicketStatus.OPEN },
      select: { id: true, reportedById: true },
    }),
    prisma.maintenanceIntervention.findFirst({
      where: { completedAt: { not: null } },
      select: { id: true },
    }),
  ]);

  if (assignment) {
    await ensureNotification(
      NotificationType.RESOURCE_ASSIGNED,
      'Nouvelle affectation demo',
      'Une ressource de demonstration vient d etre affectee.',
      NotificationEntityType.RESOURCE_ASSIGNMENT,
      assignment.id,
      assignment.userId,
    );
  }

  if (returnedAssignment) {
    await ensureNotification(
      NotificationType.RESOURCE_RETURNED,
      'Retour materiel demo',
      'Une ressource de demonstration a ete retournee.',
      NotificationEntityType.RESOURCE_ASSIGNMENT,
      returnedAssignment.id,
      returnedAssignment.userId,
    );
  }

  if (ticket) {
    await ensureNotification(
      NotificationType.MAINTENANCE_REPORTED,
      'Panne signalee demo',
      'Un ticket de maintenance demo est ouvert.',
      NotificationEntityType.MAINTENANCE_TICKET,
      ticket.id,
      ticket.reportedById,
    );
  }

  if (intervention) {
    await ensureNotification(
      NotificationType.MAINTENANCE_INTERVENTION_CREATED,
      'Intervention terminee demo',
      'Une intervention de maintenance demo est terminee.',
      NotificationEntityType.MAINTENANCE_INTERVENTION,
      intervention.id,
      managerId,
    );
  }
}

async function main(): Promise<void> {
  for (const account of DEMO_ACCOUNTS) {
    const result = await createDemoAccount(account);

    console.info(`Demo account ${account.email}: ${result}`);
  }

  const [department, manager] = await Promise.all([
    ensureDepartment(),
    prisma.user.findUniqueOrThrow({ where: { email: 'manager@grm.local' } }),
  ]);

  await ensureSuppliers();
  await ensureResources();
  await ensureNeeds(department.id, manager.id);
  await ensureAssignment(
    'INV-DEMO-2026-0001',
    'employe1@grm.local',
    ResourceAssignmentStatus.ACTIVE,
    'Affectation demo ordinateur portable.',
  );
  await ensureAssignment(
    'INV-DEMO-2026-0002',
    'employe2@grm.local',
    ResourceAssignmentStatus.ACTIVE,
    'Affectation demo ecran.',
  );
  await ensureAssignment(
    'INV-DEMO-2026-0003',
    'technicien@grm.local',
    ResourceAssignmentStatus.RETURNED,
    'Affectation demo retournee.',
  );
  await ensureMaintenanceDemo(manager.id);
  await ensureTendersAndOffers(manager.id);
  await ensureNotifications(manager.id);

  console.info('Demo data seed completed.');
}

void main()
  .catch((error: unknown) => {
    console.error('Demo data seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
