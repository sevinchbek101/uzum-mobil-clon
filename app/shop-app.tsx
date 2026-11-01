"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Grid2X2, Heart, Home, MapPin, Minus, Package, Plus, Search, ShoppingBag, Star, Trash2, UserRound, X } from "lucide-react";

type Product = { id: string; title: string; categoryId: string; price: number; oldPrice: number | null; rating: number; reviews: number; image: string; description: string; stock: number; active: boolean };
type Category = { id: string; name: string; emoji: string };
type StoreData = { products: Product[]; categories: Category[]; settings: Record<string, string> };
type CartLine = { productId: string; quantity: number };
type Order = { id: string; status: string; total: number; createdAt: string; items: { id: string; title: string; quantity: number; price: number }[] };
type Tab = "home" | "catalog" | "favorites" | "cart" | "profile";

const CART_KEY = "uzum-mobil-clon:cart:v2";
const FAV_KEY = "uzum-mobil-clon:favorites:v2";
const money = (value: number) => `${Math.round(value).toLocaleString("ru-RU")} so‘m`;
const monthly = (value: number) => Math.ceil(value / 12 / 1000) * 1000;
const statusNames: Record<string, string> = { new: "Yangi", preparing: "Tayyorlanmoqda", shipping: "Yetkazilmoqda", completed: "Yakunlangan", cancelled: "Bekor qilingan" };

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

