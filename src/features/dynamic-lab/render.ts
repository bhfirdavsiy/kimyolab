// P2.10 — the guided dynamic lab page (feature flag guidedDynamicLabV1, ADR-P2-011; P2.11 handlers: ADR-P2-012).
//
// Mobile-first, no drag: 1. select an object (apparatus, container, substance, observation point) → 2. choose an action
// (each one says whether it is the instruction's next step, possible, unavailable, unsupported or blocked by an earlier
// step) → 3. configure its parameters → the lab runtime decides. The page never changes chemistry state itself: every
// change is the `nextState` returned by applyLabAction, and every rejection reason comes from the domain boundary.
//
// Learner flow: Maqsad → Amal → Kuzatish → Nega? — four sections on ONE page (not a slideshow). Nothing is persisted:
// no attempt, no evidence, no progress (evidence candidates stay in memory and are discarded).
import {el,clear,link} from '../../ui/components/dom.ts';
import {createLocalizer,type Localize} from '../localization/element-names.ts';
import {createLabeler,type Labeler} from '../practice/form-question.ts';
import type {StudentPracticePageModel} from '../practice/model.ts';
import {LAB_ACTION_FAMILIES,type LabActionFamily} from '../../domain/lab/action-catalog.ts';
import {availableActions,createLabRuntime,createLabState,type ActionOption,type LabAction,type LabActionResult,type LabObservation,type LabState} from '../../domain/lab/lab-runtime.ts';
import type {GuidanceLevel,TopicLabProfile} from '../../domain/lab/topic-lab-profile.ts';
import {createLabDomain} from '../../domain/lab/lab-domain.ts';
import {renderLabScene,subscriptFormula} from './scene.ts';
import {iconSvg,iconForKind} from '../practice/apparatus-icons.ts';
import {setChemText} from '../../ui/chem-text.ts';

type ObjectRef={kind:'apparatus'|'substance'|'target';id:string};

/** The flag is off or the activity has no profile: a notice and the way back to the unchanged runtime. */
export function renderDynamicLabUnavailable(root:HTMLElement,page:StudentPracticePageModel,reason:'flag-off'|'no-profile'){
  const t=createLabeler(createLocalizer(page.localization));
  clear(root);
  const shell=el('div',{className:'kl-shell kl-practice-workspace'});
  shell.append(el('h1',{text:page.title}),el('p',{className:'kl-notice',text:t.ui(reason==='flag-off'?'ui.dlab-flag-off':'ui.dlab-no-profile'),attrs:{role:'status'}}),link(t.ui('ui.dlab-open-classic'),`/practice/${page.id}`,'kl-button kl-button--primary'));
  root.append(shell);
}

export interface DynamicLabHandle { state():LabState; apply(action:LabAction):LabActionResult; reset():void;
  /** Resume (SCORM): replay saved actions through the same runtime; stops at the first one not accepted. Returns how many were applied. */
  replay(actions:readonly LabAction[]):number }
/** How the lab is embedded. `trial` (default): nothing is persisted. `scorm`: the page runs as one SCORM 1.2 SCO — the
 *  host persists the accepted actions and the completed status in the LMS (never a score); there is no link to the
 *  classic practice route, because that route keeps its own browser-local attempt outside the LMS. */
export interface DynamicLabOptions {
  mode?:'trial'|'scorm';
  /** locale key of the persistence notice (default ui.dlab-not-saved) */
  noticeKey?:string;
  /** after each accepted action and after reset: the accepted actions so far and whether the lab is complete */
  onChange?(p:{accepted:readonly LabAction[];complete:boolean}):void;
  /** the bench layout (lab review stage 2): a reagent shelf, pour by picking a reagent and then a vessel (or by
   *  dragging it there), the vessel's own actions next to the picture. Default: on for BENCH_PROTOTYPE only. */
  bench?:boolean;
}
/** lab review 2026-11-24, stage 2: the bench is first tried on 7.10 (owner decision), the other labs keep the list */
export const BENCH_PROTOTYPE:ReadonlySet<string>=new Set(['practice.experiment.7.10']);

