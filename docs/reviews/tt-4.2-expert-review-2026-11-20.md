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

“Aniq” qatorlar loyiha egasi roziligi bilan kiritildi (pastda, 1-band). Xavf da’volari uchun kb-review kategoriyasi hali yo‘q.

2-bosqichda ekspert besh moddada “ta’sirlovchi” belgisini qoldirdi. Demak 2026-11-04 dagi “ta’sirlovchi atamasini o‘zgartirish” izohi belgining o‘ziga emas, so‘ziga taalluqli bo‘lishi mumkin. O‘quvchi ekranida bu belgi “ta’sirlantiruvchi”, “corrosive” esa “yemiruvchi” deb ko‘rinadi (`content-src/locales/uz-latn/learner-interaction.json`). Ekspert ikkala bosqichda ham “ta’sirlovchi” va “o‘yuvchi” so‘zlarini ishlatgan; loyiha egasi ekrandagi so‘zlarni shunga moslashga rozi bo‘ldi (pastda, 2-band).

## Darslikda bor, dasturda yo‘q

16 ta reaksiyaga “qo‘shish kerak” javobi berilgan; “Sulfat kislota + malakit; nitrat kislota + natriy karbonat” (daftar, 51–52-betlar) ga javob yo‘q. Ekspert ikki joyda “Malaxit” deb yozgan (sahifadagi “malakit” yozuviga tuzatish). 16 tasi tasdiqlanmagan yozuv sifatida qo‘shildi (pastda, 3-band); ekspert ularni alohida tekshiradi.

## Loyiha egasi qarori bilan kiritilgan o‘zgarishlar (2026-11-20)

Loyiha egasi uchta taklifga “ha” dedi. Quyidagilar kiritildi; hech biri tasdiqlangan deb ko‘rsatilmaydi (review **PENDING**).

### 1. Xavf belgilari (`content-src/chemistry/species.json`)

Faqat ekspert aniq ko‘rsatgan 4 ta: Ca(OH)2, ZnCl2, NaHSO4 → `corrosive`; I2 → `toxic` (oldin hammasi `irritant`). Sirka, ZnSO4, NH4Cl o‘zgarmadi (ochiq). NaHSO4 uchun “ko‘z uchun xavfli” izohini yozadigan maydon dasturda yo‘q.

### 2. Ekrandagi so‘zlar (`content-src/locales/uz-latn/learner-interaction.json`)

`yemiruvchi` → `o‘yuvchi`, `ta’sirlantiruvchi` → `ta’sirlovchi` (modda belgisi va reaksiya xavfsizlik yozuvlarida). Reaksiya turi “parchalanish” uchun yangi nom qo‘shildi.

### 3. Darslikdagi reaksiyalar (`content-src/chemistry/reactions.json`, `species.json`)

16 ta yozuv va 15 ta yangi modda qo‘shildi (25 → 41 reaksiya, 84 → 99 modda). Darslik va mashq daftari `content-src/source-registry.json` ga **PROPOSED** manba sifatida yozildi (inson qabul qilmagan; litsenziya va amal qilish sanasi yo‘q) — SOURCE_POLICY bo‘yicha yangi manbani PR’ni ko‘rib chiqqan inson kiritadi, bu PR o‘sha ko‘rib chiqish.

Darslikda faqat **so‘z tenglamasi** berilgan. Formulali tenglama va koeffitsientlarni agent yozdi; har biri mashinada tekshirildi (atomlar teng, kanonik balancer bilan mos). Darslikda yozilmagan narsa **kuzatuv sifatida qo‘shilmadi**: kuzatuv yo‘q joyda dastur “kuzatuv yo‘q” (OBSERVATION_MISSING) deb ko‘rsatadi.

