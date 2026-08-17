import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { parseItemDescription } from "../../../../lib/menu";

interface RecommendRequestBody {
  query?: string;
  category?: string;
  maxBudget?: number;
}

export type DetectedLanguage = "BANGLA" | "BANGLISH" | "ENGLISH";

// 🌐 Smart Language Detector
function detectLanguage(text: string): DetectedLanguage {
  // 1. Check for Bengali Unicode script (\u0980-\u09FF)
  if (/[\u0980-\u09FF]/.test(text)) {
    return "BANGLA";
  }

  // 2. Check for characteristic Banglish keywords & syllables
  const banglishPatterns = [
    /\b(amar|apnar|tumar|tomar|ami|tumi|apni|amra|tora|vai|bhai|apu)\b/i,
    /\b(khabar|khabo|khete|khawa|khai|khida|khide|khidha|khaoa|khawon)\b/i,
    /\b(kemon|kire|ki|kothay|koto|keno|kokhon|kemne|koba)\b/i,
    /\b(lagbe|chai|dao|den|dekhaw|dekhan|bolen|bolo|bolbo|dekhbo)\b/i,
    /\b(ache|achen|nai|nehi|hobe|hobe na|parba|paro|paringa)\b/i,
    /\b(valo|bhalo|kharap|joss|shundor|moja|mojadar|osadharon|pera)\b/i,
    /\b(taka|takar|moddhe|dam|kom|beshi|sosta|dami|budget|poisa)\b/i,
    /\b(jhal|misti|mishti|tok|tel|masala|gorur|khasi|murgi|dim|bhat)\b/i,
    /\b(duijon|2jon|couple|ekjon|nasta|shokal|dupur|rat|raat|bikal)\b/i,
    /\b(dhonnobad|thnx|shabash|shob|kichu|ekhon|pore|kisu)\b/i,
  ];

  const matchCount = banglishPatterns.filter((p) => p.test(text)).length;
  if (matchCount >= 1) {
    return "BANGLISH";
  }

  return "ENGLISH";
}

// Convert Bangla Numerals (০-৯) to English (0-9)
function parseBanglaNumbers(str: string): string {
  const banglaDigits: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };
  return str.replace(/[০-৯]/g, (d) => banglaDigits[d] || d);
}

// Extract budget from natural language (Bangla / Banglish / English)
function extractBudget(text: string): number | null {
  const normalized = parseBanglaNumbers(text.toLowerCase());
  const patterns = [
    /(?:under|below|max|budget|within|kom|moddhe|ভিতরে|মধ্যে|কম)?\s*(?:৳|tk|bdt|taka|টাকা)?\s*(\d{2,4})\s*(?:tk|taka|৳|bdt|takar|টাকা|টাকার|টাকার\s*মধ্যে)?/i,
    /(\d{2,4})\s*(?:taka|tk|৳|bdt|takar\s*moddhe|টাকা|টাকার\s*মধ্যে|টাকার\s*ভিতরে)/i,
    /(?:৳|tk|টাকা)\s*(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (val >= 50 && val <= 5000) {
        return val;
      }
    }
  }
  return null;
}