export function renderDynamicLab(root:HTMLElement,page:StudentPracticePageModel,profile:TopicLabProfile,options:DynamicLabOptions={}):DynamicLabHandle{
  if(profile.activityId!==page.id) throw new Error('DYNAMIC_LAB_PROFILE_MISMATCH');
  const localize:Localize=createLocalizer(page.localization);
  const t:Labeler=createLabeler(localize);
  const runtime=createLabRuntime(createLabDomain(page.chemistry as any));
  let state=createLabState(profile);
  const accepted:LabAction[]=[];
  let selected:ObjectRef|null=null;
  let pending:LabAction|null=null;
  let level:GuidanceLevel=profile.guidance.defaultLevel;
  let stage:'goal'|'action'|'observe'|'why'='goal';

  const opt=(key:string,vars?:Record<string,string|number>)=>{ const v=localize(key); return v===null?null:v.replace(/\{(\w+)\}/g,(_,k)=>String(vars?.[k]??'')); };
  const label=(key:string)=>t.text(key,key.split('.').pop()!);
  const familyName=(f:string)=>t.ui(`ui.dlab-family-${f}`);
  const apparatusName=(id:string)=>label(profile.apparatus.find(a=>a.id===id)?.labelKey??id);
  // a product is not a profile substance: it is shown by the formula its record names (gas entries carry a `gas:` prefix)
  const substanceName=(id:string)=>{ const s=profile.substances.find(x=>x.id===id); return s?label(s.labelKey):id.replace(/^gas:/,''); };
  const targetName=(id:string)=>label(profile.observationTargets.find(o=>o.id===id)?.labelKey??id);
  const objectName=(o:ObjectRef)=>o.kind==='apparatus'?apparatusName(o.id):o.kind==='substance'?substanceName(o.id):targetName(o.id);
  const actionText=(a:LabAction)=>{
    const p=a.params??{};
    const parts=[familyName(String(a.family))];
    if(p.apparatus) parts.push(apparatusName(String(p.apparatus)));
    if(p.substance) parts.push(substanceName(String(p.substance)));
    if(p.container) parts.push(apparatusName(String(p.container)));
    if(p.from) parts.push(t.ui('ui.dlab-param-from',{name:apparatusName(String(p.from))}));
    if(p.to) parts.push(t.ui('ui.dlab-param-to',{name:apparatusName(String(p.to))}));
    if(p.target) parts.push(targetName(String(p.target)));
    return parts.join(' — ');
  };
  // a procedure step is named by its action (several steps can come from one instruction sentence)
  const stepLabel=(stepId:string)=>{ const s=profile.procedure.steps.find(x=>x.id===stepId); return s?actionText({family:s.family,params:s.match}):stepId; };

  clear(root);
  const head=el('header',{className:'kl-unit-hero'}); const hi=el('div',{className:'kl-shell'});
  const title=el('h1',{text:page.title,attrs:{tabindex:'-1'}});
  if(options.mode!=='scorm') hi.append(link(t.ui('ui.dlab-open-classic'),`/practice/${page.id}`,'kl-back-link'));
  hi.append(el('p',{className:'kl-kicker',text:t.ui('ui.dlab-kicker')}),title,el('p',{className:'kl-notice',text:t.ui(options.noticeKey??'ui.dlab-not-saved'),attrs:{'data-dlab-notice':options.mode??'trial'}}));
  head.append(hi);
  const shell=el('div',{className:'kl-shell kl-practice-workspace kl-dlab',attrs:{'data-dynamic-lab':profile.profileId,'data-order-mode':profile.procedure.mode,'data-completion-scope':profile.completionScope.kind}});

  // the four stages: an ordered list of in-page links (not a carousel); the current one is marked
  const flow=el('nav',{className:'kl-dlab__flow',attrs:{'aria-label':t.ui('ui.dlab-flow')}});
  const flowList=el('ol');
  const stages=[['goal','ui.dlab-stage-goal'],['action','ui.dlab-stage-action'],['observe','ui.dlab-stage-observe'],['why','ui.dlab-stage-why']] as const;
  const flowLinks=new Map<string,HTMLAnchorElement>();
  for(const [id,key] of stages){ const a=el('a',{text:t.ui(key),attrs:{href:`#dlab-${id}`}}); a.addEventListener('click',e=>{ e.preventDefault(); const target=root.querySelector<HTMLElement>(`#dlab-${id}-title`); target?.focus(); }); flowLinks.set(id,a); const li=el('li'); li.append(a); flowList.append(li); }
  flow.append(flowList);
  const section=(id:string,key:string)=>{ const s=el('section',{className:`kl-dlab__stage kl-dlab__stage--${id}`,attrs:{id:`dlab-${id}`,'aria-labelledby':`dlab-${id}-title`}}); s.append(el('h2',{text:t.ui(key),attrs:{id:`dlab-${id}-title`,tabindex:'-1'}})); return s; };

  // Maqsad: the goal, the instruction (its own sentences), the order rule and the safety notes
  const goal=section('goal','ui.dlab-stage-goal');
  // the legacy goal is often step 1 copied; then the instruction (below) already says it
  if(profile.instruction.goal.trim()!==profile.instruction.steps[0]?.text.trim()) goal.append(el('p',{className:'kl-unit-outcome',text:profile.instruction.goal}));
  const instruction=el('details',{className:'kl-dlab__instruction'}); instruction.append(el('summary',{text:t.ui('ui.dlab-instruction')}));
  const steps=el('ol'); for(const s of profile.instruction.steps){ const li=el('li'); setChemText(li,s.text); steps.append(li); } instruction.append(steps);
  if(profile.instruction.equipmentText) instruction.append(el('p',{text:t.ui('ui.lab-equipment',{text:profile.instruction.equipmentText})}));
  if(profile.instruction.materialsText) instruction.append(el('p',{text:t.ui('ui.lab-materials',{text:profile.instruction.materialsText})}));
  goal.append(instruction,el('p',{className:'kl-dlab__order',text:t.ui(`ui.dlab-order-${profile.procedure.mode}`)}));
  if(profile.completionScope.kind==='PARTIAL_INSTRUCTION') goal.append(el('p',{className:'kl-notice kl-dlab__scope',text:t.ui('ui.dlab-partial-notice')}));
  // the same note can come from two instruction steps: it is shown once
  for(const text of [...new Set(profile.safety.notes.map(n=>n.text.trim()))]) goal.append(el('p',{className:'kl-notice kl-dlab__safety',text:t.ui('ui.lab-safety',{text})}));

  // Amal: object → action → parameters
  const action=section('action','ui.dlab-stage-action');
  const objectsBox=el('div',{className:'kl-dlab__objects'});
  const actionsBox=el('div',{className:'kl-dlab__actions',attrs:{'aria-live':'off'}});
  const paramsBox=el('div',{className:'kl-dlab__params'});
  const result=el('p',{className:'kl-feedback kl-dlab__result',attrs:{role:'status','aria-live':'polite','aria-atomic':'true',tabindex:'-1'}});
  const reset=el('button',{className:'kl-button kl-button--secondary',text:t.ui('ui.dlab-reset'),attrs:{type:'button','data-dlab-reset':''}});
  // the bench: a picture of the state (decoration — the same facts are in the text state and the observations)
  const scene=el('div',{className:'kl-scene',attrs:{'data-dlab-scene':''}});
  const speciesList:any[]=Array.isArray((page.chemistry as any)?.species)?(page.chemistry as any).species:((page.chemistry as any)?.species?.species??[]);
  const formulaBySpecies=new Map<string,string>(speciesList.map((x:any)=>[x.id,x.formula]));
  const formulaOf=(substanceId:string)=>{ const sub=profile.substances.find(x=>x.id===substanceId); const sp=sub?.speciesId??sub?.soluteSpeciesId??null; return sp?formulaBySpecies.get(sp)??null:null; };
  const benchMode=options.bench??BENCH_PROTOTYPE.has(profile.activityId);
  // the bench: a reagent "in hand", the vessel being worked with, and the pour that just happened (motion only)
  let inHand:string|null=null, focusVessel:string|null=null, pourFx:string|null=null, lastNote:string|null=null;
  const containers=profile.apparatus.filter(a=>a.isContainer);
  const drawScene=()=>renderLabScene(scene,benchMode
    ?{profile,state,formulaOf,labelOf:apparatusName,large:true,armed:inHand!==null,focus:focusVessel,pour:pourFx,onSelect:(id)=>vesselClick(id),onDrop:(id)=>{ if(inHand) pour(inHand,id); }}
    :{profile,state,formulaOf,labelOf:apparatusName,onSelect:(id)=>{ objectsBox.querySelector<HTMLButtonElement>(`[data-object="apparatus:${id}"]`)?.click(); }});
  const bench=el('section',{className:'kl-bench',attrs:{'aria-labelledby':'dlab-bench-title','data-dlab-bench':''}});
  const benchHint=el('p',{className:'kl-bench__hint',attrs:{'aria-live':'polite'}});
  const benchStage=el('div',{className:'kl-bench__stage'});
  const vesselRow=el('div',{className:'kl-bench__vessels',attrs:{role:'group','aria-label':t.ui('ui.bench-vessels')}});
  const shelf=el('div',{className:'kl-bench__shelf',attrs:{role:'group','aria-label':t.ui('ui.bench-shelf')}});
  const tools=el('div',{className:'kl-bench__tools'});
  if(benchMode){
    bench.append(el('h2',{className:'kl-sr-only',text:t.ui('ui.bench-title'),attrs:{id:'dlab-bench-title'}}));
    result.classList.add('kl-sr-only');
    benchStage.append(scene,benchHint,vesselRow,tools,result);
    const side=el('div',{className:'kl-bench__side'}); side.append(el('h3',{text:t.ui('ui.bench-shelf')}),shelf);
    bench.append(benchStage,side);
    // the list of every action stays — for the keyboard and screen readers, and for what the bench does not show
    const list=el('details',{className:'kl-dlab__list-toggle'}); list.append(el('summary',{text:t.ui('ui.bench-list')}),objectsBox,actionsBox,paramsBox);
    action.append(list,reset);
  }
  else action.append(objectsBox,actionsBox,paramsBox,result,reset);

  function vesselClick(id:string){
    if(inHand&&containers.some(c=>c.id===id)){ pour(inHand,id); return; }
    focusVessel=focusVessel===id?null:id; selected={kind:'apparatus',id}; draw();
  }
  function pour(substance:string,container:string){
    const limit=profile.limits.quantities.find(q=>q.substanceId===substance);
    inHand=null; focusVessel=container; pourFx=container;
    run({family:'ADD_SUBSTANCE',params:{substance,container,...(limit?{quantity:limit.value}:{})}});
    pourFx=null;
  }
  function drawBench(){
    if(!benchMode) return;
    clear(shelf); clear(vesselRow); clear(tools);
    setChemText(benchHint,inHand?t.ui('ui.bench-hint-in-hand',{name:substanceName(inHand)}):lastNote?lastNote:focusVessel?t.ui('ui.bench-hint-vessel',{vessel:apparatusName(focusVessel)}):t.ui('ui.bench-hint-start'));
    benchHint.classList.toggle('is-result',!inHand&&!!lastNote); lastNote=null;
    for(const sub of profile.substances){
      const b=el('button',{className:`kl-bench__bottle${inHand===sub.id?' is-in-hand':''}`,attrs:{type:'button',draggable:'true','aria-pressed':String(inHand===sub.id),'data-bench-substance':sub.id}});
      const f=formulaOf(sub.id); const ic=iconSvg('bottle'); if(ic) b.append(ic);
      if(f) b.append(el('span',{className:'kl-dlab__formula',text:subscriptFormula(f),attrs:{'aria-hidden':'true'}}));
      const nm=el('span',{className:'kl-bench__bottle-name'}); setChemText(nm,substanceName(sub.id)); b.append(nm);
      b.addEventListener('click',()=>{ inHand=inHand===sub.id?null:sub.id; focusVessel=null; draw(); });
      b.addEventListener('dragstart',e=>{ inHand=sub.id; e.dataTransfer?.setData('text/plain',sub.id); scene.querySelector('svg')?.classList.add('is-armed'); });
      shelf.append(b);
    }
    for(const c of containers){
      const b=el('button',{className:`kl-button kl-button--secondary kl-bench__vessel${focusVessel===c.id?' is-focus':''}`,attrs:{type:'button','data-bench-vessel':c.id}});
      setChemText(b,apparatusName(c.id)); if(inHand){ b.classList.add('is-target'); b.setAttribute('aria-label',t.ui('ui.bench-pour-into',{vessel:apparatusName(c.id)})); }
      b.addEventListener('click',()=>vesselClick(c.id));
      b.addEventListener('dragover',e=>e.preventDefault()); b.addEventListener('drop',e=>{ e.preventDefault(); if(inHand) pour(inHand,c.id); });
      vesselRow.append(b);
    }
    if(inHand){ const cancel=el('button',{className:'kl-button kl-button--secondary',text:t.ui('ui.bench-cancel'),attrs:{type:'button'}}); cancel.addEventListener('click',()=>{ inHand=null; draw(); }); tools.append(cancel); return; }
    if(!focusVessel) return;
    // the vessel's own actions (heat, collect its gas, …): what the runtime offers for it, the instruction's next first
    const ref={kind:'apparatus' as const,id:focusVessel};
    const seen=new Set<string>();
    const opts=availableActions(state,profile).filter(o=>o.action.family!=='ADD_SUBSTANCE'&&touches(o,ref)&&(o.category==='recommended'||o.category==='possible'));
    if(!opts.length){ tools.append(el('p',{className:'kl-bench__none',text:t.ui('ui.bench-no-tools')})); return; }
    tools.append(el('p',{className:'kl-bench__tools-title',text:t.ui('ui.bench-tools',{vessel:apparatusName(focusVessel)})}));
    for(const o of opts){
      const key=JSON.stringify(o.action); if(seen.has(key)) continue; seen.add(key);
      const b=el('button',{className:`kl-button ${o.category==='recommended'?'kl-button--primary':'kl-button--secondary'}`,attrs:{type:'button','data-bench-action':String(o.action.family)}});
      // collecting: name the gas's source tube ("1-probirkadagi gazni yig'ish"), not the collector twice
      let label=actionText(o.action);
      if(o.action.family==='COLLECT_GAS'){ const from=o.action.params?.from?String(o.action.params.from):(containers.map(c=>c.id).filter(id=>state.containers[id]?.gases.some(g=>!g.collected&&!g.collectedFrom)).length===1?containers.map(c=>c.id).find(id=>state.containers[id]?.gases.some(g=>!g.collected&&!g.collectedFrom))!:null); if(from) label=t.ui('ui.bench-collect-from',{from:apparatusName(from)}); }
      setChemText(b,label);
      b.addEventListener('click',()=>{ if(o.action.family==='RECORD'){ selected=ref; (action.querySelector('details') as HTMLDetailsElement|null)?.setAttribute('open',''); choose(o.action); return; } run(o.action); });
      tools.append(b);
    }
  }

  // Kuzatish: the observations (text, never colour alone) and the state
  const observe=section('observe','ui.dlab-stage-observe');
  const obsList=el('ol',{className:'kl-dlab__observations',attrs:{'aria-label':t.ui('ui.dlab-observations')}});
  const obsEmpty=el('p',{text:t.ui('ui.dlab-no-observations')});
  const stateBox=el('div',{className:'kl-dlab__state'});
  observe.append(obsEmpty,obsList,el('h3',{text:t.ui('ui.dlab-state')}),stateBox);
  // Stage 1 of the 2026-11-24 review: record ids, source paths and model names are for the teacher, behind one summary

  // Nega?: where each observation comes from + guidance levels 1–4 (never the answer)
  const why=section('why','ui.dlab-stage-why');
  const whyList=el('ul',{className:'kl-dlab__why-list'});
  const whyEmpty=el('p',{text:t.ui('ui.dlab-why-empty')});
  const teacher=el('details',{className:'kl-dlab__teacher'}); teacher.append(el('summary',{text:t.ui('ui.dlab-teacher')}));
  const sources=el('ul',{className:'kl-dlab__sources'}); teacher.append(sources);
  const guidanceFs=el('fieldset',{className:'kl-choice-group kl-dlab__guidance'}); guidanceFs.append(el('legend',{text:t.ui('ui.dlab-guidance')}));
  for(const l of profile.guidance.levels){
    const id=`dlab-guidance-${l}`; const input=el('input',{attrs:{type:'radio',name:'dlab-guidance',id,value:String(l)}}); if(l===level) input.checked=true;
    input.addEventListener('change',()=>{ level=l as GuidanceLevel; draw(); });
    const lab=el('label',{attrs:{for:id}}); lab.append(input,document.createTextNode(` ${t.ui(`ui.dlab-guidance-${l}`)}`)); guidanceFs.append(lab);
  }
  const guidanceOut=el('div',{className:'kl-dlab__guidance-text',attrs:{'aria-live':'polite'}});
  why.append(whyEmpty,whyList,guidanceFs,guidanceOut,teacher);

  shell.append(flow,benchMode?bench:scene,goal,action,observe,why);
  root.append(head,shell);

  function categoryText(o:ActionOption){
    const base=t.ui(`ui.dlab-cat-${o.category}`);
    if(o.category==='procedural-dependency'&&o.blockedBy.length) return `${base}: ${o.blockedBy.map(stepLabel).join(', ')}`;
    if(o.category==='unavailable'||o.category==='unsupported'){ const r=o.code?opt(`ui.dlab-reason-${o.code}`):null; return r?`${base}: ${r}`:base; }
    return base;
  }

  function touches(o:ActionOption,ref:ObjectRef){
    const p=o.action.params??{};
    if(ref.kind==='apparatus') return p.apparatus===ref.id||p.container===ref.id||p.from===ref.id||p.to===ref.id;
    if(ref.kind==='substance') return p.substance===ref.id;
    return p.target===ref.id;
  }

  function drawObjects(){
    clear(objectsBox);
    objectsBox.append(el('h3',{text:t.ui('ui.dlab-choose-object')}));
    const group=(key:string,refs:ObjectRef[])=>{
      if(!refs.length) return;
      const g=el('div',{className:'kl-dlab__group',attrs:{role:'group','aria-label':t.ui(key)}});
      g.append(el('p',{className:'kl-dlab__group-title',text:t.ui(key),attrs:{'aria-hidden':'true'}}));
      for(const ref of refs){
        // a card: apparatus with its icon, a substance with its formula above the name (the accessible name is the name)
        const b=el('button',{className:`kl-button kl-button--secondary kl-dlab__object kl-dlab__object--${ref.kind}`,attrs:{type:'button','aria-pressed':String(selected?.kind===ref.kind&&selected.id===ref.id),'data-object':`${ref.kind}:${ref.id}`}});
        if(ref.kind==='apparatus'){ const ic=iconForKind(profile.apparatus.find(a=>a.id===ref.id)?.kind??''); const svg=ic?iconSvg(ic):null; if(svg) b.append(svg); }
        if(ref.kind==='substance'){ const f=formulaOf(ref.id); if(f) b.append(el('span',{className:'kl-dlab__formula',text:subscriptFormula(f),attrs:{'aria-hidden':'true'}})); }
        { const nm=el('span',{className:'kl-dlab__object-name'}); setChemText(nm,objectName(ref)); b.append(nm); }
        b.addEventListener('click',()=>{ selected=ref; pending=null; draw(); actionsBox.querySelector<HTMLElement>('h3')?.focus(); });
        g.append(b);
      }
      objectsBox.append(g);
    };
    group('ui.dlab-group-apparatus',profile.apparatus.map(a=>({kind:'apparatus' as const,id:a.id})));
    group('ui.dlab-group-substances',profile.substances.map(s=>({kind:'substance' as const,id:s.id})));
    if(profile.allowedFamilies.includes('OBSERVE')) group('ui.dlab-group-targets',profile.observationTargets.map(o=>({kind:'target' as const,id:o.id})));
  }

  function drawActions(){
    clear(actionsBox);
    if(!selected){ actionsBox.append(el('p',{text:t.ui('ui.dlab-no-object')})); return; }
    actionsBox.append(el('h3',{text:t.ui('ui.dlab-choose-action',{object:objectName(selected)}),attrs:{tabindex:'-1'}}));
    // a container lists what can be done TO it; adding a substance starts from the substance (no 7× "add" list)
    const options=availableActions(state,profile).filter(o=>touches(o,selected!)&&!(selected!.kind==='apparatus'&&o.action.family==='ADD_SUBSTANCE'));
    // one entry per family for this object (ADD of a substance asks for the container in step 3)
    const seen=new Set<string>(); const list=el('ul',{className:'kl-dlab__action-list'});
    for(const o of options){
      const key=selected.kind==='substance'?String(o.action.family):JSON.stringify(o.action);
      if(seen.has(key)) continue; seen.add(key);
      const best=selected.kind==='substance'?pickBest(options.filter(x=>x.action.family===o.action.family)):o;
      const id=`dlab-act-${list.children.length}`;
      const b=el('button',{className:`kl-button ${best.category==='recommended'?'kl-button--primary':'kl-button--secondary'}`,text:selected.kind==='substance'?familyName(String(o.action.family)):actionText(o.action),attrs:{type:'button','aria-describedby':`${id}-cat`,'data-action-family':String(o.action.family),'data-category':best.category,...(o.action.params?.from?{'data-action-from':String(o.action.params.from)}:{}),...(o.action.params?.to?{'data-action-to':String(o.action.params.to)}:{})}});
      b.addEventListener('click',()=>choose(o.action));
      const li=el('li'); li.append(b,el('span',{className:'kl-dlab__category',text:categoryText(best),attrs:{id:`${id}-cat`}})); list.append(li);
    }
    actionsBox.append(list);
    // families the topic's instruction does not contain (for a container): offered so the learner hears WHY not
    if(selected.kind==='apparatus'&&profile.apparatus.find(a=>a.id===selected!.id)?.isContainer){
      const others=LAB_ACTION_FAMILIES.filter(d=>!profile.allowedFamilies.includes(d.family)&&d.parameters.filter(p=>p.required).map(p=>p.name).join()==='container'&&localize(`ui.dlab-family-${d.family}`)!==null);
      if(others.length){
        const det=el('details',{className:'kl-dlab__other'}); det.append(el('summary',{text:t.ui('ui.dlab-other-actions')}));
        const ul=el('ul');
        for(const d of others){ const b=el('button',{className:'kl-button kl-button--secondary',text:familyName(d.family),attrs:{type:'button','data-action-family':d.family,'data-category':'not-in-topic'}}); b.addEventListener('click',()=>run({family:d.family,params:{container:selected!.id}})); const li=el('li'); li.append(b); ul.append(li); }
        det.append(ul); actionsBox.append(det);
      }
    }
  }
  function pickBest(xs:ActionOption[]){ const rank=['recommended','possible','procedural-dependency','unavailable','unsupported']; return [...xs].sort((a,b)=>rank.indexOf(a.category)-rank.indexOf(b.category))[0]!; }

  function choose(a:LabAction){
    const needsContainer=selected?.kind==='substance';
    const needsText=a.family==='RECORD';
    const limit=a.family==='ADD_SUBSTANCE'?profile.limits.quantities.find(q=>q.substanceId===a.params?.substance):undefined;
    if(!needsContainer&&!needsText&&!limit){ run(a); return; }
    pending=a; drawParams(limit); paramsBox.querySelector<HTMLElement>('select,input,textarea')?.focus();
  }

  function drawParams(limit?:{value:number;unit:string}){
    clear(paramsBox);
    if(!pending) return;
    const a=pending;
    const form=el('form',{className:'kl-form',attrs:{novalidate:''}});
    form.append(el('h3',{text:t.ui('ui.dlab-configure',{action:familyName(String(a.family))})}));
    const alert=el('p',{className:'kl-field-error',attrs:{role:'alert',id:'dlab-param-error'}});
    let container:HTMLSelectElement|null=null, quantity:HTMLInputElement|null=null, text:HTMLInputElement|null=null;
    if(selected?.kind==='substance'){
      const f=el('div',{className:'kl-field'}); const id='dlab-param-container';
      container=el('select',{attrs:{id,required:'','aria-describedby':'dlab-param-error'}});
      container.append(el('option',{text:t.ui('ui.choose'),attrs:{value:''}}));
      for(const c of profile.apparatus.filter(x=>x.isContainer)) container.append(el('option',{text:apparatusName(c.id),attrs:{value:c.id}}));
      f.append(el('label',{text:t.ui('ui.dlab-container'),attrs:{for:id}}),container); form.append(f);
    }
    if(limit){
      const f=el('div',{className:'kl-field'}); const id='dlab-param-quantity';
      quantity=el('input',{attrs:{id,type:'number',inputmode:'decimal',min:'0',step:'any',value:String(limit.value),'aria-describedby':'dlab-param-error'}});
      f.append(el('label',{text:t.ui('ui.dlab-quantity',{unit:limit.unit,value:limit.value}),attrs:{for:id}}),quantity); form.append(f);
    }
    if(a.family==='RECORD'){
      const f=el('div',{className:'kl-field'}); const id='dlab-param-text';
      text=el('input',{attrs:{id,type:'text',autocomplete:'off',spellcheck:'false','aria-describedby':'dlab-param-error'}});
      f.append(el('label',{text:t.ui('ui.dlab-equation'),attrs:{for:id}}),text); form.append(f);
    }
    const row=el('div',{className:'kl-practice-controls'});
    const cancel=el('button',{className:'kl-button kl-button--secondary',text:t.ui('ui.dlab-cancel'),attrs:{type:'button'}});
    cancel.addEventListener('click',()=>{ pending=null; drawParams(); actionsBox.querySelector<HTMLElement>('button')?.focus(); });
    row.append(el('button',{className:'kl-button kl-button--primary',text:t.ui('ui.dlab-do'),attrs:{type:'submit'}}),cancel);
    form.append(alert,row);
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const params:Record<string,string|number>={...(a.params??{})};
      if(container){ if(!container.value){ alert.textContent=t.ui('ui.dlab-param-required'); container.setAttribute('aria-invalid','true'); container.focus(); return; } params.container=container.value; }
      if(quantity){ const v=Number(quantity.value); if(!quantity.value||!Number.isFinite(v)){ alert.textContent=t.ui('ui.dlab-param-required'); quantity.setAttribute('aria-invalid','true'); quantity.focus(); return; } params.quantity=v; }
      if(text){ if(!text.value.trim()){ alert.textContent=t.ui('ui.dlab-param-required'); text.setAttribute('aria-invalid','true'); text.focus(); return; } params.text=text.value; }
      pending=null; run({family:a.family,params});
    });
    paramsBox.append(form);
  }

  function resultText(r:LabActionResult,a:LabAction){
    if(r.error){
      const base=t.ui(`ui.dlab-err-${r.error.code}`,{list:r.procedural.blockedBy.map(stepLabel).join(', ')});
      const detail=opt(`ui.dlab-reason-${r.error.detail}`);
      return detail?`${base} ${detail}`:base;
    }
    if(r.unsupported){ const detail=opt(`ui.dlab-reason-${r.unsupported.detail}`); const key=r.unsupported.code==='UNSUPPORTED_CHEMISTRY'?'ui.dlab-unsupported-chemistry':r.unsupported.code==='LEARNER_RESPONSE_CHECKER_MISSING'?'ui.dlab-unsupported-response':'ui.dlab-unsupported-action'; return `${t.ui(key)}${detail?` ${detail}`:''}`; }
    const parts=[t.ui('ui.dlab-accepted',{action:actionText(a)})];
    const consequence=opt(`ui.dlab-reason-${r.guidance.code}`); if(consequence) parts.push(consequence);
    for(const o of r.observations) parts.push(observationText(o,r.nextState));
    const eq=r.chemistryEvents.find(e=>e.type==='equation'); if(eq) parts.push(t.ui(eq.detail.correct?'ui.dlab-equation-correct':'ui.dlab-equation-incorrect'));
    if(r.procedural.completedStep){ const s=profile.procedure.steps.find(x=>x.id===r.procedural.completedStep); if(s?.instructionStep!==null&&s?.instructionStep!==undefined) parts.push(t.ui('ui.dlab-step-done',{n:s.instructionStep+1})); }
    // P2.11 closeout: “the lab's goal is reached” only when the profile carries the WHOLE instruction
    if(r.nextState.complete&&!state.complete) parts.push(t.ui(profile.completionScope.kind==='FULL_INSTRUCTION'?'ui.dlab-complete':'ui.dlab-complete-partial'));
    return parts.join(' ');
  }

  function run(a:LabAction){
    const r=runtime.applyLabAction(state,a,profile);
    // the bench says what happened next to the picture: the observations of this action (or that nothing visible did)
    if(benchMode) lastNote=r.status==='accepted'?(r.observations.length?r.observations.map(o=>observationText(o,r.nextState)).join(' · '):t.ui('ui.bench-nothing-seen')):resultText(r,a);
    pending=null; clear(paramsBox);
    setChemText(result,resultText(r,a));
    result.dataset.status=r.status;
    result.dataset.code=r.error?.code??r.unsupported?.code??r.guidance.code;
    state=r.nextState;
    if(r.status==='accepted'){ stage=r.observations.length?'observe':'action'; accepted.push(a); options.onChange?.({accepted:[...accepted],complete:state.complete}); }
    draw();
    // the bench keeps the picture in view: focus moves to the result without scrolling (it is announced politely)
    result.focus(benchMode?{preventScroll:true}:undefined);
    return r;
  }

  // st: the state the observation belongs to (an action's result text is written before `state` moves on)
  function observationText(o:LabObservation,st:LabState=state){
    const d=(o.data??{}) as any;
    const electrode=o.target==='cathode'||o.target==='anode'?targetName(o.target):'';
    let text:string;
    switch(o.kind){
      case 'precipitate': { const c=d.color?opt(`ui.dlab-color-${d.color}`):null; text=c?t.ui('ui.dlab-obs-precipitate-color',{color:c}):t.ui('ui.dlab-obs-precipitate'); break; }
      case 'gas': {
        if(o.producedBy==='ElectrolysisModel'){ text=t.ui('ui.dlab-obs-electrode-gas',{electrode,product:String(d.product)}); break; }
        // ReactionMatcher: the gas is the record's gaseous product in that container (never named from the observation alone)
        const rid=o.source.split('#')[1];
        const g=o.container?st.containers[o.container]?.gases.find(x=>x.reactionId===rid)??Object.values(st.containers).flatMap(c=>c.gases).find(x=>x.reactionId===rid&&x.collectedFrom===o.container):undefined;
        text=g?t.ui('ui.dlab-obs-reaction-gas',{product:g.product}):t.ui('ui.dlab-obs-gas'); break;
      }
      case 'gas-collected': text=t.ui('ui.dlab-obs-gas-collected',{product:String(d.product),source:apparatusName(String(d.from))}); break;
      case 'no-visible-change': text=t.ui('ui.dlab-obs-no-visible-change'); break;
      case 'indicator-response': { const c=d.color?opt(`ui.dlab-color-${d.color}`):null; const m=d.medium?opt(`ui.dlab-medium-${d.medium}`):null; text=c&&m?t.ui('ui.dlab-obs-indicator',{color:c,medium:m}):t.ui('ui.dlab-obs-other'); break; }
      case 'temperature-change': text=t.ui('ui.dlab-obs-temperature-change'); break;
      case 'deposit': text=t.ui('ui.dlab-obs-deposit',{electrode,product:String(d.product)}); break;
      case 'color-change': text=t.ui('ui.dlab-obs-color-change'); break;
      case 'no-reaction': text=t.ui('ui.dlab-obs-no-reaction'); break;
      case 'dissolved': text=t.ui('ui.dlab-obs-dissolved',{formula:String(d.formula)}); break;
      case 'turbid-mixture': text=t.ui('ui.dlab-obs-turbid'); break;
      case 'clear-filtrate': text=t.ui('ui.dlab-obs-filtrate'); break;
      case 'state-change': text=o.target==='crystals'?t.ui('ui.dlab-obs-crystals'):t.ui('ui.dlab-obs-other'); break;
      default: text=t.ui('ui.dlab-obs-other');
    }
    const where=o.container?apparatusName(o.container):targetName(o.target);
    return t.ui('ui.dlab-obs-line',{target:where,text});
  }
  function sourceText(o:LabObservation){
    if(o.producedBy==='ReactionMatcher') return t.ui('ui.dlab-src-reaction',{id:o.source.split('#')[1]??''});
    if(o.producedBy==='ElectrolysisModel') return t.ui('ui.dlab-src-electrolysis',{query:o.source.split('#')[1]??''});
    if(o.producedBy==='IonicEngine') return t.ui('ui.dlab-src-solubility');
    if(o.producedBy==='SchoolLabModel') return t.ui('ui.dlab-src-school-model',{id:o.source.split('#')[1]??''});
    const m=o.source.match(/steps\[(\d+)\]/);
    return `${t.ui('ui.dlab-src-instruction')}${m?`, ${t.ui('ui.dlab-step-n',{n:Number(m[1])+1})}`:''}. ${t.ui('ui.dlab-why-instruction-note')}`;
  }

  // Nega?: the learner reads the reason in plain words — the record's equation, the indicator's colours, the instruction
  // itself — never a record id (those are in the teacher's summary). An unreviewed record says so.
  const chem=page.chemistry as any;
  const reactionList:any[]=Array.isArray(chem?.reactions)?chem.reactions:(chem?.reactions?.reactions??[]);
  const reactionById=new Map<string,any>(reactionList.map((r:any)=>[r.id,r]));
  const reviewed=new Set<string>(Array.isArray((page as any).reviewedReactionIds)?(page as any).reviewedReactionIds:Array.isArray(chem?.reviewedReactionIds)?chem.reviewedReactionIds:[]);
  function whyText(o:LabObservation){
    const seen=observationText(o);
    if(o.producedBy==='ReactionMatcher'){
      const id=o.source.split('#')[1]??''; const rec=reactionById.get(id);
      if(!rec?.molecularEquation) return `${seen}. ${t.ui('ui.dlab-why-record')}`;
      return `${seen}. ${t.ui('ui.dlab-why-equation',{equation:rec.molecularEquation})}${reviewed.has(id)?'':` ${t.ui('ui.dlab-why-unreviewed')}`}`;
    }
    if(o.producedBy==='SchoolLabModel'){
      const colors=(chem?.hydrolysis?.indicator?.colors??{}) as Record<string,string>;
      const list=(['acidic','basic','neutral'] as const).filter(m=>colors[m]).map(m=>`${opt(`ui.dlab-medium-${m}`)??m} — ${opt(`ui.dlab-color-${colors[m]}`)??colors[m]}`).join(', ');
      return `${seen}. ${t.ui('ui.dlab-why-indicator',{list})} ${t.ui('ui.dlab-why-unreviewed')}`;
    }
    if(o.producedBy==='IonicEngine') return `${seen}. ${t.ui('ui.dlab-why-solubility')}`;
    if(o.producedBy==='ElectrolysisModel') return `${seen}. ${t.ui('ui.dlab-why-electrolysis')}`;
    return `${seen}. ${t.ui('ui.dlab-why-instruction')}`;
  }

  function drawObservations(){
    clear(obsList); clear(sources); clear(whyList);
    obsEmpty.hidden=state.observations.length>0; whyEmpty.hidden=state.observations.length>0;
    for(const o of state.observations){
      const li=el('li',{attrs:{'data-observation-kind':o.kind,'data-produced-by':o.producedBy,'data-grounding':o.grounding}}); setChemText(li,observationText(o)); obsList.append(li);
      const w=el('li',{attrs:{'data-produced-by':o.producedBy}}); setChemText(w,whyText(o)); whyList.append(w);
      sources.append(el('li',{text:`${observationText(o)} — ${t.ui('ui.dlab-why-source',{source:sourceText(o)})}`,attrs:{'data-grounding':o.grounding}}));
    }
  }

  function drawState(){
    clear(stateBox);
    stateBox.append(el('p',{text:t.ui('ui.dlab-state-setup',{list:state.setUp.length?state.setUp.map(apparatusName).join(', '):t.ui('ui.dlab-state-none')})}));
    // the text twin of the bench picture: only what is in a vessel (an empty vessel and an unmodelled pH or
    // temperature are not listed — "not modelled" is a fact for the teacher, not an observation)
    const ul=el('ul'); let empty=0;
    for(const c of profile.apparatus.filter(a=>a.isContainer)){
      const cs=state.containers[c.id]!;
      const items=cs.contents.map(e=>substanceName(e.substanceId)+(e.amount?` (${e.amount.value} ${e.amount.unit})`:''));
      const gases=cs.gases.filter(g=>!g.collected).map(g=>g.product);
      const heated=cs.heating||(cs.temperature.modeled&&cs.temperature.state==='heated');
      if(!items.length&&!gases.length&&!cs.sealed&&!heated){ empty++; continue; }
      const extra=[...(gases.length?[t.ui('ui.dlab-gas-in',{list:[...new Set(gases)].join(', ')})]:[]),...(cs.sealed?[t.ui('ui.dlab-sealed')]:[]),...(heated?[t.ui('ui.dlab-temperature',{value:t.ui('ui.dlab-heated')})]:[])];
      const li=el('li'); setChemText(li,[t.ui('ui.dlab-contents',{container:apparatusName(c.id),list:items.length?items.join(', '):t.ui('ui.dlab-state-empty')}),...extra].join('; ')); ul.append(li);
    }
    if(ul.children.length) stateBox.append(ul);
    if(empty) stateBox.append(el('p',{text:t.ui(ul.children.length?'ui.dlab-state-rest-empty':'ui.dlab-state-all-empty')}));
    if(state.current.on) stateBox.append(el('p',{text:t.ui('ui.dlab-current-on')}));
  }

  function drawGuidance(){
    clear(guidanceOut);
    const g=runtime.guidance(state,profile,level);
    const lines=[t.ui('ui.dlab-guidance-goal',{goal:g.goal})];
    if(level>=2) lines.push(t.ui('ui.dlab-guidance-possible',{list:g.possibleFamilies.map(familyName).join(', ')||t.ui('ui.dlab-state-none')}));
    if(level>=3) lines.push(g.recommended.length?t.ui(g.ordered?'ui.dlab-guidance-next':'ui.dlab-guidance-next-unordered',{list:g.recommended.map(r=>actionText(r.action)).join('; ')}):t.ui('ui.dlab-guidance-none'));
    if(level>=4){ for(const x of g.instructionText) lines.push(t.ui('ui.dlab-guidance-text',{text:x})); for(const b of g.blocked.slice(0,1)) lines.push(t.ui('ui.dlab-guidance-blocked',{step:stepLabel(b.step),list:b.blockedBy.map(stepLabel).join(', ')})); }
    lines.push(t.ui('ui.dlab-guidance-no-answer'));
    for(const l of lines){ const p=el('p'); setChemText(p,l); guidanceOut.append(p); }
  }

  // a tally like a stepper's counter: how many of the goal's reactions the learner has observed (from the state)
  const tally=el('p',{className:'kl-dlab__tally',attrs:{'data-dlab-tally':''}}); flow.append(tally);
  function drawTally(){
    const goal=profile.completionGoal.kind==='reactions'?profile.completionGoal.reactionIds:[];
    if(!goal.length){ tally.hidden=true; return; }
    const seen=goal.filter(id=>state.observations.some(o=>o.producedBy==='ReactionMatcher'&&o.source.endsWith(`#${id}`))).length;
    tally.hidden=false; tally.textContent=t.ui('ui.dlab-tally',{done:seen,total:goal.length});
  }
  function draw(){
    for(const [id,a] of flowLinks){ if(id===stage) a.setAttribute('aria-current','step'); else a.removeAttribute('aria-current'); }
    shell.dataset.complete=String(state.complete);
    drawScene(); drawBench(); drawTally(); drawObjects(); drawActions(); drawObservations(); drawState(); drawGuidance();
  }

  reset.addEventListener('click',()=>{ state=runtime.reset(profile); accepted.length=0; inHand=null; focusVessel=null; options.onChange?.({accepted:[],complete:state.complete}); selected=null; pending=null; stage='goal'; clear(paramsBox); draw(); result.textContent=t.ui('ui.dlab-reset-done'); result.dataset.status='reset'; result.dataset.code='RESET'; title.focus(); });
  draw();
  const replay=(actions:readonly LabAction[])=>{
    let n=0;
    for(const a of actions){ const r=runtime.applyLabAction(state,a,profile); if(r.status!=='accepted') break; state=r.nextState; accepted.push(a); n++; }
    if(n){ stage='observe'; draw(); result.textContent=t.ui('ui.dlab-resumed',{count:n}); result.dataset.status='resumed'; result.dataset.code='RESUMED'; }
    return n;
  };
  return {state:()=>state,apply:(a)=>run(a),reset:()=>reset.click(),replay};
}
