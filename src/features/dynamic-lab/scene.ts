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
import {BENCH_IMAGES} from './bench-assets.ts';

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
  /** the bench (lab review stage 2): a reagent dropped on a vessel */
  onDrop?(apparatusId:string):void;
  /** a reagent is in hand: every container is a pour target */
  armed?:boolean;
  /** the vessel the learner is working with */
  focus?:string|null;
  /** the pour just made into this container: the bottle tilts over it and the liquid rises (motion only) */
  pour?:string|null;
  /** larger vessels and a rack (the bench layout) */
  large?:boolean;
  /** the picture of what is being poured (a bottle for a liquid, the sample for a solid) and whether it is a liquid */
  pourImage?:string|null;
  pourLiquid?:boolean;
  /** a gas just collected: the collector travels over its source and back (motion only) */
  collect?:{to:string;from:string}|null;
  /** a picture of a solid sample (a metal) drawn at the bottom of its vessel, or null for the neutral granules */
  sampleImage?(substanceId:string):string|null;
}

const VESSEL_KINDS=new Set(['test-tube','gas-collection-vessel','beaker','receiver','electrolysis-cell','evaporating-dish']);

export function renderLabScene(host:HTMLElement,input:SceneInput){
  const {profile,state}=input;
  const vessels=profile.apparatus.filter(a=>a.isContainer||VESSEL_KINDS.has(a.kind)).filter(a=>VESSEL_KINDS.has(a.kind));
  host.replaceChildren();
  if(!vessels.length) return;
  const large=!!input.large;
  const tubeCount=vessels.filter(a=>a.kind==='test-tube').length;
  // the bench with pictures: up to six test tubes stand in a wooden rack (the rack picture has six holes)
  if(large&&tubeCount>=1&&tubeCount<=6){ renderRackBench(host,input,vessels); return; }
  const slot=large?132:124, H=large?318:262, W=Math.max(slot*vessels.length+24,280);
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,class:'kl-scene__svg','aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'}) as SVGSVGElement;
  svg.append(sceneDefs());
  // the bench
  svg.append(s('rect',{x:0,y:H-34,width:W,height:34,rx:6,class:'kl-scene__bench'}));
  if(input.armed) svg.classList.add('is-armed');
  vessels.forEach((a,i)=>{
    const cx=24+slot*i+slot/2-12;
    const c=state.containers[a.id];
    const setUp=state.setUp.includes(a.id);
    const g=s('g',{class:`kl-scene__vessel kl-scene__vessel--${a.kind}${setUp||large?'':' is-idle'}${input.focus===a.id?' is-focus':''}${input.armed&&a.isContainer?' is-target':''}`,'data-scene-object':`apparatus:${a.id}`});
    if(input.onSelect){ g.addEventListener('click',()=>input.onSelect!(a.id)); g.setAttribute('cursor','pointer'); }
    if(input.onDrop&&a.isContainer){ g.addEventListener('dragover',e=>{ e.preventDefault(); g.classList.add('is-over'); }); g.addEventListener('dragleave',()=>g.classList.remove('is-over')); g.addEventListener('drop',e=>{ e.preventDefault(); g.classList.remove('is-over'); input.onDrop!(a.id); }); }
    drawVessel(g,a.kind,cx,H-34,c,state,input,large);
    if(input.pour===a.id) drawPour(g,cx,H-34-22-(large?190:150),H-52,input);
    // the label under the vessel, wrapped to two lines when long
    const words=input.labelOf(a.id).split(' '); const lines:string[]=[]; for(const w of words){ const last=lines.at(-1); if(last!==undefined&&(last+' '+w).length<=15) lines[lines.length-1]=last+' '+w; else lines.push(w); }
    const shownLines=lines.length>2?[lines[0]!,lines.slice(1).join(' ')]:lines;
    shownLines.forEach((l,k)=>g.append(s('text',{x:cx,y:H-(shownLines.length===2?18:11)+k*12,'text-anchor':'middle',class:'kl-scene__label'},l)));
    svg.append(g);
  });
  // a test-tube rack in front of the tubes (bench layout): a wooden bar the tubes stand through
  if(large){
    const tubes=vessels.map((a,i)=>({a,cx:24+slot*i+slot/2-12})).filter(x=>x.a.kind==='test-tube');
    if(tubes.length){ const x0=tubes[0]!.cx-46, x1=tubes.at(-1)!.cx+46, y=H-34-22-190+34;
      const rack=s('g',{class:'kl-scene__rack','aria-hidden':'true'});
      rack.append(s('rect',{x:x0,y,width:x1-x0,height:13,rx:3,class:'kl-scene__rack-bar'}),s('rect',{x:x0+4,y:y+13,width:7,height:H-34-y-13,class:'kl-scene__rack-leg'}),s('rect',{x:x1-11,y:y+13,width:7,height:H-34-y-13,class:'kl-scene__rack-leg'}));
      svg.append(rack); }
  }
  host.append(svg);
}

