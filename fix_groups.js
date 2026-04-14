require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT auction_session_id, item_order, COUNT(*) 
    FROM auction_items 
    GROUP BY auction_session_id, item_order 
    HAVING COUNT(*) > 1;
  `);
  console.log(`Found ${res.rowCount} duplicate auction_items by item_order`);
  
  const res2 = await client.query(`
    SELECT auction_session_id, student_id, COUNT(*) 
    FROM auction_items 
    GROUP BY auction_session_id, student_id 
    HAVING COUNT(*) > 1;
  `);
  console.log(`Found ${res2.rowCount} duplicate auction_items by student_id`);
  
  const res3 = await client.query(`
    SELECT auction_id, session_number, COUNT(*) 
    FROM auction_sessions 
    GROUP BY auction_id, session_number 
    HAVING COUNT(*) > 1;
  `);
  console.log(`Found ${res3.rowCount} duplicate auction_sessions by session_number`);

  await client.end();
}
run().catch(console.error);
