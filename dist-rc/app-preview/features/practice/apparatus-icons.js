// The classic experiment page's picture: the apparatus the instruction itself lists (legacyContent.equipment), as
// icons. It replaces the old generic beaker whose flame and bubbles were switched on by keywords in the step text.
// Nothing here is chemistry: an item is matched to an icon by its own Uzbek word, its label is that item's text, and an
// item with no icon is still shown, as text. Decoration (aria-hidden): the equipment list is also printed as text.

const NS='http://www.w3.org/2000/svg';
                                                        
const glass={fill:'#eaf4ff',stroke:'#5d7895','stroke-width':2.2,'stroke-linejoin':'round'};
const metal={fill:'#c7d0da',stroke:'#5d7895','stroke-width':2};
const ICONS                     ={
  'test-tube':[['path',{d:'M19 6h10v30a5 5 0 0 1-10 0z',...glass}],['path',{d:'M19.6 26h8.8v10a4.4 4.4 0 0 1-8.8 0z',fill:'#9ccaf5'}]],
  'flask':[['path',{d:'M20 6h8v12l10 20a3 3 0 0 1-3 4H13a3 3 0 0 1-3-4l10-20z',...glass}],['path',{d:'M14.5 30h19l3 6.5a2 2 0 0 1-2 3H13.5a2 2 0 0 1-2-3z',fill:'#9ccaf5'}]],
  'beaker':[['path',{d:'M10 8h28l-2 4v26a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V12z',...glass}],['rect',{x:12.5,y:26,width:23,height:12.5,rx:2,fill:'#9ccaf5'}]],
  'funnel':[['path',{d:'M8 8h32L27 24v16h-6V24z',...glass}]],
  'dropper':[['rect',{x:20,y:4,width:8,height:10,rx:3,fill:'#e06a5a'}],['path',{d:'M21 14h6v18l-3 8-3-8z',...glass}]],
  'spirit-lamp':[['path',{d:'M24 6c4 5 4 9 0 12-4-3-4-7 0-12z',fill:'#ffb12b',stroke:'#ff7a00','stroke-width':1.2}],['rect',{x:22.5,y:18,width:3,height:6,fill:'#7a5c3e'}],['path',{d:'M12 26h24l2 14H10z',...glass}]],
  'burner':[['path',{d:'M24 4c4 5 4 9 0 12-4-3-4-7 0-12z',fill:'#5aa9ff',stroke:'#2d74d0','stroke-width':1.2}],['rect',{x:20,y:16,width:8,height:18,...metal}],['rect',{x:12,y:34,width:24,height:6,rx:2,...metal}]],
  'stand':[['rect',{x:10,y:40,width:28,height:4,rx:1,...metal}],['rect',{x:15,y:6,width:3,height:34,...metal}],['path',{d:'M18 14h14',stroke:'#5d7895','stroke-width':2.5}],['circle',{cx:33,cy:14,r:4,fill:'none',stroke:'#5d7895','stroke-width':2}]],
  'dish':[['path',{d:'M6 22h36c-2 10-9 15-18 15S8 32 6 22z',...glass}]],
  'crucible':[['path',{d:'M13 12h22l-3 26H16z',fill:'#f1ece4',stroke:'#5d7895','stroke-width':2.2}]],
  'hot-plate':[['rect',{x:8,y:22,width:32,height:16,rx:3,...metal}],['rect',{x:11,y:18,width:26,height:5,rx:2,fill:'#e06a5a'}]],
  'filter-paper':[['path',{d:'M8 10h32L24 38z',fill:'#fbfbf6',stroke:'#5d7895','stroke-width':2}]],
  'rod':[['rect',{x:22,y:4,width:4,height:40,rx:2,...glass}]],
  'thermometer':[['rect',{x:21,y:4,width:6,height:30,rx:3,...glass}],['circle',{cx:24,cy:38,r:6,fill:'#e06a5a',stroke:'#5d7895','stroke-width':2}]],
  'cylinder':[['path',{d:'M16 6h16v34h4v3H12v-3h4z',...glass}],['rect',{x:18,y:24,width:12,height:15,fill:'#9ccaf5'}]],
  'tube':[['path',{d:'M8 30h14V12h18',fill:'none',stroke:'#5d7895','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'}]],
  'spoon':[['ellipse',{cx:15,cy:15,rx:7,ry:5,...metal}],['path',{d:'M20 18l18 20',stroke:'#5d7895','stroke-width':3,'stroke-linecap':'round'}]],
  'goggles':[['rect',{x:6,y:18,width:16,height:12,rx:6,...glass}],['rect',{x:26,y:18,width:16,height:12,rx:6,...glass}],['path',{d:'M22 24h4',stroke:'#5d7895','stroke-width':2}]],
  'electrodes':[['rect',{x:14,y:6,width:5,height:32,...metal}],['rect',{x:29,y:6,width:5,height:32,...metal}],['path',{d:'M16 6V3h16v3',fill:'none',stroke:'#e0a100','stroke-width':2}]],
  'power':[['rect',{x:8,y:14,width:32,height:22,rx:3,...metal}],['path',{d:'M14 20v6M11 23h6M31 23h6',stroke:'#1d3a5c','stroke-width':2}]],
  'scale':[['rect',{x:8,y:32,width:32,height:8,rx:2,...metal}],['rect',{x:12,y:26,width:24,height:6,rx:2,...glass}]],
  'bottle':[['rect',{x:20,y:4,width:8,height:7,rx:1.5,fill:'#7a8899'}],['path',{d:'M19 11h10v5l5 6v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V22l5-6z',...glass}],['rect',{x:16,y:24,width:16,height:10,rx:1.5,fill:'#ffffff',stroke:'#9fb2c7','stroke-width':1}]],
  'jar':[['path',{d:'M14 6h20v6l2 4v22a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V16l2-4z',...glass}]],
};
/** Uzbek apparatus words → icon (the word is matched inside the item's own text) */
const MATCH                       =[
  [/probirka/i,'test-tube'],[/kolba/i,'flask'],[/stakan|elektrolizyor|vanna/i,'beaker'],[/voronka/i,'funnel'],[/pipetka|tomizg/i,'dropper'],
  [/spirt\s*lampa/i,'spirit-lamp'],[/gorelka/i,'burner'],[/shtativ/i,'stand'],[/kosacha|chinni\s+idish/i,'dish'],[/tigel/i,'crucible'],
  [/isitgich|plitka/i,'hot-plate'],[/filtr/i,'filter-paper'],[/tayoqcha/i,'rod'],[/termometr/i,'thermometer'],[/silindr|menzurka/i,'cylinder'],
  [/nay|trubka/i,'tube'],[/qoshiq|shpatel/i,'spoon'],[/ko.zoynak|ekran/i,'goggles'],[/elektrod/i,'electrodes'],[/tok\s+manba|batareya|akkumulyator/i,'power'],
  [/tarozi/i,'scale'],[/banka|idish|apparat/i,'jar'],
];

