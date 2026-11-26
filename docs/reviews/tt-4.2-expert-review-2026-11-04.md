# TT 4.2 — Kimyo eksperti ko‘rigi (2026-11-04)

Ekspert: **Xasanova Sevara** (kimyo). Manba: “Kimyo. 7-sinf” darsligi va mashq daftari (Jasvinder Randhava, Natasha Mehta; “Novda Edutainment”, 2026).

Bu hujjat ekspert yuborgan natijani va u bo‘yicha qilingan ishni qayd etadi. Ekspert qarorlari o‘zgartirilmagan.

## Holat

| | Soni |
|---|---|
| Ekspert yuborgan qarorlar | 65 (hammasi “approve”) |
| Importga tayyor qarorlar | 58 — `docs/reviews/tt-4.2-expert-decisions-2026-11-04.json` |
| O‘chirilgan reaksiyalarga tegishli, import qilinmaydigan qarorlar | 7 (pastda so‘zma-so‘z) |
| Ekspert qaror bermagan da’volar | 2: `reaction:rxn.h2-cuo`, `reaction:rxn.cao-water` |
| Importer tekshiruvi (`validateChemistryDecisions`) | 58 qaror, 0 xato |

**Import hali qilinmagan.** Loyiha qoidasiga ko‘ra ro‘yxatga (`content-src/chemistry-reviews.json`) faqat inson import qiladi; buyruq agent va CI muhitida rad etiladi:

```
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-04.json
npm run review:build
```

Import qilingandan keyin ham reaksiya o‘quvchiga “tasdiqlangan” deb ko‘rinmaydi: buning uchun yaroqli (HUMAN_ACCEPTED, bibliografiyasi to‘liq) manba ham kerak. Hozir bunday manba yo‘q.

## “To‘g‘ri, lekin olib tashlash kerak” (16 reaksiya)

Ekspert 16 ta reaksiyaga “approve” qaror berib, izohda “yangi darslikda berilmagan, olib tashlash kerak” deb yozgan. Loyiha egasi qarori (2026-11-20): **faqat hech bir tajriba ishlatmaydiganlari o‘chiriladi**.

| Reaksiya | Ishlatadigan tajribalar | Natija |
|---|---|---|
| `rxn.nacl-h2so4` | 7.9 | qoldi |
| `rxn.cuo-hcl` | 7.9 | qoldi |
| `rxn.naoh-hcl` | 7.9 | qoldi |
| `rxn.co2-water` | 7.11 | qoldi |
| `rxn.zncl2-naoh` | 8.6, 9.16 | qoldi |
| `rxn.znoh2-hcl` | 8.6, 9.16 | qoldi |
| `rxn.agno3-nacl` | 8.1, 8.8, 8.9 | qoldi |
| `rxn.agno3-nabr` | 8.8 | qoldi |
| `rxn.agno3-nai` | 8.8 | qoldi |
| `rxn.cl2-kbr` | 8.10 | qoldi |
| `rxn.br2-ki` | 8.10 | qoldi |
| `rxn.bacl2-h2so4` | 8.1 (javon), 8.13; ionli model | qoldi |
| `rxn.nh4cl-caoh2` | 8.14 | qoldi |
| `rxn.na2s-hcl` | — | **o‘chirildi** |
| `rxn.cuso4-na2s` | — | **o‘chirildi** |
| `rxn.p-combustion` | — | **o‘chirildi** |

`rxn.bacl2-h2so4` dastlab “ishlatilmaydi” deb hisoblangan edi, lekin uni 8.1-laboratoriya javoni (BaCl₂ va H₂SO₄), 8.13-tajriba triaji va ionli tenglama modeli ishlatadi — shuning uchun u qoldi.

Qolgan 13 ta reaksiya 8–9-sinf tajribalarida ishlatiladi. Ular 7-sinf darsligida yo‘q; 7-sinf mavzulariga bog‘lash yoki bog‘lamaslik — 7-sinf mavzularini moslash ishi (metodist).

## O‘chirilgan reaksiyalarga tegishli 7 ta qaror (so‘zma-so‘z)

```json
[
  {
    "assertionId": "reaction:rxn.na2s-hcl",
    "assertionHash": "9d0e3cefade852bcc45f33b026225b883ab3f635e4bf602f11c3d46c11529979",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:04.783Z",
    "comment": "Yangi dasrilkda  bu reaksiyalar berilmagan, bu reaksiyani olib tashlash kerak"
  },
  {
    "assertionId": "observation:rxn.na2s-hcl",
    "assertionHash": "c82e233fa4f200dee39d7ec22e5b80819584137555cb4d3a464a9ed42cdc427d",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:08.327Z"
  },
  {
    "assertionId": "reaction:rxn.cuso4-na2s",
    "assertionHash": "3de39a3c8cb7e9c84d7d1769627a8c58997ede4ce709d0a2c35542a767d4b13c",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:14.206Z",
    "comment": "Yangi dasrilkda  bu reaksiyalar berilmagan, bu reaksiyani olib tashlash kerak"
  },
  {
    "assertionId": "observation:rxn.cuso4-na2s",
    "assertionHash": "2eb20d73f80b846deb0c5fb879bfd406052a885031c058db45a5f8735ad1312c",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:17.999Z"
  },
  {
    "assertionId": "reaction:rxn.p-combustion",
    "assertionHash": "b5159c653bd640dab67c8cffea84137a937e5e686d6a651f5ca25c99cc479144",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:23.007Z",
    "comment": "Yangi dasrilkda  bu reaksiyalar berilmagan, bu reaksiyani olib tashlash kerak"
  },
  {
    "assertionId": "condition:rxn.p-combustion",
    "assertionHash": "7c89472822fdd1a151b26e2b5faa8d02de7f688526817c70a09e4c2bb6a94a97",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:26.207Z"
  },
  {
    "assertionId": "observation:rxn.p-combustion",
    "assertionHash": "5ea890c5d64ec841ee22856efdfc1bbdf72ac02288120319854f1ea7b7137d2f",
    "decision": "approve",
    "reviewerId": "Xasanova Sevara",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-04T04:05:28.647Z"
  }
]
```

