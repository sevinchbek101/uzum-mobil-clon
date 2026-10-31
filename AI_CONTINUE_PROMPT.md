# Boshqa AI uchun tayyor prompt

Sen "Uzum mobil clon" mobil do'kon loyihasini davom ettiryapsan. Avval README.md, VERSION va CHANGELOG.md ni o'qi. Foydalanuvchi avval Uzum Market mobil ilovasiga o'xshash demo, keyin o'z brendi, undan keyin desktop istaydi. O'zbek tilida gaplash. Joriy versiya 0.1.0.

## Asosiy kod
Bu checkout statik Sites variantidir. dist/index.html ichida barcha HTML/CSS/JS mavjud, npm kerak emas. Asosiy render() funksiyasi sahifalarni chiqaradi, views() tablarni, sheet() mahsulot va buyurtma oynalarini beradi. P — 14 mahsulot, CATS — kategoriyalar, S — holat. Click event delegation data-a va data-id orqali ishlaydi. Narxlar so'mda; mon() 12 oylik namoyish summasini yuqoriga 1000 ga yaxlitlaydi. Savat va sevimlilar localStorage 'uzum-mobil-clon:v1' kalitida {cart:[{id,qty}],favs:[id]} shaklida.

## Dizayn
480px maksimal kenglik, 2 ustun mahsulot, #7000ff binafsha, oq fon, sariq muddatli to'lov belgilari. Bosh sahifa/Katalog/Sevimlilar/Savat/Profil pastki navigatsiyasi. Safe-area saqlansin. Desktopni foydalanuvchi so'ramaguncha qo'shma.

## Cheklovlar
Backend, haqiqiy to'lov, login yo'q. Shahar tanlash va profil satrlari maket. Unsplash rasmlari internet talab qiladi. Tablar URL bilan boshqarilmaydi. Demo buyurtma serverga ketmaydi. localStorage boshqa hosting bilan umumiy emas.

## Manbalar va sinxronizatsiya
Lovable loyiha: https://lovable.dev/projects/1d38b7b3-534e-438b-ade6-e8aa513b7f8f
U yerda React/TanStack varianti va standalone/index.html mavjud. Bu repository esa Sites uchun dist/index.html variantini ishlatadi. Avtomatik GitHub/Lovable sync hali sozlanmagan. O'zgarishlarni qaysi variantga qilayotganingni aniq yoz va ikkala variant kerak bo'lsa ongli ravishda moslashtir.
Sites project_id .openai/hosting.json ichida: mavjud ID ni saqla, yangi Site yaratma.

## Reliz qoidasi
Har mazmunli reliz: VERSION va HTML ichidagi VERSION ni yangila, CHANGELOG.md ga sana, qo'shilgan/tuzatilgan narsalarni yoz. Bajarilgan va tekshirilmagan ishlarni farqla. Git commitni vX.Y.Z bilan belgilash, repository mavjud bo'lsa teg qo'yish. Token va parollarni kodga yozma.

## Keyingi ishlar
Foydalanuvchi fikriga ko'ra dizaynni moslashtir; shahar tanlash, saralash/filtr, local buyurtma tarixi; keyin o'z brendi va backend. Hozir desktopga o'tma.

## Tekshirish
Qidiruv, kategoriya, tafsilot, sevimlilar, savat +/−/o'chirish, jami, sahifa yangilanishida saqlanish va demo checkoutni sinab ko'r. 375px va 480px da gorizontal overflow yo'qligini tekshir.

