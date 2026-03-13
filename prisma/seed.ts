import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding solo user...");

  const user = await prisma.user.upsert({
    where: { email: "athlete@brick.local" },
    update: {},
    create: {
      id: "cld_solo_user_placeholder",
      email: "athlete@brick.local",
      name: "Solo Athlete",
      experienceLevel: "INTERMEDIATE",
      preferredDistUnit: "km",
      preferredPaceUnit: "min/km",
      timezone: "America/New_York",
    },
  });

  console.log(`Solo user ready: ${user.id} (${user.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
