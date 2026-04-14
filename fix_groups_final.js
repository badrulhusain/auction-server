require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query(`DELETE FROM groups;`);
  console.log(`Deleted ${res.rowCount} rows from groups table to clear out unique constraint violation`);
  await client.end();
}
run().catch(console.error);
