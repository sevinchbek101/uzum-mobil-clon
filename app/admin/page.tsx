import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { getAdminSnapshot, isAdmin } from "@/lib/store-data";
import Link from "next/link";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  if (!isAdmin(user)) {
    return <main className="grid min-h-dvh place-items-center bg-zinc-100 p-6"><section className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl"><p className="text-4xl">🔒</p><h1 className="mt-4 text-2xl font-black">Admin ruxsati yo‘q</h1><p className="mt-2 text-sm text-zinc-500">{user.email} hisobiga admin huquqi berilmagan. ADMIN_EMAILS sozlamasini tekshiring.</p><Link href="/" className="mt-5 inline-block rounded-xl bg-violet-700 px-5 py-3 font-bold text-white">Do‘konga qaytish</Link></section></main>;
  }
  return <AdminClient initial={await getAdminSnapshot()} userName={user.displayName}/>;
}
