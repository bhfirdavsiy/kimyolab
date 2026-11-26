# TT 4.2 — Kimyo ekspert review paketi

> Bu fayl `npm run chemistry:expert-packet` bilan generatsiya qilinadi; qo‘lda tahrirlamang. Mashina faqat **strukturaviy tekshiruv** qiladi va qaror qabul qilinadigan da’volarni sanaydi. Hech bir band tasdiqlanmagan: har biri `PENDING`. Qaror faqat inson tomonidan `content-src/chemistry-reviews.json` ga yoziladi.

## Qabul mezoni

- Mezon: 28/28 reactions reviewed by a chemistry expert; 0 unapproved assertions shown as approved
- Ekspert ko‘rib chiqqan: **0/48**
- Holat: **NOT_MET — human review outstanding (DRAFT/PENDING never counts as PASS)**
- Tasdiqsiz “reviewed” ko‘rsatilganlar: 0

## Mashina tekshiruvlari (qaror emas)

| Tekshiruv | Natija |
|---|---|
| Tenglama o‘qildi | 47/48 |
| Formulalar yozuvga mos | 47/48 |
| Atomlar saqlangan | 47/48 |
| Zaryad saqlangan | 47/48 |
| Kanonik balancer bilan mos koeffitsientlar | 47/48 |
| Strelka ↔ direction | 47/48 |
| Species aniqlangan (formula + faza) | 47/48 |
| Noma’lum condition maydoni (REJECT) | 0 |
| Kuzatuv bayroqlari | 13 |
| Yaroqli manba | 0/48 |
| Species identity buzilishi | 0 (101 ta yozuv) |
| Formula o‘rnida nom (parser qo‘llamaydi) | 6: `species.etanol`, `species.kraxmal`, `species.saxaroza`, `species.sirka`, `species.moy`, `species.indikator` |

Qaror kutayotgan da’volar: **122** (reaction / condition / observation).

## Reaksiyalar

