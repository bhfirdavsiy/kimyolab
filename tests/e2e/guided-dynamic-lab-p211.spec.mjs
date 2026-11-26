// P2.11 — the new slices in real Chromium on BOTH hosts (portal /kimyolab/ and the standalone file).
//   7.10 → metal + dilute acid: the gas comes from the reaction record; with two gas sources the learner chooses which
//          one to collect; Cu + HCl fails closed (no record); heating the Cu trial or an arbitrary pairing is refused by
//          the instruction scope; partial completion is never announced as the whole lab; nothing persisted
//   8.14 → nothing forms before heating (the record requires it); seal, heat, collect; completion
//   no engine or developer names visible; 320 px reflow and 44 px targets on the new controls
import {test, expect} from '@playwright/test';
import {startHosts, semanticStore} from './host-scenarios.mjs';
import {semantics, reflow, targetSizes} from '../helpers/a11y.mjs';

const FLAG = '?ff=guidedDynamicLabV1';
const LAB = '.kl-dlab';
const result = (page) => page.locator(`${LAB} .kl-dlab__result`);
const list = (page) => page.locator(`${LAB} .kl-dlab__action-list`);
let hosts;
test.beforeAll(async () => { hosts = await startHosts(); });
test.afterAll(async () => { await hosts?.close(); });

async function object(page, ref) { await page.locator(`${LAB} [data-object="${ref}"]`).click(); }
async function addTo(page, substance, container) {
  // lab review stage 2 (2026-11-24): 7.10 is the bench prototype; its full action list sits in a closed <details> (opened here)
  const toggle = page.locator('.kl-dlab__list-toggle:not([open]) > summary');
  if (await toggle.count()) await toggle.click();
  await object(page, `substance:${substance}`);
  await list(page).locator('[data-action-family=ADD_SUBSTANCE]').click();
  await page.locator('#dlab-param-container').selectOption(container);
  await page.locator(`${LAB} .kl-dlab__params button[type=submit]`).click();
}
const DEV_TERMS = /ReactionMatcher|IonicEngine|ElectrolysisModel|SchoolLab|registry|handler|undefined|null\b|NaN|ui\.dlab-/;