## Darslik bilan farqlar (ekspert e’tiboriga)

- `observation:rxn.nh3-hcl` — “ko‘zga ko‘rinadigan o‘zgarish yo‘q” deb tasdiqlangan. Darslik 47-betida esa “ammoniy xloridning zich oq bug‘lari” hosil bo‘ladi deyilgan.
- `observation:rxn.h2-combustion`, `rxn.naoh-hcl`, `rxn.cl2-kbr`, `rxn.br2-ki` — “rangi o‘zgaradi” qaysi rangga ekani yozilmagan holda tasdiqlangan.
- `observation:rxn.nacl-h2so4` (gaz, lekin mahsulotda gaz belgilanmagan) va `observation:rxn.znoh2-hcl` (cho‘kma, lekin erimaydigan mahsulot yo‘q) — dastur bayroqlagan, ekspert tasdiqlagan.

Bu bandlar ekspert qarori sifatida qoladi; agar ekspert qayta ko‘rmoqchi bo‘lsa, kuzatuv yozuvi o‘zgartiriladi va eski qaror avtomatik eskiradi.

## NaCl va xavf belgilari (ekspert xulosasi, so‘zma-so‘z)

```
# NaCl va xavf belgilari bo‘yicha xulosa
Tekshiruvchi: Xasanova Sevara
NaCl masalasi: C-yo‘l. Izoh: 7-sinflar o'quv maqsadlarida kumush ko'zgu reaksiyasi berilishi nazarda tutilmagan. Bu yuqori sinflarda to'liq izohlanadi
O2 (oksidlovchi*): to‘g‘ri
H2 (yonuvchan): to‘g‘ri
HCl (o‘yuvchi): to‘g‘ri
H2SO4 (o‘yuvchi): to‘g‘ri
HNO3 (o‘yuvchi, oksidlovchi*): to‘g‘ri
NaOH (o‘yuvchi): to‘g‘ri
Ca(OH)2 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish kerak. "o'yuvchi"ga
CaO (o‘yuvchi): to‘g‘ri
Mg (yonuvchan): to‘g‘ri
S (yonuvchan): to‘g‘ri
KNO3 (oksidlovchi*): to‘g‘ri
NH4Cl (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish  
Tegishli ogohlantirish piktogrammasi — GHS07 (undov belgisi)
NH4NO3 (oksidlovchi*): to‘g‘ri
Na2CO3 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
Na2S (zaharli): to‘g‘ri
ZnCl2 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish. O‘yuvchi (korroziv) variantda berish
AlCl3 (o‘yuvchi): to‘g‘ri
CuSO4 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
AgNO3 (o‘yuvchi): to‘g‘ri
Br2 (zaharli, o‘yuvchi): to‘g‘ri
I2 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
zaharli
Cl2 (zaharli, oksidlovchi*): to‘g‘ri
etanol (yonuvchan): to‘g‘ri
sirka (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
"kuydiruvchi"
SO2 (zaharli, ta’sirlovchi*): to‘g‘ri
ZnSO4 (ta’sirlovchi*): to‘g‘ri — Ta'sirlovchi atamasini o'zgartirish
ko‘zni jiddiy shikastlovchi
CuCl2 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
NaHSO4 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
BaCl2 (zaharli): to‘g‘ri
NH3 (zaharli, ta’sirlovchi*): to‘g‘ri
NaNO3 (oksidlovchi*): to‘g‘ri
K2S (zaharli): to‘g‘ri
P (yonuvchan): to‘g‘ri
P2O5 (o‘yuvchi): to‘g‘ri
H3PO4 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
Na3PO4 (ta’sirlovchi*): tuzatish kerak — Ta'sirlovchi atamasini o'zgartirish
SO3 (o‘yuvchi): to‘g‘ri — Ta'sirlovchi atamasini o'zgartirish
H2S (zaharli, yonuvchan): to‘g‘ri
CO (zaharli): to‘g‘ri
Xavf belgilari: 39 / 39 ta modda ko‘rib chiqildi
```

**Hali qo‘llanmagan.** Xavf belgilari uchun kb-review kategoriyasi yo‘q. Ekspert 15 ta moddada “ta’sirlovchi” atamasini o‘zgartirishni so‘ragan, lekin ko‘pchiligida yangi belgi aniq ko‘rsatilmagan (aniq ko‘rsatilganlari: Ca(OH)₂ → o‘yuvchi, ZnCl₂ → o‘yuvchi, sirka → “kuydiruvchi”, I₂ → zaharli, ZnSO₄ → “ko‘zni jiddiy shikastlovchi”, NH₄Cl → GHS07). Har bir modda uchun yangi kod ekspert bilan kelishilgach, `species.json` alohida o‘zgarish bilan yangilanadi.

NaCl masalasi: ekspert **C-yo‘l**ni tanlagan (hech narsa o‘zgartirilmaydi). Ma’lumot o‘zgarmaydi; `rxn.agno3-nacl` Reaksiya izlagichda ochilmay qoladi.
