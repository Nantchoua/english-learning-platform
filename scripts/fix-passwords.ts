/**
 * Direct fix: hash all plain-text passwords in the database.
 * Run with: npx tsx scripts/fix-passwords.ts
 */
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Fetch all users with passwords
  const { rows: users } = await pool.query(
    'SELECT id, email, password FROM "User"'
  );

  console.log(`Found ${users.length} users.\n`);

  for (const user of users) {
    if (!user.password) {
      console.log(`  ⚠  Skipping ${user.email} — no password`);
      continue;
    }
    if (user.password.startsWith('$2')) {
      console.log(`  ✓  Skipping ${user.email} — already hashed`);
      continue;
    }

    const hashed = await bcrypt.hash(user.password, 10);
    await pool.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashed, user.id]);
    console.log(`  ✅ Hashed password for ${user.email} (was: ${user.password})`);
  }

  console.log('\n✅ Done! You can now log in with your original passwords.');
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
