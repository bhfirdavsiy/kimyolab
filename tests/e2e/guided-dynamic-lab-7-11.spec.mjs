// Step 4 (owner sequence, 2026-11-23): 7.11 water + oxides as a guided dynamic lab, on BOTH hosts.
//   CaO + water → the record rxn.cao-water decides (temperature rise; the suspension / basic medium of the instruction
//   text is not invented); the carbonated mineral water and the distilled water are ready samples (nothing reacts);
//   the indicator step is not offered (no indicator handler) → completion is PARTIAL_INSTRUCTION; nothing persisted.
import {test, expect} from '@playwright/test';
import {startHosts, semanticStore} from './host-scenarios.mjs';

const FLAG = '?ff=guidedDynamicLabV1';
const LAB = '.kl-dlab';
const result = (page) => page.locator(`${LAB} .kl-dlab__result`);
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
const DEV_TERMS = /ReactionMatcher|IonicEngine|ElectrolysisModel|SchoolLab|registry|handler|undefined|null\b|NaN|ui\.dlab-/;

for (const name of ['portal', 'standalone']) {
  test(`${name}: 7.11 CaO + water from the record; samples react with nothing; partial completion; nothing persisted`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await hosts[name].open(page, `/dynamic-lab/practice.experiment.7.11${FLAG}`);
    await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.7.11.water-oxides"]`)).toBeVisible();
    await expect(page.locator(`${LAB}[data-completion-scope=PARTIAL_INSTRUCTION]`)).toBeVisible();
    // a sample in its own tube: accepted, but no reaction observation is produced
    await addTo(page, 'carbonated-water', 'tube-2');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await addTo(page, 'distilled-water', 'tube-3');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toHaveCount(0);
    await expect(page.locator(`${LAB}[data-complete=true]`)).toHaveCount(0);
    // the instruction's trials: CaO does not go into the sample tubes
    await addTo(page, 'cao', 'tube-2');
    await expect(result(page)).toHaveAttribute('data-code', 'ACTION_NOT_IN_INSTRUCTION_SCOPE');
    // CaO + water: the record decides
    await addTo(page, 'cao', 'tube-1'); await addTo(page, 'water', 'tube-1');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toHaveCount(1);
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('rxn.cao-water');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toBeVisible();
    await expect(result(page)).toContainText('Yo‘riqnomaning bu laboratoriyada qo‘llab-quvvatlanadigan qismi bajarildi.');
    // the indicator comparison is not offered as an action
    await expect(page.locator(`${LAB} [data-action-family=COMPARE]`)).toHaveCount(0);
    expect(await page.locator(LAB).innerText()).not.toMatch(DEV_TERMS);
    const store = await semanticStore(page, hosts[name].dbName);
    expect(store.evidence).toEqual([]); expect(store.attempts ?? []).toEqual([]); expect(store.progress).toEqual([]);
    expect(errors).toEqual([]);
  });
}
