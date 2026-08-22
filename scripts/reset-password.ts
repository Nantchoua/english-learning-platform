import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const email = 'nantchoua@test.com';
  const newPassword = 'Password123!';
  
  const hashed = await bcrypt.hash(newPassword, 10);
  const result = await pool.query(
    'UPDATE "User" SET password = $1 WHERE email = $2',
    [hashed, email]
  );

  if (result.rowCount === 0) {
    console.error('❌ User not found with email:', email);
  } else {
    console.log(`\n✅ Password for ${email} has been successfully reset to: ${newPassword}\n`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error resetting password:', err.message);
  process.exit(1);
});
