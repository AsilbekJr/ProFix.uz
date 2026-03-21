# "MAHALLA-SERVIS" TO'LIQ TEXNIK TOPSHIRIG'I VA STRATEGIYASI (PRD 2.0)

## 1. LOYIHA MAQSADI VA KO'LAMI
**Loyiha nomi:** Mahalla-Servis
**Maqsad:** O'zbekiston bozorida mahalliy ustalar va mijozlar o'rtasida ishonchli, shaffof va qulay bozor taklif qiluvchi (Marketplace) platformani yaratish. Hozirda bozorda mavjud bo'lgan "aldanib qolish", "narxning noaniqligi" kabi muammolarni zamonaviy vositalar orqali hal qilish.
**Asosiy platforma formati:** Telegram Web App (TWA) - oson kirish, ro'yxatdan o'tishsiz (Tg akkaunt orqali) va tez ishlash imkonini beruvchi format.

## 2. REAL / TOP LOYIHA UCHUN YANGILANGAN STRATEGIK XUSUSIYATLAR
Platformaning oddiy e'lonlar doskasidan farqlashi uchun kiritilgan muhim xususiyatlar:

1. **Tasdiqlangan Usta ("Verified Badge") tizimi**
   - Ustalar qo'shimcha tasdiqdan (pasport yoki litsenziya) o'tgandan so'ng, ularning profiliga maxsus ✅ belgi chiqadi.
   - Tasdiqlangan ustalar katalogda birinchilardan bo'lib ko'rinadi.

2. **Xavfsiz To'lov / Escrow**
   - Mijoz ishni tasdiqlagandan so'ng (Masalan, "Qabul qildim" tugmasini bosganda) pul usta hisobiga o'tadi. 
   - Bu O'zbekistondagi "Usta avans olib qochib ketdi" muammosiga asosiy yechim hisoblanadi. (Integration: Click / Payme / Uzumbank).

3. **Geolokatsiya va Smart Qidiruv**
   - Mijozga uning joylashuviga (hozirgi lokatsiyasiga) qarab eng yaqin masofadagi ustalar ro'yxatini chiqarib berish.
   - Bu ustalarga yo'lkira va vaqt iqtisod qilishlariga juda muhim rol o'ynaydi.

4. **Kengaytirilgan Sharh va Reyting (Review)**
   - Ixtiyoriy odam emas, **faqat aynan o'sha usta orqali ishi bitib, Order holati "COMPLETED" bo'lgan** mijozlargina sharh qoldirishga haqli bo'ladi.
   - Reytingga alohida algoritm joriy qilinadi.

5. **Smart Portfolio (Oldin / Keyin)**
   - Usta bajargan ishi bo'yicha "Before-After" (Oldin qanday edi, remontdan so'ng qanday bo'ldi) uslubida oddiy rasm yuklashi, mijozga ishning sifatini baholash imkonini beradi.

6. **Kalendar, Bandlik va Jadval (Availability)**
   - Mijoz ustaning ochiq profili orqali bugun, ertaga bo'sh ekanligini, aynan qaysi soatlari bandligini va "Bron" (Band) qilish imkoniyatini bevosita ko'ra olishi kerak.

## 3. ASOSIY TOMONLAR VA ULARNING ROLLARGA BO'LINGAN FUNKSIYALARI

### 3.1. MIJOZ (Client) UX / UI:
- **Xizmatlar katalogi:** Ustalar, toifalar (Slesar, elektr...) bo'yicha navigatsiya.
- **Tez buyurtma (1 click):** GPS bilan manzilini avtomatik olish yoki qo'lda kiritish.
- **Buyurtma xolati kuzatuvi (Live status):** "Usta qabul qildi", "Yetib keldi", "Jarayonda", "Tugatildi".
- **Ovozli tasvirlash:** Muammoni yozib emas, TWA integratsiyasi orqali audioda ham tushuntira olish xususiyati.

### 3.2. USTA (Specialist) UX / UI:
- **Buyurtmalar lentasi:** Faqat o'z sohasiga va geografik o'rniga moslashtirilgan takliflar asboblar paneli.
- **Portfolio paneli:** "Bitgan ishlarim" qismida rasm va qisqa description qo'sha olishi.
- **Onlayn/Oflayn maqomini qo'yish:** Hozir bandmi yoki yangi buyurtmalarni qabul qilishga tayyormi - birgina tugma orqali.
- **Statistika va daromadlar stoli:** Nechta ish bajargani, reytingi, ishlab topgan pullari analitikasi ko'rinib turishi.

### 3.3. ADMIN PANEL (Back-office):
- Dashbord: Platformaning moliyaviy aylanmasi, aktiv ustalar hajmi, shikoyatlar.
- "Pasport Verification": Ustalarni passportini ko'rib chiqib, ularga qo'lda "Verified" berish funksiyasi.
- Tushgan muamoli buyurtmalar bo'yicha chat va orderlarni bekor qilish/moderatsiya qilish.
- Tariflar boshqaruvi: Masalan "Topsda turish" xizmati, reklama joylashtirish.

## 4. O'ZBEKISTON BOZORIGA XOS XUSUSIYATLAR (LOKALIZATSIYA)
- **Til qo'llab quvvatlashi:** Barcha interfeys O'zbek tili (Lotin) asosida qilinadi (Keyinchalik Rus tiliga kengaytiriladi).
- **Narxlar filtri:** Aniq narx ko'plab xizmatlarda imkonsiz (ish hajmiga qarab baholanadi), shu bois "dan boshlab", yoki "Kelishilgan holda" statusi ishlatiladi.
- **Yuklash Tezligi & Optimization:** Internet sekin joylar uchun maksimal yengillashtirilgan va kech (cache) bilan ishlovchi texnologiyalardan (Redux Toolkit + RTK Query) foydalanish.

## 5. REJALASHTIRILGAN DATABASE SCHEMA (PRISMA DB STRUCTURE)
* Prisma-ga biz `Payment`, `PaymentStatus`, `Review`, `Portfolio`, `SpecialistAvailability` modellarini tirkadik.

## 6. BOSQICHMA-BOSQICH RIVOJLANTIRISH (ROADMAP)
- **1-Bosqich (Hozirgi bajarilayotgan maqsad):** 
Core API va DB bazasini to'ldirish (Auth, Order Creation, Dashboard UI, Specialist xarakteristikalari). Interfeys sifatiga to'xtalib, "Enterprise Design" holatiga olib kelish.
- **2-Bosqich (Keyingi Qadam):**
"Verification" (Ustalarni shaxsini tasdiqlash), "Portfolio" modeliga tayangan real gallereya qo'shish va "Reviews" tizimini mijozlarga moslashtirish. TWA ni optimallashtirish.
- **3-Bosqich (Kelajak Relizlari):**
To'lov (Escrow Click/Payme integratsiyasi) xizmati va Geolokatsiya bo'yicha maxsus algoritm ishga tushirilib, tadbirkorlik modeliga o'tish. Ustalar uchun Premium Tariflari ishga tushirish.