| Yozuv | Tenglama | Darslikda | Agent qo‘shgan (ekspert tekshirsin) |
|---|---|---|---|
| `rxn.mg-combustion` | 2Mg + O2 → 2MgO | darslik 46: so‘z tenglamasi | shart “yondirish”; kuzatuv yo‘q |
| `rxn.no-o2` | 2NO + O2 → 2NO2 | darslik 47: rangsiz gazlardan qo‘ng‘ir bug‘ | — |
| `rxn.co-combustion` | 2CO + O2 → 2CO2 | darslik 47: so‘z tenglamasi | shart “yondirish”; kuzatuv yo‘q |
| `rxn.na-cl2` | 2Na + Cl2 → 2NaCl | darslik 45: natriy + xlor → natriy xlorid | shart “qizdirish”; kuzatuv yo‘q |
| `rxn.ag2o-decomposition` | 2Ag2O → 4Ag + O2 | darslik 45: qizdirilganda kumush va kislorod (rangsiz gaz) | — |
| `rxn.caco3-decomposition` | CaCO3 → CaO + CO2 | darslik 50: qizdirilganda | kuzatuv yo‘q |
| `rxn.mgo-water` | MgO + H2O → Mg(OH)2 | darslik 50: so‘z tenglamasi | kuzatuv yo‘q |
| `rxn.hgo-decomposition` | 2HgO → 2Hg + O2 | darslik 50: so‘z tenglamasi | shart “qizdirish”; kuzatuv yo‘q |
| `rxn.h2o-electrolysis` | 2H2O → 2H2 + O2 | darslik 28: elektr toki bilan vodorod va kislorod | — (izlagichda “elektr toki” sharti yo‘q: yozuv u yerdan ochilmaydi) |
| `rxn.fe-s` | Fe + S → FeS | darslik 46, 99; daftar 34–35: qizdirilganda, aralashma porlaydi | — |
| `rxn.hno3-caco3` | 2HNO3 + CaCO3 → Ca(NO3)2 + H2O + CO2 | darslik 79: suyultirilgan kislota, tuz + suv + CO2 | — |
| `rxn.koh-hno3` | KOH + HNO3 → KNO3 + H2O | darslik 82: suyultirilgan nitrat kislota | kuzatuv yo‘q |
| `rxn.koh-hcl` | KOH + HCl → KCl + H2O | daftar 56: test savoli | kuzatuv yo‘q |
| `rxn.mg-hcl` | Mg + 2HCl → MgCl2 + H2 | daftar 49–50; darslik 79: metall + kislota → tuz + vodorod | tuz formulasi (MgCl2) |
| `rxn.fe-hcl` | Fe + 2HCl → FeCl2 + H2 | daftar 49–50; darslik 79 | tuz formulasi (**FeCl2**, temir(II)) |
| `rxn.malachite-decomposition` | Cu2(OH)2CO3 → 2CuO + H2O + CO2 | daftar 33: malaxit qizdiriladi, gaz ohakli suvdan o‘tkaziladi | **mahsulotlar** (daftarda yozilmagan); kuzatuv yo‘q |

Yangi moddalardan faqat ikkitasiga darslikdagi xavf belgisi qo‘yildi: Hg — zaharli (darslik 10-bet, 1.3-jadval), KOH — o‘yuvchi (82-bet). Qolganlariga (masalan, Na, NO2, HgO) belgi qo‘yilmadi — ekspert belgilaydi.

**Qo‘shilmadi:**
- “Mis + suyultirilgan xlorid kislota” (“reaksiya bormaydi” yozuvi). TT 4.2.6 bo‘yicha bunday da’vo o‘quvchiga faqat ko‘rib chiqilgandan keyin ko‘rsatiladi. Reaksiya izlagichida shu tekshiruv bor, 7.10-tajriba (laboratoriya) yo‘lida esa yo‘q: yozuv qo‘shilsa, tajriba tasdiqlanmagan “reaksiya bormaydi” natijasini ko‘rsatib yuborardi. Avval laboratoriya yo‘liga ham shu tekshiruv qo‘shilishi kerak.
- “Sulfat kislota + malaxit; nitrat kislota + natriy karbonat” — ekspert javob bermagan.

**Testlar va himoya.** “P2.5 dan beri kimyo yozuvi qo‘shilmagan” himoyasi (`COMPUTED_MODEL_INVARIANT`) olib tashlanmadi. U endi `OWNER_DECIDED_RECORD_CHANGES` ro‘yxatini hisobga oladi (`scripts/lib/computed-model-interaction.ts`): ro‘yxatdan tashqari har qanday qo‘shilgan yoki yo‘qolgan yozuv uni hali ham yiqitadi. Eski testlardagi sonlar izoh bilan yangilandi.

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
