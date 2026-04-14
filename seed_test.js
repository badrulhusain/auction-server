require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const admin = await prisma.admin.create({
    data: { id: "admin-1", name: "Test Admin", email: "admin@test.com", username: "admin", password_hash: "hash" }
  });
  const auction1 = await prisma.auction.create({
    data: { id: "12345", name: "Auction 1", auction_type: "ENGLISH", created_by: admin.id }
  });
  const auction2 = await prisma.auction.create({
    data: { id: "67890", name: "Auction 2", auction_type: "DRAFT", created_by: admin.id }
  });
  
  console.log('Seeded DB with Auctions');
  await prisma.$disconnect();
}
run().catch(console.error);
