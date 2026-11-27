import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

const FOODS = [
  { name: "Nasi Putih", estimatedCalorie: 130, category: "siang", protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Nasi Goreng", estimatedCalorie: 350, category: "siang", protein: 8, carbs: 45, fat: 14 },
  { name: "Mie Goreng", estimatedCalorie: 400, category: "siang", protein: 10, carbs: 52, fat: 16 },
  { name: "Ayam Goreng", estimatedCalorie: 250, category: "siang", protein: 25, carbs: 5, fat: 15 },
  { name: "Ikan Bakar", estimatedCalorie: 200, category: "siang", protein: 30, carbs: 0, fat: 8 },
  { name: "Sayur Bening", estimatedCalorie: 80, category: "siang", protein: 2, carbs: 10, fat: 2 },
  { name: "Roti Tawar", estimatedCalorie: 70, category: "sarapan", protein: 2.5, carbs: 13, fat: 1 },
  { name: "Omelet", estimatedCalorie: 90, category: "sarapan", protein: 6, carbs: 1, fat: 7 },
  { name: "Kopi Hitam", estimatedCalorie: 5, category: "sarapan", protein: 0.5, carbs: 0, fat: 0 },
  { name: "Teh Manis", estimatedCalorie: 40, category: "sarapan", protein: 0, carbs: 10, fat: 0 },
  { name: "Salad Buah", estimatedCalorie: 60, category: "snack", protein: 1, carbs: 15, fat: 0.2 },
  { name: "Yogurt", estimatedCalorie: 100, category: "snack", protein: 5, carbs: 12, fat: 3 },
  { name: "Kacang Almond", estimatedCalorie: 160, category: "snack", protein: 6, carbs: 6, fat: 14 },
  { name: "Salad Sayur", estimatedCalorie: 120, category: "malam", protein: 3, carbs: 12, fat: 7 },
  { name: "Sup Ayam", estimatedCalorie: 150, category: "malam", protein: 12, carbs: 10, fat: 6 },
];

async function main() {
  await prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    update: {},
    create: {
      id: DEFAULT_USER_ID,
      email: "default@calorie.app",
      name: "User Default",
      passwordHash: "none",
      targetCalorie: 2000,
    },
  });

  await prisma.reminderSetting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  for (const food of FOODS) {
    await prisma.food.upsert({
      where: { id: `seed-${food.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        estimatedCalorie: food.estimatedCalorie,
        category: food.category,
      },
      create: {
        id: `seed-${food.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: food.name,
        estimatedCalorie: food.estimatedCalorie,
        category: food.category,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        imageUrl: null,
      },
    });
  }

  console.log(`Seed berhasil: ${FOODS.length} makanan + user default + reminder default`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });