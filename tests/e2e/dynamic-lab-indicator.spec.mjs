// The indicator as a lab action (owner sequence 2026-11-24, "davom etaver"): litmus dropped into a tube reveals the
// medium of the sample already there. The medium comes from the bound school-lab model (matched by the tube's exact
// contents), the colour from the litmus record; anything else shows no colour (never guessed).
import {test, expect} from '@playwright/test';
import {startHosts} from './host-scenarios.mjs';

const LAB = '.kl-dlab';
const result = (page) => page.locator(`${LAB} .kl-dlab__result`);
const list = (page) => page.locator(`${LAB} .kl-dlab__action-list`);
const indicatorObs = (page) => page.locator(`${LAB} .kl-dlab__observations li[data-observation-kind=indicator-response]`);
const liquidFill = (page, tube) => page.locator(`[data-dlab-scene] [data-scene-object="apparatus:${tube}"] .kl-scene__liquid`);
let hosts;
test.beforeAll(async () => { hosts = await startHosts(); });
test.afterAll(async () => { await hosts?.close(); });
async function addTo(page, substance, container) {
  await page.locator(`${LAB} [data-object="substance:${substance}"]`).click();
  await list(page).locator('[data-action-family=ADD_SUBSTANCE]').click();
  await page.locator('#dlab-param-container').selectOption(container);
  await page.locator(`${LAB} .kl-dlab__params button[type=submit]`).click();
}

test('7.11: litmus shows basic / acidic / neutral for the three tubes, from the school model; the scene tints each tube', async ({page}) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.11');
  await addTo(page, 'cao', 'tube-1'); await addTo(page, 'water', 'tube-1');
  await addTo(page, 'carbonated-water', 'tube-2');
  await addTo(page, 'distilled-water', 'tube-3');
  for (const tube of ['tube-1', 'tube-2', 'tube-3']) await addTo(page, 'litmus', tube);
  await expect(indicatorObs(page)).toHaveCount(3);
  await expect(indicatorObs(page).nth(0)).toContainText('ko‘k rangga kirdi: muhit ishqoriy');
  await expect(indicatorObs(page).nth(1)).toContainText('qizil rangga kirdi: muhit kislotali');
  await expect(indicatorObs(page).nth(2)).toContainText('binafsha rangga kirdi: muhit neytral');
  await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('school.water-oxide.indicator-comparison');
  await expect(liquidFill(page, 'tube-1')).toHaveAttribute('fill', '#5b8def');
  await expect(liquidFill(page, 'tube-2')).toHaveAttribute('fill', '#d9534f');
  expect(errors).toEqual([]);
});

test('7.11: litmus before the sample is complete shows no colour (the medium of CaO alone is not modeled)', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.11');
  await addTo(page, 'cao', 'tube-1'); await addTo(page, 'litmus', 'tube-1');
  await expect(result(page)).toHaveAttribute('data-status', 'unsupported');
  await expect(result(page)).toContainText('muhiti modelda yo‘q');
  await expect(indicatorObs(page)).toHaveCount(0);
});

test('7.9: water neutral, HCl acidic', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.9');
  await addTo(page, 'water', 'tube-5'); await addTo(page, 'litmus', 'tube-5');
  await addTo(page, 'hcl-solution', 'tube-6'); await addTo(page, 'litmus', 'tube-6');
  await expect(indicatorObs(page)).toHaveCount(2);
  await expect(indicatorObs(page).nth(0)).toContainText('muhit neytral');
  await expect(indicatorObs(page).nth(1)).toContainText('muhit kislotali');
});
