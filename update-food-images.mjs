import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const updates = [
  {
    nameMatch: "Payesh",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Khichuri",
    imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Zinger",
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Shorshe Ilish",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Handi Chicken",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Rui Macher",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Shahi Tukda",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  {
    nameMatch: "Cupcakes",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"
  }
];

async function main() {
  try {
    console.log("Updating database food images...");
    for (const u of updates) {
      const items = await prisma.menuItem.findMany({
        where: { name: { contains: u.nameMatch, mode: 'insensitive' } }
      });
      for (const item of items) {
        await prisma.menuItem.update({
          where: { id: item.id },
          data: { imageUrl: u.imageUrl }
        });
        console.log(`Updated ${item.name} with new image.`);
      }
    }
    console.log("All food images updated successfully in DB!");
  } catch (err) {
    console.error("Update error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
