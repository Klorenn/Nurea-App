import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.review.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.professional.deleteMany();

  const prof = await prisma.professional.create({
    data: {
      name: "Dra. Nurea Test",
      rut: "12345678-9",
      specialty: "Psiquiatría",
      city: "Temuco",
      priceRange: "$35.000 - $45.000",
      description: "Atención online y presencial, agenda flexible.",
      workDayStart: "09:00",
      workDayEnd: "18:00",
      slotDuration: 30,
    },
  });

  console.log("Profesional creado:", prof.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

