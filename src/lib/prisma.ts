import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma 7 requiere pasar un driver adapter al cliente en vez de tomar la
// connection string directamente del datasource del schema. Ver
// .claude/skills/prisma-database-setup para más contexto.
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

// En desarrollo, Next.js recarga módulos en caliente y crearía un nuevo pool
// de conexiones en cada cambio si no reutilizamos la instancia global.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
