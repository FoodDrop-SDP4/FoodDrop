import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';

const fallbackMenuItems = [
  {
    id: 'fallback-1',
    name: 'Classic Burger',
    description: 'Juicy grilled beef burger with fresh toppings.',
    price: 320,
    originalPrice: 400,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'Fast Food & Burger',
    isAvailable: true,
    restaurantId: 'fallback-restaurant',
    restaurant: { reviews: [] },
  },
  {
    id: 'fallback-2',
    name: 'Spicy Biryani',
    description: 'Aromatic rice with tender meat and traditional spices.',
    price: 450,
    originalPrice: null,
    imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80',
    category: 'Biryani & Rice',
    isAvailable: true,
    restaurantId: 'fallback-restaurant',
    restaurant: { reviews: [] },
  },
  {
    id: 'fallback-3',
    name: 'Margherita Pizza',
    description: 'Wood-fired pizza with tomato, mozzarella and basil.',
    price: 390,
    originalPrice: 480,
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza & Pasta',
    isAvailable: true,
    restaurantId: 'fallback-restaurant',
    restaurant: { reviews: [] },
  },
];

const defaultCategoryImages: Record<string, string> = {
  "Biryani & Rice": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
  "Fast Food & Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
  "Pizza & Pasta": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  "Chinese & Thai": "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
  "Dessert & Bakery": "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
  "Beverages & Drinks": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
};

export function parseItemDescription(rawDesc: string | null): { cleanDescription: string; originalPrice: number | null } {
  if (!rawDesc) return { cleanDescription: "", originalPrice: null };
  const match = rawDesc.match(/\[ORIGINAL:([0-9.]+)\]/);
  if (match) {
    const origPrice = parseFloat(match[1]);
    const clean = rawDesc.replace(/\[ORIGINAL:[0-9.]+\]/, "").trim();
    return { cleanDescription: clean, originalPrice: origPrice };
  }
  return { cleanDescription: rawDesc, originalPrice: null };
}

type MenuItemWithReviews = Prisma.MenuItemGetPayload<{
  include: {
    restaurant: {
      include: {
        reviews: true;
      };
    };
  };
}>;

const formatMenuItems = (items: (MenuItemWithReviews | typeof fallbackMenuItems[0])[]) =>
  items.map((item) => {
    const reviews = item.restaurant?.reviews || [];
    const totalReviews = reviews.length;

    let avgRating = 0;
    if (totalReviews > 0) {
      const totalRatingSum = reviews.reduce((sum: number, review) => sum + Number(review.rating || 0), 0);
      avgRating = Number((totalRatingSum / totalReviews).toFixed(1));
    }

    const { cleanDescription, originalPrice } = parseItemDescription(item.description);

    return {
      ...item,
      description: cleanDescription,
      originalPrice: (item as any).originalPrice || originalPrice,
      avgRating: totalReviews > 0 ? avgRating : 0,
      totalReviews,
    };
  });

// 🚀 GET: Fetch Menu items with Real Restaurant Rating & Review Counts
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        restaurant: {
          include: {
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json(formatMenuItems(menuItems), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching menu with reviews:", error);
    return NextResponse.json(formatMenuItems(fallbackMenuItems), { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, originalPrice, imageUrl, category, ownerId } = body; 

    if (!name || !price || !ownerId) {
      return NextResponse.json({ message: 'Missing required fields!' }, { status: 400 });
    }

    let restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: ownerId },
    });

    if (!restaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: 'My Awesome Restaurant',
          address: 'Dhaka, Bangladesh',
          ownerId: ownerId,
        },
      });
    }

    const selectedCategory = category || "Fast Food & Burger";
    const finalImageUrl = (imageUrl && imageUrl.trim().length > 5) 
      ? imageUrl.trim() 
      : (defaultCategoryImages[selectedCategory] || defaultCategoryImages["Fast Food & Burger"]);

    const cleanBaseDesc = description ? description.trim() : "";
    const parsedOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;
    const finalDescription = (parsedOriginalPrice && parsedOriginalPrice > parseFloat(price))
      ? `${cleanBaseDesc} [ORIGINAL:${parsedOriginalPrice}]`.trim()
      : cleanBaseDesc;

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description: finalDescription,
        price: parseFloat(price),
        category: selectedCategory,
        imageUrl: finalImageUrl,
        restaurantId: restaurant.id,
      },
    });

    return NextResponse.json({
      message: 'Food item added successfully!',
      item: {
        ...newItem,
        description: cleanBaseDesc,
        originalPrice: parsedOriginalPrice,
      },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 🚀 খাবারের তথ্য এডিট বা স্টক চেঞ্জ করার API
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, price, originalPrice, category, imageUrl, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ message: 'Menu Item ID is required!' }, { status: 400 });
    }

    let updatedDescription: string | undefined = undefined;
    if (description !== undefined || originalPrice !== undefined || price !== undefined) {
      const existing = await prisma.menuItem.findUnique({ where: { id } });
      const currentDesc = description !== undefined ? description : (existing?.description || "");
      const { cleanDescription } = parseItemDescription(currentDesc);
      
      const currentPrice = price ? parseFloat(price) : (existing?.price || 0);
      const targetOrigPrice = originalPrice !== undefined
        ? (originalPrice ? parseFloat(originalPrice) : null)
        : parseItemDescription(existing?.description || "").originalPrice;

      if (targetOrigPrice && targetOrigPrice > currentPrice) {
        updatedDescription = `${cleanDescription} [ORIGINAL:${targetOrigPrice}]`.trim();
      } else {
        updatedDescription = cleanDescription;
      }
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(updatedDescription !== undefined && { description: updatedDescription }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(imageUrl && { imageUrl }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    const { cleanDescription, originalPrice: parsedOrig } = parseItemDescription(updatedItem.description);

    return NextResponse.json({
      message: 'Menu item updated successfully!',
      item: {
        ...updatedItem,
        description: cleanDescription,
        originalPrice: parsedOrig,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update menu item.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ message: 'Menu Item ID is required!' }, { status: 400 });
    }

    await prisma.orderItem.deleteMany({
      where: { menuItemId: itemId },
    });

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Menu item deleted successfully!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete menu item.' }, { status: 500 });
  }
}