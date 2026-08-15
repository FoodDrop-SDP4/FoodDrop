"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Bot,
  X,
  Send,
  Loader2,
  Plus,
  Check,
  Flame,
  Star,
  ShoppingBag,
  RotateCcw,
  Store,
  ChevronRight,
  MessageSquare,
  Zap,
  Layers,
  Heart,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { triggerConfetti } from "../../lib/confetti";
import { playAddToCartSound } from "../../lib/sound";

interface DishSuggestion {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  imageUrl: string;
  category: string;
  restaurantId: string;
  restaurantName: string;
  restaurantRating?: number;
  calories?: number;
  protein?: string;
  macroTag?: string;
  aiHighlight?: string;
}

interface ComboMeal {
  title: string;
  dishes: DishSuggestion[];
  totalPrice: number;
  comboPrice: number;
  savings: number;
  caloriesTotal: number;
}

interface ChatMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  dishes?: DishSuggestion[];
  comboMeal?: ComboMeal | null;
  followUps?: string[];
  timestamp: string;
}

// ⏰ 4. Time-Aware Context Helper
function getTimeGreeting(): { greeting: string; periodText: string; prompts: { label: string; query: string }[] } {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      greeting: "Good Morning! ☀️",
      periodText: "Start your day with healthy breakfast & fresh juices",
      prompts: [
        { label: "Healthy Breakfast 🥗", query: "healthy breakfast and light meals" },
        { label: "Fresh Juices & Tea ☕", query: "fresh juices coffee and tea" },
        { label: "Budget Deals < ৳150 💰", query: "budget meals under 150 taka" },
        { label: "Spicy Bites 🌶️", query: "spicy snacks under 200 taka" },
      ],
    };
  } else if (hour >= 11 && hour < 16) {
    return {
      greeting: "Lunchtime Specials! 🍛",
      periodText: "Explore hot Biryanis, Rice bowls & hearty meals",
      prompts: [
        { label: "Best Biryani & Kacchi 🍛", query: "popular biryani kacchi" },
        { label: "Combo for 2 < ৳500 👫", query: "couple combo meal for 2" },
        { label: "Spicy Treats < ৳250 🌶️", query: "spicy food under 250 taka" },
        { label: "Juicy Burgers 🍔", query: "best burgers and fries" },
      ],
    };
  } else if (hour >= 16 && hour < 20) {
    return {
      greeting: "Evening Snack Break! ☕",
      periodText: "Hot coffee, crispy fries & delicious quick bites",
      prompts: [
        { label: "Crispy Snacks & Fries 🍟", query: "crispy snacks and fast food" },
        { label: "Burgers & Pizza 🍕", query: "best pizza and burgers" },
        { label: "Sweet Desserts 🍰", query: "sweet desserts and pastries" },
        { label: "Combo Deal for 2 👫", query: "combo meal for 2" },
      ],
    };
  } else {
    return {
      greeting: "Late Night Cravings! 🌙",
      periodText: "Hungry after-hours? Fast delivery & midnight munchies",
      prompts: [
        { label: "Late Night Burgers 🍔", query: "juicy burgers and fast food" },
        { label: "Midnight Biryani 🍛", query: "kacchi biryani under 350 taka" },
        { label: "Spicy Treats < ৳200 🌶️", query: "spicy snacks under 200 taka" },
        { label: "Combo for 2 👫", query: "combo meal for 2 under 500 taka" },
      ],
    };
  }
}

