# TT 4.2 — Kimyo eksperti ko‘rigi, 3-bosqich (2026-11-23)

Ekspert: **Xasanova Sevara Giyosiddinovna** (kimyo). Sahifa: “Kimyo ekspert tekshiruvi 3” — 2026-11-20 da darslikdan qo‘shilgan 16 reaksiya va yangi moddalarning xavf belgilari. Ekspert javobi Telegram orqali 4 qismda keldi; qismlar birlashtirildi, matn o‘zgartirilmadi.

## Holat

| | Natija |
|---|---|
| Da’volar | 45 / 45 ga qaror berilgan: 40 tasdiq, 5 “o‘zgartirish kerak”, 0 rad |
| Importga tayyor | 40 qaror — `docs/reviews/tt-4.2-expert-decisions-2026-11-23.json` (importer tekshiruvi: 0 xato) |
| “O‘zgartirish kerak” | 5 ta — yozuvlar ekspert aytgandek tuzatildi (pastda); bu qarorlar importga kiritilmadi |
| Xavf belgilari | 18 / 18 moddaga javob — `species.json` ga kiritildi |

`condition:rxn.ag2o-decomposition` yozuvi Telegram xabari bo‘lingan joyga to‘g‘ri kelgan; u bitta yozuv: **approve**, izoh “160–200 °C haroratda parchalanadi”. Shart (“qizdirish”) o‘zgartirilmadi; aniq harorat oralig‘i reaksiya izlagichida hali shart sifatida qo‘llanmaydi.

**Import (faqat inson):**

```
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-04.json
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-20.json
npm run chemistry:review-import -- docs/reviews/tt-4.2-expert-decisions-2026-11-23.json
npm run review:build
```

Uchala fayl joriy kontentga qarshi tekshirildi: jami 100 qaror, 0 xato.

## Ekspert so‘ragan o‘zgarishlar (kiritildi)

| Da’vo | Ekspert izohi | Kiritilgan o‘zgarish |
|---|---|---|
| `condition:rxn.na-cl2` | “Natriy xlor bilan xona haroratida ham reaksiyaga kirishadi.” | shart olib tashlandi (“qizdirish” yo‘q) |
| `observation:rxn.caco3-decomposition` | “Gaz ajraladi” | kuzatuv: gaz ajraladi |
| `observation:rxn.hgo-decomposition` | “Gaz ajraladi” | kuzatuv: gaz ajraladi |
| `observation:rxn.malachite-decomposition` | “Gaz ajraladi” | kuzatuv: gaz ajraladi |
| `observation:rxn.mgo-water` | “oq loyqa yoki suspenziya hosil bo'ladi. Issiqlik ajraladi(ekzotermik reaksiya)” | kuzatuv: oq cho‘kma (`precipitate`, oq) + harorat ko‘tariladi |

MgO + H2O uchun “oq loyqa yoki suspenziya” dasturning kuzatuv turlaridan eng yaqini — **oq cho‘kma** bilan yozildi; buni ekspert keyingi qisqa tekshiruvda tasdiqlaydi. Tuzatilgan 5 ta yozuvning hashi o‘zgardi: ular yangi qaror kutadi.

Bu 5 ta qaror so‘zma-so‘z:

```json
[
  {
    "assertionId": "condition:rxn.na-cl2",
    "assertionHash": "005bd8d0540ad3a27bb153feeccab51c7d0c2d8de3b310f8d0755ba1ca56b7ba",
    "decision": "change_required",
    "reviewerId": "Xasanova Sevara Giyosiddinovna",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-23T04:01:56.599Z",
    "comment": "Natriy xlor bilan xona haroratida ham reaksiyaga kirishadi."
  },
  {
    "assertionId": "observation:rxn.caco3-decomposition",
    "assertionHash": "5686f9688f672c5a70347984cbf7a91fd77b94d756f72dced1ef74c52145a39a",
    "decision": "change_required",
    "reviewerId": "Xasanova Sevara Giyosiddinovna",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-23T04:06:09.833Z",
    "comment": "Gaz ajraladi"
  },
  {
    "assertionId": "observation:rxn.mgo-water",
    "assertionHash": "5686f9688f672c5a70347984cbf7a91fd77b94d756f72dced1ef74c52145a39a",
    "decision": "change_required",
    "reviewerId": "Xasanova Sevara Giyosiddinovna",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-23T04:09:19.418Z",
    "comment": "oq loyqa yoki suspenziya hosil bo'ladi. Issiqlik ajraladi(ekzotermik reaksiya)"
  },
  {
    "assertionId": "observation:rxn.hgo-decomposition",
    "assertionHash": "5686f9688f672c5a70347984cbf7a91fd77b94d756f72dced1ef74c52145a39a",
    "decision": "change_required",
    "reviewerId": "Xasanova Sevara Giyosiddinovna",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-23T04:09:31.482Z",
    "comment": "Gaz ajraladi"
  },
  {
    "assertionId": "observation:rxn.malachite-decomposition",
    "assertionHash": "cb073be32e25f39dbf498fa78929f461dcceca07a3ee9d1e6bf94bf99cc0c5a4",
    "decision": "change_required",
    "reviewerId": "Xasanova Sevara Giyosiddinovna",
    "reviewerRole": "chemistry",
    "reviewedAt": "2026-11-23T04:11:58.602Z",
    "comment": "Gaz ajraladi"
  }
]
```

## Xavf belgilari (kiritildi)

Ekspert javobi so‘zma-so‘z:

```
MgO (species.mgo): belgi kerak emas
NO (species.no): belgilar: zaharli, ta’sirlovchi, oksidlovchi
NO2 (species.no2): belgilar: zaharli, o‘yuvchi, oksidlovchi
Na (species.na): belgilar: yonuvchan, o‘yuvchi
Ag2O (species.ag2o): belgilar: ta’sirlovchi, oksidlovchi
Ag (species.ag): belgi kerak emas
Mg(OH)2 (species.mgoh2): belgi kerak emas
HgO (species.hgo): belgilar: zaharli, ta’sirlovchi
Hg (species.hg): belgilar: zaharli
FeS (species.fes): belgi kerak emas
Ca(NO3)2 (species.cano32): belgi kerak emas
KOH (species.koh): belgilar: o‘yuvchi
MgCl2 (species.mgcl2): belgi kerak emas
FeCl2 (species.fecl2): belgi kerak emas
Cu2(OH)2CO3 (species.malachite): belgilar: zaharli, ta’sirlovchi
sirka (species.sirka): belgilar: yonuvchan, o‘yuvchi, ta’sirlovchi — o'yuvchi-kuydiruvchi.
ZnSO4 (species.znso4): belgi kerak emas
NH4Cl (species.nh4cl): belgilar: ta’sirlovchi
```

`species.json` da o‘zgarganlar: NO, NO2, Na, Ag2O, HgO, malaxit — yangi belgilar; sirka → yonuvchan, o‘yuvchi, ta’sirlovchi (izoh: “o'yuvchi-kuydiruvchi”); ZnSO4 → belgi yo‘q (oldin ta’sirlovchi). Hg, KOH, NH4Cl va belgisiz moddalar o‘zgarmadi. Xavf da’volari uchun kb-review kategoriyasi hali yo‘q; bu belgilar ekspertning shu javobiga asoslangan.

## Ochiq qolganlar

- Tuzatilgan 5 ta yozuvning qayta tasdiqlashi (qisqa 4-bosqich).
- `Cu + HCl` (“reaksiya bormaydi”): laboratoriya yo‘liga review tekshiruvi qo‘shilgach.
