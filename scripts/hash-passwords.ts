/**
 * One-time migration script: re-hash all plain-text passwords with bcrypt.
 * Run with: npx tsx scripts/hash-passwords.ts
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  const users = await db.user.findMany({
    select: { id: true, email: true, password: true },
  });

  console.log(`Found ${users.length} users.`);

  for (const user of users) {
    if (!user.password) {
      console.log(`  ⚠  Skipping ${user.email} — no password set`);
      continue;
    }

    // If it already looks like a bcrypt hash, skip it
    if (user.password.startsWith('$2')) {
      console.log(`  ✓  Skipping ${user.email} — already hashed`);
      continue;
    }

    // Hash the plain-text password
    const hashed = await bcrypt.hash(user.password, 10);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
    console.log(`  ✅ Hashed password for ${user.email}`);
  }

  console.log('\nDone! All plain-text passwords have been hashed.');
  await db.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