function vesselGroup(a:TopicLabProfile['apparatus'][number],input:SceneInput,extraIdle:boolean):SVGElement{
  const g=s('g',{class:`kl-scene__vessel kl-scene__vessel--${a.kind}${extraIdle?' is-idle':''}${input.focus===a.id?' is-focus':''}${input.armed&&a.isContainer?' is-target':''}`,'data-scene-object':`apparatus:${a.id}`});
  if(input.onSelect){ g.addEventListener('click',()=>input.onSelect!(a.id)); g.setAttribute('cursor','pointer'); }
  if(input.onDrop&&a.isContainer){ g.addEventListener('dragover',e=>{ e.preventDefault(); g.classList.add('is-over'); }); g.addEventListener('dragleave',()=>g.classList.remove('is-over')); g.addEventListener('drop',e=>{ e.preventDefault(); g.classList.remove('is-over'); input.onDrop!(a.id); }); }
  return g;
}

/* The rack bench (lab review 2026-11-24, stage 2b): pictures of a wooden rack and glass tubes (assets/lab-bench), with
   the lab state drawn inside the glass exactly as before. Geometry is in the rack picture's own pixels (S scales them):
   hole centres at x = 232 + 215·i, the top bar's front face at y 544–614, the shelf top at y 880, legs to y 1087. */
