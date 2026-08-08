import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const dummyFoods = [
  // Biryani & Rice
  {
    name: "Special Mutton Kacchi Biryani",
    description: "Tender mutton pieces cooked with aromatic Basmati rice, soft potatoes, and authentic ghee.",
    price: 340,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chicken Dum Biryani",
    description: "Traditional spicy chicken biryani cooked slow-style with rich spices and herbs.",
    price: 240,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Beef Tehari",
    description: "Old Dhaka style aromatic mustard oil beef tehari cooked with small succulent beef chunks.",
    price: 220,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },

  // Fast Food & Burger
  {
    name: "Smokey BBQ Beef Burger",
    description: "Juicy beef patty topped with smoked BBQ sauce, cheddar cheese, and fresh lettuce.",
    price: 290,
    category: "Fast Food & Burger",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Crispy Zinger Chicken Burger",
    description: "Deep-fried crispy spicy chicken fillet served with mayonnaise and sesame bun.",
    price: 210,
    category: "Fast Food & Burger",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Double Cheese Monster Burger",
    description: "Double beef patties loaded with double melted cheese, pickles, and chef's special sauce.",
    price: 420,
    category: "Fast Food & Burger",
    imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Loaded Cheese Fries",
    description: "Crispy French fries smothered in hot liquid cheddar cheese and jalapeños.",
    price: 180,
    category: "Fast Food & Burger",
    imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
  },

  // Pizza & Pasta
  {
    name: "Pepperoni Passion Pizza (12 inch)",
    description: "Classic Italian pizza crust topped with rich tomato sauce, mozzarella, and spicy beef pepperoni.",
    price: 750,
    category: "Pizza & Pasta",
    imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "BBQ Chicken Pizza (12 inch)",
    description: "Topped with smoky BBQ chicken, onions, green peppers, and melted cheese blend.",
    price: 680,
    category: "Pizza & Pasta",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Creamy White Sauce Alfredo Pasta",
    description: "Penne pasta tossed in rich parmesan garlic white sauce with grilled chicken breast.",
    price: 330,
    category: "Pizza & Pasta",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281270?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Spicy Baked Pasta",
    description: "Oven-baked pasta layered with spicy marinara sauce, minced beef, and mozzarella.",
    price: 310,
    category: "Pizza & Pasta",
    imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },

  // Chinese & Thai
  {
    name: "Szechuan Fried Rice",
    description: "Spicy wok-fried rice with eggs, fresh vegetables, and tender chicken bits.",
    price: 250,
    category: "Chinese & Thai",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chili Onion Chicken",
    description: "Crispy chicken tossed with bell peppers, green chilies, and tangy soy glaze.",
    price: 360,
    category: "Chinese & Thai",
    imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Authentic Tom Yum Soup",
    description: "Hot and sour Thai soup with prawns, lemongrass, mushrooms, and kaffir lime leaves.",
    price: 280,
    category: "Chinese & Thai",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
  },

  // Dessert & Bakery
  {
    name: "Sizzling Chocolate Lava Cake",
    description: "Warm chocolate cake with a melting gooey chocolate center, served fresh.",
    price: 160,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "New York Creamy Cheesecake",
    description: "Rich, smooth baked cheesecake on a crunchy graham cracker crust.",
    price: 260,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chocolate Fudgy Brownie",
    description: "Dense and rich chocolate brownie topped with chocolate drizzle.",
    price: 120,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
  },

  // Beverages & Drinks
  {
    name: "Cold Coffee with Ice Cream",
    description: "Blended espresso coffee with chilled milk and a scoop of vanilla ice cream.",
    price: 140,
    category: "Beverages & Drinks",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Fresh Mango Smoothie",
    description: "Thick and refreshing smoothie made from pure sweet mango pulp and yogurt.",
    price: 150,
    category: "Beverages & Drinks",
    imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mint Lemonade Mojito",
    description: "Zesty lemon juice mixed with fresh mint leaves, ice, and sparkling soda.",
    price: 110,
    category: "Beverages & Drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  },
];

async function main() {
  console.log("🚀 Starting database seeding process with hashed passwords...");

  // 🔒 Common Hashed Password for all testing accounts
  const defaultPassword = await bcrypt.hash("12345678", 10);

  // 1. Create Test Customer
  await prisma.user.upsert({
    where: { email: "customer@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Test Customer",
      email: "customer@fooddrop.com",
      password: defaultPassword,
      phone: "01711111111",
      role: "CUSTOMER",
    },
  });

  // 2. Create Restaurant Owners
  const owner1 = await prisma.user.upsert({
    where: { email: "sultan@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Sultan Owner",
      email: "sultan@fooddrop.com",
      password: defaultPassword,
      phone: "01722222222",
      role: "RESTAURANT_OWNER",
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: "pizzahouse@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Mario Rossi",
      email: "pizzahouse@fooddrop.com",
      password: defaultPassword,
      phone: "01733333333",
      role: "RESTAURANT_OWNER",
    },
  });

  // 3. Create Test Rider
  await prisma.user.upsert({
    where: { email: "rider@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Rakib Rider",
      email: "rider@fooddrop.com",
      password: defaultPassword,
      phone: "01744444444",
      role: "RIDER",
      vehicleType: "Motorcycle",
      vehicleNumber: "DHAKA-HA-1234",
      isOnline: true,
    },
  });

  // 4. Create Restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Sultan's Dine & Cafe",
      address: "Dhanmondi 27, Dhaka",
      ownerId: owner1.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Pizza & Burger House",
      address: "Banani Road 11, Dhaka",
      ownerId: owner2.id,
    },
  });

  // 5. Insert 20 Menu Items into Database
  let index = 0;
  for (const food of dummyFoods) {
    const targetRestaurantId = index % 2 === 0 ? restaurant1.id : restaurant2.id;

    await prisma.menuItem.create({
      data: {
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        imageUrl: food.imageUrl,
        restaurantId: targetRestaurantId,
      },
    });
    index++;
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });