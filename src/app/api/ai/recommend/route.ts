import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseItemDescription } from "../../../../lib/menu";

interface RecommendRequestBody {
  query?: string;
  category?: string;
  maxBudget?: number;
}

// Extract budget from natural language (Bangla / Banglish / English)
function extractBudget(text: string): number | null {
  // Matches: 200 taka, ৳250, tk 300, under 150, 200 tk, 250 takar moddhe, budget 300
  const patterns = [
    /(?:under|below|max|budget|within|kom|moddhe)?\s*(?:৳|tk|bdt|taka)?\s*(\d{2,4})\s*(?:tk|taka|৳|bdt|takar)?/i,
    /(\d{2,4})\s*(?:taka|tk|৳|bdt|takar\s*moddhe)/i,
    /(?:৳|tk)\s*(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (val >= 50 && val <= 5000) {
        return val;
      }
    }
  }
  return null;
}

// Keyword categories for deep intent recognition
const INTENT_KEYWORDS: Record<string, string[]> = {
  spicy: ["spicy", "jhal", "chilli", "hot", "masala", "crispy", "peppery", "naga"],
  biryani: ["biryani", "kacchi", "dum", "khichuri", "polao", "rice", "tehari", "morog polao"],
  burger: ["burger", "patty", "fast food", "sandwich", "fries", "zinger"],
  pizza: ["pizza", "pasta", "italian", "cheese", "crust", "slice"],
  healthy: ["salad", "soup", "healthy", "diet", "boiled", "vegetable", "fresh", "light", "fruit"],
  dessert: ["dessert", "sweet", "cake", "ice cream", "misti", "pudding", "pastry", "waffle", "chocolate"],
  drinks: ["drink", "beverage", "shake", "smoothie", "coffee", "tea", "juice", "cold", "mojito", "lassi"],
  meat: ["beef", "mutton", "chicken", "meat", "kebab", "gorur", "khasi", "murgi", "steak"],
  budget: ["cheap", "budget", "low cost", "sosta", "affordable", "deal", "offer", "discount"],
};

export async function POST(request: Request) {
  try {
    const body: RecommendRequestBody = await request.json();
    const query = (body.query || "").trim();
    const lowerQuery = query.toLowerCase();

    // 1. Extract constraints
    const detectedBudget = body.maxBudget || extractBudget(query);

    // 2. Detect matching intents
    const detectedIntents = Object.entries(INTENT_KEYWORDS)
      .filter(([_, words]) => words.some((w) => lowerQuery.includes(w)))
      .map(([key]) => key);

    // 3. Fetch available menu items with restaurant & reviews from Prisma
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        restaurant: {
          include: {
            reviews: true,
          },
        },
      },
    });

    if (!menuItems || menuItems.length === 0) {
      return NextResponse.json({
        message: "I couldn't find any active dishes in the kitchen right now. Please try again soon!",
        dishes: [],
        followUps: ["Explore popular restaurants", "Check all menu items"],
      });
    }

    // 4. Score and Rank Items
    const scoredItems = menuItems.map((item) => {
      let score = 0;
      const { cleanDescription, originalPrice } = parseItemDescription(item.description);
      const itemNameLower = item.name.toLowerCase();
      const itemDescLower = cleanDescription.toLowerCase();
      const itemCatLower = (item.category || "").toLowerCase();

      // Budget filter scoring
      if (detectedBudget) {
        if (item.price <= detectedBudget) {
          score += 30;
          // Closer to budget gets nice efficiency bonus
          const budgetRatio = item.price / detectedBudget;
          if (budgetRatio >= 0.5 && budgetRatio <= 1.0) {
            score += 15;
          }
        } else {
          // Penalty if exceeds budget
          score -= 50;
        }
      }

      // Query word direct matching
      const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
      for (const word of queryWords) {
        if (itemNameLower.includes(word)) score += 25;
        if (itemCatLower.includes(word)) score += 20;
        if (itemDescLower.includes(word)) score += 10;
      }

      // Intent based matching
      for (const intent of detectedIntents) {
        const keywords = INTENT_KEYWORDS[intent] || [];
        for (const kw of keywords) {
          if (itemNameLower.includes(kw)) score += 20;
          if (itemDescLower.includes(kw)) score += 12;
          if (itemCatLower.includes(kw)) score += 15;
        }
      }

      // Promotional Discount Bonus
      if (originalPrice && originalPrice > item.price) {
        score += 10;
      }

      // Restaurant Rating bonus
      const reviews = item.restaurant?.reviews || [];
      if (reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
        score += avg * 3;
      }

      return {
        ...item,
        description: cleanDescription,
        originalPrice: originalPrice,
        score,
        restaurantName: item.restaurant?.name || "Popular Restaurant",
        restaurantRating: reviews.length > 0
          ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 4.8,
      };
    });

    // Sort by highest score first
    const rankedDishes = scoredItems
      .filter((item) => item.score > -20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Fallback if no strong match: take top rated/discounted
    const finalDishes = rankedDishes.length > 0 ? rankedDishes : scoredItems.slice(0, 4);

    // 5. Generate contextual, friendly AI Chef response message
    let aiMessage = "Here are my top culinary recommendations tailored just for you! 👨‍🍳✨";

    if (detectedBudget && detectedIntents.includes("spicy")) {
      aiMessage = `Craving some heat? 🔥 I picked out the most flavorful spicy dishes under ৳${detectedBudget} for you:`;
    } else if (detectedBudget && detectedIntents.includes("biryani")) {
      aiMessage = `Biryani lovers rejoice! 🍛 Here are authentic, aromatic biryanis within your ৳${detectedBudget} budget:`;
    } else if (detectedBudget) {
      aiMessage = `Great budget choice! 💰 Here are the tastiest dishes you can enjoy for under ৳${detectedBudget}:`;
    } else if (detectedIntents.includes("spicy")) {
      aiMessage = "Looking for something spicy & punchy? 🔥 Check out these hot favorites from our top kitchens:";
    } else if (detectedIntents.includes("biryani")) {
      aiMessage = "Nothing beats the royal aroma of Kacchi & Biryani! 🍛 Here are the highest rated plates:";
    } else if (detectedIntents.includes("burger")) {
      aiMessage = "Juicy burgers and crispy fast-food coming right up! 🍔🍟 Here are our chef's top picks:";
    } else if (detectedIntents.includes("pizza")) {
      aiMessage = "Cheesy goodness! 🍕 Freshly baked pizzas and pasta ready to satisfy your craving:";
    } else if (detectedIntents.includes("healthy")) {
      aiMessage = "Eating clean & staying healthy? 🥗 Fresh salads, soups, and light meals just for you:";
    } else if (detectedIntents.includes("dessert") || detectedIntents.includes("drinks")) {
      aiMessage = "Sweet tooth or thirsty? 🍰🥤 Refreshing drinks and delightful desserts to brighten your day:";
    } else if (query.length > 0) {
      aiMessage = `I searched all our active kitchen menus for "${query}" — here are the top recommendations! 🍽️`;
    }

    // Dynamic Follow-up Suggestions
    const followUps: string[] = [];
    if (!detectedIntents.includes("biryani")) followUps.push("Best Biryani & Kacchi 🍛");
    if (!detectedIntents.includes("spicy")) followUps.push("Spicy snacks under ৳200 🌶️");
    if (!detectedIntents.includes("burger")) followUps.push("Juicy Burgers & Pizza 🍔");
    if (!detectedIntents.includes("healthy")) followUps.push("Healthy & Low Calorie 🥗");
    if (!detectedBudget) followUps.push("Budget deals under ৳150 💰");

    return NextResponse.json({
      message: aiMessage,
      dishes: finalDishes,
      followUps: followUps.slice(0, 3),
    });
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json(
      { message: "Oops! AI Chef had a small hiccup. Please try again in a moment.", dishes: [], followUps: [] },
      { status: 500 }
    );
  }
}
