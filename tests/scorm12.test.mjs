// SCORM 1.2: the run-time adapter (what is written to an LMS, what never is), the manifest, the deterministic zip and
// the package report. The browser behaviour is tests/e2e/scorm12-package.spec.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {findScorm12Api,scormTimespan,encodeSuspendData,decodeSuspendData,Scorm12Session,scormPackageConfig,SUSPEND_DATA_LIMIT} from '../src/app/scorm12.ts';
import {buildScormPackages,scormManifest,scormIndexHtml,SCORM_REPORT} from '../scripts/lib/scorm-package.ts';
import {writeZip,readZip} from '../scripts/lib/zip.ts';

const root=fileURLToPath(new URL('..',import.meta.url));
const B={profileId:'lab-profile.7.10.metal-acid-gas',activityVersion:'2026.09.1',configVersion:'1.0.0'};

function stubLms(seed={}){
  const cmi={'cmi.core.lesson_status':'not attempted','cmi.core.entry':'ab-initio','cmi.suspend_data':'',...seed}, calls=[]; let open=false;
  const api={
    LMSInitialize:(a)=>{calls.push(['init',a]);open=true;return 'true';}, LMSFinish:(a)=>{calls.push(['finish',a]);open=false;return 'true';},
    LMSGetValue:(k)=>cmi[k]??'', LMSSetValue:(k,v)=>{calls.push(['set',k,v]);if(!open)return 'false';cmi[k]=v;return 'true';},
    LMSCommit:()=>{calls.push(['commit']);return 'true';}, LMSGetLastError:()=>'0', LMSGetErrorString:()=>'',
  };
  return {api,cmi,calls,sets:()=>calls.filter(c=>c[0]==='set')};
}

test('API discovery: own window, then the parent chain (max 7), then the opener; cross-origin frames are skipped',()=>{
  const {api}=stubLms();
  const top={API:api}; top.parent=top;
  let w=top; for(let i=0;i<3;i++){ w={parent:w}; }
  assert.equal(findScorm12Api(w),api);
  let deep=top; for(let i=0;i<9;i++){ deep={parent:deep}; }
  assert.equal(findScorm12Api(deep),null,'deeper than 7 levels is not searched');
  const blocked={get parent(){ throw new Error('SecurityError'); }};
  assert.equal(findScorm12Api({parent:blocked,opener:{API:api}}),api,'a cross-origin parent is skipped, the opener is tried');
  assert.equal(findScorm12Api({API:{LMSInitialize(){}}}),null,'an incomplete object is not an API');
  assert.equal(findScorm12Api(undefined),null);
});

test('session: incomplete on open, completed once complete; never a score, never passed/failed',()=>{
  const lms=stubLms(); let t=0;
  const s=new Scorm12Session(lms.api,B,()=>t);
  assert.equal(s.start(),null); assert.equal(s.connection,'connected');
  assert.equal(lms.cmi['cmi.core.lesson_status'],'incomplete');
  s.save({actions:[{family:'ADD_SUBSTANCE',params:{substance:'mg',container:'tube-1'}}],complete:false});
  assert.equal(lms.cmi['cmi.core.lesson_status'],'incomplete');
  s.save({actions:[1,2,3],complete:true});
  assert.equal(lms.cmi['cmi.core.lesson_status'],'completed');
  s.save({actions:[1,2,3,4],complete:true});
  t=3723450; s.finish(); s.finish();
  assert.equal(lms.cmi['cmi.core.session_time'],'01:02:03.45');
  assert.equal(lms.cmi['cmi.core.exit'],'');
  assert.equal(lms.calls.filter(c=>c[0]==='finish').length,1,'finish is idempotent');
  const sets=lms.sets();
  assert.deepEqual(sets.filter(c=>c[1]==='cmi.core.lesson_status').map(c=>c[2]),['incomplete','completed'],'completed is written once');
  assert.ok(!sets.some(c=>/score|passed|failed/.test(c[1])||c[2]==='passed'||c[2]==='failed'));
  s.save({actions:[],complete:false}); assert.equal(lms.sets().length,sets.length,'nothing after finish');
});

test('session: an already completed lab is never downgraded; a resumed one replays only its own data',()=>{
  const data=encodeSuspendData(B,{actions:[{a:1},{a:2}],complete:false});
  const lms=stubLms({'cmi.core.lesson_status':'completed','cmi.core.entry':'resume','cmi.suspend_data':data});
  const s=new Scorm12Session(lms.api,B);
  assert.deepEqual(s.start(),{actions:[{a:1},{a:2}],complete:false});
  s.save({actions:[],complete:false}); s.finish();
  assert.ok(!lms.sets().some(c=>c[1]==='cmi.core.lesson_status'),'completed stays completed');
  assert.equal(lms.cmi['cmi.core.exit'],'');
  // data of another profile or version, or foreign data, is ignored
  for(const other of [{...B,profileId:'lab-profile.8.14.ammonia-heating'},{...B,configVersion:'2.0.0'},{...B,activityVersion:'2026.10.1'}]) assert.equal(decodeSuspendData(other,data),null);
  for(const raw of ['','{','"x"','{"s":"kl.s1"}','null']) assert.equal(decodeSuspendData(B,raw),null);
  // ab-initio never resumes, even with data present
  assert.equal(new Scorm12Session(stubLms({'cmi.core.entry':'ab-initio','cmi.suspend_data':data}).api,B).start(),null);
});