/** the equipment sentence → its items (split at commas, semicolons and the word va; first letter capitalised) */
export function equipmentItems(text       )         {
  return text.replace(/\.$/,'').split(/,|;|\s+va\s+/).map(x=>x.trim()).filter(Boolean)
    .map(x=>x.charAt(0).toLocaleUpperCase('uz')+x.slice(1)).filter((x,i,a)=>a.indexOf(x)===i).slice(0,14);
}
export function iconFor(item       )            { for(const [re,k] of MATCH) if(re.test(item)) return k; return null; }

/** apparatus named in the instruction's steps (fallback when no equipment list exists): icon keys in order of first use */
const STEP_KEYS=['test-tube','flask','beaker','funnel','dropper','spirit-lamp','burner','stand','dish','crucible','hot-plate','filter-paper','rod','thermometer','cylinder','tube','spoon','electrodes','power','scale'];
export function apparatusFromSteps(steps                  )         {
  const text=steps.join(' ');
  const found                       =[];
  for(const [re,k] of MATCH){ if(!STEP_KEYS.includes(k)||found.some(f=>f[1]===k)) continue; const m=new RegExp(re.source,'i').exec(text); if(m) found.push([m.index,k]); }
  return found.sort((a,b)=>a[0]-b[0]).map(f=>f[1]).slice(0,10);
}

                                                              
export function equipmentGalleryItems(text       )              { return equipmentItems(text).map(label=>({label,key:iconFor(label)})); }
export function materialGalleryItems(text       )              { return equipmentItems(text).slice(0,10).map(label=>({label,key:'bottle'})); }

export function apparatusGallery(items                       ,heading        )            {
  const block=document.createElement('div'); block.className='kl-apparatus-block';
  if(heading){ const h=document.createElement('p'); h.className='kl-apparatus-heading'; h.textContent=heading; block.append(h); }
  const wrap=document.createElement('div');
  wrap.className='kl-apparatus-gallery';
  for(const item of items){
    const fig=document.createElement('figure'); fig.className='kl-apparatus';
    if(item.key&&ICONS[item.key]){ const svg=document.createElementNS(NS,'svg'); svg.setAttribute('viewBox','0 0 48 48'); svg.setAttribute('focusable','false'); for(const [tag,attrs] of ICONS[item.key] ){ const n=document.createElementNS(NS,tag); for(const [k,v] of Object.entries(attrs)) n.setAttribute(k,String(v)); svg.append(n); } fig.append(svg); fig.dataset.apparatus=item.key; }
    else fig.classList.add('is-text-only');
    // digits after an element symbol or a bracket are formula indices: NH4Cl → NH₄Cl
    const cap=document.createElement('figcaption'); cap.textContent=item.label.replace(/([A-Z][a-z]?|\))(\d+)/g,(_,a       ,d       )=>a+[...d].map(x=>'₀₁₂₃₄₅₆₇₈₉'[Number(x)]).join('')); fig.append(cap);
    wrap.append(fig);
  }
  block.append(wrap);
  return block;
}
