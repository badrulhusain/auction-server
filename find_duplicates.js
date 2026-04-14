require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  // List all unique constraints to see if (key, value) applies to something else
  const res = await client.query(`
    SELECT
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM
      information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'UNIQUE' AND kcu.column_name IN ('key', 'value');
  `);
  console.log('Unique constraints on key/value columns:');
  console.table(res.rows);
  await client.end();
}
run().catch(console.error);