test('suspend_data: at most 4096 characters, never truncated; status is still written when it does not fit',()=>{
  const big=Array.from({length:400},(_,i)=>({family:'ADD_SUBSTANCE',params:{substance:`s${i}`,container:'tube-1'}}));
  assert.equal(encodeSuspendData(B,{actions:big,complete:true}),null);
  const lms=stubLms(); const s=new Scorm12Session(lms.api,B); s.start();
  s.save({actions:big,complete:true});
  assert.ok(!lms.sets().some(c=>c[1]==='cmi.suspend_data'));
  assert.equal(lms.cmi['cmi.core.lesson_status'],'completed');
  assert.deepEqual(s.errors,['SUSPEND_DATA_TOO_LONG']);
  assert.ok(encodeSuspendData(B,{actions:[],complete:false}).length<=SUSPEND_DATA_LIMIT);
});

test('without an LMS, or when LMSInitialize fails, nothing is written and nothing throws',()=>{
  const none=new Scorm12Session(null,B); assert.equal(none.start(),null); none.save({actions:[1],complete:true}); none.finish(); assert.equal(none.connection,'no-lms');
  const lms=stubLms(); lms.api.LMSInitialize=()=>'false'; lms.api.LMSGetLastError=()=>'101';
  const f=new Scorm12Session(lms.api,B); f.start(); f.save({actions:[1],complete:true}); f.finish();
  assert.equal(f.connection,'failed'); assert.deepEqual(f.errors,['LMSInitialize:101']); assert.deepEqual(lms.sets(),[]);
});

test('timespan and package config',()=>{
  assert.equal(scormTimespan(0),'00:00:00.00'); assert.equal(scormTimespan(59999),'00:01:00.00'); assert.equal(scormTimespan(-5),'00:00:00.00');
  assert.equal(scormTimespan(10000*3600*1000),'9999:00:00.00');
  assert.deepEqual(scormPackageConfig({__KIMYOLAB_SCORM__:{standard:'1.2',activityId:'practice.experiment.7.10'}}),{standard:'1.2',activityId:'practice.experiment.7.10'});
  for(const c of [undefined,{standard:'2004',activityId:'practice.experiment.7.10'},{standard:'1.2',activityId:'../x'},{standard:'1.2'}]) assert.equal(scormPackageConfig({__KIMYOLAB_SCORM__:c}),null);
});

test('manifest, index page and zip',()=>{
  const m=scormManifest({identifier:'kimyolab.practice.experiment.7.10',version:'2026.09.1',title:'7.10. A & <B>'});
  for(const s of ['<schema>ADL SCORM</schema>','<schemaversion>1.2</schemaversion>','adlcp:scormtype="sco" href="index.html"','<file href="index.html"/>','7.10. A &amp; &lt;B&gt;','xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"']) assert.ok(m.includes(s),s);
  const html=scormIndexHtml('<html><head><title>KimyoLab</title></head><body><script type="module">go()</script></body></html>','practice.experiment.7.10','Lab <1>');
  assert.match(html,/<title>Lab &lt;1&gt; — KimyoLab<\/title>/);
  assert.match(html,/<script>globalThis\.__KIMYOLAB_SCORM__=\{"standard":"1\.2","activityId":"practice\.experiment\.7\.10"\};<\/script>\s*<script type="module">/);
  assert.throws(()=>scormIndexHtml('<title>x</title>','a','b'),/SCORM_STANDALONE_ENTRY_NOT_FOUND/);
  const entries=[{name:'imsmanifest.xml',data:Buffer.from(m)},{name:'index.html',data:Buffer.from('ü'.repeat(5000))}];
  const z=writeZip(entries);
  assert.deepEqual(writeZip(entries),z,'deterministic');
  assert.deepEqual(readZip(z).map(e=>[e.name,e.data.toString()]),entries.map(e=>[e.name,e.data.toString()]));
  const bad=Buffer.from(z); bad[30+'imsmanifest.xml'.length+8]^=0xff; assert.throws(()=>readZip(bad),'corrupted data is refused (inflate or CRC)');
  for(const name of ['/abs','../x','a b']) assert.throws(()=>writeZip([{name,data:Buffer.from('')}]),/ZIP_NAME_INVALID/);
});

test('packages: one per dynamic-lab profile, built from the current standalone; report is generator-equal',()=>{
  const {files,report}=buildScormPackages(root);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,SCORM_REPORT),'utf8')),report,'npm run scorm:build');
  const profiles=JSON.parse(fs.readFileSync(path.join(root,'public/content/2026.09.1/topic-lab-profiles.json'),'utf8')).profiles;
  assert.deepEqual(report.packages.map(p=>p.activityId).sort(),profiles.map(p=>p.activityId).sort());
  assert.deepEqual(report.runtime.neverWritten,['cmi.core.score.raw','passed','failed']);
  for(const p of report.packages){
    const entries=readZip(files[p.file]);
    assert.deepEqual(entries.map(e=>e.name),['imsmanifest.xml','index.html']);
    const index=entries[1].data.toString();
    assert.ok(index.includes(`"activityId":"${p.activityId}"`));
    assert.ok(entries[0].data.toString().includes(`identifier="kimyolab.${p.activityId}"`));
  }
});
