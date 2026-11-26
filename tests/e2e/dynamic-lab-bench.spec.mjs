// Lab review stage 2 (owner decision 2026-11-24): the bench prototype on 7.10. A reagent is picked from the shelf and
// poured into a vessel by a second click (or by dragging it there); the vessel's own actions stand next to the picture.
// The runtime still decides everything: the bench only builds the same actions the list builds.
import {test, expect} from '@playwright/test';
import {startHosts, semanticStore} from './host-scenarios.mjs';

const LAB = '.kl-dlab';
const vessel = (page, id) => page.locator(`[data-dlab-scene] [data-scene-object="apparatus:${id}"]`);
let hosts;
test.beforeAll(async () => { hosts = await startHosts(); });
test.afterAll(async () => { await hosts?.close(); });

for (const name of ['portal', 'standalone']) {
  test(`${name}: 7.10 bench — pick, pour, see the gas from the record next to the picture, collect it from the tube`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await hosts[name].open(page, '/dynamic-lab/practice.experiment.7.10');
    await expect(page.locator(`${LAB} [data-dlab-bench]`)).toBeVisible();
    await expect(page.locator(`${LAB} .kl-bench__shelf [data-bench-substance]`)).toHaveCount(6);
    // the full list is still there, closed
    await expect(page.locator(`${LAB} details.kl-dlab__list-toggle`)).not.toHaveAttribute('open', '');
    // pick → the vessels become pour targets, the hint says what is in hand
    await page.locator(`${LAB} [data-bench-substance=mg]`).click();
    await expect(page.locator(`${LAB} [data-bench-substance=mg]`)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(`${LAB} [data-bench-vessel=tube-1]`)).toHaveAttribute('aria-label', /quyish/);
    // pour by clicking the vessel in the picture
    await vessel(page, 'tube-1').click();
    await expect(vessel(page, 'tube-1').locator('.kl-scene__formula')).toHaveText('Mg');
    await expect(page.locator(`${LAB} .kl-bench__hint`)).toContainText('o‘zgarish yo‘q');
    // the acid, by the vessel button: the record's gas, said next to the picture
    await page.locator(`${LAB} [data-bench-substance=h2so4-dilute]`).click();
    await page.locator(`${LAB} [data-bench-vessel=tube-1]`).click();
    await expect(page.locator(`${LAB} .kl-bench__hint`)).toContainText('H₂ gazi ajraldi');
    await expect(vessel(page, 'tube-1').locator('.kl-scene__bubble').first()).toBeAttached();
    await expect(page.locator(`${LAB} .kl-dlab__why-list`)).toContainText('Mg + H₂SO₄ → MgSO₄ + H₂');
    // the collector's own action names the gas's source tube
    await page.locator(`${LAB} [data-bench-vessel=gas-collector]`).click();
    const collect = page.locator(`${LAB} .kl-bench__tools [data-bench-action=COLLECT_GAS]`);
    await expect(collect).toContainText('1-probirkadagi gazni yig‘ish');
    await collect.click();
    await expect(vessel(page, 'gas-collector').locator('.kl-scene__gas-label')).toHaveText('H₂');
    // owner, 2026-11-26 ("Amal bloki tushunarsiz"): the Amal block lists the instruction's steps with their state
    const tasks = page.locator(`${LAB} .kl-bench__tasks > li`);
    await expect(tasks.first()).toHaveAttribute('data-bench-task', 'done');
    await expect(tasks.nth(1)).toHaveAttribute('data-bench-task', 'now');
    await expect(page.locator(`${LAB} .kl-bench__tasks > li[data-bench-task=outside]`)).toHaveCount(1);
    // the collector is a test tube held mouth-down in a stand (the school way to collect hydrogen)
    await expect(vessel(page, 'gas-collector').locator('.kl-scene__glass-img')).toHaveCount(1);
    // nothing is persisted (practice mode)
    const store = await semanticStore(page, hosts[name].dbName);
    expect(store.evidence).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('bench: drag a reagent onto a vessel pours it; reset puts the reagent back; 390 px has no sideways scroll', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.10');
  await page.locator(`${LAB} [data-bench-substance=zn]`).dragTo(page.locator(`${LAB} [data-bench-vessel=tube-2]`));
  await expect(vessel(page, 'tube-2').locator('.kl-scene__formula')).toHaveText('Zn');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(`${LAB} [data-bench-substance=hcl-dilute]`).click();
  await page.locator(`${LAB} [data-dlab-reset]`).click();
  await expect(page.locator(`${LAB} [data-bench-substance=hcl-dilute]`)).toHaveAttribute('aria-pressed', 'false');
  await expect(vessel(page, 'tube-2').locator('.kl-scene__formula')).toHaveCount(0);
});

test('the other labs keep the list layout (the bench is tried on 7.10 first)', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.11');
  await expect(page.locator(`${LAB} [data-dlab-bench]`)).toHaveCount(0);
  await expect(page.locator(`${LAB} .kl-dlab__objects`)).toBeVisible();
});

// "hech nima o'zgarmaganku" (owner, 2026-11-24): the catalogue sent learners to the classic page, where the lab was only
// a small offer. A card whose activity has a guided dynamic lab now opens that lab; the others still open the classic page.
test('Virtual laboratoriya: the 7.10 card opens the bench; a lab without a profile opens the classic page', async ({page}) => {
  await hosts.portal.open(page, '/labs');
  const card710 = page.locator('.kl-lab-card', {hasText: 'Kislotalarning metallar bilan'}).first();
  await expect(card710.locator('[data-lab-dynamic]')).toBeVisible();
  await card710.getByRole('link', {name: 'Tajribani boshlash'}).click();
  await expect(page.locator(`${LAB} [data-dlab-bench]`)).toBeVisible();
  await hosts.portal.open(page, '/labs');
  const card71 = page.locator('.kl-lab-card', {hasText: 'Laboratoriya shtativi'}).first();
  await expect(card71.locator('[data-lab-dynamic]')).toHaveCount(0);
  await expect(card71.getByRole('link', {name: 'Tajribani boshlash'})).toHaveAttribute('href', /practice\/practice\.experiment\.7\.1$/);
});
