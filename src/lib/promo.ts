export interface PromoCode {
  code: string;
  description: string;
  type: "FLAT" | "PERCENTAGE" | "FREE_DELIVERY";
  discountAmount?: number;
  discountPercentage?: number;
  maxDiscount?: number;
  minOrderAmount: number;
}

export const AVAILABLE_PROMOS: PromoCode[] = [
  {
    code: "FOODDROP50",
    description: "৳50 flat discount on your meal",
    type: "FLAT",
    discountAmount: 50,
    minOrderAmount: 150,
  },
  {
    code: "SAVE100",
    description: "৳100 off on orders above ৳300",
    type: "FLAT",
    discountAmount: 100,
    minOrderAmount: 300,
  },
  {
    code: "FIRSTBITE",
    description: "20% off on your delicious order",
    type: "PERCENTAGE",
    discountPercentage: 20,
    maxDiscount: 120,
    minOrderAmount: 200,
  },
  {
    code: "FREEDEL",
    description: "100% Free Delivery discount (৳60 off)",
    type: "FREE_DELIVERY",
    discountAmount: 60,
    minOrderAmount: 100,
  },
];

export interface PromoCalculationResult {
  isValid: boolean;
  message: string;
  discount: number;
  promoCode?: PromoCode;
}

export function calculatePromoDiscount(
  rawCode: string,
  subtotal: number,
  deliveryFee: number
): PromoCalculationResult {
  const cleanCode = rawCode.trim().toUpperCase();
  const promo = AVAILABLE_PROMOS.find((p) => p.code === cleanCode);

  if (!promo) {
    return {
      isValid: false,
      message: "Invalid promo code. Please try another one.",
      discount: 0,
    };
  }

  if (subtotal < promo.minOrderAmount) {
    return {
      isValid: false,
      message: `Minimum order amount of ৳${promo.minOrderAmount} required for ${promo.code}.`,
      discount: 0,
    };
  }

  let calculatedDiscount = 0;

  if (promo.type === "FLAT") {
    calculatedDiscount = promo.discountAmount || 0;
  } else if (promo.type === "FREE_DELIVERY") {
    calculatedDiscount = deliveryFee;
  } else if (promo.type === "PERCENTAGE") {
    const rawDiscount = (subtotal * (promo.discountPercentage || 0)) / 100;
    calculatedDiscount = promo.maxDiscount
      ? Math.min(rawDiscount, promo.maxDiscount)
      : rawDiscount;
  }

  // Ensure discount does not exceed subtotal + deliveryFee
  calculatedDiscount = Math.min(calculatedDiscount, subtotal + deliveryFee);

  return {
    isValid: true,
    message: `Promo code ${promo.code} applied successfully!`,
    discount: Math.round(calculatedDiscount),
    promoCode: promo,
  };
}
