import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Fallback trending data when DB is unavailable
const FALLBACK_TRENDING = [
  {
    id: 'trend-1',
    name: 'Special Mutton Kacchi Biryani',
    price: 340, originalPrice: 400,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    category: 'Biryani & Rice', restaurantId: 'r1',
    restaurant: { name: "Sultan's Dine & Cafe" },
    avgRating: 5.0, totalReviews: 12, orderCount: 142,
  },
  {
    id: 'trend-2',
    name: 'Smokey BBQ Beef Burger',
    price: 290, originalPrice: 350,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'Fast Food & Burger', restaurantId: 'r2',
    restaurant: { name: 'Pizza & Burger House' },
    avgRating: 4.5, totalReviews: 8, orderCount: 98,
  },
  {
    id: 'trend-3',
    name: 'Pepperoni Passion Pizza (12 inch)',
    price: 750, originalPrice: 850,
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza & Pasta', restaurantId: 'r2',
    restaurant: { name: 'Pizza & Burger House' },
    avgRating: 5.0, totalReviews: 6, orderCount: 87,
  },
  {
    id: 'trend-4',
    name: 'Szechuan Chicken Fried Rice',
    price: 250, originalPrice: 300,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    category: 'Chinese & Thai', restaurantId: 'r3',
    restaurant: { name: 'Dragon House' },
    avgRating: 5.0, totalReviews: 5, orderCount: 76,
  },
  {
    id: 'trend-5',
    name: 'Dark Chocolate Lava Cake',
    price: 160, originalPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'Dessert & Bakery', restaurantId: 'r4',
    restaurant: { name: 'Sweet Bites Bakery' },
    avgRating: 5.0, totalReviews: 4, orderCount: 65,
  },
  {
    id: 'trend-6',
    name: 'Zinger Double Crispy Burger',
    price: 210, originalPrice: 250,
    imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80',
    category: 'Fast Food & Burger', restaurantId: 'r2',
    restaurant: { name: 'Pizza & Burger House' },
    avgRating: 5.0, totalReviews: 5, orderCount: 58,
  },
];

export async function GET() {
  try {
    // Try to get trending items from DB based on order count
    const trendingFromDB = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _count: { menuItemId: true },
      _sum: { price: true },
      orderBy: { _count: { menuItemId: 'desc' } },
      take: 10,
    });

    if (trendingFromDB.length > 0) {
      // Enrich with menu item details
      const menuItemIds = trendingFromDB.map((t) => t.menuItemId);
      const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: menuItemIds }, isAvailable: true },
        include: {
          restaurant: { select: { name: true } },
          reviews: { select: { rating: true } },
        },
      });

      // Sort by original order (trending order)
      const itemMap = new Map(menuItems.map((m) => [m.id, m]));
      const enriched = trendingFromDB
        .map((t) => {
          const item = itemMap.get(t.menuItemId);
          if (!item) return null;
          const ratings = item.reviews.map((r) => r.rating);
          const avgRating = ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 5.0;
          return {
            ...item,
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews: ratings.length,
            orderCount: t._count.menuItemId,
            restaurant: item.restaurant,
          };
        })
        .filter(Boolean);

      return NextResponse.json(enriched);
    }
  } catch (err) {
    // DB not available - use fallback
  }

  return NextResponse.json(FALLBACK_TRENDING);
}
