// SCORM 1.2 package in real Chromium, inside a stub LMS player (the SCORM 1.2 API on the parent window, the package in
// an iframe, same origin — as an LMS serves it). Checks what the package writes to the LMS and what it never writes.
//   7.10: partial work → exit 'suspend' → resume replays to the same state → completion → 'completed', never a score
//   outside an LMS: the lab still runs and says nothing is saved
import {test, expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildScormPackages} from '../../scripts/lib/scorm-package.ts';
import {readZip} from '../../scripts/lib/zip.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LAB = '.kl-dlab';
const ORIGIN = 'http://lms.test';

function packageFiles(activityId) {
  const {files, report} = buildScormPackages(root);
  const pkg = report.packages.find((p) => p.activityId === activityId);
  return Object.fromEntries(readZip(files[pkg.file]).map((e) => [e.name, e.data]));
}

// The stub LMS: a minimal SCORM 1.2 API; every call is logged, the CMI data model is a plain object.
const PLAYER = `<!doctype html><html><head><meta charset="utf-8"><title>Stub LMS</title></head><body>
<script>
  const seed = JSON.parse(decodeURIComponent(location.hash.slice(1) || '%7B%7D'));
  window.cmi = Object.assign({'cmi.core.lesson_status': 'not attempted', 'cmi.core.entry': 'ab-initio', 'cmi.suspend_data': ''}, seed);
  window.calls = []; let open = false;
  window.API = {
    LMSInitialize(a) { calls.push(['LMSInitialize', a]); open = true; return 'true'; },
    LMSFinish(a) { calls.push(['LMSFinish', a]); open = false; return 'true'; },
    LMSGetValue(k) { calls.push(['LMSGetValue', k]); return cmi[k] ?? ''; },
    LMSSetValue(k, v) { calls.push(['LMSSetValue', k, v]); if (!open) return 'false'; cmi[k] = String(v); return 'true'; },
    LMSCommit(a) { calls.push(['LMSCommit', a]); return 'true'; },
    LMSGetLastError() { return '0'; }, LMSGetErrorString() { return ''; }, LMSGetDiagnostic() { return ''; },
  };
</script>
<iframe id="sco" src="pkg/index.html" style="width:1200px;height:900px;border:0" title="SCO"></iframe>
</body></html>`;

async function serve(page, files) {
  await page.route(`${ORIGIN}/**`, (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p === '/player.html') return route.fulfill({status: 200, contentType: 'text/html; charset=utf-8', body: PLAYER});
    const rel = p.replace(/^\/pkg\//, '');
    if (p.startsWith('/pkg/') && files[rel]) return route.fulfill({status: 200, contentType: rel.endsWith('.xml') ? 'application/xml' : 'text/html; charset=utf-8', body: files[rel]});
    return route.fulfill({status: 404, body: ''});
  });
}
const sco = (page) => page.frameLocator('#sco');
async function addTo(f, substance, container) {
  await f.locator(`${LAB} [data-object="substance:${substance}"]`).click();
  await f.locator(`${LAB} .kl-dlab__action-list [data-action-family=ADD_SUBSTANCE]`).click();
  await f.locator('#dlab-param-container').selectOption(container);
  await f.locator(`${LAB} .kl-dlab__params button[type=submit]`).click();
}
/** unload the SCO (its pagehide finishes the session) and return what the LMS holds */
async function exitSco(page) {
  await page.evaluate(() => new Promise((r) => { const f = document.getElementById('sco'); f.addEventListener('load', r, {once: true}); f.src = 'about:blank'; }));
  return page.evaluate(() => ({cmi: window.cmi, calls: window.calls}));
}

