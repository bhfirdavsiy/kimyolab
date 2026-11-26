// Step 4 (b) of the owner's sequence (2026-11-23): 7.9 (acid properties) and 8.8 (halide tests) as guided dynamic labs.
//   7.9: CuO / NaOH / CaCO3 with HCl are decided by their records; NaCl + H2SO4 needs a concentration the instruction does
//        not state, so it stays unmet (never assumed); partial completion
//   8.8: one tube per halide + AgNO3 → white / yellow precipitates from the records; HCl + AgNO3 has no record → no outcome
import {test, expect} from '@playwright/test';
import {startHosts, semanticStore} from './host-scenarios.mjs';

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
const fromRecord = (page) => page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`);

for (const name of ['portal', 'standalone']) {
  test(`${name}: 7.9 — three HCl trials from their records; NaCl + H2SO4 never assumes concentrated acid`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await hosts[name].open(page, '/dynamic-lab/practice.experiment.7.9');
    await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.7.9.acid-properties"]`)).toBeVisible();
    await addTo(page, 'nacl', 'tube-1'); await addTo(page, 'h2so4', 'tube-1');
    await page.locator(`${LAB} [data-object="apparatus:tube-1"]`).click();
    await list(page).locator('[data-action-family=HEAT]').click();
    await expect(fromRecord(page)).toHaveCount(0);
    await addTo(page, 'cuo', 'tube-2'); await addTo(page, 'hcl-solution', 'tube-2');
    await addTo(page, 'naoh-solution', 'tube-3'); await addTo(page, 'hcl-solution', 'tube-3');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toHaveCount(0);
    await addTo(page, 'caco3', 'tube-4'); await addTo(page, 'hcl-solution', 'tube-4');
    for (const id of ['rxn.cuo-hcl', 'rxn.naoh-hcl', 'rxn.caco3-hcl']) await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText(id);
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).not.toContainText('rxn.nacl-h2so4');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toBeVisible();
    await expect(page.locator(`${LAB}[data-completion-scope=PARTIAL_INSTRUCTION]`)).toBeVisible();
    // the trials keep reagents apart: CaCO3 does not go into the NaOH tube
    await addTo(page, 'caco3', 'tube-3');
    await expect(result(page)).toHaveAttribute('data-code', 'ACTION_NOT_IN_INSTRUCTION_SCOPE');
    const store = await semanticStore(page, hosts[name].dbName);
    expect(store.evidence).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${name}: 8.8 — AgCl white, AgBr / AgI yellow from the records; HCl + AgNO3 has no record`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await hosts[name].open(page, '/dynamic-lab/practice.experiment.8.8');
    await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.8.8.halide-tests"]`)).toBeVisible();
    await addTo(page, 'hcl-solution', 'tube-1'); await addTo(page, 'agno3-solution', 'tube-1');
    await expect(fromRecord(page)).toHaveCount(0);
    await expect(page.locator('[data-dlab-scene] [data-scene-object="apparatus:tube-1"] .kl-scene__precipitate')).toHaveCount(0);
    for (const [salt, tube] of [['nacl-solution', 'tube-2'], ['nabr-solution', 'tube-3'], ['nai-solution', 'tube-4']]) { await addTo(page, salt, tube); await addTo(page, 'agno3-solution', tube); }
    await expect(fromRecord(page)).toHaveCount(3);
    await expect(fromRecord(page).first()).toContainText('oq');
    await expect(page.locator('[data-dlab-scene] [data-scene-object="apparatus:tube-3"] .kl-scene__precipitate')).toHaveAttribute('fill', '#f2d24b');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toBeVisible();
    // the solutions are drawn as liquids (the instruction pours them), not as solid granules
    await expect(page.locator('[data-dlab-scene] [data-scene-object="apparatus:tube-2"] .kl-scene__solid')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