// 💬 Conversational Small-Talk & Chitchat Detector (understands English, Bangla, and Banglish)
function detectChitchat(query: string): {
  isChitchat: boolean;
  message?: string;
  followUps?: string[];
} {
  const q = query.toLowerCase().trim();

  // 1. Greetings
  if (
    /^(hi|hello|hey|salam|assalamu alaikum|assalamualaikum|hola|ki khobor|sup|heya|yo|good morning|good evening|good afternoon|হাই|হ্যালো|সালাম|আসসালামু আলাইকুম|শুভ সকাল|শুভ সন্ধ্যা)(\s.*)?$/i.test(
      q
    )
  ) {
    return {
      isChitchat: true,
      message:
        "Hello there! 👋 I am your **FoodDrop AI Chef**! I'm feeling great and ready to cook up some amazing food suggestions. What are you in the mood to eat today?",
      followUps: ["Best Biryani & Kacchi 🍛", "Spicy Treats < ৳250 🌶️", "Combo for 2 under ৳500 👫"],
    };
  }

  // 2. How are you / Kemon acho
  if (/how are you|kemon acho|kemon asen|how do you do|valo acho|ki obostha|how r u|kemon cholche|কেমন আছো|কেমন আছেন|ভালো আছো|কি খবর/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "I'm doing fantastic, full of culinary energy and excited to serve! 👨‍🍳🔥 How are you feeling today? Tell me what flavor you're craving — spicy, cheesy, or sweet?",
      followUps: ["I want something spicy 🔥", "Show budget meals 💰", "Couple combo meal 👫"],
    };
  }

  // 3. Identity / Who are you
  if (/who are you|tumi ke|tumar nam ki|what is your name|what can you do|tumi ki korte paro|help me|what are you|তুমি কে|তোমার নাম কি|তুমি কি করতে পারো|সাহায্য করো/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "I'm **FoodDrop AI Chef** 🤖✨ — your smart food assistant! I can help you find dishes by budget (e.g. 'under ৳200'), match cravings in English, Bangla or Banglish (spicy, biryani, burgers), build combos, and even estimate calories! Try asking me anything!",
      followUps: ["Meals under ৳200 💰", "Healthy low-calorie 🥗", "Best Kacchi in town 🍛"],
    };
  }

  // 4. Hunger / Khida lagse
  if (/khida lagse|khide lagse|khida|khide|pete khida|khabar chai|khabar dao|খিদে লাগছে|পেটে খিদে|খাবার চাই|কী খাবো|ক্ষুধা লাগছে/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "Hungry? Don't worry! 🍽️ Here are top satisfying meals ready for fast delivery right to your door:",
      followUps: ["Best Biryani & Kacchi 🍛", "Juicy Burgers 🍔", "Deals under ৳150 💰"],
    };
  }

  // 5. Thank you / Compliments
  if (/thank you|thanks|dhonnobad|thank u|thx|awesome|great job|joss|khub valo|you are great|love you|nice|ধন্যবাদ|থ্যাংকস|অনেক ভালো|অসাধারণ|জোশ/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "You're most welcome! 😊 It's always my pleasure to help you find delicious meals. Whenever hunger strikes, I'm right here with the best picks!",
      followUps: ["Explore popular dishes 🍽️", "Sweet desserts 🍰", "Order something now 🛍️"],
    };
  }

  // 6. Jokes / Humor
  if (/tell me a joke|joke|funny|koutuk|hasao|কৌতুক বলো|মজা করো|হাসাও/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "Why did the tomato blush? Because it saw the salad dressing! 🍅😄 Now tell me, what delicious meal should we order for you today?",
      followUps: ["Juicy Burgers 🍔", "Spicy Kacchi 🍛", "Crispy Fries 🍟"],
    };
  }

  // 7. Farewell / Bye
  if (/bye|goodbye|see you|pore kotha hobe|tata|allah hafez|khoda hafez|বিদায়|বাই|টাটা|আল্লাহ হাফেজ/i.test(q)) {
    return {
      isChitchat: true,
      message:
        "Goodbye for now! 👋 Hope you enjoy a mouth-watering meal. Have a wonderful day and see you soon!",
      followUps: ["Explore Home Page 🏠", "My Orders 📦"],
    };
  }

  return { isChitchat: false };
}

