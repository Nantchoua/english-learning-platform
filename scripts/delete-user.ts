/**
 * Safely delete a user and all their related data (courses, enrollments, progress, sessions).
 * Run with: npx tsx scripts/delete-user.ts dominic@test.com
 */
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npx tsx scripts/delete-user.ts <email>');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Find the user
  const { rows } = await pool.query('SELECT id, email, role FROM "User" WHERE email = $1', [email]);
  if (rows.length === 0) {
    console.error(`❌ No user found with email: ${email}`);
    await pool.end();
    process.exit(1);
  }

  const user = rows[0];
  console.log(`\nFound user: ${user.email} (${user.role}) — id: ${user.id}`);
  console.log('Deleting all related data...\n');

  // 1. Delete progress records for this user
  const { rowCount: progressCount } = await pool.query('DELETE FROM "Progress" WHERE "userId" = $1', [user.id]);
  console.log(`  ✅ Deleted ${progressCount} progress records`);

  // 2. Delete enrollments for this user
  const { rowCount: enrollCount } = await pool.query('DELETE FROM "Enrollment" WHERE "userId" = $1', [user.id]);
  console.log(`  ✅ Deleted ${enrollCount} enrollments`);

  // 3. Delete sessions for this user
  const { rowCount: sessionCount } = await pool.query('DELETE FROM "Session" WHERE "userId" = $1', [user.id]);
  console.log(`  ✅ Deleted ${sessionCount} sessions`);

  // 4. Delete accounts for this user
  const { rowCount: accountCount } = await pool.query('DELETE FROM "Account" WHERE "userId" = $1', [user.id]);
  console.log(`  ✅ Deleted ${accountCount} accounts`);

  // 5. Find courses owned by this instructor
  const { rows: courses } = await pool.query('SELECT id FROM "Course" WHERE "instructorId" = $1', [user.id]);
  console.log(`  Found ${courses.length} course(s) owned by this instructor`);

  for (const course of courses) {
    // Delete progress for all lessons in this course
    await pool.query(`
      DELETE FROM "Progress" WHERE "lessonId" IN (
        SELECT l.id FROM "Lesson" l
        JOIN "Module" m ON l."moduleId" = m.id
        WHERE m."courseId" = $1
      )
    `, [course.id]);

    // Delete enrollments for this course
    await pool.query('DELETE FROM "Enrollment" WHERE "courseId" = $1', [course.id]);

    // Delete lessons (via modules cascade won't work without cascade, so do it manually)
    await pool.query(`
      DELETE FROM "Lesson" WHERE "moduleId" IN (
        SELECT id FROM "Module" WHERE "courseId" = $1
      )
    `, [course.id]);

    // Delete modules
    await pool.query('DELETE FROM "Module" WHERE "courseId" = $1', [course.id]);

    // Delete the course
    await pool.query('DELETE FROM "Course" WHERE id = $1', [course.id]);
    console.log(`  ✅ Deleted course ${course.id} and all its content`);
  }

  // 6. Finally delete the user
  await pool.query('DELETE FROM "User" WHERE id = $1', [user.id]);
  console.log(`\n✅ User ${email} has been fully deleted.`);

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