const RACK={S:0.23,cropY:448,holeX0:232,holeDx:215,holeY:510,frontY:544,frontH:70,shelfY:880,bottomY:1087,aW:1200,bX:1376,bW:160,h:640};
const TUBE={T:0.105,w:326,h:1468,bodyX:34,bodyW:257,rimH:60};
function renderRackBench(host:HTMLElement,input:SceneInput,vessels:TopicLabProfile['apparatus']){
  const {state}=input; const S=RACK.S;
  const tubes=vessels.filter(a=>a.kind==='test-tube'), others=vessels.filter(a=>a.kind!=='test-tube');
  const rackX=24, tubeTop=150, tubeLen=TUBE.h*TUBE.T;
  const shelfTop=tubeTop+tubeLen+2; const rackY=shelfTop-(RACK.shelfY-RACK.cropY)*S;
  const rackBottom=rackY+(RACK.bottomY-RACK.cropY)*S, rackW=(RACK.aW+RACK.bW)*S;
  const otherSlot=96, W=Math.ceil(rackX+rackW+(others.length?28+others.length*otherSlot:0)+20), H=Math.ceil(rackBottom+44);
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,class:'kl-scene__svg kl-scene__svg--rack','aria-hidden':'true',focusable:'false',preserveAspectRatio:'xMidYMid meet'}) as SVGSVGElement;
  svg.append(sceneDefs());
  if(input.armed) svg.classList.add('is-armed');
  // the table
  svg.append(s('rect',{x:0,y:rackBottom-6,width:W,height:H-rackBottom+6,rx:8,class:'kl-scene__bench kl-scene__bench--table'}));
  const img=(href:string,x:number,y:number,w:number,h:number,cls:string)=>s('image',{href,x,y,width:w,height:h,class:cls,preserveAspectRatio:'none'});
  // the rack behind the tubes (the six-hole picture shortened to the tubes it holds: piece A, then its right end)
  const aW=RACK.aW*S, bW=RACK.bW*S, rH=RACK.h*S;
  svg.append(img(BENCH_IMAGES['rack-a'],rackX,rackY,aW,rH,'kl-scene__rack-img'),img(BENCH_IMAGES['rack-b'],rackX+aW,rackY,bW,rH,'kl-scene__rack-img'));
  const tw=TUBE.w*TUBE.T, bodyW=TUBE.bodyW*TUBE.T;
  tubes.forEach((a,i)=>{
    const cx=rackX+(RACK.holeX0+RACK.holeDx*i)*S;
    const c=state.containers[a.id];
    const g=vesselGroup(a,input,false);
    const box:Box={x:cx-bodyW/2,y:tubeTop+TUBE.rimH*TUBE.T*0.6,w:bodyW,h:tubeLen-TUBE.rimH*TUBE.T*0.6-4,bottom:tubeTop+tubeLen-3,mouth:tubeTop};
    drawVessel(g,'test-tube',cx,rackBottom,c,state,input,true,{box,noFlame:true,glassImage:{href:BENCH_IMAGES.tube,x:cx-tw/2,y:tubeTop,w:tw,h:tubeLen}});
    if(input.pour===a.id) drawPour(g,cx,tubeTop,box.bottom,input);
    // a heated tube: the spirit lamp stands under it, its flame at the tube's bottom (below the rack's front face)
    if(c?.heating) drawLamp(g,cx,rackBottom-2,tubeTop+tubeLen-6,c.heating);
    svg.append(g);
  });
  // the rack's front face in front of the tubes: they stand IN the holes; the tube numbers are stamped on it
  const fy=rackY+(RACK.frontY-RACK.cropY)*S, fh=RACK.frontH*S;
  const front=s('g',{class:'kl-scene__rack','aria-hidden':'true'});
  front.append(img(BENCH_IMAGES['rack-a-front'],rackX,fy,aW,fh,'kl-scene__rack-img'),img(BENCH_IMAGES['rack-b-front'],rackX+aW,fy,bW,fh,'kl-scene__rack-img'));
  tubes.forEach((_,i)=>front.append(s('text',{x:rackX+(RACK.holeX0+RACK.holeDx*i)*S,y:fy+fh/2+4,'text-anchor':'middle',class:'kl-scene__rack-number'},String(i+1))));
  svg.append(front);

  // the other vessels stand on the table to the right of the rack, with their name under them
  const tubeCx=(id:string)=>{ const i=tubes.findIndex(x=>x.id===id); return i<0?null:rackX+(RACK.holeX0+RACK.holeDx*i)*S; };
  others.forEach((a,i)=>{
    const cx=rackX+rackW+28+otherSlot*i+otherSlot/2;
    const g=vesselGroup(a,input,false);
    if(a.kind==='gas-collection-vessel'){
      // the school way to collect hydrogen: a test tube held mouth-down in a stand's clamp (the gas rises into it)
      const top=tubeTop+26, h=tubeLen-30, box:Box={x:cx-bodyW/2,y:top,w:bodyW,h,bottom:top+h,mouth:top};
      drawStand(g,cx,top,box.bottom,rackBottom);
      const mover=s('g',{class:'kl-scene__collector'});
      drawVessel(mover,a.kind,cx,rackBottom,state.containers[a.id],state,input,true,{box,glassImage:{href:BENCH_IMAGES.tube,x:cx-tw/2,y:top-4,w:tw,h:h+8,flip:true}});
      const from=input.collect?.to===a.id?tubeCx(input.collect.from):null;
      if(from!==null){ mover.classList.add('is-collecting'); (mover as SVGElement).style.setProperty('--kl-dx',`${from-cx}px`); (mover as SVGElement).style.setProperty('--kl-dy',`${tubeTop-6-box.bottom}px`); }
      g.append(mover);
    }
    else drawVessel(g,a.kind,cx,rackBottom+16,state.containers[a.id],state,input,false);
    if(input.pour===a.id) drawPour(g,cx,rackBottom+16-22-138,rackBottom-10,input);
    const words=input.labelOf(a.id).split(' '); const l1=words.slice(0,Math.ceil(words.length/2)).join(' '), l2=words.slice(Math.ceil(words.length/2)).join(' ');
    [l1,l2].filter(Boolean).forEach((l,k)=>g.append(s('text',{x:cx,y:rackBottom+22+k*12,'text-anchor':'middle',class:'kl-scene__label'},l)));
    svg.append(g);
  });
  host.append(svg);
}