// 🎯 Deep Multilingual Intent Keywords (English, Bangla Script & Banglish)
const INTENT_KEYWORDS: Record<string, string[]> = {
  spicy: [
    "spicy", "jhal", "chilli", "hot", "masala", "crispy", "peppery", "naga", "morich",
    "ঝাল", "স্পাইসি", "নাগা", "মরিচ", "মসলা", "তীব্র ঝাল", "ক্রিস্পি",
  ],
  biryani: [
    "biryani", "kacchi", "dum", "khichuri", "polao", "rice", "tehari", "morog polao", "bhat", "basmati",
    "বিরিয়ানি", "কাচ্চি", "খিচুড়ি", "পোলাও", "তেহারি", "মোরগ পোলাও", "ভাত", "বাসমতী",
  ],
  burger: [
    "burger", "patty", "fast food", "sandwich", "fries", "zinger", "nuggets",
    "বার্গার", "ফাস্টফুড", "স্যান্ডউইচ", "ফ্রাইস", "নাগেটস",
  ],
  pizza: [
    "pizza", "pasta", "italian", "cheese", "crust", "slice", "chowmein", "cheesy",
    "পিজ্জা", "পাস্তা", "চিজি", "চিজ", "ক্রাস্ট", "চাউমিন",
  ],
  healthy: [
    "salad", "soup", "healthy", "diet", "boiled", "vegetable", "fresh", "light", "fruit", "oats", "calorie",
    "সালাদ", "সুপ", "ডায়েট", "হেলদি", "শাকসবজি", "ফলমূল", "হালকা খাবার", "কম তেল",
  ],
  dessert: [
    "dessert", "sweet", "cake", "ice cream", "misti", "mishti", "pudding", "pastry", "waffle", "chocolate", "doi",
    "মিষ্টি", "কেক", "আইসক্রিম", "পুডিং", "পেস্ট্রি", "চকলেট", "দই", "মিষ্টান্ন",
  ],
  drinks: [
    "drink", "beverage", "shake", "smoothie", "coffee", "tea", "juice", "cold", "mojito", "lassi", "borhani", "cha",
    "পানীয়", "জুস", "কফি", "চা", "লাচ্ছি", "বোরহানি", "স্মুদি", "কোল্ড ড্রিংক",
  ],
  meat: [
    "beef", "mutton", "chicken", "meat", "kebab", "gorur", "khasi", "murgi", "steak", "tikka", "grill",
    "গরু", "গরুর মাংস", "খাসি", "মুরগি", "চিকেন", "কাবাব", "গ্রিল", "টিক্কা", "বিফ",
  ],
  budget: [
    "cheap", "budget", "low cost", "sosta", "affordable", "deal", "offer", "discount", "kom dame", "kom taka",
    "বাজেট", "কম খরচে", "সস্তা", "অফার", "ডিসকাউন্ট", "ছাড়", "কম দাম",
  ],
};

// 🥗 Calorie & Nutrition Estimator
function estimateNutrition(name: string, category: string): {
  calories: number;
  protein: string;
  tag: string;
} {
  const lower = `${name} ${category}`.toLowerCase();

  if (lower.includes("biryani") || lower.includes("kacchi") || lower.includes("polao") || lower.includes("বিরিয়ানি")) {
    return { calories: 620, protein: "28g Protein", tag: "Rich & Filling" };
  }
  if (lower.includes("burger") || lower.includes("sandwich") || lower.includes("বার্গার")) {
    return { calories: 480, protein: "22g Protein", tag: "Energy Packed 🍔" };
  }
  if (lower.includes("pizza") || lower.includes("pasta") || lower.includes("পিজ্জা")) {
    return { calories: 380, protein: "16g Protein", tag: "Cheesy Comfort 🧀" };
  }
  if (lower.includes("salad") || lower.includes("soup") || lower.includes("healthy") || lower.includes("diet") || lower.includes("সালাদ")) {
    return { calories: 190, protein: "12g Protein", tag: "Low Calorie 🥗" };
  }
  if (lower.includes("dessert") || lower.includes("cake") || lower.includes("sweet") || lower.includes("মিষ্টি")) {
    return { calories: 280, protein: "6g Protein", tag: "Sweet Treat 🍰" };
  }
  if (lower.includes("drink") || lower.includes("coffee") || lower.includes("juice") || lower.includes("চা")) {
    return { calories: 120, protein: "2g Protein", tag: "Hydrating & Fresh 🥤" };
  }
  if (lower.includes("chicken") || lower.includes("meat") || lower.includes("beef") || lower.includes("মাংস")) {
    return { calories: 510, protein: "32g Protein", tag: "High Protein 🍗" };
  }

  return { calories: 390, protein: "18g Protein", tag: "Balanced Meal" };
}