test('7.10 SCORM 1.2: incomplete → suspend → resume → completed; never a score', async ({page}) => {
  const files = packageFiles('practice.experiment.7.10');
  expect(Object.keys(files).sort()).toEqual(['imsmanifest.xml', 'index.html']);
  expect(files['imsmanifest.xml'].toString()).toContain('<schemaversion>1.2</schemaversion>');
  expect(files['imsmanifest.xml'].toString()).toContain('adlcp:scormtype="sco" href="index.html"');
  await serve(page, files);
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));

  // first session: two trials of four, then the learner leaves
  await page.goto(`${ORIGIN}/player.html`);
  const f = sco(page);
  await expect(f.locator(`${LAB}[data-dynamic-lab="lab-profile.7.10.metal-acid-gas"]`)).toBeVisible();
  await expect(f.locator('[data-dlab-notice=scorm]')).toContainText('platformaga yoziladi');
  await expect(f.locator('.kl-site-header .kl-nav')).toBeHidden();
  await expect(f.locator(`${LAB} a[href*="/practice/"]`)).toHaveCount(0);
  await addTo(f, 'mg', 'tube-1'); await addTo(f, 'h2so4-dilute', 'tube-1');
  await expect(f.locator(`${LAB} .kl-dlab__result`)).toHaveAttribute('data-status', 'accepted');
  let lms = await exitSco(page);
  expect(lms.calls[0]).toEqual(['LMSInitialize', '']);
  expect(lms.cmi['cmi.core.lesson_status']).toBe('incomplete');
  expect(lms.cmi['cmi.core.exit']).toBe('suspend');
  expect(lms.cmi['cmi.core.session_time']).toMatch(/^\d{2,4}:\d{2}:\d{2}\.\d{2}$/);
  expect(lms.calls.at(-1)).toEqual(['LMSFinish', '']);
  const saved = JSON.parse(lms.cmi['cmi.suspend_data']);
  expect([saved.p, saved.c, saved.a.length]).toEqual(['lab-profile.7.10.metal-acid-gas', 0, 2]);

  // second session: the LMS resumes; the same runtime replays the two actions; the learner completes the lab
  await page.goto(`${ORIGIN}/player.html#${encodeURIComponent(JSON.stringify({...lms.cmi, 'cmi.core.entry': 'resume'}))}`);
  await page.reload();
  await expect(f.locator(`${LAB} .kl-dlab__result`)).toHaveAttribute('data-code', 'RESUMED');
  await expect(f.locator(`${LAB} .kl-dlab__result`)).toContainText('Avvalgi ishingiz tiklandi: 2 ta amal.');
  await expect(f.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toHaveCount(1);
  await addTo(f, 'zn', 'tube-2'); await addTo(f, 'hcl-dilute', 'tube-2');
  await f.locator(`${LAB} [data-object="apparatus:gas-collector"]`).click();
  await f.locator(`${LAB} .kl-dlab__action-list [data-action-family=COLLECT_GAS][data-action-from=tube-1]`).click();
  await addTo(f, 'mg', 'tube-4'); await addTo(f, 'hcl-dilute', 'tube-4');
  await addTo(f, 'fe', 'tube-5'); await addTo(f, 'hcl-dilute', 'tube-5');
  await expect(f.locator(`${LAB}[data-complete=true]`)).toBeVisible();
  lms = await exitSco(page);
  expect(lms.cmi['cmi.core.lesson_status']).toBe('completed');
  expect(lms.cmi['cmi.core.exit']).toBe('');
  expect(JSON.parse(lms.cmi['cmi.suspend_data']).c).toBe(1);
  // the dynamic lab is not an assessment: no score, never passed/failed
  const sets = lms.calls.filter((c) => c[0] === 'LMSSetValue');
  expect(sets.some((c) => c[1].startsWith('cmi.core.score'))).toBe(false);
  // this (resumed) session: still incomplete on open, completed once the runtime says so — nothing else
  expect(sets.filter((c) => c[1] === 'cmi.core.lesson_status').map((c) => c[2])).toEqual(['incomplete', 'completed']);
  expect(errors).toEqual([]);
});

test('outside an LMS: the packaged lab runs and says nothing is saved', async ({page}) => {
  await serve(page, packageFiles('practice.experiment.8.14'));
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${ORIGIN}/pkg/index.html`);
  await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.8.14.ammonia-heating"]`)).toBeVisible();
  await expect(page.locator('[data-dlab-notice=scorm]')).toContainText('platformasidan tashqarida');
  await expect(page.locator('#app-main')).toHaveAttribute('data-scorm-connection', 'no-lms');
  // the route is locked to the packaged lab
  await addTo(page, 'nh4cl', 'reaction-tube');
  await expect(page.locator(`${LAB} .kl-dlab__result`)).toHaveAttribute('data-status', 'accepted');
  await page.evaluate(() => { location.hash = '#/labs'; });
  await expect(page).toHaveURL(/#\/dynamic-lab\/practice\.experiment\.8\.14$/);
  await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.8.14.ammonia-heating"]`)).toBeVisible();
  await expect(page.locator(`${LAB} .kl-dlab__result`)).toHaveAttribute('data-status', 'accepted');
  expect(errors).toEqual([]);
});
