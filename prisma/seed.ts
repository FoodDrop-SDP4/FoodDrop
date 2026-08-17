import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const restaurantFoods = [
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

  // Beverages & Drinks
  {
    name: "Cold Coffee with Ice Cream",
    description: "Blended espresso coffee with chilled milk and a scoop of vanilla ice cream.",
    price: 140,
    category: "Beverages & Drinks",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mint Lemonade Mojito",
    description: "Zesty lemon juice mixed with fresh mint leaves, ice, and sparkling soda.",
    price: 110,
    category: "Beverages & Drinks",
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
  },
];

// 🏡 Authentic Homemade Dishes
const homemadeFoods = [
  {
    name: "Ammi's Special Beef Bhuna Khichuri",
    description: "Slow-cooked aromatic chinigura rice khichuri paired with spicy homemade tender beef bhuna and egg.",
    price: 260,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Shorshe Ilish with Steamed Rice",
    description: "Authentic Padma Hilsa fish cooked in pure mustard paste, green chilies, and served with hot rice.",
    price: 380,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Handi Chicken Curry & Fluffy Luchi (4 pcs)",
    description: "Homestyle clay pot chicken curry with 4 pieces of puffed deep-fried golden luchi.",
    price: 190,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Rui Macher Jhol with Seasonal Veggies",
    description: "Fresh Rui fish cooked in light homestyle cumin broth with potatoes, cauliflower, and cilantro.",
    price: 180,
    category: "Biryani & Rice",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Homemade Shahi Tukda & Kheer",
    description: "Crispy fried bread soaked in saffron cardamom milk, condensed milk, and topped with pistachios.",
    price: 140,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Freshly Baked Chocolate Fudge Cupcakes (2 pcs)",
    description: "Moist dark chocolate cupcakes with rich home-whipped buttercream frosting.",
    price: 150,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Traditional Nolen Gurer Payesh",
    description: "Authentic winter date jaggery rice pudding prepared with cow milk and crushed dry fruits.",
    price: 130,
    category: "Dessert & Bakery",
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
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

  // 2. Create Commercial Restaurant Owners
  const owner1 = await prisma.user.upsert({
    where: { email: "sultan@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Sultan Ahmed",
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

  // 🏡 3. Create Home Kitchen / Homemade Chefs
  const homeChef1 = await prisma.user.upsert({
    where: { email: "farhana@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Farhana Yasmin",
      email: "farhana@fooddrop.com",
      password: defaultPassword,
      phone: "01755555555",
      role: "RESTAURANT_OWNER",
    },
  });

  const homeChef2 = await prisma.user.upsert({
    where: { email: "shila@fooddrop.com" },
    update: { password: defaultPassword },
    create: {
      name: "Shila Rahman",
      email: "shila@fooddrop.com",
      password: defaultPassword,
      phone: "01766666666",
      role: "RESTAURANT_OWNER",
    },
  });

  // 4. Create Test Rider
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

  // 5. Create Commercial Restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Sultan's Dine & Cafe",
      address: "Dhanmondi 27, Dhaka",
      restaurantType: "RESTAURANT",
      ownerId: owner1.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Pizza & Burger House",
      address: "Banani Road 11, Dhaka",
      restaurantType: "RESTAURANT",
      ownerId: owner2.id,
    },
  });

  // 🏡 6. Create Home Kitchen Entities
  const homeKitchen1 = await prisma.restaurant.create({
    data: {
      name: "Ammi's Kitchen (Farhana's Craft)",
      address: "Sector 4, Uttara, Dhaka",
      restaurantType: "HOMEMADE",
      ownerId: homeChef1.id,
    },
  });

  const homeKitchen2 = await prisma.restaurant.create({
    data: {
      name: "Bake & Cook by Shila",
      address: "Block D, Bashundhara R/A, Dhaka",
      restaurantType: "HOMEMADE",
      ownerId: homeChef2.id,
    },
  });

  // 7. Insert Commercial Restaurant Menu Items
  let index = 0;
  for (const food of restaurantFoods) {
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

  // 🏡 8. Insert Homemade Kitchen Menu Items
  let homeIndex = 0;
  for (const food of homemadeFoods) {
    const targetKitchenId = homeIndex % 2 === 0 ? homeKitchen1.id : homeKitchen2.id;

    await prisma.menuItem.create({
      data: {
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        imageUrl: food.imageUrl,
        restaurantId: targetKitchenId,
      },
    });
    homeIndex++;
  }

  console.log("✅ Seeding with Restaurants & Homemade Kitchens completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });