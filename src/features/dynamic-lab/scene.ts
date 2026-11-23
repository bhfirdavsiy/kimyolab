// The guided dynamic lab's bench: an SVG picture DERIVED from the lab state, redrawn after every action.
//
// It draws only what the state holds — it never decides chemistry and never changes the state:
//   * a vessel per container apparatus, shaped by its kind (test tube, gas-collection vessel, beaker, cell, dish);
//   * contents by phase (liquid band, solid granules); labels are the substances' formulas;
//   * bubbles ONLY where an authority produced a gas in that container (ReactionMatcher record / ElectrolysisModel);
//   * a precipitate ONLY where an observation says so, in the colour the record states (else a neutral shade);
//   * a heat haze ONLY for a temperature-change observation; a flame ONLY while the container is heated;
//   * a stopper ONLY when sealed; a collected gas fills the collecting vessel, labelled by the product formula.
// The picture is decoration for sighted learners (aria-hidden): every fact in it is also in the text state and the
// observation list. Clicking a vessel selects that apparatus, the same as its button in the object list.
// Motion is CSS only and stops under prefers-reduced-motion.
import type {LabState,ContainerState} from '../../domain/lab/lab-runtime.ts';
import type {TopicLabProfile} from '../../domain/lab/topic-lab-profile.ts';

const NS='http://www.w3.org/2000/svg';
type Attrs=Record<string,string|number>;
function s(tag:string,attrs:Attrs={},text?:string):SVGElement{
  const n=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,String(v));
  if(text!==undefined) n.textContent=text;
  return n;
}
/** H2SO4 → H₂SO₄ (digits after a letter or a closing bracket become subscripts) */
export function subscriptFormula(f:string):string{
  const SUB='₀₁₂₃₄₅₆₇₈₉';
  return f.replace(/([A-Za-z)\]])(\d+)/g,(_,a:string,d:string)=>a+[...d].map(x=>SUB[Number(x)]).join(''));
}
/** colour words a record may state → a fill; anything else gets the neutral precipitate shade (never invented) */
const COLOR:Record<string,string>={white:'#f4f6f8',blue:'#5b8def','light-blue':'#9cc3ff',green:'#4caf6a',yellow:'#f2d24b','pale-yellow':'#f6e7a1',red:'#d9534f',brown:'#8d5a3b','red-brown':'#a0522d',black:'#2b2b2b',grey:'#9aa1ab',gray:'#9aa1ab',orange:'#f0a03c',violet:'#8e6cc9',purple:'#8e6cc9'};
const NEUTRAL_PRECIPITATE='#e9edf2';

export interface SceneInput {
  profile:TopicLabProfile;
  state:LabState;
  /** substance id → formula (from its species), or null for a sample without a species */
  formulaOf(substanceId:string):string|null;
  /** apparatus id → its localized label */
  labelOf(apparatusId:string):string;
  /** called when a vessel is clicked (selects that apparatus like its button) */
  onSelect?(apparatusId:string):void;
}

const VESSEL_KINDS=new Set(['test-tube','gas-collection-vessel','beaker','receiver','electrolysis-cell','evaporating-dish']);

export function renderLabScene(host:HTMLElement,input:SceneInput){
  const {profile,state}=input;
  const vessels=profile.apparatus.filter(a=>a.isContainer||VESSEL_KINDS.has(a.kind)).filter(a=>VESSEL_KINDS.has(a.kind));
  host.replaceChildren();
  if(!vessels.length) return;
  const slot=124, H=262, W=Math.max(slot*vessels.length+24,280);
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,class:'kl-scene__svg','aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'}) as SVGSVGElement;
  // the bench
  svg.append(s('rect',{x:0,y:H-34,width:W,height:34,rx:6,class:'kl-scene__bench'}));
  vessels.forEach((a,i)=>{
    const cx=24+slot*i+slot/2-12;
    const c=state.containers[a.id];
    const setUp=state.setUp.includes(a.id);
    const g=s('g',{class:`kl-scene__vessel kl-scene__vessel--${a.kind}${setUp?'':' is-idle'}`,'data-scene-object':`apparatus:${a.id}`});
    if(input.onSelect){ g.addEventListener('click',()=>input.onSelect!(a.id)); g.setAttribute('cursor','pointer'); }
    drawVessel(g,a.kind,cx,H-34,c,state,input);
    // the label under the vessel, wrapped to two lines when long
    const words=input.labelOf(a.id).split(' '); const lines:string[]=[]; for(const w of words){ const last=lines.at(-1); if(last!==undefined&&(last+' '+w).length<=15) lines[lines.length-1]=last+' '+w; else lines.push(w); }
    const shownLines=lines.length>2?[lines[0]!,lines.slice(1).join(' ')]:lines;
    shownLines.forEach((l,k)=>g.append(s('text',{x:cx,y:H-(shownLines.length===2?18:11)+k*12,'text-anchor':'middle',class:'kl-scene__label'},l)));
    svg.append(g);
  });
  host.append(svg);
}

