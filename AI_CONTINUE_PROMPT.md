# Boshqa AI uchun davom ettirish prompti

Sen `sevinchbek101/uzum-mobil-clon` loyihasini davom ettiryapsan. Joriy versiya `0.2.1`. Bu Uzum mobil ilovasi tuzilishidan ilhomlangan, ammo Uzum bilan rasmiy aloqasi bo‘lmagan o‘zbekcha marketplace demo.

## Arxitektura

- Vinext/Next 16 + React 19 + Tailwind 4.
- Cloudflare Worker va D1; Drizzle schema `db/schema.ts`, migratsiyalar `drizzle/`.
- Do‘kon UI: `app/shop-app.tsx`, bosh sahifa `app/page.tsx`.
- Admin: `app/admin/page.tsx` va `app/admin/admin-client.tsx`.
- API: `app/api/store`, `app/api/orders`, `app/api/admin`.
- Server biznes qoidalari va seed: `lib/store-data.ts`.
- Sites identity: `app/chatgpt-auth.ts`; admin allowlist runtime `ADMIN_EMAILS`.

## Muhim qoidalar

Narx, jami va qoldiq serverda tekshiriladi. Buyurtma qatorlari mahsulot nomi va narxini snapshot qilib saqlaydi. Kategoriya ichida mahsulot bo‘lsa, kategoriya o‘chirilmaydi. Mahsulotni o‘chirish eski buyurtma qatorlarini buzmaydi. Savat/sevimlilar localStorage, asosiy ma’lumotlar D1.

## Cheklovlar va keyingi ishlar

Hozir haqiqiy payment, SMS, kuryer integratsiyasi, rasm upload va public signup yo‘q. Keyingi bosqichlar: R2 rasm yuklash, Click/Payme sandbox, manzil tanlash, variantlar (rang/o‘lcham), kuponlar, yetkazish narxi, audit log va ommaviy sayt rejimi.

## Reliz va deploy

Har relizda `VERSION`, `package.json`, UI versiyasi va `CHANGELOG.md` ni yangila. D1 schema o‘zgarsa yangi migratsiya yarat. GitHub `main` ga commit/push qil va `vX.Y.Z` release yarat. Sites deploy GitHub’dan avtomatik emas: mavjud `appgprj_6ae62b71f8848191a9fc1597a8337a80` project ID bilan Sites workflow orqali alohida deploy qil.