export default function ShopApp() {
  const [data, setData] = useState<StoreData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<CartLine[]>(() => readLocal(CART_KEY, []));
  const [favorites, setFavorites] = useState<string[]>(() => readLocal(FAV_KEY, []));
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/store").then(async (response) => {
      const body = await response.json() as StoreData & { error?: string };
      if (!response.ok) throw new Error(body.error);
      setData(body);
    }).catch((reason) => setError(reason.message || "Ma’lumot yuklanmadi."));
  }, []);

  useEffect(() => { if (cart.length || localStorage.getItem(CART_KEY)) localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (favorites.length || localStorage.getItem(FAV_KEY)) localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); }, [favorites]);

  const products = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLocaleLowerCase("uz");
    return data.products.filter((product) =>
      (category === "all" || product.categoryId === category) &&
      (!q || `${product.title} ${product.description}`.toLocaleLowerCase("uz").includes(q)),
    );
  }, [data, query, category]);

  const cartRows = useMemo(() => cart.map((line) => ({ ...line, product: data?.products.find((product) => product.id === line.productId) })).filter((line) => line.product), [cart, data]);
  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cartRows.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);

  function add(product: Product) {
    setCart((current) => {
      const found = current.find((line) => line.productId === product.id);
      if (found) return current.map((line) => line.productId === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line);
      return product.stock > 0 ? [...current, { productId: product.id, quantity: 1 }] : current;
    });
  }

  function quantity(productId: string, next: number) {
    const product = data?.products.find((item) => item.id === productId);
    if (next <= 0) setCart((current) => current.filter((line) => line.productId !== productId));
    else setCart((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(next, product?.stock ?? next) } : line));
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function loadOrders() {
    setOrdersLoaded(true);
    const response = await fetch("/api/orders");
    const body = await response.json() as { orders: Order[]; error?: string };
    if (response.ok) setOrders(body.orders);
  }

  function changeTab(next: Tab) {
    setTab(next); setSelected(null); setCheckout(false); window.scrollTo({ top: 0, behavior: "smooth" });
    if (next === "profile" && !ordersLoaded) void loadOrders();
  }

  if (error) return <main className="mx-auto flex min-h-dvh max-w-[480px] items-center justify-center bg-white p-8 text-center"><div><p className="text-4xl">😕</p><h1 className="mt-3 text-xl font-bold">Do‘kon ochilmadi</h1><p className="mt-2 text-sm text-zinc-500">{error}</p><button onClick={() => location.reload()} className="mt-5 rounded-xl bg-violet-700 px-5 py-3 font-semibold text-white">Qayta urinish</button></div></main>;
  if (!data) return <main className="mx-auto min-h-dvh max-w-[480px] bg-white p-4"><div className="h-11 animate-pulse rounded-xl bg-zinc-100"/><div className="mt-4 h-44 animate-pulse rounded-3xl bg-violet-100"/><div className="mt-5 grid grid-cols-2 gap-3">{[1,2,3,4].map((n)=><div key={n} className="h-72 animate-pulse rounded-2xl bg-zinc-100"/>)}</div></main>;

  const favoriteProducts = data.products.filter((product) => favorites.includes(product.id));
  return (
    <main className="mx-auto min-h-dvh w-full max-w-[480px] bg-white pb-24 text-zinc-950 shadow-2xl shadow-zinc-300/40">
      {(tab === "home" || tab === "catalog") && <header className="sticky top-0 z-30 bg-white/95 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button className="flex w-full items-center gap-1 text-sm font-semibold"><MapPin className="size-4 text-violet-700"/> Toshkent <ChevronDown className="size-4"/><span className="ml-auto text-xs font-normal text-zinc-500">1 kunda yetkazamiz</span></button>
        <label className="mt-3 flex items-center gap-2 rounded-2xl bg-zinc-100 px-3.5 py-3"><Search className="size-5 text-zinc-500"/><input aria-label="Qidiruv" value={query} onChange={(event)=>{setQuery(event.target.value);setTab("home")}} placeholder="Mahsulotlar va turkumlar" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/>{query && <button onClick={()=>setQuery("")}><X className="size-4"/></button>}</label>
      </header>}

      {tab === "home" && <>
        {!query && <section className="promo-card mx-4 mt-2 overflow-hidden rounded-[28px] p-5 text-white"><p className="text-xs font-semibold uppercase tracking-[.16em] text-white/75">Bugunning taklifi</p><h1 className="mt-2 max-w-[310px] text-[28px] font-black leading-[1.05]">{data.settings.promoTitle}</h1><p className="mt-3 text-sm text-white/85">{data.settings.promoSubtitle}</p><div className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-violet-700">Xaridni boshlash →</div></section>}
        <CategoryChips categories={data.categories} selected={category} onSelect={setCategory}/>
        <div className="flex items-end justify-between px-4 pb-3"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">{query ? "Qidiruv" : "Tavsiyalar"}</p><h2 className="text-xl font-black">{query ? `“${query}” natijalari` : "Siz uchun"}</h2></div><span className="text-xs text-zinc-500">{products.length} ta</span></div>
        <ProductGrid products={products} favorites={favorites} onFavorite={toggleFavorite} onOpen={setSelected} onAdd={add}/>
      </>}

      {tab === "catalog" && <section className="px-4"><h1 className="mb-3 mt-2 text-2xl font-black">Katalog</h1>{data.categories.map((item)=><button key={item.id} onClick={()=>{setCategory(item.id);changeTab("home")}} className="mb-2 flex w-full items-center gap-3 rounded-2xl bg-zinc-50 p-4 text-left"><span className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-2xl">{item.emoji}</span><span className="font-bold">{item.name}</span><span className="ml-auto text-sm text-zinc-400">{data.products.filter((p)=>p.categoryId===item.id).length} ta ›</span></button>)}</section>}

      {tab === "favorites" && <section className="px-3 pt-[max(20px,env(safe-area-inset-top))]"><h1 className="mb-4 px-1 text-2xl font-black">Sevimlilar</h1>{favoriteProducts.length ? <ProductGrid products={favoriteProducts} favorites={favorites} onFavorite={toggleFavorite} onOpen={setSelected} onAdd={add}/> : <Empty icon="♡" title="Sevimlilar bo‘sh" text="Yoqtirgan mahsulotlaringizni yurakcha orqali saqlang." onClick={()=>changeTab("home")}/>}</section>}

      {tab === "cart" && <section className="px-4 pt-[max(20px,env(safe-area-inset-top))]"><h1 className="text-2xl font-black">Savat <span className="text-base font-medium text-zinc-400">· {cartCount} ta</span></h1>{cartRows.length ? <><div className="mt-4 space-y-3">{cartRows.map((line)=><article key={line.productId} className="flex gap-3 rounded-2xl border border-zinc-100 p-3"><img src={line.product!.image} alt="" className="size-24 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{line.product!.title}</p><p className="mt-2 font-black">{money(line.product!.price * line.quantity)}</p><div className="mt-3 flex items-center"><div className="flex items-center rounded-xl bg-zinc-100"><button aria-label="Kamaytirish" onClick={()=>quantity(line.productId,line.quantity-1)} className="p-2"><Minus className="size-4"/></button><span className="min-w-7 text-center text-sm font-bold">{line.quantity}</span><button aria-label="Ko‘paytirish" onClick={()=>quantity(line.productId,line.quantity+1)} className="p-2"><Plus className="size-4"/></button></div><button aria-label="O‘chirish" onClick={()=>quantity(line.productId,0)} className="ml-auto p-2 text-zinc-400"><Trash2 className="size-5"/></button></div></div></article>)}</div><div className="mt-5 rounded-3xl bg-zinc-950 p-5 text-white"><div className="flex justify-between text-sm text-zinc-400"><span>{cartCount} ta mahsulot</span><span>Yetkazish bepul</span></div><div className="mt-2 flex items-end justify-between"><span className="font-semibold">Jami</span><span className="text-2xl font-black">{money(total)}</span></div><button onClick={()=>setCheckout(true)} className="mt-5 w-full rounded-2xl bg-violet-600 py-3.5 font-bold">Rasmiylashtirish</button></div></> : <Empty icon="🛒" title="Savat bo‘sh" text="Mahsulot tanlang va bu yerda buyurtma bering." onClick={()=>changeTab("home")}/>}</section>}

      {tab === "profile" && <section className="px-4 pt-[max(20px,env(safe-area-inset-top))]"><div className="rounded-3xl bg-gradient-to-br from-violet-700 to-fuchsia-600 p-5 text-white"><p className="text-xs font-bold uppercase tracking-widest text-white/70">Shaxsiy kabinet</p><h1 className="mt-2 text-2xl font-black">Xush kelibsiz!</h1><p className="mt-1 text-sm text-white/80">Buyurtmalaringiz backend bazasida saqlanadi.</p></div><Link href="/admin" className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 font-bold text-violet-800"><span className="grid size-10 place-items-center rounded-xl bg-white">⚙️</span> Admin panel <span className="ml-auto">→</span></Link><h2 className="mb-3 mt-6 text-lg font-black">Buyurtmalarim</h2>{orders.length ? <div className="space-y-3">{orders.map((order)=><article key={order.id} className="rounded-2xl border border-zinc-100 p-4"><div className="flex justify-between"><div><p className="font-black">{order.id}</p><p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString("uz-UZ")}</p></div><span className="h-fit rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">{statusNames[order.status] || order.status}</span></div><p className="mt-3 text-sm text-zinc-500">{order.items.map((item)=>`${item.title} × ${item.quantity}`).join(", ")}</p><p className="mt-2 text-right font-black">{money(order.total)}</p></article>)}</div> : <div className="rounded-2xl bg-zinc-50 p-5 text-center text-sm text-zinc-500"><Package className="mx-auto mb-2 size-7"/>Hali buyurtma yo‘q.</div>}<p className="mt-8 text-center text-xs text-zinc-400">{data.settings.storeName} · v0.2.1 · Mustaqil demo</p></section>}

      <BottomNav tab={tab} count={cartCount} onChange={changeTab}/>
      {selected && <ProductSheet product={selected} favorite={favorites.includes(selected.id)} onClose={()=>setSelected(null)} onFavorite={()=>toggleFavorite(selected.id)} onAdd={()=>add(selected)}/>} 
      {checkout && <Checkout total={total} cart={cart} onClose={()=>setCheckout(false)} onSuccess={(order)=>{setCart([]);setCheckout(false);setOrdersLoaded(true);setOrders((current)=>[{...order,items:[]} as Order,...current]);changeTab("profile")}}/>}
    </main>
  );
}

function CategoryChips({ categories, selected, onSelect }: { categories: Category[]; selected: string; onSelect: (id: string)=>void }) {
  return <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 py-4"><button onClick={()=>onSelect("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${selected==="all"?"bg-zinc-950 text-white":"bg-zinc-100"}`}>🛍️ Hammasi</button>{categories.map((item)=><button key={item.id} onClick={()=>onSelect(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${selected===item.id?"bg-zinc-950 text-white":"bg-zinc-100"}`}>{item.emoji} {item.name}</button>)}</div>;
}

function ProductGrid({ products, favorites, onFavorite, onOpen, onAdd }: { products: Product[]; favorites: string[]; onFavorite: (id:string)=>void; onOpen:(product:Product)=>void; onAdd:(product:Product)=>void }) {
  if (!products.length) return <div className="px-4 py-16 text-center text-sm text-zinc-500">Hech narsa topilmadi.</div>;
  return <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-2">{products.map((product)=><article key={product.id} className="min-w-0"><div className="relative overflow-hidden rounded-2xl bg-zinc-100"><button onClick={()=>onOpen(product)} className="block w-full"><img src={product.image} alt={product.title} loading="lazy" className="aspect-[3/4] w-full object-cover"/></button><button aria-label="Sevimlilarga" onClick={()=>onFavorite(product.id)} className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-white/90 shadow"><Heart className={`size-5 ${favorites.includes(product.id)?"fill-violet-700 text-violet-700":""}`}/></button>{product.oldPrice && <span className="absolute bottom-2 left-2 rounded-lg bg-fuchsia-600 px-2 py-1 text-[10px] font-black text-white">−{Math.round((1-product.price/product.oldPrice)*100)}%</span>}</div><button onClick={()=>onOpen(product)} className="block w-full px-1 pt-2 text-left"><p className="line-clamp-2 min-h-10 text-[13px] leading-5">{product.title}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500"><Star className="size-3 fill-amber-400 text-amber-400"/>{product.rating} · {product.reviews} sharh</p><span className="mt-1.5 inline-block rounded-md bg-yellow-300 px-1.5 py-0.5 text-[11px] font-bold">{money(monthly(product.price))}/oy</span>{product.oldPrice && <p className="mt-1 text-[11px] text-zinc-400 line-through">{money(product.oldPrice)}</p>}<p className="text-[15px] font-black">{money(product.price)}</p></button><button disabled={!product.stock} onClick={()=>onAdd(product)} className="mt-2 w-full rounded-xl border border-violet-200 py-2 text-xs font-bold text-violet-700 disabled:border-zinc-200 disabled:text-zinc-400">{product.stock ? "Savatga" : "Tugagan"}</button></article>)}</div>;
}

function BottomNav({ tab, count, onChange }: { tab: Tab; count: number; onChange:(tab:Tab)=>void }) {
  const items: [Tab,string,typeof Home][] = [["home","Bosh sahifa",Home],["catalog","Katalog",Grid2X2],["favorites","Sevimlilar",Heart],["cart","Savat",ShoppingBag],["profile","Profil",UserRound]];
  return <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[480px] -translate-x-1/2 grid-cols-5 border-t border-zinc-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">{items.map(([id,label,Icon])=><button key={id} onClick={()=>onChange(id)} className={`relative flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${tab===id?"text-violet-700":"text-zinc-500"}`}><Icon className={`size-5 ${id==="favorites"&&tab===id?"fill-violet-100":""}`}/>{label}{id==="cart"&&count>0&&<span className="absolute left-[53%] top-1 rounded-full bg-violet-700 px-1.5 text-[9px] text-white">{count}</span>}</button>)}</nav>;
}

function ProductSheet({ product, favorite, onClose, onFavorite, onAdd }: { product: Product; favorite:boolean; onClose:()=>void; onFavorite:()=>void; onAdd:()=>void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50" onMouseDown={(event)=>{if(event.currentTarget===event.target)onClose()}}><section className="max-h-[92dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[32px] bg-white pb-[max(18px,env(safe-area-inset-bottom))]"><div className="relative"><img src={product.image} alt={product.title} className="aspect-square w-full object-cover"/><button onClick={onClose} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/90"><X/></button></div><div className="p-5"><p className="flex items-center gap-1 text-sm text-zinc-500"><Star className="size-4 fill-amber-400 text-amber-400"/>{product.rating} · {product.reviews} sharh</p><h2 className="mt-2 text-xl font-black">{product.title}</h2><p className="mt-3 text-2xl font-black">{money(product.price)}</p><p className="mt-3 rounded-2xl bg-yellow-300 p-3 text-sm">12 oyga <b>{money(monthly(product.price))}</b> dan</p><p className="mt-4 text-sm leading-6 text-zinc-600">{product.description}</p><p className="mt-3 text-sm font-semibold">Qoldiq: {product.stock} ta</p><div className="mt-5 flex gap-2"><button onClick={onFavorite} className="grid size-14 shrink-0 place-items-center rounded-2xl border border-zinc-200"><Heart className={favorite?"fill-violet-700 text-violet-700":""}/></button><button onClick={onAdd} disabled={!product.stock} className="flex-1 rounded-2xl bg-violet-700 font-bold text-white disabled:bg-zinc-300">{product.stock?"Savatga qo‘shish":"Sotuvda yo‘q"}</button></div></div></section></div>;
}

function Checkout({ total, cart, onClose, onSuccess }: { total:number; cart:CartLine[]; onClose:()=>void; onSuccess:(order:{id:string;status:string;total:number;createdAt:string})=>void }) {
  const [form,setForm]=useState({customerName:"",phone:"+998 ",address:""}); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { const response=await fetch("/api/orders",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,items:cart})}); const body=await response.json() as { error?: string; order:{id:string;status:string;total:number;createdAt:string} }; if(!response.ok) throw new Error(body.error); onSuccess(body.order); } catch(reason) { setError(reason instanceof Error?reason.message:"Buyurtma yuborilmadi."); setBusy(false); } }
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50"><form onSubmit={submit} className="w-full max-w-[480px] rounded-t-[32px] bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Checkout</p><h2 className="text-xl font-black">Buyurtmani tasdiqlang</h2></div><button type="button" onClick={onClose} className="p-2"><X/></button></div><p className="mt-3 rounded-xl bg-violet-50 p-3 text-sm text-violet-800">Buyurtma backend bazasiga yoziladi. To‘lov hozircha qabul qilishda — demo.</p>{error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}<div className="mt-4 space-y-3"><input required minLength={2} placeholder="Ismingiz" value={form.customerName} onChange={(e)=>setForm({...form,customerName:e.target.value})} className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-violet-500"/><input required minLength={7} placeholder="Telefon" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className="w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-violet-500"/><textarea required minLength={5} placeholder="Yetkazib berish manzili" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} className="min-h-24 w-full rounded-xl border border-zinc-200 p-3 outline-none focus:border-violet-500"/></div><div className="mt-4 flex items-end justify-between"><span className="text-sm text-zinc-500">Jami</span><b className="text-xl">{money(total)}</b></div><button disabled={busy} className="mt-4 w-full rounded-2xl bg-violet-700 py-4 font-bold text-white disabled:opacity-60">{busy?"Saqlanmoqda…":"Buyurtma berish"}</button></form></div>;
}

function Empty({ icon,title,text,onClick }: {icon:string;title:string;text:string;onClick:()=>void}) { return <div className="py-20 text-center"><p className="text-5xl">{icon}</p><h2 className="mt-3 text-xl font-black">{title}</h2><p className="mx-auto mt-2 max-w-64 text-sm text-zinc-500">{text}</p><button onClick={onClick} className="mt-5 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white">Xarid qilish</button></div>; }
