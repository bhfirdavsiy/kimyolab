// npm run scorm:build — SCORM 1.2 packages (one per guided dynamic lab) into dist-scorm/, report into reports/.
// Requires a current standalone build (npm run standalone:build).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildScormPackages,SCORM_OUTPUT_DIR,SCORM_REPORT} from './lib/scorm-package.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {files,report}=buildScormPackages(root);
fs.rmSync(path.join(root,SCORM_OUTPUT_DIR),{recursive:true,force:true});
fs.mkdirSync(path.join(root,SCORM_OUTPUT_DIR),{recursive:true});
for(const [rel,data] of Object.entries(files)) fs.writeFileSync(path.join(root,rel),data);
fs.writeFileSync(path.join(root,SCORM_REPORT),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({packages:report.packages.map(p=>({file:p.file,sizeBytes:p.sizeBytes})),report:SCORM_REPORT}));
