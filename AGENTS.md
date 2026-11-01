# AI agentlar uchun qoidalar

Avval `AI_CONTINUE_PROMPT.md`, `README.md`, `VERSION` va `CHANGELOG.md` ni o‘qing.

- Har mazmunli relizda SemVer, `CHANGELOG.md` va interfeysdagi versiyani yangilang.
- `.openai/hosting.json` ichidagi `project_id` ni o‘zgartirmang.
- D1 schema o‘zgarsa `npm run db:generate` bajaring va yangi migratsiyani commit qiling; eski migratsiyani qayta yozmang.
- Admin yozuvlarini serverda `isAdmin()` bilan tekshiring. Secret va tokenlarni source’ga yozmang.
- Buyurtma summasi va qoldiqni mijoz yuborgan narxga ishonmasdan serverda hisoblang.
- Mobil do‘konni 480px gacha qulay saqlang. Desktop do‘konni foydalanuvchi alohida so‘raganda qo‘shing.
- Haqiqiy to‘lov bor deb ko‘rsatmang. Loyiha Uzum’ning rasmiy mahsuloti emas.
- Git tarixini force push yoki rebase bilan qayta yozmang.