interface Box { x:number; y:number; w:number; h:number; bottom:number; mouth:number }
function vesselBox(kind:string,cx:number,floor:number):Box{
  switch(kind){
    case 'test-tube': return {x:cx-17,y:floor-150,w:34,h:132,bottom:floor-18,mouth:floor-150};
    case 'gas-collection-vessel': return {x:cx-30,y:floor-138,w:60,h:120,bottom:floor-18,mouth:floor-138};
    case 'evaporating-dish': return {x:cx-42,y:floor-58,w:84,h:30,bottom:floor-28,mouth:floor-58};
    case 'electrolysis-cell': return {x:cx-44,y:floor-118,w:88,h:100,bottom:floor-18,mouth:floor-118};
    default: return {x:cx-36,y:floor-118,w:72,h:100,bottom:floor-18,mouth:floor-118};
  }
}

function drawVessel(g:SVGElement,kind:string,cx:number,floor:number,c:ContainerState|undefined,state:LabState,input:SceneInput){
  // vessels stand 22 px above the bench, leaving room for the flame of a heated container
  const b=vesselBox(kind,cx,floor-22);
  // an invisible hit area: the glass is only an outline, so an empty vessel must still take a click
  g.append(s('rect',{x:b.x-10,y:b.mouth-30,width:b.w+20,height:floor-b.mouth+30,class:'kl-scene__hit'}));
  const clipId=`kl-scene-clip-${Math.round(cx)}-${kind}`;
  // the glass outline (and its inside, used as a clip for the contents)
  const glass=kind==='test-tube'
    ?`M${b.x} ${b.y} L${b.x} ${b.bottom-b.w/2} A${b.w/2} ${b.w/2} 0 0 0 ${b.x+b.w} ${b.bottom-b.w/2} L${b.x+b.w} ${b.y}`
    :kind==='evaporating-dish'
      ?`M${b.x} ${b.y} Q${cx} ${b.bottom+26} ${b.x+b.w} ${b.y}`
      :kind==='gas-collection-vessel'
        ?`M${b.x} ${b.bottom} L${b.x} ${b.y+14} Q${b.x} ${b.y} ${b.x+14} ${b.y} L${b.x+b.w-14} ${b.y} Q${b.x+b.w} ${b.y} ${b.x+b.w} ${b.y+14} L${b.x+b.w} ${b.bottom} Z`
        :`M${b.x-4} ${b.y} L${b.x} ${b.y+6} L${b.x} ${b.bottom-8} Q${b.x} ${b.bottom} ${b.x+8} ${b.bottom} L${b.x+b.w-8} ${b.bottom} Q${b.x+b.w} ${b.bottom} ${b.x+b.w} ${b.bottom-8} L${b.x+b.w} ${b.y+6} L${b.x+b.w+4} ${b.y}`;
  const defs=s('defs'); const clip=s('clipPath',{id:clipId}); clip.append(s('path',{d:glass+(kind==='gas-collection-vessel'?'':' Z')})); defs.append(clip); g.append(defs);
  const inside=s('g',{'clip-path':`url(#${clipId})`});
  g.append(inside);
  if(c){
    // what the learner added; a reaction product (source ReactionMatcher:…) is drawn by its observation (precipitate, gas)
    const added=c.contents.filter(e=>!String(e.source).startsWith('ReactionMatcher:'));
    const liquids=added.filter(e=>e.form==='solution'||e.form==='liquid'||e.phase==='aq'||e.phase==='l');
    const solids=added.filter(e=>!liquids.includes(e));
    const obs=state.observations.filter(o=>o.container===c.id);
    // liquid band
    if(liquids.length){
      const level=Math.min(0.72,0.38+0.17*(liquids.length-1));
      const top=b.bottom-(b.bottom-b.y)*level;
      const tint=colorChange(obs)??'#a9d6ff';
      inside.append(s('rect',{x:b.x-6,y:top,width:b.w+12,height:b.bottom-top+40,class:'kl-scene__liquid',fill:tint}));
      inside.append(s('rect',{x:b.x-6,y:top,width:b.w+12,height:3,class:'kl-scene__meniscus'}));
    }
    // solid granules at the bottom (a deterministic pattern, not a measurement)
    solids.forEach((e,k)=>{
      for(let j=0;j<5;j+=1){
        const px=b.x+6+((j*13+k*7)%Math.max(8,b.w-12)), py=b.bottom-5-((j+k)%3)*4;
        inside.append(s('circle',{cx:px,cy:py,r:3.4,class:`kl-scene__solid kl-scene__solid--${k%3}`}));
      }
    });
    // precipitate: only where an observation reports one; colour from the record when it states one
    const precip=obs.find(o=>o.kind==='precipitate'||(o.data as any)?.type==='precipitate');
    if(precip||c.precipitates.length){
      const col=COLOR[String((precip?.data as any)?.color??'')]??NEUTRAL_PRECIPITATE;
      // turbidity over the liquid, then the settled layer with grains (the colour is the record's, else neutral)
      inside.append(s('rect',{x:b.x-6,y:b.y+(b.bottom-b.y)*0.35,width:b.w+12,height:(b.bottom-b.y),class:'kl-scene__turbid',fill:col}));
      inside.append(s('ellipse',{cx,cy:b.bottom-2,rx:b.w/2+2,ry:13,fill:col,class:'kl-scene__precipitate'}));
      for(let j=0;j<9;j+=1) inside.append(s('circle',{cx:b.x+4+((j*9)%Math.max(8,b.w-8)),cy:b.bottom-6-(j%3)*4,r:2.1,fill:col,class:'kl-scene__grain'}));
    }
    // bubbles: only for a gas an authority produced here (not yet collected elsewhere)
    // a gas still in its source (a collected one is marked collected there, and copied with collectedFrom into the collector)
    const produced=c.gases.filter(x=>!x.collected&&!x.collectedFrom);
    if(produced.length&&kind!=='gas-collection-vessel'){
      for(let j=0;j<6;j+=1){
        inside.append(s('circle',{cx:b.x+6+((j*11)%Math.max(8,b.w-12)),cy:b.bottom-10-j*6,r:2.2+(j%3),class:`kl-scene__bubble kl-scene__bubble--${j%3}`}));
      }
    }
    // collected gas: the collecting vessel fills, labelled by the product the record names
    const collected=c.gases.filter(x=>x.collectedFrom);
    if(collected.length){
      inside.append(s('rect',{x:b.x-4,y:b.y-4,width:b.w+8,height:(b.bottom-b.y)*0.62,class:'kl-scene__gas'}));
      g.append(s('text',{x:cx,y:b.y+30,'text-anchor':'middle',class:'kl-scene__gas-label'},[...new Set(collected.map(x=>subscriptFormula(x.product)))].join(', ')));
    }
    // electrolysis deposits at the electrodes
    for(const d of c.deposits) inside.append(s('rect',{x:d.electrode==='cathode'?cx-26:cx+18,y:b.y+30,width:8,height:b.bottom-b.y-40,class:'kl-scene__deposit'}));
    // formula labels of what is inside (at most three, the rest as "+n")
    const formulas=c.contents.map(e=>input.formulaOf(e.substanceId)).filter((f):f is string=>Boolean(f));
    // one line above the vessel: "Mg + H₂SO₄" (at most three, then "+n")
    if(formulas.length){ const shown=formulas.slice(0,3).map(subscriptFormula).join(' + ')+(formulas.length>3?` +${formulas.length-3}`:'');
      g.append(s('text',{x:cx,y:b.mouth-(c.sealed?20:10),'text-anchor':'middle',class:'kl-scene__formula'},shown)); }
    // a temperature rise the record states: a heat haze above the mouth
    if(obs.some(o=>(o.data as any)?.type==='temperature-change'&&(o.data as any)?.direction==='up')){
      // inside the vessel's upper part (the formula line sits above the mouth)
      const hy=b.y+(b.bottom-b.y)*0.42;
      for(let j=0;j<3;j+=1) g.append(s('path',{d:`M${cx-8+j*8} ${hy} q3 -6 0 -12 q-3 -6 0 -12`,class:'kl-scene__haze'}));
    }
    // stopper
    if(c.sealed) g.append(s('rect',{x:b.x-3,y:b.mouth-12,width:b.w+6,height:14,rx:3,class:'kl-scene__stopper'}));
    // electrodes in the cell
    if(kind==='electrolysis-cell'&&state.setUp.includes('electrodes')){
      g.append(s('rect',{x:cx-24,y:b.y-16,width:5,height:b.bottom-b.y,class:'kl-scene__electrode'}),s('rect',{x:cx+19,y:b.y-16,width:5,height:b.bottom-b.y,class:'kl-scene__electrode'}));
      if(state.current.on&&state.current.container===c.id) g.append(s('path',{d:`M${cx-21} ${b.y-16} L${cx-21} ${b.y-30} L${cx+21} ${b.y-30} L${cx+21} ${b.y-16}`,class:'kl-scene__wire is-on'}));
    }
    // flame below a heated container
    if(c.heating){
      const fy=floor+2;
      g.append(s('rect',{x:cx-11,y:fy-9,width:22,height:9,rx:3,class:'kl-scene__lamp'}));
      g.append(s('path',{d:`M${cx} ${fy-34} C${cx+9} ${fy-24} ${cx+7} ${fy-12} ${cx} ${fy-9} C${cx-7} ${fy-12} ${cx-9} ${fy-24} ${cx} ${fy-34} Z`,class:`kl-scene__flame kl-scene__flame--${c.heating}`}));
    }
  }
  g.append(s('path',{d:glass,class:'kl-scene__glass'}));
}

function colorChange(obs:LabState['observations']):string|null{
  const o=obs.find(x=>(x.data as any)?.type==='color-change'); const to=String((o?.data as any)?.to??'');
  return COLOR[to]??null;
}
