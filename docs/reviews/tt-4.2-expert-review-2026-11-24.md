# TT 4.2 — kimyo eksperti tekshiruvi, 5-bosqich (2026-11-24)

Tekshiruvchi: Xasanova Sevara Giyosiddinovna (kimyo). Eksport vaqti: 2026-11-24T07:17:39.894Z.
Manba: ekspert tekshiruvi 5-sahifasidan eksport qilingan matn; loyiha egasi uni shu suhbatga joylagan.
Sahifa bazasida yozuv yo‘q edi, shuning uchun bu matn asosiy manba hisoblanadi.

## 1. Element nomlari (118 ta)

- **116 ta tasdiq**: `docs/reviews/tt-4.2-expert-decisions-2026-11-24.json`.
  - Hammasining hashi joriy bazaga mos keladi, tekshiruvda muammo chiqmadi.
  - Importni faqat inson bajaradi: `npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-24.json`.
  - Bu hujjat registrga (`content-src/chemistry-reviews.json`) yozilmadi.
- Avval ziddiyatli bo‘lgan 5 ta nomdan 3 tasi joriy yozilishi bilan tasdiqlandi: Y Ittriy, Lu Lyutetsiy, Hs Xassiy.
- **2 ta o‘zgartirish so‘rovi** ekspert aytgandek kiritildi. Eski hash eskirgani uchun ular qayta tasdiqlashga yuboriladi:

| Da’vo | Avval | Endi | Ekspert izohi (so‘zma-so‘z) | Vaqt |
|---|---|---|---|---|
| `element-name:As` (hash `e34ba8e7…`) | Margimush | Mishyak | “To‘g‘ri yozilishi: Mishyak” | 2026-11-24T07:13:58.886Z |
| `element-name:Nh` (hash `eebcfea5…`) | Nixoniy | Nihoniy | “To‘g‘ri yozilishi: Nihoniy” | 2026-11-24T07:17:37.262Z |

## 2. Reaksiya takliflari (8 ta)

Takliflar hali baza da’vosi emas edi (hash yo‘q), shuning uchun ular import qilinmaydi.
Quyida ekspert javoblari o‘zgarishsiz berilgan:

```json
[
  {"proposal":"p.fe-h2so4","equation":"Fe + H2SO4 → FeSO4 + H2↑","condition":"suyultirilgan kislota","observation":"gaz ajraladi","decision":"approve","reviewedAt":"2026-11-24T04:41:01.118Z"},
  {"proposal":"p.al-hcl","equation":"2Al + 6HCl → 2AlCl3 + 3H2↑","condition":"suyultirilgan kislota","observation":"gaz ajraladi","decision":"approve","reviewedAt":"2026-11-24T04:41:04.630Z"},
  {"proposal":"p.al-h2so4","equation":"2Al + 3H2SO4 → Al2(SO4)3 + 3H2↑","condition":"suyultirilgan kislota","observation":"gaz ajraladi","decision":"approve","reviewedAt":"2026-11-24T04:41:10.870Z"},
  {"proposal":"p.caoh2-co2","equation":"Ca(OH)2 + CO2 → CaCO3↓ + H2O","condition":"shart yo‘q (xona harorati)","observation":"ohakli suv loyqalanadi (oq cho‘kma)","decision":"approve","reviewedAt":"2026-11-24T04:41:21.054Z"},
  {"proposal":"p.kmno4-decomposition","equation":"2KMnO4 → K2MnO4 + MnO2 + O2↑","condition":"qizdirish","observation":"gaz ajraladi","decision":"reject","reviewedAt":"2026-11-24T04:41:37.942Z","comment":"Sabab bu modda maktab laboratoriyasidan chiqarilgan."},
  {"proposal":"p.cl2-nabr","equation":"Cl2 + 2NaBr → 2NaCl + Br2","condition":"shart yo‘q (xona harorati, eritmalar)","observation":"eritma rangi o‘zgaradi (qaysi rangga — izohda yozing)","decision":"change_required","reviewedAt":"2026-11-24T06:57:59.708Z","source":"8-sinf 94-bet. Darslikda kaliy bromid bilan berilgan","comment":"Kuzatuv: natriy bromidning rangsiz eritmasi brom ajralib chiqishi natijasida sariq-to‘q sariq yoki qo‘ng‘ir tusga kiradi. Rangning intensivligi hosil bo‘lgan brom konsentratsiyasiga bog‘liq."},
  {"proposal":"p.cl2-nai","equation":"Cl2 + 2NaI → 2NaCl + I2","condition":"shart yo‘q (xona harorati, eritmalar)","observation":"eritma rangi o‘zgaradi (qaysi rangga — izohda yozing)","decision":"change_required","reviewedAt":"2026-11-24T07:11:33.710Z","source":"8-sinf 94-bet. Darslikda kaliy bromid bilan berilgan","comment":"Reaksiya tenglamasi kimyoviy jihatdan to‘g‘ri. Reaksiya xona haroratida, suvli eritmada boradi. Natriy yodidning rangsiz eritmasi yod hosil bo‘lishi natijasida sariq-qo‘ng‘ir yoki to‘q qo‘ng‘ir tusga kiradi. Tajriba yo‘riqnomasida NaI eritmasi ko‘rsatilganligi sababli reaksiya tenglamasida NaI ifodalanishi lozim. Tajriba mo‘rili shkafda, xavfsizlik qoidalariga rioya etilgan holda o‘qituvchi tomonidan namoyish etilishi kerak."},
  {"proposal":"p.br2-nai","equation":"Br2 + 2NaI → 2NaBr + I2","condition":"shart yo‘q (xona harorati, eritmalar)","observation":"eritma rangi o‘zgaradi (qaysi rangga — izohda yozing)","decision":"reject","reviewedAt":"2026-11-24T04:45:47.869Z","source":"8-sinf 94-bet. Darslikda kaliy bromid bilan berilgan","comment":"Sharti: xona haroratida, suvli eritmada boradi. Qizdirish va katalizator talab etilmaydi.\nKuzatuv: natriy yodid eritmasiga bromli suv ta’sir ettirilganda yod hosil bo‘lishi natijasida eritma qo‘ng‘ir tusga kiradi."}
]
```

