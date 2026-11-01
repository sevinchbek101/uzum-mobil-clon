import "server-only";

import { env } from "cloudflare:workers";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, orderItems, orders, products, settings } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

const now = () => new Date().toISOString();
const image = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&q=82&auto=format&fit=crop`;

const seedCategories = [
  ["electronics", "Elektronika", "📱"],
  ["clothes", "Kiyim", "👕"],
  ["shoes", "Poyabzal", "👟"],
  ["accessories", "Aksessuarlar", "⌚"],
  ["beauty", "Go‘zallik", "💄"],
  ["home", "Uy-ro‘zg‘or", "🏠"],
] as const;

const seedProducts = [
  ["p1", "Simsiz quloqchinlar, shovqinni pasaytirish", "electronics", 459000, 620000, 4.8, 1243, "photo-1505740420928-5e560c06d30e", "Bluetooth 5.3, 30 soatgacha ishlash, faol shovqin pasaytirish.", 32],
  ["p2", "Smartfon 128 GB, 6.5 dyuym ekran", "electronics", 2899000, 3290000, 4.7, 860, "photo-1511707171634-5f897ff02aa9", "8 GB operativ xotira, 50 MP kamera, 5000 mAh batareya.", 18],
  ["p3", "Noutbuk 14, 16 GB / 512 GB SSD", "electronics", 9490000, null, 4.9, 312, "photo-1517336714731-489689fd1ca8", "Yengil alyumin korpus, ish va o‘qish uchun ideal.", 7],
  ["p4", "Raqamli fotoapparat, retro dizayn", "electronics", 5390000, 5990000, 4.6, 98, "photo-1526170375885-4d8ecf77b99f", "24 MP sensor, 4K video, almashtiriladigan obyektiv.", 5],
  ["p5", "Erkaklar klassik qo‘l soati", "accessories", 389000, 499000, 4.7, 540, "photo-1523275335684-37898b6baf30", "Suvga chidamli, zanglamaydigan po‘lat, charm tasma.", 41],
  ["p6", "Quyoshdan himoya ko‘zoynagi UV400", "accessories", 129000, 190000, 4.5, 721, "photo-1572635196237-14b3f281503f", "Polarizatsiyalangan linzalar, yengil ramka.", 57],
  ["p7", "Sport krossovkalari, qizil", "shoes", 549000, 790000, 4.8, 2011, "photo-1542291026-7eec264c27ff", "Yumshoq taglik, nafas oluvchi to‘r material.", 24],
  ["p8", "Kundalik krossovka, unisex", "shoes", 419000, null, 4.6, 455, "photo-1491553895911-0055eca6402d", "Har kungi kiyish uchun qulay va yengil.", 29],
  ["p9", "Paxta futbolka, oq rang", "clothes", 89000, 129000, 4.7, 3320, "photo-1521572163474-6864f9cf17ab", "100% paxta, S–XXL o‘lchamlar.", 85],
  ["p10", "Ayollar kiyimlari to‘plami", "clothes", 349000, null, 4.4, 187, "photo-1434389677669-e08b4cac3105", "Mavsumiy kolleksiya, yumshoq mato.", 22],
  ["p11", "Atir, gulli-mevali hid, 50 ml", "beauty", 279000, 350000, 4.9, 964, "photo-1585386959984-a4155224a1ad", "Uzoq saqlanuvchi hid, sovg‘a uchun qadoq.", 38],
  ["p12", "Yuz parvarishi to‘plami", "beauty", 199000, null, 4.6, 402, "photo-1556228578-8c89e6adf883", "Tozalovchi, tonik va namlovchi krem.", 31],
  ["p13", "Smart televizor 43 dyuym 4K", "home", 3790000, 4390000, 4.7, 233, "photo-1593359677879-a4bb92f829d1", "Smart TV, HDR10, Wi‑Fi va Bluetooth.", 9],
  ["p14", "Oshxona jihozlari to‘plami", "home", 659000, null, 4.5, 141, "photo-1556909114-f6e7ad7d3136", "Zamonaviy oshxona uchun kerakli jihozlar.", 16],
] as const;

export async function ensureSeeded() {
  const db = getDb();
  const existing = await db.select({ id: categories.id }).from(categories).limit(1);
  if (existing.length) return;
  const timestamp = now();
  await db.batch([
    db.insert(categories).values(seedCategories.map(([id, name, emoji], index) => ({ id, name, emoji, sortOrder: index, createdAt: timestamp }))),
    db.insert(products).values(seedProducts.map(([id, title, categoryId, price, oldPrice, rating, reviews, imageId, description, stock]) => ({
      id, title, categoryId, price, oldPrice, rating, reviews, image: image(imageId), description, stock, active: true, createdAt: timestamp, updatedAt: timestamp,
    }))),
    db.insert(settings).values([
      { key: "storeName", value: "Uzum mobil clon", updatedAt: timestamp },
      { key: "promoTitle", value: "Kuz aksiyasi — 40% gacha chegirma", updatedAt: timestamp },
      { key: "promoSubtitle", value: "Muddatli to‘lov 0% · 12 oy", updatedAt: timestamp },
    ]),
  ]);
}

export async function getStoreData(includeInactive = false) {
  await ensureSeeded();
  const db = getDb();
  const productRows = await db.select().from(products)
    .where(includeInactive ? undefined : eq(products.active, true))
    .orderBy(desc(products.createdAt));
  const categoryRows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  const settingRows = await db.select().from(settings);
  return {
    products: productRows,
    categories: categoryRows,
    settings: Object.fromEntries(settingRows.map((item) => [item.key, item.value])),
  };
}

export function isAdmin(user: ChatGPTUser | null) {
  if (!user) return false;
  const configured = (env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return configured.includes(user.email.toLowerCase()) || (configured.length === 0 && user.email.endsWith("@sites.test"));
}

export async function createOrder(user: ChatGPTUser, input: { customerName: string; phone: string; address: string; items: { productId: string; quantity: number }[] }) {
  await ensureSeeded();
  const db = getDb();
  const ids = [...new Set(input.items.map((item) => item.productId))];
  const available = await db.select().from(products).where(and(inArray(products.id, ids), eq(products.active, true)));
  const mapped = new Map(available.map((product) => [product.id, product]));
  const lines = input.items.map((item) => {
    const product = mapped.get(item.productId);
    if (!product) throw new Error("Mahsulot topilmadi yoki sotuvda emas.");
    if (item.quantity < 1 || item.quantity > product.stock) throw new Error(`${product.title}: yetarli qoldiq yo‘q.`);
    return { product, quantity: item.quantity };
  });
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const id = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const timestamp = now();
  await db.batch([
    db.insert(orders).values({ id, userId: user.userId, customerName: input.customerName, phone: input.phone, address: input.address, status: "new", total, createdAt: timestamp, updatedAt: timestamp }),
    db.insert(orderItems).values(lines.map(({ product, quantity }) => ({ id: crypto.randomUUID(), orderId: id, productId: product.id, title: product.title, image: product.image, price: product.price, quantity }))),
    ...lines.map(({ product, quantity }) => db.update(products).set({ stock: sql`${products.stock} - ${quantity}`, updatedAt: timestamp }).where(and(eq(products.id, product.id), sql`${products.stock} >= ${quantity}`))),
  ]);
  return { id, total, status: "new", createdAt: timestamp };
}

export async function getOrders(userId?: string) {
  await ensureSeeded();
  const db = getDb();
  const orderRows = await db.select().from(orders).where(userId ? eq(orders.userId, userId) : undefined).orderBy(desc(orders.createdAt));
  const itemRows = orderRows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderRows.map((order) => order.id))) : [];
  return orderRows.map((order) => ({ ...order, items: itemRows.filter((item) => item.orderId === order.id) }));
}

export async function getAdminSnapshot() {
  const store = await getStoreData(true);
  return { ...store, orders: await getOrders() };
}

export async function adminAction(action: string, payload: Record<string, unknown>) {
  await ensureSeeded();
  const db = getDb();
  const timestamp = now();
  if (action === "saveProduct") {
    const id = String(payload.id || crypto.randomUUID());
    const values = {
      title: String(payload.title), categoryId: String(payload.categoryId), price: Number(payload.price), oldPrice: payload.oldPrice ? Number(payload.oldPrice) : null,
      image: String(payload.image), description: String(payload.description || ""), stock: Number(payload.stock), active: Boolean(payload.active), updatedAt: timestamp,
    };
    if (!values.title || !values.categoryId || !values.image || values.price < 0 || values.stock < 0) throw new Error("Mahsulot ma’lumotlarini tekshiring.");
    const existing = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
    if (existing.length) await db.update(products).set(values).where(eq(products.id, id));
    else await db.insert(products).values({ id, ...values, rating: 5, reviews: 0, createdAt: timestamp });
  } else if (action === "deleteProduct") {
    await db.delete(products).where(eq(products.id, String(payload.id)));
  } else if (action === "saveCategory") {
    const id = String(payload.id || crypto.randomUUID());
    const value = { name: String(payload.name), emoji: String(payload.emoji || "🛍️") };
    if (!value.name) throw new Error("Kategoriya nomini kiriting.");
    const existing = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
    if (existing.length) await db.update(categories).set(value).where(eq(categories.id, id));
    else await db.insert(categories).values({ id, ...value, sortOrder: 99, createdAt: timestamp });
  } else if (action === "deleteCategory") {
    const id = String(payload.id);
    const used = await db.select({ id: products.id }).from(products).where(eq(products.categoryId, id)).limit(1);
    if (used.length) throw new Error("Bu kategoriyada mahsulotlar bor. Avval ularni boshqa kategoriyaga o‘tkazing.");
    await db.delete(categories).where(eq(categories.id, id));
  } else if (action === "orderStatus") {
    const allowed = ["new", "preparing", "shipping", "completed", "cancelled"];
    if (!allowed.includes(String(payload.status))) throw new Error("Buyurtma holati noto‘g‘ri.");
    await db.update(orders).set({ status: String(payload.status), updatedAt: timestamp }).where(eq(orders.id, String(payload.id)));
  } else if (action === "saveSettings") {
    const entries = ["storeName", "promoTitle", "promoSubtitle"].map((key) => ({ key, value: String(payload[key] || ""), updatedAt: timestamp }));
    for (const item of entries) await db.insert(settings).values(item).onConflictDoUpdate({ target: settings.key, set: { value: item.value, updatedAt: timestamp } });
  } else {
    throw new Error("Noma’lum amal.");
  }
  return getAdminSnapshot();
}
