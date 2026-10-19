import 'dotenv/config';
import crypto from 'crypto';
import { query, queryOne } from '../core/database/db';
import { hashPassword } from '../core/utils/authSecurity';
import { logger } from '../core/logging/logger';

/**
 * Idempotent development-only administrator seeding script.
 * Refuses execution in production environments.
 */
export async function seedDevelopmentAdmins() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    throw new Error('SECURITY VIOLATION: Refusing to seed default development accounts in production environment.');
  }

  console.log('--- Initializing Local Development Administrator Accounts ---');

  // Read development passwords from environment variables with safe dev fallbacks
  const superAdminPassword =
    process.env.DEV_SUPERADMIN_PASSWORD ||
    process.env.SEED_SUPERADMIN_PASSWORD ||
    'Erkab@DevSuper2026!';

  const subAdminPassword =
    process.env.DEV_SUBADMIN_PASSWORD ||
    process.env.SEED_SUBADMIN_PASSWORD ||
    'Erkab@DevSub2026!';

  const accounts = [
    {
      id: 'usr-dev-superadmin',
      email: 'superadmin@erkab.local',
      name: 'Erkab Super Administrator (Local)',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['*']),
      password: superAdminPassword,
      status: 'ACTIVE',
    },
    {
      id: 'usr-dev-superadmin-org',
      email: 'superadmin@erkab.org',
      name: 'Erkab Executive Director',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify(['*']),
      password: superAdminPassword,
      status: 'ACTIVE',
    },
    {
      id: 'usr-dev-subadmin',
      email: 'subadmin@erkab.local',
      name: 'Erkab Operations Specialist (Local)',
      role: 'SUB_ADMIN',
      permissions: JSON.stringify([
        'security:read',
        'support:read',
        'support:write',
        'monitoring:read',
        'maintenance:read',
        'applications:read',
      ]),
      password: subAdminPassword,
      status: 'ACTIVE',
    },
    {
      id: 'usr-dev-subadmin-org',
      email: 'subadmin@erkab.org',
      name: 'Erkab Operations Specialist',
      role: 'SUB_ADMIN',
      permissions: JSON.stringify([
        'security:read',
        'support:read',
        'support:write',
        'monitoring:read',
        'maintenance:read',
        'applications:read',
      ]),
      password: subAdminPassword,
      status: 'ACTIVE',
    },
  ];

  for (const acc of accounts) {
    const normalizedEmail = acc.email.toLowerCase().trim();
    const existing = await queryOne<{ id: string }>(
      `SELECT "id" FROM "public"."AdminUser" WHERE LOWER("email") = $1`,
      [normalizedEmail]
    );

    const passwordHash = hashPassword(acc.password);

    if (existing) {
      await query(
        `UPDATE "public"."AdminUser"
         SET "passwordHash" = $1,
             "name" = $2,
             "role" = $3,
             "permissions" = $4,
             "status" = $5,
             "updatedAt" = NOW()
         WHERE "id" = $6`,
        [passwordHash, acc.name, acc.role, acc.permissions, acc.status, existing.id]
      );
      console.log(`[OK] Updated existing dev account: ${normalizedEmail} (Role: ${acc.role})`);
    } else {
      await query(
        `INSERT INTO "public"."AdminUser" (
           "id", "email", "passwordHash", "name", "role", "permissions", "status", "createdAt", "updatedAt"
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [acc.id, normalizedEmail, passwordHash, acc.name, acc.role, acc.permissions, acc.status]
      );
      console.log(`[OK] Created new dev account: ${normalizedEmail} (Role: ${acc.role})`);
    }
  }

  console.log('--- Development Administrator Accounts Ready ---');
  console.log('Super Admin: superadmin@erkab.local');
  console.log('Sub Admin:   subadmin@erkab.local');
}

if (require.main === module || process.argv[1]?.endsWith('seedAdmin.ts')) {
  seedDevelopmentAdmins()
    .then(() => {
      console.log('Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err.message);
      process.exit(1);
    });
}