### Nima qilindi

Barcha yangi yozuvlar **ko‘rib chiqilmagan** holatda qo‘shildi. Ekspert endi ularni baza da’volari sifatida (hash bilan) tasdiqlashi kerak, shuning uchun bu taklif qarorlari tasdiq hisoblanmaydi.

| Taklif | Qaror | Bazada |
|---|---|---|
| Fe + H₂SO₄ | tasdiq | `rxn.fe-h2so4`. Yangi modda: `species.feso4` |
| Al + HCl | tasdiq | `rxn.al-hcl` |
| Al + H₂SO₄ | tasdiq | `rxn.al-h2so4`. Yangi modda: `species.al2so43` |
| Ca(OH)₂ + CO₂ | tasdiq | `rxn.caoh2-co2`, oq cho‘kma |
| 2KMnO₄ → … | rad | qo‘shilmadi. 7.7 uchun boshqa kislorod manbai kerak |
| Cl₂ + 2NaBr | o‘zgartirish | `rxn.cl2-nabr`. Kuzatuv: rangsiz → qo‘ng‘ir (ekspert matni yuqorida) |
| Cl₂ + 2NaI | o‘zgartirish | `rxn.cl2-nai`. Kuzatuv: rangsiz → qo‘ng‘ir. Ekspert talabi: faqat o‘qituvchi namoyishi, mo‘rili shkafda |
| Br₂ + 2NaI | rad | qo‘shilmadi. **Savol:** qaror “rad”, lekin izohda shart va kuzatuv yozilgan (tasdiqqa o‘xshaydi). Ekspertdan aniqlik so‘raladi |

**Qolgan ishlar va ochiq savollar:**

- **Manbalar.** Ikkita yangi manba PROPOSED holatida ro‘yxatga olindi, inson ularni hali qabul qilmagan:
  - `src.textbook.kimyo8` — “8-sinf 94-bet”. Muallif, nashriyot va yil hali yo‘q.
  - `src.expert-review.tt-4.2-stage5` — bu ichki taklif, nashr emas.
  - Ekspertning so‘zi bilan aytganda, darslikda reaksiya kaliy bromid bilan berilgan.
- **Xavf belgilari.** FeSO₄ va Al₂(SO₄)₃ uchun xavf belgilari hali hal qilinmagan, `hazards` bo‘sh. Bu “xavf yo‘q” degani emas, ekspertga savol.
- **Rang.** Ikkala galogen yozuvida rang `brown` (qo‘ng‘ir) deb yozildi, chunki ekspert matnida ikkalasida ham “qo‘ng‘ir” bor. Ekspert esa rang oralig‘ini berdi: sariq-to‘q sariq / sariq-qo‘ng‘ir. Tasdiqlashda shu tekshiriladi.
