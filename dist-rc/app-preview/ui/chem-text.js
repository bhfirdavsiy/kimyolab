// Chemical formulas inside running text, typeset as formulas: digits as subscripts and their own font class, so that a
// capital I is never read as a small l (NaI, KI in a sans-serif face look like "Nal", "Kl"). Display only: the text is
// unchanged (copying it gives the same letters), nothing here decides what a formula means.
import {ELEMENT_SYMBOLS} from '../domain/chemistry/periodic-table.js';

const SYMBOLS=new Set(ELEMENT_SYMBOLS);
const SUB='₀₁₂₃₄₅₆₇₈₉';
const CANDIDATE=/(?<![\p{L}\p{M}‘’ʻʼ'])[A-Z(][A-Za-z0-9₀-₉()]*(?![\p{L}\p{M}‘’ʻʼ'])/gu;

/** the element symbols a token is made of, or null when it is not a formula (backtracking: "Co" vs "C" + "O") */
function symbolsOf(core       )              {
  const go=(i       )              =>{
    if(i===core.length) return [];
    for(const len of [2,1]){ const s=core.slice(i,i+len); if(s.length===len&&SYMBOLS.has(s)){ const rest=go(i+len); if(rest) return [s,...rest]; } }
    return null;
  };
  return go(0);
}
/** true when a token reads as a chemical formula: element symbols, digits and balanced brackets, with at least two
 *  symbols or an index (a single symbol is left alone: it is also an ordinary capitalised word); roman numerals are not */
export function isFormulaToken(token       )        {
  if(/^[IVX]+$/.test(token)) return false;
  let depth=0; for(const ch of token){ if(ch==='(') depth++; else if(ch===')'){ if(--depth<0) return false; } }
  if(depth!==0) return false;
  const core=token.replace(/[0-9₀-₉()]/g,'');
  if(!core||!/^[A-Z]/.test(core)) return false;
  const syms=symbolsOf(core);
  return !!syms&&(syms.length>=2||/[0-9₀-₉]/.test(token));
}
/** H2SO4 → H₂SO₄ (an index follows a symbol or a closing bracket; a leading coefficient is not touched) */
export function subscriptIndices(token       )       {
  return token.replace(/([A-Za-z)])(\d+)/g,(_,a       ,d       )=>a+[...d].map(x=>SUB[Number(x)]).join(''));
}
/** the text with every formula token wrapped in <span class="kl-formula"> */
export function chemFragment(text       )                 {
  const frag=document.createDocumentFragment();
  let last=0;
  for(const m of text.matchAll(CANDIDATE)){
    const token=m[0]; const at=m.index??0;
    if(!isFormulaToken(token)) continue;
    if(at>last) frag.append(document.createTextNode(text.slice(last,at)));
    const span=document.createElement('span'); span.className='kl-formula'; span.textContent=subscriptIndices(token); frag.append(span);
    last=at+token.length;
  }
  if(last<text.length) frag.append(document.createTextNode(text.slice(last)));
  return frag;
}
/** replace a node's text with the typeset text */
export function setChemText(node        ,text       )     { node.replaceChildren(chemFragment(text)); }
