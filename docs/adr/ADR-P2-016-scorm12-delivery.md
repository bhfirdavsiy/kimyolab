# ADR-P2-016 — SCORM 1.2 delivery: one package per guided dynamic lab

Status: accepted (owner decision 2026-11-23)

## Context

KimyoLab is to be delivered into a national e-learning portal (raqamlitalim.trm.uz) that imports **SCORM 1.2**
packages. The owner decided that each lab is a separate virtual environment, like a single PhET or Physics Aviary
simulation: one lab, one package.

The product already has one runtime delivered through different hosts (ADR-P2-003). The single-file standalone build
runs offline from one HTML file, which is what a SCORM package needs.

## Decision

- **One SCO per guided dynamic lab profile.** `npm run scorm:build` writes `dist-scorm/kimyolab-<lab>-scorm12.zip`
  (git-ignored) and `reports/scorm-packages.json` (committed, generator-equal). Each zip holds exactly two files:
  `imsmanifest.xml` (SCORM 1.2 / IMS CP 1.1.2) and `index.html`. The `index.html` is the standalone build plus one
  build-time line, `globalThis.__KIMYOLAB_SCORM__={"standard":"1.2","activityId":…}`, and the lab's title.
- **Route lock.** In a package the app shows only that lab: other routes redirect to it and the site navigation is
  hidden. The classic practice link is not offered, because that route keeps its own browser-local attempt outside the
  LMS. Building the package is the decision to show the lab, so the `guidedDynamicLabV1` flag is not needed inside it.
- **Run-time (src/app/scorm12.ts).** This is the only module that talks to the LMS:
  - API discovery follows the SCORM 1.2 RTE: the window, then its parents (at most 7), then the opener chain.
    Cross-origin frames are skipped.
  - `cmi.core.lesson_status` is set to `incomplete` on open, unless already completed, and to `completed` when the lab
    runtime reports the lab complete. A completed record is never downgraded.
  - `cmi.suspend_data` holds the accepted lab actions, bound to the profile id and the activity and config versions.
    On resume (`cmi.core.entry` is `resume`) the same deterministic runtime replays them. It stops at the first action
    that is not accepted, so data for another version is never forced. The value has at most 4096 characters and is
    never truncated: an action log that does not fit is simply not written, and the status still is.
  - `cmi.core.session_time` and `cmi.core.exit` are set on page exit (`suspend` while incomplete, empty once
    completed), then `LMSCommit` and `LMSFinish`.
- **Never written: `cmi.core.score.raw`, `passed` or `failed`.** The guided dynamic lab is not an assessment, so no
  score exists. Reporting one would fabricate a grade.
- **Without an LMS** the lab runs and the page says that nothing is saved. If `LMSInitialize` fails, the page says the
  platform could not be reached.

## Consequences and known gaps

All of these are listed in `reports/scorm-packages.json#knownGaps`.

- `SCHEMA_XSD_NOT_BUNDLED`: the manifest names the ADL/IMS XSD files but the package does not carry them.
- `TARGET_LMS_NOT_TESTED`: the packages are tested against a SCORM 1.2 API stub in Chromium
  (`tests/e2e/scorm12-package.spec.mjs`), not yet in the target portal. The portal could not be reached from the build
  environment.
- `PACKAGE_CARRIES_FULL_CONTENT_PACK`: about 3 MB per package, because each one carries the whole standalone build.
- Lab chemistry is unchanged. A no-reaction record is still shown only once reviewed (TT 4.2.6), inside an LMS as
  everywhere else.
