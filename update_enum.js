require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query("UPDATE auction_sessions SET status = 'ACTIVE' WHERE status::text IN ('LIVE', 'UPCOMING', 'PAUSED');");
  console.log(`Updated ${res.rowCount} rows`);
  await client.end();
}
run().catch(console.error);
