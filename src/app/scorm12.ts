// SCORM 1.2 run-time adapter for a single-lab package (one SCO = one guided dynamic lab).
//
// KimyoLab is delivered into an LMS (e.g. a national e-learning portal) as one SCORM 1.2 package per lab. This module
// is the only place that talks to the LMS API. It is host-layer code: domain, runtime, renderers and chemistry never
// import it.
//
// What is written, and what is NOT:
//   * cmi.core.lesson_status — 'incomplete' while the lab is open, 'completed' once the lab runtime says the lab is
//     complete. Never 'passed' or 'failed': the dynamic lab is not an assessment, so nothing here pretends it graded
//     the learner.
//   * cmi.core.score.raw — never written (no score exists).
//   * cmi.suspend_data — the learner's accepted actions, so a resumed attempt replays to the same state through the
//     same deterministic runtime (no chemistry state is serialised). Bound to the lab profile and its versions; data
//     for another profile/version is ignored. SCORM 1.2 limits it to 4096 characters: when the actions do not fit,
//     nothing is written to suspend_data (an invalid or truncated value is never sent) and the status still is.
//   * cmi.core.session_time, cmi.core.exit — on finish.
// Without an LMS API (opened outside an LMS) every call is a no-op and the lab still works; the page says so.

export interface Scorm12Api {
  LMSInitialize(arg:''):string; LMSFinish(arg:''):string;
  LMSGetValue(element:string):string; LMSSetValue(element:string,value:string):string;
  LMSCommit(arg:''):string; LMSGetLastError():string; LMSGetErrorString(code:string):string;
}
interface WindowWithApi { API?:unknown; parent?:WindowWithApi|null; opener?:WindowWithApi|null }

export const SUSPEND_DATA_LIMIT=4096;
export const SUSPEND_SCHEMA='kl.s1';

function isApi(x:unknown):x is Scorm12Api{
  return Boolean(x)&&['LMSInitialize','LMSFinish','LMSGetValue','LMSSetValue','LMSCommit','LMSGetLastError'].every(k=>typeof (x as any)[k]==='function');
}

/** The standard SCORM 1.2 discovery: this window, then up the parent chain (at most 7 levels), then the opener's chain.
 *  A cross-origin frame throws on access; that frame is skipped, never fatal. */
export function findScorm12Api(win:WindowWithApi|null|undefined):Scorm12Api|null{
  const climb=(start:WindowWithApi|null|undefined)=>{
    let w=start;
    for(let depth=0;w&&depth<=7;depth++){
      try{ if(isApi(w.API)) return w.API; }catch{ /* cross-origin */ }
      let next:WindowWithApi|null|undefined=null;
      try{ next=w.parent&&w.parent!==w?w.parent:null; }catch{ next=null; }
      w=next;
    }
    return null;
  };
  let opener:WindowWithApi|null|undefined=null;
  try{ opener=win?.opener; }catch{ opener=null; }
  return climb(win)??climb(opener);
}

/** SCORM 1.2 CMITimespan: HHHH:MM:SS.SS (hours 2–4 digits). */
export function scormTimespan(ms:number):string{
  const cs=Math.max(0,Math.round(ms/10));
  const h=Math.min(9999,Math.floor(cs/360000)), m=Math.floor(cs/6000)%60, s=Math.floor(cs/100)%60, c=cs%100;
  const p2=(n:number)=>String(n).padStart(2,'0');
  return `${p2(h)}:${p2(m)}:${p2(s)}.${p2(c)}`;
}

export interface LabBinding { profileId:string; activityVersion:string; configVersion:string }
export interface SuspendedLab { actions:unknown[]; complete:boolean }