| # | Reaksiya | Tenglama | Atom | Zaryad | Balancer | Species | Bayroq | Qarorlar |
|---|---|---|---|---|---|---|---|---|
| 1 | `rxn.h2-combustion` | 2H2 + O2 → 2H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_NONSPECIFIC | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 2 | `rxn.c-combustion` | C + O2 → CO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 3 | `rxn.s-combustion` | S + O2 → SO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 4 | `rxn.fe-combustion` | 3Fe + 2O2 → Fe3O4 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 5 | `rxn.zn-hcl` | Zn + 2HCl → ZnCl2 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 6 | `rxn.zn-h2so4` | Zn + H2SO4 → ZnSO4 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 7 | `rxn.mg-h2so4` | Mg + H2SO4 → MgSO4 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 8 | `rxn.h2-cuo` | H2 + CuO → Cu + H2O | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 9 | `rxn.nacl-h2so4` | NaCl + H2SO4 → NaHSO4 + HCl | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_PRODUCT_MISMATCH | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 10 | `rxn.cuo-hcl` | CuO + 2HCl → CuCl2 + H2O | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 11 | `rxn.naoh-hcl` | NaOH + HCl → NaCl + H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_NONSPECIFIC | `reaction` pending<br>`observation` pending |
| 12 | `rxn.caco3-hcl` | CaCO3 + 2HCl → CaCl2 + H2O + CO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 13 | `rxn.cao-water` | CaO + H2O → Ca(OH)2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 14 | `rxn.co2-water` | CO2 + H2O ⇌ H2CO3 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 15 | `rxn.zncl2-naoh` | ZnCl2 + 2NaOH → Zn(OH)2 + 2NaCl | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 16 | `rxn.znoh2-hcl` | Zn(OH)2 + 2HCl → ZnCl2 + 2H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_PRODUCT_MISMATCH | `reaction` pending<br>`observation` pending |
| 17 | `rxn.agno3-nacl` | AgNO3 + NaCl → AgCl + NaNO3 | BALANCED | BALANCED | AGREES | UNRESOLVED | — | `reaction` pending<br>`observation` pending |
| 18 | `rxn.agno3-nabr` | AgNO3 + NaBr → AgBr + NaNO3 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 19 | `rxn.agno3-nai` | AgNO3 + NaI → AgI + NaNO3 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 20 | `rxn.cl2-kbr` | Cl2 + 2KBr → 2KCl + Br2 | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_NONSPECIFIC | `reaction` pending<br>`observation` pending |
| 21 | `rxn.br2-ki` | Br2 + 2KI → 2KBr + I2 | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_NONSPECIFIC | `reaction` pending<br>`observation` pending |
| 22 | `rxn.bacl2-h2so4` | BaCl2 + H2SO4 → BaSO4 + 2HCl | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 23 | `rxn.nh4cl-caoh2` | 2NH4Cl + Ca(OH)2 → 2NH3 + CaCl2 + 2H2O | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 24 | `rxn.nh3-hcl` | NH3 + HCl → NH4Cl | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 25 | `rxn.c-combustion-limited` | 2C + O2 → 2CO | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 26 | `rxn.mg-combustion` | 2Mg + O2 → 2MgO | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_MISSING | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 27 | `rxn.no-o2` | 2NO + O2 → 2NO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 28 | `rxn.co-combustion` | 2CO + O2 → 2CO2 | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_MISSING | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 29 | `rxn.na-cl2` | 2Na + Cl2 → 2NaCl | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_MISSING | `reaction` pending<br>`observation` pending |
| 30 | `rxn.ag2o-decomposition` | 2Ag2O → 4Ag + O2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 31 | `rxn.caco3-decomposition` | CaCO3 → CaO + CO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 32 | `rxn.mgo-water` | MgO + H2O → Mg(OH)2 | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_PRODUCT_MISMATCH | `reaction` pending<br>`observation` pending |
| 33 | `rxn.hgo-decomposition` | 2HgO → 2Hg + O2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 34 | `rxn.h2o-electrolysis` | 2H2O → 2H2 + O2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 35 | `rxn.fe-s` | Fe + S → FeS | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 36 | `rxn.hno3-caco3` | 2HNO3 + CaCO3 → Ca(NO3)2 + H2O + CO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 37 | `rxn.koh-hno3` | KOH + HNO3 → KNO3 + H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_MISSING | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 38 | `rxn.koh-hcl` | KOH + HCl → KCl + H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_MISSING | `reaction` pending<br>`observation` pending |
| 39 | `rxn.mg-hcl` | Mg + 2HCl → MgCl2 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 40 | `rxn.fe-hcl` | Fe + 2HCl → FeCl2 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 41 | `rxn.malachite-decomposition` | Cu2(OH)2CO3 → 2CuO + H2O + CO2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 42 | `rxn.cu-hcl` | Cu + HCl → reaksiya bormaydi | NO_REACTION_RECORD | — | — | RESOLVED | — | `no-reaction` pending<br>`condition` pending<br>`observation` pending |
| 43 | `rxn.fe-h2so4` | Fe + H2SO4 → FeSO4 + H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 44 | `rxn.al-hcl` | 2Al + 6HCl → 2AlCl3 + 3H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 45 | `rxn.al-h2so4` | 2Al + 3H2SO4 → Al2(SO4)3 + 3H2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`condition` pending<br>`observation` pending |
| 46 | `rxn.caoh2-co2` | Ca(OH)2 + CO2 → CaCO3 + H2O | BALANCED | BALANCED | AGREES | RESOLVED | OBSERVATION_PRODUCT_MISMATCH | `reaction` pending<br>`observation` pending |
| 47 | `rxn.cl2-nabr` | Cl2 + 2NaBr → 2NaCl + Br2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |
| 48 | `rxn.cl2-nai` | Cl2 + 2NaI → 2NaCl + I2 | BALANCED | BALANCED | AGREES | RESOLVED | — | `reaction` pending<br>`observation` pending |

Har bir da’voning `assertionId` va `assertionHash` qiymatlari: `reports/chemistry-expert-review-packet.json` → `reactions[].decisions[]`.

## rxn.agno3-nacl — NaCl(aq) qarori

Topilma: yozuv NaCl(aq) ni nomlaydi; registrda: species.nacl (s).