/** shared gradients: the flame (outer, core, glow) and the spirit lamp's glass and alcohol */
function sceneDefs():SVGElement{
  const d=s('defs');
  const lin=(id:string,stops:Array<[string,string,number?]>,x2=0,y2=1)=>{ const g=s('linearGradient',{id,x1:0,y1:0,x2,y2}); for(const [o,c,a] of stops) g.append(s('stop',{offset:o,'stop-color':c,'stop-opacity':a??1})); d.append(g); };
  const rad=(id:string,stops:Array<[string,string,number?]>)=>{ const g=s('radialGradient',{id,cx:'50%',cy:'60%',r:'50%'}); for(const [o,c,a] of stops) g.append(s('stop',{offset:o,'stop-color':c,'stop-opacity':a??1})); d.append(g); };
  lin('kl-flame-outer',[['0','#fff6c2',0.15],['0.35','#ffd34d'],['0.75','#ff9a1f'],['1','#ff6a00',0.9]]);
  lin('kl-flame-core',[['0','#bfe3ff',0.2],['0.6','#5aa9ff',0.85],['1','#2b6fd6']]);
  rad('kl-flame-glow',[['0','#ffcc55',0.55],['0.6','#ffb12b',0.18],['1','#ffb12b',0]]);
  lin('kl-lamp-glass',[['0','#f4f8fc',0.95],['0.5','#dbe6f1',0.9],['1','#c3d1df',0.95]],1,0);
  lin('kl-lamp-alcohol',[['0','#e9f2ff',0.7],['1','#bcd6f2',0.85]]);
  return d;
}

/** a spirit lamp (glass body with alcohol, metal collar, wick) with a layered flame whose tip reaches tipY */
function drawLamp(g:SVGElement,cx:number,baseY:number,tipY:number,level:string){
  const total=Math.max(30,baseY-tipY), bodyH=Math.min(20,total*0.38), bodyW=bodyH*1.55;
  const top=baseY-bodyH, collarY=top-4, wickTop=collarY-4, flameH=Math.max(14,wickTop-tipY), fw=flameH*0.34;
  const lamp=s('g',{class:'kl-scene__lamp-group'});
  // the glow behind the flame
  lamp.append(s('ellipse',{cx,cy:wickTop-flameH*0.45,rx:fw*2.2,ry:flameH*0.75,fill:'url(#kl-flame-glow)',class:'kl-scene__flame-glow'}));
  // glass body and the alcohol in it
  lamp.append(s('path',{d:`M${cx-bodyW*0.28} ${top} C${cx-bodyW*0.62} ${top+2} ${cx-bodyW/2} ${baseY-1} ${cx-bodyW*0.42} ${baseY} L${cx+bodyW*0.42} ${baseY} C${cx+bodyW/2} ${baseY-1} ${cx+bodyW*0.62} ${top+2} ${cx+bodyW*0.28} ${top} Z`,fill:'url(#kl-lamp-glass)',stroke:'#8aa0b8','stroke-width':1.2,class:'kl-scene__lamp'}));
  lamp.append(s('path',{d:`M${cx-bodyW*0.46} ${top+bodyH*0.45} L${cx+bodyW*0.46} ${top+bodyH*0.45} C${cx+bodyW*0.5} ${baseY-2} ${cx+bodyW*0.44} ${baseY-1} ${cx+bodyW*0.4} ${baseY-1} L${cx-bodyW*0.4} ${baseY-1} C${cx-bodyW*0.44} ${baseY-1} ${cx-bodyW*0.5} ${baseY-2} ${cx-bodyW*0.46} ${top+bodyH*0.45} Z`,fill:'url(#kl-lamp-alcohol)'}));
  lamp.append(s('path',{d:`M${cx-bodyW*0.2} ${top+3} L${cx-bodyW*0.16} ${baseY-3}`,stroke:'#ffffff',opacity:0.7,'stroke-width':1.5,'stroke-linecap':'round'}));
  // metal collar and the wick
  lamp.append(s('rect',{x:cx-bodyW*0.22,y:collarY,width:bodyW*0.44,height:5,rx:1.5,fill:'#9aa5b1',stroke:'#6b7784','stroke-width':0.8}));
  lamp.append(s('rect',{x:cx-1.4,y:wickTop,width:2.8,height:5,fill:'#5b4a3a'}));
  // the flame: an orange-yellow outer body, a blue core at its base
  const f=s('g',{class:'kl-scene__flame-group'});
  f.append(s('path',{d:`M${cx} ${wickTop-flameH} C${cx+fw*0.9} ${wickTop-flameH*0.62} ${cx+fw*1.15} ${wickTop-flameH*0.22} ${cx+fw*0.55} ${wickTop+1} C${cx+fw*0.2} ${wickTop+2.5} ${cx-fw*0.2} ${wickTop+2.5} ${cx-fw*0.55} ${wickTop+1} C${cx-fw*1.15} ${wickTop-flameH*0.22} ${cx-fw*0.9} ${wickTop-flameH*0.62} ${cx} ${wickTop-flameH} Z`,fill:'url(#kl-flame-outer)',class:`kl-scene__flame kl-scene__flame--${level}`}));
  f.append(s('path',{d:`M${cx} ${wickTop-flameH*0.42} C${cx+fw*0.42} ${wickTop-flameH*0.25} ${cx+fw*0.48} ${wickTop-2} ${cx} ${wickTop+0.5} C${cx-fw*0.48} ${wickTop-2} ${cx-fw*0.42} ${wickTop-flameH*0.25} ${cx} ${wickTop-flameH*0.42} Z`,fill:'url(#kl-flame-core)',class:'kl-scene__flame-core'}));
  lamp.append(f);
  g.append(lamp);
}