export function encodeSuspendData(binding:LabBinding,lab:SuspendedLab):string|null{
  const value=JSON.stringify({s:SUSPEND_SCHEMA,p:binding.profileId,av:binding.activityVersion,cv:binding.configVersion,c:lab.complete?1:0,a:lab.actions});
  return value.length<=SUSPEND_DATA_LIMIT?value:null;
}
/** Only data written by this adapter for the SAME profile and versions is accepted; anything else is ignored. */
export function decodeSuspendData(binding:LabBinding,raw:string|null|undefined):SuspendedLab|null{
  if(!raw) return null;
  try{
    const v=JSON.parse(raw);
    if(!v||v.s!==SUSPEND_SCHEMA||v.p!==binding.profileId||v.av!==binding.activityVersion||v.cv!==binding.configVersion||!Array.isArray(v.a)) return null;
    return {actions:v.a,complete:v.c===1};
  }catch{ return null; }
}

export type Scorm12Connection='connected'|'no-lms'|'failed';

export class Scorm12Session{
  readonly #api:Scorm12Api|null; readonly #binding:LabBinding; readonly #now:()=>number;
  #state:Scorm12Connection='no-lms'; #startedAt=0; #finished=false; #complete=false; #wasCompleted=false;
  readonly errors:string[]=[];
  constructor(api:Scorm12Api|null,binding:LabBinding,now:()=>number=()=>Date.now()){ this.#api=api; this.#binding=binding; this.#now=now; }
  get connection():Scorm12Connection{ return this.#state; }

  #call(element:string,value:string){
    if(!this.#api||this.#state!=='connected') return false;
    const ok=this.#api.LMSSetValue(element,value)==='true';
    if(!ok) this.errors.push(`LMSSetValue:${element}:${this.#api.LMSGetLastError()}`);
    return ok;
  }

  /** LMSInitialize and read back what the LMS already has for this learner. Returns the suspended lab, if any. */
  start():SuspendedLab|null{
    this.#startedAt=this.#now();
    if(!this.#api){ this.#state='no-lms'; return null; }
    if(this.#api.LMSInitialize('')!=='true'){ this.#state='failed'; this.errors.push(`LMSInitialize:${this.#api.LMSGetLastError()}`); return null; }
    this.#state='connected';
    const status=this.#api.LMSGetValue('cmi.core.lesson_status');
    this.#wasCompleted=status==='completed'||status==='passed';
    const entry=this.#api.LMSGetValue('cmi.core.entry');
    const suspended=entry==='resume'||entry===''?decodeSuspendData(this.#binding,this.#api.LMSGetValue('cmi.suspend_data')):null;
    // a completed lab stays completed: re-opening it never downgrades the LMS record
    if(!this.#wasCompleted) this.#call('cmi.core.lesson_status','incomplete');
    this.#api.LMSCommit('');
    return suspended;
  }

  /** After every accepted action: the action log for resume and, once complete, the completed status. */
  save(lab:SuspendedLab){
    if(this.#state!=='connected'||this.#finished) return;
    this.#complete=lab.complete;
    const data=encodeSuspendData(this.#binding,lab);
    if(data!==null) this.#call('cmi.suspend_data',data); else this.errors.push('SUSPEND_DATA_TOO_LONG');
    if(lab.complete&&!this.#wasCompleted){ this.#call('cmi.core.lesson_status','completed'); this.#wasCompleted=true; }
    this.#api!.LMSCommit('');
  }

  /** On page exit: session time, exit mode, commit, LMSFinish. Idempotent. */
  finish(){
    if(this.#state!=='connected'||this.#finished) return;
    this.#finished=true;
    this.#call('cmi.core.session_time',scormTimespan(this.#now()-this.#startedAt));
    this.#call('cmi.core.exit',this.#complete||this.#wasCompleted?'':'suspend');
    this.#api!.LMSCommit('');
    this.#api!.LMSFinish('');
  }
}

/** Build-time package configuration, injected by scripts/build-scorm.ts as `globalThis.__KIMYOLAB_SCORM__`. */
export interface ScormPackageConfig { standard:'1.2'; activityId:string }
export function scormPackageConfig(globals:any):ScormPackageConfig|null{
  const c=globals?.__KIMYOLAB_SCORM__;
  return c&&c.standard==='1.2'&&typeof c.activityId==='string'&&/^practice\.experiment\.[0-9.]+$/.test(c.activityId)?{standard:'1.2',activityId:c.activityId}:null;
}
