/**
 * Export database schema structure
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import postgres from 'postgres';

config({ path: resolve(process.cwd(), '.env.local') });

const sql = postgres(process.env.DATABASE_URL!);

async function exportSchema() {
  try {
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('Tables in database:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));

    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

exportSchema();
