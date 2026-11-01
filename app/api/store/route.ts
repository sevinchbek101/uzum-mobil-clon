import { NextResponse } from "next/server";
import { getStoreData } from "@/lib/store-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getStoreData());
  } catch (error) {
    console.error("GET /api/store failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Do‘kon ma’lumotlarini yuklab bo‘lmadi." }, { status: 500 });
  }
}