// 💡 Smart Highlights
function generateAiHighlight(
  item: any,
  originalPrice: number | null,
  detectedIntents: string[]
): string {
  if (originalPrice && originalPrice > item.price) {
    const diff = Math.round(originalPrice - item.price);
    return `🔥 Value Deal: Save ৳${diff} today`;
  }
  if (item.restaurantRating && item.restaurantRating >= 4.8) {
    return "⭐ Top Rated: 97% positive foodie feedback";
  }
  if (detectedIntents.includes("spicy")) {
    return "🌶️ Chef Note: Voted best spicy kick & aroma";
  }
  if (detectedIntents.includes("biryani")) {
    return "🍛 Signature: Slow-cooked dum with tender meat";
  }
  if (detectedIntents.includes("healthy")) {
    return "🥗 Diet Choice: Low oil & nutrient-dense";
  }
  if (item.price <= 200) {
    return "💰 Pocket Friendly: High flavor per Taka";
  }
  return "✨ Chef Pick: Freshly prepared to order";
}

export async function POST(request: Request) {
  try {
    const body: RecommendRequestBody = await request.json();
    const query = (body.query || "").trim();
    const lowerQuery = query.toLowerCase();

    // 1. Check for Conversational Chitchat (Greetings / Small Talk)
    const chitchat = detectChitchat(query);

    // 2. Extract constraints (handles English, Bangla numerals, and Banglish words)
    const detectedBudget = body.maxBudget || extractBudget(query);

    // 3. Detect matching intents
    const detectedIntents = Object.entries(INTENT_KEYWORDS)
      .filter(([_, words]) => words.some((w) => lowerQuery.includes(w)))
      .map(([key]) => key);

    // Detect if user wants a COMBO meal
    const isComboQuery =
      lowerQuery.includes("combo") ||
      lowerQuery.includes("couple") ||
      lowerQuery.includes("2 jon") ||
      lowerQuery.includes("duijon") ||
      lowerQuery.includes("meal for 2") ||
      lowerQuery.includes("package") ||
      lowerQuery.includes("set meal") ||
      lowerQuery.includes("কম্বো") ||
      lowerQuery.includes("২ জন") ||
      lowerQuery.includes("দুইজন") ||
      lowerQuery.includes("দুজনের") ||
      lowerQuery.includes("প্যাকেজ");

    // 4. Fetch available menu items with restaurant & reviews from Prisma
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

    // 5. Score and Rank Items
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
          const budgetRatio = item.price / detectedBudget;
          if (budgetRatio >= 0.5 && budgetRatio <= 1.0) {
            score += 15;
          }
        } else {
          score -= 50;
        }
      }

      // Query word direct matching (skip if pure chitchat)
      if (!chitchat.isChitchat) {
        const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
        for (const word of queryWords) {
          if (itemNameLower.includes(word)) score += 25;
          if (itemCatLower.includes(word)) score += 20;
          if (itemDescLower.includes(word)) score += 10;
        }
      }

      // Intent based matching (handles spicy, biryani, burgers, healthy, etc. in any language)
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
      const restaurantRating =
        reviews.length > 0
          ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
          : 4.8;
      score += restaurantRating * 3;

      const nutrition = estimateNutrition(item.name, item.category || "");
      const highlight = generateAiHighlight(
        { ...item, restaurantRating },
        originalPrice,
        detectedIntents
      );

      return {
        ...item,
        description: cleanDescription,
        originalPrice: originalPrice,
        score,
        restaurantName: item.restaurant?.name || "Popular Restaurant",
        restaurantRating,
        calories: nutrition.calories,
        protein: nutrition.protein,
        macroTag: nutrition.tag,
        aiHighlight: highlight,
      };
    });

    // 👫 6. Smart Combo Pairing Builder (if combo requested)
    let comboMeal: any = null;
    if (isComboQuery) {
      const mains = scoredItems.filter(
        (i) => i.category?.includes("Biryani") || i.category?.includes("Burger") || i.category?.includes("Pizza")
      );
      const sidesOrDrinks = scoredItems.filter(
        (i) => i.category?.includes("Beverages") || i.category?.includes("Dessert") || i.price < 200
      );

      const main1 = mains[0] || scoredItems[0];
      const side = sidesOrDrinks.find((s) => s.id !== main1.id) || scoredItems[1];

      if (main1 && side) {
        const total = main1.price + side.price;
        const comboDiscounted = Math.round(total * 0.9); // 10% AI combo deal

        comboMeal = {
          title: `Smart Duo Feast (${main1.name} + ${side.name})`,
          dishes: [main1, side],
          totalPrice: total,
          comboPrice: comboDiscounted,
          savings: total - comboDiscounted,
          caloriesTotal: main1.calories + side.calories,
        };
      }
    }

    // Sort by highest score first
    const rankedDishes = scoredItems
      .filter((item) => item.score > -20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const finalDishes = rankedDishes.length > 0 ? rankedDishes : scoredItems.slice(0, 3);

    // 7. If query was pure conversational small-talk, return the conversational response!
    if (chitchat.isChitchat && chitchat.message) {
      return NextResponse.json({
        message: chitchat.message,
        dishes: finalDishes.slice(0, 3),
        comboMeal: null,
        followUps: chitchat.followUps || ["Best Biryani 🍛", "Burgers & Fries 🍔", "Deals < ৳150 💰"],
      });
    }

    // 8. Generate Contextual English AI Chef Message
    let aiMessage = "Here are my top culinary recommendations tailored just for you! 👨‍🍳✨";

    if (comboMeal) {
      aiMessage = `🎉 I built a special smart combo pairing for you! Includes main & beverage with an extra 10% combo value:`;
    } else if (detectedBudget && detectedIntents.includes("spicy")) {
      aiMessage = `Craving some heat? 🔥 I picked out the most flavorful spicy dishes under ৳${detectedBudget} with calorie details:`;
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
      aiMessage = "Eating clean & staying healthy? 🥗 Fresh salads, soups, and light meals with low calorie tags:";
    } else if (detectedIntents.includes("dessert") || detectedIntents.includes("drinks")) {
      aiMessage = "Sweet tooth or thirsty? 🍰🥤 Refreshing drinks and delightful desserts to brighten your day:";
    } else if (query.length > 0) {
      aiMessage = `I searched all our active kitchen menus for "${query}" — here are the top recommendations! 🍽️`;
    }

    // Dynamic Follow-up Suggestions
    const followUps: string[] = [];
    if (!isComboQuery) followUps.push("Combo for 2 under ৳500 👫");
    if (!detectedIntents.includes("biryani")) followUps.push("Best Biryani & Kacchi 🍛");
    if (!detectedIntents.includes("spicy")) followUps.push("Spicy snacks under ৳200 🌶️");
    if (!detectedIntents.includes("healthy")) followUps.push("Healthy & Low Calorie 🥗");
    if (!detectedBudget) followUps.push("Budget deals under ৳150 💰");

    return NextResponse.json({
      message: aiMessage,
      dishes: finalDishes,
      comboMeal: comboMeal,
      followUps: followUps.slice(0, 3),
    });
  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json(
      {
        message: "Oops! AI Chef had a small hiccup. Please try again in a moment.",
        dishes: [],
        followUps: [],
      },
      { status: 500 }
    );
  }
}