for (const name of ['portal', 'standalone']) {
  test(`${name}: 7.10 metal + acid — record gas, choose the source to collect, Cu + HCl fails closed, completion`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await hosts[name].open(page, `/dynamic-lab/practice.experiment.7.10${FLAG}`);
    await expect(page.locator(`${LAB}[data-dynamic-lab="lab-profile.7.10.metal-acid-gas"]`)).toBeVisible();
    await addTo(page, 'mg', 'tube-1'); await addTo(page, 'h2so4-dilute', 'tube-1');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    // Stage 1 of the 2026-11-24 lab review: formulas in the learner text are typeset (H2 → H₂, so NaI is never read as "Nal")
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toContainText('H₂ gazi ajraldi');
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('rxn.mg-h2so4');
    await addTo(page, 'zn', 'tube-2'); await addTo(page, 'hcl-dilute', 'tube-2');
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toHaveCount(2);
    // two gas sources: one choice per source, named by the tube it comes from
    await object(page, 'apparatus:gas-collector');
    const collect = list(page).locator('[data-action-family=COLLECT_GAS]');
    await expect(collect).toHaveCount(2);
    await expect(list(page).locator('[data-action-family=COLLECT_GAS][data-action-from=tube-1]')).toContainText('qayerdan: 1-probirka');
    await list(page).locator('[data-action-family=COLLECT_GAS][data-action-from=tube-1]').click();
    // Stage 1 of the 2026-11-24 lab review: formulas in the learner text are typeset (H2 → H₂, so NaI is never read as "Nal")
    await expect(result(page)).toContainText('H₂ gazi yig‘ildi (manba: 1-probirka)');
    // 7.10 aligned with the 2026 grade-7 workbook, practical work 5.2 (owner decision 2026-11-21): Mg + dilute HCl and Fe + dilute HCl are trials of the instruction: the lab is not complete before them
    await expect(page.locator(`${LAB}[data-complete=true]`)).toHaveCount(0);
    await addTo(page, 'mg', 'tube-4'); await addTo(page, 'hcl-dilute', 'tube-4');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await addTo(page, 'fe', 'tube-5'); await addTo(page, 'hcl-dilute', 'tube-5');
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toHaveCount(4);
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('rxn.mg-hcl');
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('rxn.fe-hcl');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toBeVisible();
    // closeout: the profile carries only part of the instruction — never announced as the whole lab
    await expect(page.locator(`${LAB}[data-completion-scope=PARTIAL_INSTRUCTION]`)).toBeVisible();
    await expect(result(page)).toContainText('Yo‘riqnomaning bu laboratoriyada qo‘llab-quvvatlanadigan qismi bajarildi.');
    await expect(result(page)).not.toContainText('maqsadiga erishildi');
    await expect(page.locator(`${LAB} .kl-dlab__scope`)).toContainText('faqat bir qismini');
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-observation-kind=gas-collected]`)).toHaveAttribute('data-grounding', 'PROCEDURE');
    // Cu + dilute HCl: no reviewed reaction record → no observation is invented, also after heating
    await addTo(page, 'cu', 'tube-3'); await addTo(page, 'hcl-dilute', 'tube-3');
    await expect(result(page)).toHaveAttribute('data-status', 'unsupported');
    // TT 4.2.6 (2026-11-23): Cu + dilute HCl now has a no-reaction record (rxn.cu-hcl) that is not reviewed yet: the lab says so and shows nothing
    await expect(result(page)).toContainText('hali tasdiqlamagan');
    // closeout: the Cu trial states no heating — HEAT is refused by the instruction scope, before any chemistry
    await object(page, 'apparatus:tube-3');
    await expect(list(page).locator('[data-action-family=HEAT]')).toHaveAttribute('data-category', 'unavailable');
    await list(page).locator('[data-action-family=HEAT]').click();
    await expect(result(page)).toHaveAttribute('data-status', 'rejected');
    await expect(result(page)).toHaveAttribute('data-code', 'ACTION_NOT_IN_INSTRUCTION_SCOPE');
    await expect(result(page)).toContainText('Yo‘riqnoma bu amalni shu tajriba uchun ko‘rsatmagan');
    // an arbitrary pairing is refused too (Mg is not part of the Cu trial; 7.10 aligned with the 2026 grade-7 workbook, practical work 5.2 (owner decision 2026-11-21): Mg + dilute HCl and Fe + dilute HCl are trials of the instruction only in a tube of its own)
    await addTo(page, 'mg', 'tube-3');
    await expect(result(page)).toHaveAttribute('data-code', 'ACTION_NOT_IN_INSTRUCTION_SCOPE');
    await expect(result(page)).toContainText('bir idishda birga ishlatilmaydi');
    // 7.10 aligned with the 2026 grade-7 workbook, practical work 5.2 (owner decision 2026-11-21): Mg + dilute HCl and Fe + dilute HCl are trials of the instruction: 4 reaction observations + 1 collected gas (was 3)
    await expect(page.locator(`${LAB} .kl-dlab__observations li`)).toHaveCount(5);
    await expect(page.locator(`${LAB} .kl-dlab__state`)).toContainText('3-probirka');
    // learner-facing text names no engine and leaks no developer term
    expect(await page.locator(LAB).innerText()).not.toMatch(DEV_TERMS);
    const store = await semanticStore(page, hosts[name].dbName);
    expect(store.evidence).toEqual([]); expect(store.attempts ?? []).toEqual([]); expect(store.progress).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${name}: 8.14 heating gate — nothing before heating; seal, heat, collect; completion; 320 px`, async ({page}) => {
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.setViewportSize({width: 320, height: 800});
    await hosts[name].open(page, `/dynamic-lab/practice.experiment.8.14${FLAG}`);
    await addTo(page, 'nh4cl', 'reaction-tube'); await addTo(page, 'slaked-lime', 'reaction-tube');
    await expect(result(page)).toHaveAttribute('data-status', 'unsupported');
    await expect(result(page)).toContainText('sharoit hozir bajarilmagan');
    await expect(page.locator(`${LAB} .kl-dlab__observations li`)).toHaveCount(0);
    // collecting before any gas: the domain says why
    await object(page, 'apparatus:collector-tube');
    await list(page).locator('[data-action-family=COLLECT_GAS]').click();
    await expect(result(page)).toHaveAttribute('data-code', 'STATE_PRECONDITION_UNMET');
    await expect(result(page)).toContainText('gaz ajralmagan');
    await object(page, 'apparatus:reaction-tube');
    await list(page).locator('[data-action-family=SEAL]').click();
    await expect(result(page)).toHaveAttribute('data-status', 'accepted');
    await expect(page.locator(`${LAB} .kl-dlab__state`)).toContainText('tiqin bilan yopilgan');
    await object(page, 'apparatus:reaction-tube');
    await list(page).locator('[data-action-family=HEAT]').click();
    // Stage 1 of the 2026-11-24 lab review: formulas in the learner text are typeset (H2 → H₂, so NaI is never read as "Nal")
    await expect(page.locator(`${LAB} .kl-dlab__observations li[data-produced-by=ReactionMatcher]`)).toContainText('NH₃ gazi ajraldi');
    await expect(page.locator(`${LAB} .kl-dlab__sources`)).toContainText('rxn.nh4cl-caoh2');
    await object(page, 'apparatus:collector-tube');
    await list(page).locator('[data-action-family=COLLECT_GAS]').click();
    // Stage 1 of the 2026-11-24 lab review: formulas in the learner text are typeset (H2 → H₂, so NaI is never read as "Nal")
    await expect(result(page)).toContainText('NH₃ gazi yig‘ildi');
    await expect(page.locator(`${LAB}[data-complete=true]`)).toBeVisible();
    await expect(result(page)).toContainText('qo‘llab-quvvatlanadigan qismi bajarildi');
    await expect(result(page)).not.toContainText('maqsadiga erishildi');
    expect(await page.locator(LAB).innerText()).not.toMatch(DEV_TERMS);
    const s = await semantics(page);
    expect(s.unnamed).toEqual([]); expect(s.duplicateIds).toBe(0); expect(s.h1).toBe(1);
    const r = await reflow(page);
    expect(r.horizontalScroll, r.culprit).toBe(false); expect(r.clipped).toBe(0);
    expect(await targetSizes(page)).toEqual([]);
    expect(errors).toEqual([]);
  });
}
