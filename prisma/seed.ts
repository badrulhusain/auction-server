import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    const saltOrRounds = 10;

    // 1. Create a dummy Admin
    const adminPassword = await bcrypt.hash('password123', saltOrRounds);
    const admin = await prisma.admin.upsert({
        where: { username: 'admin123' },
        update: {},
        create: {
            username: 'admin123',
            email: 'admin@bidsphere.com',
            name: 'Super Admin',
            password_hash: adminPassword,
        },
    });

    // 2. Create a dummy Auction (required for Team creation)
    const auction = await prisma.auction.create({
        data: {
            name: 'Test Auction 2026',
            auction_type: 'ENGLISH',
            created_by: admin.id,
        }
    });

    // 3. Create a dummy Team
    const teamPassword = await bcrypt.hash('team_password!', saltOrRounds);
    const team = await prisma.team.upsert({
        where: { username: 'team_alpha' },
        update: {},
        create: {
            username: 'team_alpha',
            name: 'Team Alpha',
            password_hash: teamPassword,
            total_budget: 100000.00,
            auction_id: auction.id,
        },
    });

    console.log('--- SEED SUCCESS ---');
    console.log('ADMIN UUID FOR LOGOUT:', admin.id);
    console.log('TEAM UUID FOR LOGOUT:', team.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
