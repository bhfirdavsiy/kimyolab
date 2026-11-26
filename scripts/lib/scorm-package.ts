// SCORM 1.2 packages: one package (one SCO) per guided dynamic lab.
//
// Input: the single-file standalone build (dist-standalone/KimyoLab_standalone.html — the whole product, offline, with
// its embedded content pack) and the packed topic-lab profiles. Each package is that same file as index.html, with
// one build-time line that names the lab (`globalThis.__KIMYOLAB_SCORM__`), plus imsmanifest.xml. The runtime part
// (LMS API discovery, what is written to the LMS) is src/app/scorm12.ts.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {writeZip} from './zip.ts';

export const SCORM_OUTPUT_DIR='dist-scorm';
export const SCORM_REPORT='reports/scorm-packages.json';
const STANDALONE='dist-standalone/KimyoLab_standalone.html';

const sha=(b:Buffer|string)=>crypto.createHash('sha256').update(b).digest('hex');
const xml=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const htmlText=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

export function scormManifest(p:{identifier:string;version:string;title:string}):string{
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xml(p.identifier)}" version="${xml(p.version)}"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${xml(p.title)}</title>
      <item identifier="ITEM-1" identifierref="RES-1" isvisible="true">
        <title>${xml(p.title)}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;
}

/** The standalone page with the package line inserted before the module bootstrap, and the lab's title. */
export function scormIndexHtml(standalone:string,activityId:string,title:string):string{
  const marker='<script type="module">';
  if(standalone.split(marker).length!==2) throw new Error('SCORM_STANDALONE_ENTRY_NOT_FOUND');
  if(!/<title>[^<]*<\/title>/.test(standalone)) throw new Error('SCORM_STANDALONE_TITLE_NOT_FOUND');
  const config=JSON.stringify({standard:'1.2',activityId});
  return standalone
    .replace(/<title>[^<]*<\/title>/,`<title>${htmlText(title)} — KimyoLab</title>`)
    .replace(marker,`<script>globalThis.__KIMYOLAB_SCORM__=${config};</script>\n  ${marker}`);
}

export function buildScormPackages(root:string){
  const standalone=fs.readFileSync(path.join(root,STANDALONE),'utf8');
  const pointer=JSON.parse(fs.readFileSync(path.join(root,'public/content/manifest.json'),'utf8'));
  const version:string=pointer.activeVersion;
  const pack=JSON.parse(fs.readFileSync(path.join(root,`public/content/${version}/topic-lab-profiles.json`),'utf8'));
  const activities=JSON.parse(fs.readFileSync(path.join(root,`public/content/${version}/practice-activities.json`),'utf8'));
  const list:any[]=Array.isArray(activities)?activities:Object.values(activities.activities??activities);
  const files:Record<string,Buffer>={};
  const packages=[...pack.profiles].sort((a:any,b:any)=>a.activityId.localeCompare(b.activityId,'en',{numeric:true})).map((p:any)=>{
    const activity=list.find(a=>a?.id===p.activityId);
    if(!activity?.title) throw new Error(`SCORM_ACTIVITY_TITLE_MISSING:${p.activityId}`);
    const lab=p.activityId.replace(/^practice\.experiment\./,'');
    const manifest=scormManifest({identifier:`kimyolab.${p.activityId}`,version,title:`${lab}. ${activity.title}`});
    const index=scormIndexHtml(standalone,p.activityId,activity.title);
    const zip=writeZip([{name:'imsmanifest.xml',data:Buffer.from(manifest,'utf8')},{name:'index.html',data:Buffer.from(index,'utf8')}]);
    const file=`${SCORM_OUTPUT_DIR}/kimyolab-${lab}-scorm12.zip`;
    files[file]=zip;
    return {activityId:p.activityId,profileId:p.profileId,title:activity.title,completionScope:p.completionScope?.kind??null,file,sizeBytes:zip.length,sha256:sha(zip),indexSha256:sha(index),manifestSha256:sha(manifest)};
  });
  const report={
    schema:'kimyolab.scorm-packages.v1',
    standard:'SCORM 1.2',
    contentVersion:version,
    standaloneSha256:sha(standalone),
    granularity:'one package (one SCO) per guided dynamic lab profile',
    runtime:{
      apiDiscovery:'window.API in this window, its parents (max 7) and the opener chain (SCORM 1.2 RTE)',
      writes:{
        'cmi.core.lesson_status':['incomplete (on open, unless already completed)','completed (once the lab runtime reports the lab complete)'],
        'cmi.suspend_data':'accepted lab actions, bound to profile + activity/config version, ≤ 4096 characters (never truncated)',
        'cmi.core.session_time':'on exit','cmi.core.exit':'suspend while incomplete, empty once completed',
      },
      neverWritten:['cmi.core.score.raw','passed','failed'],
      neverWrittenReason:'the guided dynamic lab is not an assessment: no score exists, so none is reported',
      withoutLms:'the lab runs; the page says nothing is saved',
    },
    knownGaps:[
      {code:'SCHEMA_XSD_NOT_BUNDLED',detail:'imsmanifest.xml names the ADL/IMS SCORM 1.2 XSD files in xsi:schemaLocation but the package does not carry them; most LMSs accept this, a strictly validating importer may not.'},
      {code:'TARGET_LMS_NOT_TESTED',detail:'Tested against a SCORM 1.2 API stub in Chromium (tests/e2e/scorm12-package.spec.mjs), not yet in the target LMS.'},
      {code:'PACKAGE_CARRIES_FULL_CONTENT_PACK',detail:'Each package embeds the whole standalone build (all content), not only its lab.'},
    ],
    packages,
  };
  return {files,report};
}
