import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { senderId, content } = body;

    if (!senderId || !content) {
      return NextResponse.json({ error: "Missing senderId or content" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
