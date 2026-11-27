import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.food.createMany({
    skipDuplicates: true,
    data: [
      { name: "Nasi Putih", estimatedCalorie: 130, category: "siang", imageUrl: null },
      { name: "Nasi Goreng", estimatedCalorie: 350, category: "siang", imageUrl: null },
      { name: "Mie Goreng", estimatedCalorie: 400, category: "siang", imageUrl: null },
      { name: "Ayam Goreng", estimatedCalorie: 250, category: "siang", imageUrl: null },
      { name: "Ikan Bakar", estimatedCalorie: 200, category: "siang", imageUrl: null },
      { name: "Sayur Bening", estimatedCalorie: 80, category: "siang", imageUrl: null },
      { name: "Roti Tawar", estimatedCalorie: 70, category: "sarapan", imageUrl: null },
      { name: "Omelet", estimatedCalorie: 90, category: "sarapan", imageUrl: null },
      { name: "Kopi Hitam", estimatedCalorie: 5, category: "sarapan", imageUrl: null },
      { name: "Teh Manis", estimatedCalorie: 40, category: "sarapan", imageUrl: null },
      { name: "Salad Buah", estimatedCalorie: 60, category: "snack", imageUrl: null },
      { name: "Yogurt", estimatedCalorie: 100, category: "snack", imageUrl: null },
      { name: "Kacang Almond", estimatedCalorie: 160, category: "snack", imageUrl: null },
      { name: "Salad Sayur", estimatedCalorie: 120, category: "malam", imageUrl: null },
      { name: "Sup Ayam", estimatedCalorie: 150, category: "malam", imageUrl: null },
    ],
  })

  console.log("Seed berhasil: data makanan awal telah ditambahkan")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
