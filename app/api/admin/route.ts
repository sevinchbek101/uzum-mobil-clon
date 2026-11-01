import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { adminAction, getAdminSnapshot, isAdmin } from "@/lib/store-data";

export const dynamic = "force-dynamic";

async function authorize() {
  const user = await getChatGPTUser();
  return { user, allowed: isAdmin(user) };
}

export async function GET() {
  const auth = await authorize();
  if (!auth.allowed) return NextResponse.json({ error: "Admin ruxsati yo‘q." }, { status: 403 });
  return NextResponse.json(await getAdminSnapshot());
}

export async function POST(request: NextRequest) {
  const auth = await authorize();
  if (!auth.allowed) return NextResponse.json({ error: "Admin ruxsati yo‘q." }, { status: 403 });
  try {
    const body = await request.json() as { action?: string; payload?: Record<string, unknown> };
    if (!body.action) throw new Error("Amal ko‘rsatilmagan.");
    return NextResponse.json(await adminAction(body.action, body.payload ?? {}));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Amal bajarilmadi.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
