# KimyoLab

7–11-sinflar uchun ochiq manbali, o‘zbek tilidagi interaktiv kimyo ta’lim platformasi. Loyiha hozir ishlab chiqilish bosqichida.

[English README](README.md)

## Manbalar

Platforma quyidagi manbalarga asoslanadi:

1. `source/KimyoLab_v20_nazariya_amaliyot_mapping.xlsx` — 122 nazariya va 62 amaliyot uchun tasdiqlangan mapping bazasi.
2. `source/KimyoLab_v19_reference.html` — v19 laboratoriya, nazariya va 118 element ma'lumotlari.

## Sahifalar
- `index.html` — asosiy ilova (Mavzu studiyasi, Virtual laboratoriya, Davriy jadval, Natijalarim).

## Data
- `data/curriculum.json` — 122 nazariya.
- `data/practices.json` — 62 amaliyot + v19 equipment/materials/safety/steps/tasks.
- `data/elements.json` — 118 element.
- `data/summary.json` — sinf va qamrov xulosasi.
- `data/methodology.json` — mapping metodikasi.

## Ishga tushirish
Talab: Node.js 22.18+ (`.nvmrc`).

```
npm ci
npm run build      # content pack + browser preview + dist/
npm start          # faqat dist/ ni http://127.0.0.1:4173 da beradi
```
Windowsda `start.bat`, Linux/macOS’da `start.sh` (dist yo‘q bo‘lsa avval build qiladi).
Server hech qachon repository ildizini bermaydi: faqat `dist/` (yoki `KIMYOLAB_PUBLIC_ROOT`).

## Tekshirish
```
npx playwright install chromium   # E2E uchun bir marta
npm run verify
```
`verify`: lint → typecheck → schema → content → chemistry → unit → integration → E2E → build.
Alohida: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:e2e`.

P0 Integrity Release tafsilotlari: `docs/releases/p0-integrity-release.md`.

## Litsenziya
MIT — [LICENSE](LICENSE). Uchinchi tomon komponentlari: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
