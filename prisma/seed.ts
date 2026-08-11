import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TicketCategory } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = requireEnv("ADMIN_EMAIL");
  const adminPassword = requireEnv("ADMIN_PASSWORD");
  const adminName = process.env.ADMIN_NAME ?? "Administrador";

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash: await hashPassword(adminPassword),
    },
  });
  console.log(`✔ Admin listo: ${admin.email}`);

  const event = await prisma.event.upsert({
    where: { slug: "bingo-bekeff-2026" },
    update: {},
    create: {
      slug: "bingo-bekeff-2026",
      name: "Bingo Bekeff 2026",
      date: new Date("2026-08-29T20:00:00-03:00"),
      location: "Lamroth Hakol, Caseros 1450, Florida, Pcia. de Buenos Aires",
      description:
        "La entrada incluye toda la experiencia del Bingo y los cartones para jugar. Durante la noche vas a poder comprar comidas y bebidas en el buffet.",
      mercadoPagoLink: requireEnv("MERCADO_PAGO_LINK"),
      adultPriceCents: 2_000_000, // $20.000
      minorPriceCents: 1_000_000, // $10.000
      freePriceCents: 0,
      voluntaryAmountsCents: [500_000, 1_000_000, 2_000_000], // $5.000 / $10.000 / $20.000
    },
  });
  console.log(`✔ Evento listo: ${event.name} (${event.slug})`);

  for (const category of Object.values(TicketCategory)) {
    await prisma.ticketSequence.upsert({
      where: { eventId_category: { eventId: event.id, category } },
      update: {},
      create: { eventId: event.id, category, lastNumber: 0 },
    });
  }
  console.log("✔ Secuencias de numeración listas (ADULT/MINOR/FREE)");
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} para poder seedear la base.`);
  }
  return value;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
