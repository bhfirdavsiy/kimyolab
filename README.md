# KimyoLab

**An open-source, Uzbek-language interactive chemistry learning platform for grades 7–11.**

[O‘zbekcha README](README.uz.md)

KimyoLab gives secondary-school students in Uzbekistan a complete, curriculum-mapped chemistry course in their own language: theory, virtual experiments and practice, linked topic by topic to the national curriculum. It runs in the browser, keeps learner progress on the device, and has an offline single-file build for schools with weak connectivity.

> **Status: in development, pre-release.** The platform is technically complete and is entering expert chemistry review. It has not yet been released to students, and there are no public pilots yet.

## Why

Uzbek-speaking students have very little interactive chemistry material in their own language. The widely used virtual labs are English- or Russian-first, and many schools lack the equipment or safe reagents for practical work. KimyoLab is built to close that gap for the national 7–11 grade chemistry curriculum.

## What is in it

| Area | Scope |
|---|---|
| Curriculum | 122 theory topics (LearningUnits), each following a **Theory → Practice → Reinforcement** cycle |
| Practice | 62 practical assignments mapped to theory |
| Virtual labs | 57 launchable experiments: 30 driven by chemistry engines, 27 guided step-by-step labs |
| Chemistry engines | reactions, ionic precipitation, hydrolysis, equilibrium, kinetics, electrolysis, organic chemistry |
| Periodic table | 118 elements with Uzbek names and links to topics, substances and labs |
| Language | Uzbek (Latin script) |

## Quality and safety

Content that reaches students is held to a fail-closed release process:

- Content, chemistry data and mappings are validated against JSON schemas.
- Every guided lab step is checked against modelled chemistry evidence; reactions are balance-checked.
- Expert and pedagogical approvals are recorded per content version and gate the stable release.
- Unit, integration, end-to-end, security and accessibility checks run in CI on pinned Linux and Windows runners.

## Getting started

Requires Node.js 22.18+ (see `.nvmrc`).

```bash
npm ci
npm run build      # content pack + browser preview + dist/
npm start          # serves dist/ at http://127.0.0.1:4173
```

On Windows use `start.bat`; on Linux/macOS use `start.sh`. The server only ever serves `dist/` (or `KIMYOLAB_PUBLIC_ROOT`), never the repository root.

### Checks

```bash
npx playwright install chromium   # once, for end-to-end tests
npm run verify                     # lint → typecheck → schema → content → chemistry → unit → integration → E2E → build
```

Individual steps: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:integration`, `npm run test:e2e`.

## Project layout

| Path | Contents |
|---|---|
| `content-src/` | Source of truth for curriculum, activities, chemistry data and Uzbek localisation |
| `src/` | TypeScript application: runtime, chemistry engines, renderers, features |
| `public/` | Generated browser preview and content pack (committed) |
| `server/`, `server.mjs` | Hardened static server for `dist/` |
| `scripts/` | Build, validation, release and deployment tooling |
| `schemas/` | JSON schemas for content and reports |
| `tests/` | Unit, integration, E2E and security tests |
| `docs/` | Architecture decisions, specs, governance and status |

Current status in detail: [`docs/status/current-status.md`](docs/status/current-status.md).

## Contributing

Contributions from chemistry teachers, translators and developers are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code and original content are released under the [MIT License](LICENSE). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party components.