export default function FoodieAIAssistant() {
  const pathname = usePathname();
  const { addToCart, openCart } = useCartStore();

  const timeContext = useMemo(() => getTimeGreeting(), []);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "AI",
      text: `${timeContext.greeting} 👨‍🍳 I'm your **FoodDrop AI Chef**. ${timeContext.periodText}. Tell me what you crave or pick a recommendation:`,
      followUps: [
        "Combo for 2 under ৳500 👫",
        "Best Biryani & Kacchi 🍛",
        "Spicy Deals < ৳250 🌶️",
      ],
      timestamp: "Just now",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedDishIds, setAddedDishIds] = useState<Record<string, boolean>>({});
  const [addedComboId, setAddedComboId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // Hide AI Assistant on specialized management portals
  const isExcludedRoute =
    pathname?.startsWith("/restaurant") ||
    pathname?.startsWith("/rider") ||
    pathname?.startsWith("/checkout");

  if (isExcludedRoute) {
    return null;
  }

  // Handle Query Submission
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "USER",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "AI",
          text: data.message || "Here are my recommendations for you!",
          dishes: data.dishes || [],
          comboMeal: data.comboMeal || null,
          followUps: data.followUps || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-err-${Date.now()}`,
            sender: "AI",
            text: "I couldn't fetch dishes right now. Please try again!",
            timestamp: "Just now",
          },
        ]);
      }
    } catch (err) {
      console.error("AI Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "AI",
          text: "Something went wrong. Let's try another craving!",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add single dish to cart
  const handleAddToCartFromAI = (dish: DishSuggestion) => {
    playAddToCartSound();
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      imageUrl: dish.imageUrl,
      quantity: 1,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
    });

    triggerConfetti();

    setAddedDishIds((prev) => ({ ...prev, [dish.id]: true }));
    setTimeout(() => {
      setAddedDishIds((prev) => ({ ...prev, [dish.id]: false }));
    }, 2000);
  };

  // 👫 3. Add Entire Combo Meal to Cart
  const handleAddComboToCart = (combo: ComboMeal) => {
    playAddToCartSound();
    combo.dishes.forEach((dish) => {
      addToCart({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        imageUrl: dish.imageUrl,
        quantity: 1,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
      });
    });

    triggerConfetti();
    setAddedComboId(combo.title);
    setTimeout(() => {
      setAddedComboId(null);
    }, 2500);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "AI",
        text: `Chat reset! 👨‍🍳 What would you like to explore now?`,
        followUps: [
          "Combo for 2 under ৳500 👫",
          "Best Biryani & Kacchi 🍛",
          "Budget Deals < ৳150 💰",
        ],
        timestamp: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* 🚀 1. Floating Glowing Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 animate-in fade-in zoom-in-90 duration-300">
          <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-2.5 shadow-xl backdrop-blur border border-orange-200 text-xs font-black text-slate-800 animate-bounce">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
            <span>Hungry? Ask AI Chef! 🤖</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-2xl shadow-orange-600/50 transition-all duration-300 hover:scale-110 active:scale-95 ring-4 ring-orange-500/20"
            title="Ask Foodie AI Chef"
          >
            <Sparkles className="h-6 w-6 text-amber-200 animate-spin-slow transition group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* 🚀 2. Glassmorphic AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-[640px] max-h-[90vh] w-[95vw] sm:w-[450px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 shadow-md">
                <Bot className="h-5 w-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-wide">FoodDrop AI Chef</h3>
                  <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-orange-400 border border-orange-500/30">
                    Smart Recommender
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{timeContext.greeting} • Personalized Food Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Restart Conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                title="Close AI Assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ⏰ Time-Aware Quick Preset Prompts Bar */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 overflow-x-auto flex gap-1.5 no-scrollbar">
            {timeContext.prompts.map((prompt) => (
              <button
                key={prompt.label}
                onClick={() => handleSendQuery(prompt.query)}
                className="shrink-0 rounded-xl bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs border border-slate-200/80 hover:border-orange-500 hover:text-orange-600 transition active:scale-95"
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "USER" ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[92%]">
                  {msg.sender === "AI" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-xs">
                      👨‍🍳
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "USER"
                        ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-br-none shadow-md shadow-orange-600/20 font-medium"
                        : "bg-white text-slate-800 shadow-sm border border-slate-200/80 rounded-bl-none font-normal"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* 👫 3. Smart Combo Meal Pairing Box */}
                    {msg.comboMeal && (
                      <div className="mt-3 overflow-hidden rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white text-[10px]">
                              👫
                            </span>
                            <h4 className="font-black text-orange-950 text-xs">
                              {msg.comboMeal.title}
                            </h4>
                          </div>
                          <span className="rounded-full bg-orange-600 text-white text-[9px] font-black px-2 py-0.5">
                            Save ৳{msg.comboMeal.savings}
                          </span>
                        </div>

                        {/* Combo Items */}
                        <div className="divide-y divide-orange-200/60 bg-white rounded-xl p-2 border border-orange-100">
                          {msg.comboMeal.dishes.map((cd) => (
                            <div key={cd.id} className="flex items-center justify-between py-1.5 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                                <span className="font-bold text-slate-800 truncate max-w-[170px]">{cd.name}</span>
                              </div>
                              <span className="font-mono text-slate-600">৳{cd.price}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 line-through mr-1">
                              ৳{msg.comboMeal.totalPrice}
                            </span>
                            <span className="text-sm font-black text-orange-600">
                              ৳{msg.comboMeal.comboPrice}
                            </span>
                            <span className="text-[9px] text-slate-500 block">
                              🔥 ~{msg.comboMeal.caloriesTotal} kcal (Complete Pair)
                            </span>
                          </div>

                          <button
                            onClick={() => msg.comboMeal && handleAddComboToCart(msg.comboMeal)}
                            className={`flex items-center gap-1 rounded-xl px-3.5 py-2 text-[11px] font-bold text-white shadow-md transition active:scale-95 ${
                              addedComboId === msg.comboMeal.title
                                ? "bg-emerald-600"
                                : "bg-orange-600 hover:bg-orange-700 shadow-orange-600/30"
                            }`}
                          >
                            {addedComboId === msg.comboMeal.title ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Combo Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-3.5 w-3.5" />
                                <span>Add Entire Combo</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Embedded Food Recommendation Cards */}
                    {msg.dishes && msg.dishes.length > 0 && (
                      <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-100">
                        {msg.dishes.map((dish) => {
                          const isAdded = addedDishIds[dish.id];
                          const discountPercent =
                            dish.originalPrice && dish.originalPrice > dish.price
                              ? Math.round(((dish.originalPrice - dish.price) / dish.originalPrice) * 100)
                              : null;

                          return (
                            <div
                              key={dish.id}
                              className="group flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5 transition hover:bg-orange-50/40 hover:border-orange-200"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {dish.imageUrl && (
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                                      <img
                                        src={dish.imageUrl}
                                        alt={dish.name}
                                        className="h-full w-full object-cover group-hover:scale-105 transition"
                                      />
                                      {discountPercent && (
                                        <span className="absolute top-0.5 left-0.5 rounded-md bg-rose-600 px-1 py-0.2 text-[8px] font-black text-white">
                                          -{discountPercent}%
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 truncate text-xs">{dish.name}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                                      <span className="truncate">{dish.restaurantName}</span>
                                      <span>•</span>
                                      <span className="flex items-center text-amber-500 font-bold">
                                        ⭐ {dish.restaurantRating || 4.8}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="font-black text-slate-900 text-xs">৳{dish.price}</span>
                                      {dish.originalPrice && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          ৳{dish.originalPrice}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleAddToCartFromAI(dish)}
                                  className={`shrink-0 flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold transition shadow-sm ${
                                    isAdded
                                      ? "bg-emerald-600 text-white"
                                      : "bg-orange-600 text-white hover:bg-orange-700 active:scale-95"
                                  }`}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="h-3.5 w-3.5" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="h-3.5 w-3.5" />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* 🔥 2. AI Calorie & Nutrition + 💡 5. "Why AI Picked This" Highlights */}
                              <div className="flex flex-wrap items-center justify-between gap-1 pt-1.5 border-t border-slate-200/60 text-[10px]">
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <span className="rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.5 font-bold">
                                    🔥 ~{dish.calories || 450} kcal
                                  </span>
                                  <span>{dish.protein || "20g Protein"}</span>
                                </div>

                                {dish.aiHighlight && (
                                  <span className="text-orange-700 font-bold truncate max-w-[200px]">
                                    {dish.aiHighlight}
                                  </span>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow-up Question Chips */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <div className="mt-2 ml-9 flex flex-wrap gap-1.5">
                    {msg.followUps.map((fu, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendQuery(fu)}
                        className="rounded-lg bg-orange-50 border border-orange-200 px-2 py-1 text-[10px] font-bold text-orange-700 hover:bg-orange-100 transition"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                )}

                <span className="mt-1 text-[9px] text-slate-400 px-2">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 text-xs">
                  👨‍🍳
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="border-t border-slate-200 bg-white p-3 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. 200 takar moddhe biryani or combo for 2..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium outline-none focus:border-orange-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>

        </div>
      )}
    </>
  );
}
