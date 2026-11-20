# TT 4.2 — Kimyo eksperti ko‘rigi, 2-bosqich (2026-11-20)

Ekspert: **Xasanova Sevara Giyosiddinovna** (kimyo). Sahifa: “Kimyo ekspert tekshiruvi 2” — 2026-11-04 javobidan keyin ochiq qolgan savollar. Ekspert javobi pastda so‘zma-so‘z keltirilgan; u o‘zgartirilmagan.

## Holat

| | Natija |
|---|---|
| Qaror berilmagan 2 reaksiya | ikkalasi “approve” — `docs/reviews/tt-4.2-expert-decisions-2026-11-20.json` (importer tekshiruvi: 2 qaror, 0 xato) |
| Xavf belgisi ko‘rsatilmagan 7 modda | 7 tasiga ham javob bor (pastdagi jadval) |
| Darslikda bor, dasturda yo‘q | 16 tasi “qo‘shish kerak”, 1 tasiga javob yo‘q |
| Manba ma’lumotlari | to‘ldirilmagan |

**Import hali qilinmagan** (faqat inson):

```
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-04.json
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-20.json
npm run review:build
```

Import qilingandan keyin ham reaksiya o‘quvchiga “tasdiqlangan” deb ko‘rinmaydi: yaroqli manba (bibliografiyasi to‘liq, inson qabul qilgan) hali yo‘q.

## Reaksiyalar

- `reaction:rxn.h2-cuo` (H2 + CuO → Cu + H2O) — approve. Izoh: “t belgisini qo‘yish maqsadga muvofiq”. Sharti (qizdirish) 2026-11-04 da tasdiqlangan; izoh tenglama strelkasi ustida qizdirish belgisini ko‘rsatishga taalluqli — bu ko‘rinish o‘zgarishi, hali qilinmagan.
- `reaction:rxn.cao-water` (CaO + H2O → Ca(OH)2) — approve.

## Xavf belgilari: ikki bosqich jamlanmasi

| Modda | Dasturda hozir | 2026-11-04 javobi | 2026-11-20 javobi | Xulosa |
|---|---|---|---|---|
| Ca(OH)2 | irritant | “o‘yuvchi”ga | — | corrosive — aniq |
| ZnCl2 | irritant | o‘yuvchi (korroziv) | — | corrosive — aniq |
| I2 | irritant | zaharli | — | toxic — aniq |
| NaHSO4 | irritant | atamani o‘zgartirish | o‘yuvchi; ko‘z uchun xavfi izohda | corrosive — aniq; izoh uchun maydon dasturda yo‘q |
| Na2CO3 | irritant | atamani o‘zgartirish | ta’sirlovchi | o‘zgarmaydi |
| CuSO4 | irritant | atamani o‘zgartirish | ta’sirlovchi | o‘zgarmaydi |
| CuCl2 | irritant | atamani o‘zgartirish | ta’sirlovchi | o‘zgarmaydi |
| H3PO4 | irritant | atamani o‘zgartirish | ta’sirlovchi | o‘zgarmaydi |
| Na3PO4 | irritant | atamani o‘zgartirish | ta’sirlovchi | o‘zgarmaydi |
| SO3 | corrosive | to‘g‘ri + izoh | o‘yuvchi | o‘zgarmaydi |
| SO2, NH3 | toxic, irritant | to‘g‘ri | — | o‘zgarmaydi |
| sirka | irritant | “kuydiruvchi” | — | **ochiq**: “kuydiruvchi” belgisi dasturda yo‘q |
| ZnSO4 | irritant | “ko‘zni jiddiy shikastlovchi” | — | **ochiq**: bunday belgi dasturda yo‘q |
| NH4Cl | irritant | atamani o‘zgartirish; GHS07 (undov belgisi) | — | **ochiq**: yangi belgi nomi yozilmagan |

Hozircha `content-src/chemistry/species.json` o‘zgartirilmagan. Xavf da’volari uchun kb-review kategoriyasi yo‘q; “aniq” qatorlar loyiha egasi roziligi bilan alohida o‘zgarish sifatida kiritiladi.

2-bosqichda ekspert besh moddada “ta’sirlovchi” belgisini qoldirdi. Demak 2026-11-04 dagi “ta’sirlovchi atamasini o‘zgartirish” izohi belgining o‘ziga emas, so‘ziga taalluqli bo‘lishi mumkin. O‘quvchi ekranida bu belgi “ta’sirlantiruvchi”, “corrosive” esa “yemiruvchi” deb ko‘rinadi (`content-src/locales/uz-latn/learner-interaction.json`). Ekspert ikkala bosqichda ham “ta’sirlovchi” va “o‘yuvchi” so‘zlarini ishlatgan; ekrandagi so‘zlarni shunga moslash — loyiha egasi qarori.

