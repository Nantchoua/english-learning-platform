/**
 * Reassign all courses from one user to another, then delete the original user.
 * Run with: npx tsx scripts/reassign-and-delete.ts <from-email> <to-email>
 * Example:  npx tsx scripts/reassign-and-delete.ts dominic@test.com nantchoua@test.com
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const fromEmail = process.argv[2];
  const toEmail = process.argv[3];

  if (!fromEmail || !toEmail) {
    console.error('Usage: npx tsx scripts/reassign-and-delete.ts <from-email> <to-email>');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Find both users
  const { rows: fromRows } = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', [fromEmail]);
  const { rows: toRows }   = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', [toEmail]);

  if (fromRows.length === 0) { console.error(`❌ User not found: ${fromEmail}`); process.exit(1); }
  if (toRows.length === 0)   { console.error(`❌ User not found: ${toEmail}`);   process.exit(1); }

  const fromUser = fromRows[0];
  const toUser   = toRows[0];

  console.log(`\nFrom : ${fromUser.email} (${fromUser.role})`);
  console.log(`To   : ${toUser.email} (${toUser.role})\n`);

  // Find courses owned by the source user
  const { rows: courses } = await pool.query(
    'SELECT id, title FROM "Course" WHERE "instructorId" = $1',
    [fromUser.id]
  );

  if (courses.length === 0) {
    console.log('  ℹ  No courses to reassign.');
  } else {
    // Reassign all courses
    const { rowCount } = await pool.query(
      'UPDATE "Course" SET "instructorId" = $1 WHERE "instructorId" = $2',
      [toUser.id, fromUser.id]
    );
    console.log(`  ✅ Reassigned ${rowCount} course(s) to ${toUser.email}:`);
    courses.forEach(c => console.log(`       - "${c.title}"`));
  }

  // Now safely delete the original user's related data
  console.log(`\nRemoving ${fromUser.email}'s remaining data...`);

  const { rowCount: prog }    = await pool.query('DELETE FROM "Progress"   WHERE "userId" = $1', [fromUser.id]);
  const { rowCount: enroll }  = await pool.query('DELETE FROM "Enrollment" WHERE "userId" = $1', [fromUser.id]);
  const { rowCount: sess }    = await pool.query('DELETE FROM "Session"    WHERE "userId" = $1', [fromUser.id]);
  const { rowCount: acct }    = await pool.query('DELETE FROM "Account"    WHERE "userId" = $1', [fromUser.id]);

  console.log(`  ✅ Deleted ${prog} progress records`);
  console.log(`  ✅ Deleted ${enroll} enrollments`);
  console.log(`  ✅ Deleted ${sess} sessions`);
  console.log(`  ✅ Deleted ${acct} accounts`);

  // Delete the user
  await pool.query('DELETE FROM "User" WHERE id = $1', [fromUser.id]);
  console.log(`\n✅ User ${fromEmail} deleted. All their courses now belong to ${toEmail}.`);

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
