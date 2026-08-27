import "dotenv/config";
import { Pool } from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function main() {
  console.log("Connecting to Supabase PostgreSQL database...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    console.log("Fetching all tables in the public schema...");
    const res = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

    const tables = res.rows.map(r => r.tablename);
    console.log(`Found ${tables.length} tables in public schema:`, tables);

    for (const table of tables) {
      console.log(`Enabling RLS on "${table}"...`);
      await client.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
    }

    console.log("Revoking public PostgREST API access (anon, authenticated) from all public tables...");
    await client.query(`
      REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
      REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
      REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;
    `);

    console.log("✅ Security hardening completed successfully!");
    console.log("Row-Level Security (RLS) is now ENABLED on all tables, and unauthorized PostgREST API access is REVOKED.");
  } catch (err) {
    console.error("❌ Error executing security fix:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