## Darslikda bor, dasturda yo‘q

16 ta reaksiyaga “qo‘shish kerak” javobi berilgan; “Sulfat kislota + malakit; nitrat kislota + natriy karbonat” (daftar, 51–52-betlar) ga javob yo‘q. Ekspert ikki joyda “Malaxit” deb yozgan (sahifadagi “malakit” yozuviga tuzatish). Yangi reaksiya yozuvlari hali qo‘shilmagan: har biri tenglama, shart va kuzatuv bilan yoziladi va ekspertga alohida tekshirishga yuboriladi.

## Ekspert javobi (so‘zma-so‘z)

```
Tekshiruvchi: Xasanova Sevara Giyosiddinovna
Tuzilgan: 2026-11-20T10:47:47.000Z

# Xavf belgilari (moddalar)
Na2CO3 (species.na2co3): belgilar: ta’sirlovchi
CuSO4 (species.cuso4): belgilar: ta’sirlovchi
CuCl2 (species.cucl2): belgilar: ta’sirlovchi
NaHSO4 (species.nahso4): belgilar: o‘yuvchi — o‘yuvchi belgisini tanlanish hamda izohda uning aynan ko‘z uchun xavfliligi ko‘rsatish kerak.
H3PO4 (species.h3po4): belgilar: ta’sirlovchi
Na3PO4 (species.na3po4): belgilar: ta’sirlovchi
SO3 (species.so3): belgilar: o‘yuvchi

# Darslikda bor, dasturda yo‘q
Magniy + kislorod → magniy oksidi [Darslik, 46-bet]: qo‘shish kerak
Azot monooksidi + kislorod → azot dioksidi (qo‘ng‘ir bug‘) [Darslik, 47-bet]: qo‘shish kerak
Uglerod monooksidi + kislorod → uglerod dioksidi [Darslik, 47-bet]: qo‘shish kerak
Natriy + xlor → natriy xlorid [Darslik, 45-bet]: qo‘shish kerak
Kumush oksidining qizdirilganda parchalanishi → kumush + kislorod [Darslik, 45-bet]: qo‘shish kerak
Kalsiy karbonatning qizdirilganda parchalanishi → kalsiy oksidi + uglerod dioksidi [Darslik, 50-bet]: qo‘shish kerak
Magniy oksidi + suv → magniy gidroksid [Darslik, 50-bet]: qo‘shish kerak
Simob monooksidining parchalanishi → simob + kislorod [Darslik, 50-bet]: qo‘shish kerak
Suvning elektr toki bilan parchalanishi [Darslik, 28-bet]: qo‘shish kerak
Temir + oltingugurt → temir sulfid (qizdirilganda) [Darslik, 46 va 99-betlar; daftar, 34–35-betlar]: qo‘shish kerak
Nitrat kislota + kalsiy karbonat → kalsiy nitrat + suv + uglerod dioksidi [Darslik, 79-bet]: qo‘shish kerak
Kaliy gidroksid + nitrat kislota → kaliy nitrat + suv [Darslik, 82-bet]: qo‘shish kerak
Kaliy gidroksid + xlorid kislota → kaliy xlorid + suv [Daftar, 56-bet]: qo‘shish kerak
Magniy, temir + suyultirilgan xlorid kislota [Daftar, 49–50-betlar]: qo‘shish kerak
Mis + suyultirilgan xlorid kislota (“qaysi metall reaksiyaga kirishmadi?”) [Daftar, 50-bet, 9-savol. “Reaksiya bormaydi” yozuvi uchun manba bo‘lishi mumkin — siz hal qilasiz]: qo‘shish kerak
Malakitning qizdirilganda parchalanishi [Daftar, 33-bet]: qo‘shish kerak — Malaxit
Sulfat kislota + malakit; nitrat kislota + natriy karbonat [Daftar, 51–52-betlar]: javob yo‘q — Malaxit

# Manba (darslik)
Foydalanish sharti: to‘ldirilmagan
Amal qilish sanasi: to‘ldirilmagan
Nashr: to‘ldirilmagan
```

Reaksiya qarorlari JSON ko‘rinishida `docs/reviews/tt-4.2-expert-decisions-2026-11-20.json` da.
