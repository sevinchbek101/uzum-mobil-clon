import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { createOrder, getOrders } from "@/lib/store-data";

export const dynamic = "force-dynamic";

const orderInput = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  address: z.string().trim().min(5).max(300),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
});

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  return NextResponse.json({ orders: await getOrders(user.userId) });
}

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Kirish talab qilinadi." }, { status: 401 });
  try {
    const input = orderInput.parse(await request.json());
    return NextResponse.json({ order: await createOrder(user, input) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Buyurtmani saqlab bo‘lmadi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
