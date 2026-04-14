import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const existing = await prisma.student.findUnique({
      where: { 
        auction_id_reg_no: { 
          auction_id: '67890', 
          reg_no: '2024-001' 
        } 
      }
  });
  console.log('existing:', existing);
  await prisma.$disconnect();
}
run();
