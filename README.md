# Uzum mobil clon — v0.2.0

Mustaqil o‘zbekcha mobil marketplace demosi. Uzum bilan rasmiy aloqasi yo‘q.

## Imkoniyatlar

- mobil katalog, qidiruv, kategoriyalar va mahsulot tafsilotlari;
- sevimlilar va savat (brauzerda saqlanadi);
- serverda tekshiriladigan checkout, D1 bazadagi buyurtmalar va qoldiq nazorati;
- foydalanuvchining buyurtmalar tarixi;
- `/admin` panel: dashboard, mahsulot CRUD, kategoriyalar, buyurtma holatlari va promo sozlamalari;
- ChatGPT Sites identifikatsiyasi va `ADMIN_EMAILS` orqali serverdagi admin tekshiruvi.

## Texnologiyalar

Vinext/Next 16, React 19, Tailwind 4, Cloudflare Worker, D1, Drizzle ORM. R2 hozir ishlatilmaydi; rasmlar URL orqali saqlanadi.

## Ishga tushirish

```bash
npm run install:ci
npm run db:generate
npm run build
```

Mahalliy D1 migratsiyasini `drizzle/` ichidagi SQL bilan starter README ko‘rsatmasi bo‘yicha qo‘llang. `ADMIN_EMAILS` — vergul bilan ajratilgan admin email ro‘yxati. Sites’da bu runtime env sifatida saqlanadi.

## Ma’lumot modeli

- `categories`: kategoriya nomi, emoji, tartib;
- `products`: narx, eski narx, rasm, tavsif, qoldiq va faol holat;
- `orders`: foydalanuvchi ID, mijoz ma’lumotlari, status, jami;
- `order_items`: buyurtma paytidagi nom/narx nusxasi;
- `settings`: do‘kon va promo matnlari.

Boshlang‘ich katalog baza bo‘sh bo‘lganda bir marta yoziladi. Savat va sevimlilar qurilmada qoladi; mahsulot, buyurtma va sozlamalar D1’da barcha sessiyalar uchun saqlanadi.

## Xavfsizlik va cheklovlar

Admin API har bir so‘rovda Sites identity va `ADMIN_EMAILS` ni tekshiradi. Sayt hozir owner-only. To‘lov provayderi, SMS, yetkazib berish API, rasm yuklash va ommaviy ro‘yxatdan o‘tish hali yo‘q. Checkout real pul olmaydi.

## Havolalar

- GitHub: https://github.com/sevinchbek101/uzum-mobil-clon
- Sites: https://uzum-mobil-clon-demo-s101.icydeck.chatgpt.site