/** a lab stand: base on the table, a rod, and a clamp arm holding the tube near its top */
function drawStand(g:SVGElement,cx:number,top:number,bottom:number,table:number){
  const rx=cx+26;
  g.append(s('rect',{x:cx-14,y:table-9,width:56,height:8,rx:2,class:'kl-scene__stand-base'}),
    s('rect',{x:rx-2.5,y:top-34,width:5,height:table-9-(top-34),rx:2,class:'kl-scene__stand-rod'}),
    s('rect',{x:cx-2,y:top+18,width:rx-cx+4,height:5,rx:2,class:'kl-scene__stand-arm'}),
    s('rect',{x:cx-17,y:top+13,width:34,height:15,rx:5,class:'kl-scene__stand-clamp'}));
}

interface Box { x:number; y:number; w:number; h:number; bottom:number; mouth:number }
function vesselBox(kind:string,cx:number,floor:number,large=false):Box{
  switch(kind){
    case 'test-tube': return large?{x:cx-21,y:floor-190,w:42,h:172,bottom:floor-18,mouth:floor-190}:{x:cx-17,y:floor-150,w:34,h:132,bottom:floor-18,mouth:floor-150};
    case 'gas-collection-vessel': return {x:cx-30,y:floor-138,w:60,h:120,bottom:floor-18,mouth:floor-138};
    case 'evaporating-dish': return {x:cx-42,y:floor-58,w:84,h:30,bottom:floor-28,mouth:floor-58};
    case 'electrolysis-cell': return {x:cx-44,y:floor-118,w:88,h:100,bottom:floor-18,mouth:floor-118};
    default: return {x:cx-36,y:floor-118,w:72,h:100,bottom:floor-18,mouth:floor-118};
  }
}

