import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
test('guided-lab engineering triage partitions all 27 guided labs without inventing reaction refs',()=>{
  const report=JSON.parse(fs.readFileSync(path.join(root,'reports/guided-lab-triage.json'),'utf8'));
  assert.equal(report.classification,'engineering-triage-not-expert-approval');
  // 7.10 aligned with the 2026 grade-7 workbook, practical work 5.2 (owner decision 2026-11-21): two new reaction-grounded steps (Mg + HCl, Fe + HCl): 19 → 21 and 47 → 49
  assert.deepEqual(report.summary,{total:27,proceduralGuided:8,reactionKbPartial:11,domainModelRequired:0,domainModelBaselined:8,unclassified:0,candidateReactionRefs:23,missingReactionRefs:0,reactionGroundedLabs:10,reactionGroundedSteps:21,chemistryGroundedLabs:19,chemistryGroundedSteps:49,modelGroundedSteps:30});
  assert.equal(new Set(report.rows.map(x=>x.id)).size,27);
});
