import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in your environment variables.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const tasks = Array.from({ length: 10 }).map((_, i) => ({
    id: `task-${i + 1}`,
    title: `Task ${i + 1}`,
    completed: i % 2 === 0,
  }));

  // skipDuplicates: true ensures that if a record with the same ID
  // already exists, Prisma will simply ignore it instead of throwing an error.
  const result = await prisma.task.createMany({
    data: tasks,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} new tasks.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