function drawVessel(g:SVGElement,kind:string,cx:number,floor:number,c:ContainerState|undefined,state:LabState,input:SceneInput,large=false,opts?:{box?:Box;noFlame?:boolean;glassImage?:{href:string;x:number;y:number;w:number;h:number;flip?:boolean}}){
  // vessels stand 22 px above the bench, leaving room for the flame of a heated container
  const b=opts?.box??vesselBox(kind,cx,floor-22,large);
  // an invisible hit area: the glass is only an outline, so an empty vessel must still take a click
  g.append(s('rect',{x:b.x-10,y:b.mouth-30,width:b.w+20,height:floor-b.mouth+30,class:'kl-scene__hit'}));
  const clipId=`kl-scene-clip-${Math.round(cx)}-${kind}`;
  // the glass outline (and its inside, used as a clip for the contents)
  const glass=kind==='test-tube'
    ?`M${b.x} ${b.y} L${b.x} ${b.bottom-b.w/2} A${b.w/2} ${b.w/2} 0 0 0 ${b.x+b.w} ${b.bottom-b.w/2} L${b.x+b.w} ${b.y}`
    :kind==='evaporating-dish'
      ?`M${b.x} ${b.y} Q${cx} ${b.bottom+26} ${b.x+b.w} ${b.y}`
      :kind==='gas-collection-vessel'
        ?`M${b.x} ${b.bottom} L${b.x} ${b.y+Math.min(14,b.w/2)} Q${b.x} ${b.y} ${b.x+Math.min(14,b.w/2)} ${b.y} L${b.x+b.w-Math.min(14,b.w/2)} ${b.y} Q${b.x+b.w} ${b.y} ${b.x+b.w} ${b.y+Math.min(14,b.w/2)} L${b.x+b.w} ${b.bottom} Z`
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
      inside.append(s('rect',{x:b.x-6,y:top,width:b.w+12,height:b.bottom-top+40,class:`kl-scene__liquid${input.pour===c.id?' is-filling':''}`,fill:tint}));
      inside.append(s('rect',{x:b.x-6,y:top,width:b.w+12,height:3,class:'kl-scene__meniscus'}));
    }
    // solid granules at the bottom (a deterministic pattern, not a measurement)
    solids.forEach((e,k)=>{
      // a metal with its own picture lies at the bottom as that picture (Mg ribbon, Zn granules, …)
      const href=input.sampleImage?.(e.substanceId)??null;
      if(href){ inside.append(s('image',{href,x:b.x-3,y:b.bottom-15-k*6,width:b.w+6,height:16,preserveAspectRatio:'xMidYMax meet',class:'kl-scene__solid kl-scene__solid--img'})); return; }
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
      // the bench draws a livelier stream (more bubbles from the metal at the bottom); a pattern, not a rate
      const n=large?14:6;
      for(let j=0;j<n;j+=1){
        inside.append(s('circle',{cx:b.x+6+((j*11)%Math.max(8,b.w-12)),cy:b.bottom-10-(j%7)*6,r:large?1.8+(j%3)*1.1:2.2+(j%3),class:`kl-scene__bubble kl-scene__bubble--${j%3}${large?` kl-scene__bubble--d${j%5}`:''}`}));
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
    if(c.heating&&!opts?.noFlame) drawLamp(g,cx,floor+2,b.bottom-2,c.heating);
  }
  // the glass: a picture of a tube over its contents (the outline stays, invisible, for the hover / target ring), or the line drawing
  if(opts?.glassImage){ const gi=opts.glassImage; g.append(s('image',{href:gi.href,x:gi.x,y:gi.y,width:gi.w,height:gi.h,preserveAspectRatio:'none',class:'kl-scene__glass-img',...(gi.flip?{transform:`matrix(1 0 0 -1 0 ${2*gi.y+gi.h})`}:{})}),s('path',{d:glass,class:'kl-scene__glass kl-scene__glass--img'})); }
  else g.append(s('path',{d:glass,class:'kl-scene__glass'}));
}

function colorChange(obs:LabState['observations']):string|null{
  // the latest indicator colour (an indicator-response observation) tints the liquid; else a record's colour change
  const ind=[...obs].reverse().find(x=>(x.data as any)?.type==='indicator-response'); if(ind&&COLOR[String((ind.data as any).color)]) return COLOR[String((ind.data as any).color)]!;
  const o=obs.find(x=>(x.data as any)?.type==='color-change'); const to=String((o?.data as any)?.to??'');
  return COLOR[to]??null;
}

/** the pour (motion only; reduced motion shows nothing): a liquid's bottle comes over the mouth, tilts and pours a
 *  stream while the liquid rises; a solid sample (its picture) drops in. The picture is the shelf's own. */
function drawPour(g:SVGElement,cx:number,mouthY:number,bottomY:number,input:SceneInput){
  const href=input.pourImage??null;
  const p=s('g',{class:`kl-scene__pour kl-scene__pour--${input.pourLiquid?'liquid':'solid'}`,'aria-hidden':'true'});
  if(input.pourLiquid){
    const move=s('g',{class:'kl-scene__pour-move'});
    // the bottle's neck at the mouth, its body up and to the right (rotated about the neck)
    const nx=cx+4, ny=mouthY-10, w=26, h=60;
    const tilt=s('g',{transform:`translate(${nx} ${ny}) rotate(-128)`,class:'kl-scene__pour-tilt'});
    tilt.append(href?s('image',{href,x:-w/2,y:-2,width:w,height:h,preserveAspectRatio:'xMidYMid meet'}):s('rect',{x:-w/2,y:0,width:w,height:h,rx:6,class:'kl-scene__bottle'}));
    move.append(tilt);
    p.append(move,s('path',{d:`M${nx} ${ny} C${cx+2} ${mouthY+8} ${cx} ${mouthY+30} ${cx} ${bottomY-18}`,class:'kl-scene__stream'}));
  } else {
    const size=22;
    p.append(href?s('image',{href,x:cx-size/2,y:mouthY-size-6,width:size,height:size,class:'kl-scene__drop',preserveAspectRatio:'xMidYMid meet'}):s('circle',{cx,cy:mouthY-12,r:5,class:'kl-scene__drop'}));
    (p as SVGElement).style.setProperty('--kl-drop',`${bottomY-mouthY-6}px`);
  }
  g.append(p);
}
