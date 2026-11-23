// The guided dynamic lab's bench picture (src/features/dynamic-lab/scene.ts) is DERIVED from the lab state:
// each effect appears only when the state holds it, never from the wording of a step. Also: the lab is open by default
// (owner decision 2026-11-23) and the classic practice page offers it.
import {test, expect} from '@playwright/test';
import {startHosts} from './host-scenarios.mjs';

const LAB = '.kl-dlab';
const SCENE = '[data-dlab-scene]';
const list = (page) => page.locator(`${LAB} .kl-dlab__action-list`);
let hosts;
test.beforeAll(async () => { hosts = await startHosts(); });
test.afterAll(async () => { await hosts?.close(); });

async function addTo(page, substance, container) {
  await page.locator(`${LAB} [data-object="substance:${substance}"]`).click();
  await list(page).locator('[data-action-family=ADD_SUBSTANCE]').click();
  await page.locator('#dlab-param-container').selectOption(container);
  await page.locator(`${LAB} .kl-dlab__params button[type=submit]`).click();
}
const vessel = (page, id) => page.locator(`${SCENE} [data-scene-object="apparatus:${id}"]`);

test('7.10 without ?ff: bubbles only after the record decides; the collected gas fills the collector', async ({page}) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.10');
  await expect(page.locator(SCENE)).toHaveAttribute('data-dlab-scene', '');
  await expect(page.locator(`${SCENE} svg`)).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator(`${SCENE} [data-scene-object]`)).toHaveCount(6);
  await addTo(page, 'mg', 'tube-1');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__bubble')).toHaveCount(0);
  await expect(vessel(page, 'tube-1').locator('.kl-scene__formula')).toHaveText('Mg');
  await addTo(page, 'h2so4-dilute', 'tube-1');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__bubble').first()).toBeAttached();
  await expect(vessel(page, 'gas-collector').locator('.kl-scene__gas-label')).toHaveCount(0);
  // clicking a vessel selects that apparatus, like its button
  await vessel(page, 'gas-collector').click();
  await list(page).locator('[data-action-family=COLLECT_GAS]').first().click();
  await expect(vessel(page, 'gas-collector').locator('.kl-scene__gas-label')).toHaveText('H₂');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__bubble')).toHaveCount(0);
  // no flame: nothing was heated
  await expect(page.locator(`${SCENE} .kl-scene__flame`)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('8.14: the stopper only after SEAL, the flame only while heated', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.8.14');
  await addTo(page, 'nh4cl', 'reaction-tube'); await addTo(page, 'slaked-lime', 'reaction-tube');
  await expect(vessel(page, 'reaction-tube').locator('.kl-scene__stopper')).toHaveCount(0);
  await expect(vessel(page, 'reaction-tube').locator('.kl-scene__flame')).toHaveCount(0);
  await vessel(page, 'reaction-tube').click(); await list(page).locator('[data-action-family=SEAL]').click();
  await expect(vessel(page, 'reaction-tube').locator('.kl-scene__stopper')).toHaveCount(1);
  await vessel(page, 'reaction-tube').click(); await list(page).locator('[data-action-family=HEAT]').click();
  await expect(vessel(page, 'reaction-tube').locator('.kl-scene__flame')).toHaveCount(1);
});

test('7.11: the heat haze comes from the record; the carbonated water is drawn as the liquid the instruction pours', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.7.11');
  await addTo(page, 'carbonated-water', 'tube-2');
  await expect(vessel(page, 'tube-2').locator('.kl-scene__liquid')).toHaveCount(1);
  await expect(vessel(page, 'tube-2').locator('.kl-scene__solid')).toHaveCount(0);
  await addTo(page, 'cao', 'tube-1');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__haze')).toHaveCount(0);
  await addTo(page, 'water', 'tube-1');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__haze')).toHaveCount(3);
});

test('8.1: a precipitate only after mixing a pair the record covers', async ({page}) => {
  await hosts.portal.open(page, '/dynamic-lab/practice.experiment.8.1');
  await addTo(page, 'agno3', 'tube-1'); await addTo(page, 'nacl', 'tube-1');
  await expect(vessel(page, 'tube-1').locator('.kl-scene__precipitate')).toHaveCount(0);
  await vessel(page, 'tube-1').click(); await list(page).locator('[data-action-family=MIX]').click();
  await expect(vessel(page, 'tube-1').locator('.kl-scene__precipitate')).toHaveCount(1);
});

test('the classic practice page offers the dynamic lab where a profile exists, and only there', async ({page}) => {
  await hosts.portal.open(page, '/practice/practice.experiment.7.10');
  const offer = page.locator('[data-dlab-offer]');
  await expect(offer).toBeVisible();
  await offer.getByRole('link', {name: 'Interaktiv laboratoriyani ochish'}).click();
  await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.7.10.metal-acid-gas"]`)).toBeVisible();
  await hosts.portal.open(page, '/practice/practice.experiment.7.1');
  await expect(page.locator('.kl-experiment-step-list')).toBeVisible();
  await expect(page.locator('[data-dlab-offer]')).toHaveCount(0);
});