- **A.** author a canonical NaCl(aq) species record (with source and review), keep the reaction record as written
- **B.** change the reaction record so its NaCl participant names a phase the registry holds (a chemistry change — needs the same review)
- **C.** keep both as they are: the record stays unreachable in the explorer (PHASE_NOT_IN_REGISTRY), no learner claim changes

Agent tanlamaydi (variantlar tartibi tavsiya emas). Qaror: **PENDING**.

## Xavf da’volari (safety review)

46 ta species 62 ta xavf kodini da’vo qiladi; reaksiyalarda 23 ta safety tegi bor. Manba: INTERNAL_PROPOSAL (yaroqsiz). Xavf uchun kb-review kategoriyasi hali yo‘q — review yo‘lini inson belgilashi kerak.

| Species | Faza | Xavf kodlari | Qaror |
|---|---|---|---|
| `species.o2` (O2) | g | oxidizer | PENDING |
| `species.h2` (H2) | g | flammable | PENDING |
| `species.hcl` (HCl) | aq | corrosive | PENDING |
| `species.h2so4` (H2SO4) | aq | corrosive | PENDING |
| `species.hno3` (HNO3) | aq | corrosive, oxidizer | PENDING |
| `species.naoh` (NaOH) | aq | corrosive | PENDING |
| `species.camoh2` (Ca(OH)2) | aq | corrosive | PENDING |
| `species.cao` (CaO) | s | corrosive | PENDING |
| `species.mg` (Mg) | s | flammable | PENDING |
| `species.s` (S) | s | flammable | PENDING |
| `species.kno3` (KNO3) | s | oxidizer | PENDING |
| `species.nh4cl` (NH4Cl) | s | irritant | PENDING |
| `species.nh4no3` (NH4NO3) | s | oxidizer | PENDING |
| `species.na2co3` (Na2CO3) | s | irritant | PENDING |
| `species.na2s` (Na2S) | s | toxic | PENDING |
| `species.zncl2` (ZnCl2) | aq | corrosive | PENDING |
| `species.alcl3` (AlCl3) | aq | corrosive | PENDING |
| `species.cuso4` (CuSO4) | aq | irritant | PENDING |
| `species.agno3` (AgNO3) | aq | corrosive | PENDING |
| `species.br2` (Br2) | l | toxic, corrosive | PENDING |
| `species.i2` (I2) | s | toxic | PENDING |
| `species.cl2` (Cl2) | g | toxic, oxidizer | PENDING |
| `species.etanol` (etanol) | l | flammable | PENDING |
| `species.sirka` (sirka) | aq | flammable, corrosive, irritant | PENDING |
| `species.so2` (SO2) | g | toxic, irritant | PENDING |
| `species.cucl2` (CuCl2) | aq | irritant | PENDING |
| `species.nahso4` (NaHSO4) | s | corrosive | PENDING |
| `species.bacl2` (BaCl2) | aq | toxic | PENDING |
| `species.nh3` (NH3) | g | toxic, irritant | PENDING |
| `species.nano3` (NaNO3) | aq | oxidizer | PENDING |
| `species.k2s` (K2S) | aq | toxic | PENDING |
| `species.p` (P) | s | flammable | PENDING |
| `species.p2o5` (P2O5) | s | corrosive | PENDING |
| `species.h3po4` (H3PO4) | aq | irritant | PENDING |
| `species.na3po4` (Na3PO4) | aq | irritant | PENDING |
| `species.so3` (SO3) | g | corrosive | PENDING |
| `species.h2s` (H2S) | g | toxic, flammable | PENDING |
| `species.co` (CO) | g | toxic | PENDING |
| `species.no` (NO) | g | toxic, irritant, oxidizer | PENDING |
| `species.no2` (NO2) | g | toxic, corrosive, oxidizer | PENDING |
| `species.na` (Na) | s | flammable, corrosive | PENDING |
| `species.ag2o` (Ag2O) | s | irritant, oxidizer | PENDING |
| `species.hgo` (HgO) | s | toxic, irritant | PENDING |
| `species.hg` (Hg) | l | toxic | PENDING |
| `species.koh` (KOH) | aq | corrosive | PENDING |
| `species.malachite` (Cu2(OH)2CO3) | s | toxic, irritant | PENDING |
