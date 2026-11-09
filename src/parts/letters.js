/* ---------- silent letters & letter teams ---------- */
const SND=D.snd||{sil:[],dg:[],ks:[],kd:[]};
let lx={mode:'sil',q:null};
const markW=(w,idx,cls)=>{ const set=new Set(idx); return [...w].map((c,k)=>set.has(k)?`<b class="${cls}">${esc(c)}</b>`:esc(c)).join(''); };
function renderLetters(){
  const m=lx.mode;
  let body='';
  if(m==='sil') body=SND.sil.map((g,k)=>`<details class="panel lrule" ${k===0?'open':''}><summary>${esc(g.t)}<span>${n(g.w.length)} كلمة</span></summary>
    <p class="lx">${esc(g.x)}</p>
    ${g.w.map(r=>`<div class="lwrow"><span class="lw en" lang="en">${markW(r[0],r[1],'sl')}</span><div class="mid"><small>النطق: ${esc(r[3])}</small><small>${esc(r[2])}</small></div>${accBtns(r[0])}</div>`).join('')}
    ${g.ex&&g.ex.length?`<div class="lexn">${esc(g.exn)}</div>${g.ex.map(e=>`<div class="lwrow"><span class="lw en" lang="en">${esc(e[0])}</span><div class="mid"><small>النطق: ${esc(e[2])}</small><small>${esc(e[1])}</small></div><button class="iconbtn" type="button" data-say="${esc(e[0].replace(' ← ',', '))}" aria-label="اسمع">${SPK}</button></div>`).join('')}`:''}</details>`).join('');
  else if(m==='dg') body=SND.dg.map((g,k)=>`<details class="panel lrule" ${k===0?'open':''}><summary><span class="dgp en">${esc(g.p)}</span>${esc(g.s)}<span>${n(g.w.length)} كلمة</span></summary>
    <p class="lx">${esc(g.x)}</p>
    ${g.w.map(r=>`<div class="lwrow"><span class="lw en" lang="en">${markW(r[0],r[1],'dgl')}</span><div class="mid"><small>النطق: ${esc(r[3])}</small><small>${esc(r[2])}</small></div>${accBtns(r[0])}</div>`).join('')}</details>`).join('');
  else return lettersQuiz();
  view.innerHTML=`<div class="head"><h2>الحروف الصامتة والمركبة</h2><p class="sub">${m==='sil'?'الحروف الباهتة اللي عليها خط بتتكتب بس مبتتنطقش. افتح كل قاعدة واسمع الكلمات.':'الحروف الملونة بتتنطق مع بعض صوت واحد. افتح كل مجموعة واسمع الأمثلة.'}</p></div>
  <div class="modes"><button class="fchip" type="button" data-lm="sil" aria-pressed="${m==='sil'}">الحروف الصامتة</button><button class="fchip" type="button" data-lm="dg" aria-pressed="${m==='dg'}">الحروف المركبة</button><button class="fchip" type="button" data-lm="q" aria-pressed="false">اختبر نفسك</button></div>${body}`;
  view.querySelectorAll('[data-lm]').forEach(b=>b.onclick=()=>{lx.mode=b.dataset.lm; lx.q=null; renderLetters(); window.scrollTo(0,0);});
}
function lettersQuiz(){
  if(!lx.q){ const items=[];
    shuffle(SND.sil.flatMap(g=>g.w.filter(r=>r[1].length)).slice()).slice(0,5).forEach(r=>items.push({t:'s',r}));
    shuffle(SND.dg.flatMap(g=>g.w.map(r=>({r,p:r[0].slice(r[1][0],r[1][r[1].length-1]+1)}))).slice()).slice(0,5).forEach(o=>items.push({t:'d',r:o.r,p:o.p}));
    lx.q={items:shuffle(items),k:0,sc:0,sel:new Set(),done:false,opt:null}; }
  const Q=lx.q;
  const modes=`<div class="modes"><button class="fchip" type="button" data-lm="sil" aria-pressed="false">الحروف الصامتة</button><button class="fchip" type="button" data-lm="dg" aria-pressed="false">الحروف المركبة</button><button class="fchip" type="button" data-lm="q" aria-pressed="true">اختبر نفسك</button></div>`;
  if(Q.k>=Q.items.length){
    view.innerHTML=`<div class="head"><h2>اختبر نفسك</h2></div>${modes}<div class="empty"><div class="big">${n(Q.sc)} / ${n(Q.items.length)}</div><h2>${Q.sc>=8?'ممتاز!':'كويس، راجع القواعد وجرب تاني'}</h2><button class="btn primary" id="lqa" type="button">جولة تانية</button></div>`;
    view.querySelector('#lqa').onclick=()=>{lx.q=null;renderLetters();};
    view.querySelectorAll('[data-lm]').forEach(b=>b.onclick=()=>{lx.mode=b.dataset.lm; lx.q=null; renderLetters();}); return;
  }
  const it=Q.items[Q.k], r=it.r, w=r[0];
  let inner='';
  if(it.t==='s'){
    const ok=Q.done&&r[1].length===Q.sel.size&&r[1].every(i=>Q.sel.has(i));
    inner=`<p class="sub">دوس على الحرف أو الحروف اللي مبتتنطقش، وبعدين صحح.</p>
      <div class="ltiles" dir="ltr">${[...w].map((c,k)=>`<button type="button" data-li="${k}" class="${Q.sel.has(k)?'on':''} ${Q.done&&r[1].includes(k)?'right':''} ${Q.done&&Q.sel.has(k)&&!r[1].includes(k)?'wrong':''}" ${Q.done?'disabled':''}>${esc(c)}</button>`).join('')}</div>
      <div class="sub">${esc(r[2])}</div>
      ${Q.done?`<div class="verdict ${ok?'ok':'no'}">${ok?'صح':'الحروف الصامتة هي اللي باللون الأخضر'}</div><div class="en lw">${markW(w,r[1],'sl')}</div><div class="pp">النطق: ${esc(r[3])}</div><button class="btn primary" id="lqn" type="button">اللي بعدها</button>`:`<button class="btn primary" id="lqc" type="button" ${Q.sel.size?'':'disabled'}>صحح</button>`}`;
  } else {
    if(!Q.opt){ const others=shuffle([...new Set(SND.dg.flatMap(g=>g.w.map(x=>x[0].slice(x[1][0],x[1][x[1].length-1]+1))))].filter(p=>p!==it.p)).slice(0,2); Q.opt=shuffle([it.p,...others]); }
    const masked=[...w].map((c,k)=>r[1].includes(k)?'_':c).join('');
    inner=`<p class="sub">اسمع الكلمة واختار الحروف الناقصة.</p><div class="word en" lang="en" dir="ltr">${Q.done?markW(w,r[1],'dgl'):esc(masked)}</div><div class="sub">${esc(r[2])}</div>
      <div class="opts">${Q.opt.map(o=>{let c='opt en'; if(Q.done){ if(o===it.p) c+=' right'; else if(o===Q.pick) c+=' wrong'; } return `<button class="${c}" type="button" data-lo="${esc(o)}" ${Q.done?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
      ${Q.done?`<div class="pp">النطق: ${esc(r[3])}</div><button class="btn primary" id="lqn" type="button">اللي بعدها</button>`:''}`;
  }
  view.innerHTML=`<div class="head"><h2>اختبر نفسك</h2><p class="sub">سؤال ${n(Q.k+1)} من ${n(Q.items.length)}</p></div>${modes}<div class="q"><button class="btn ghost" type="button" data-say="${esc(w)}">${SPK} اسمع</button>${inner}</div>`;
  if(!Q.played){ Q.played=true; setTimeout(()=>say(w),300); }
  view.querySelectorAll('[data-lm]').forEach(b=>b.onclick=()=>{lx.mode=b.dataset.lm; lx.q=null; renderLetters();});
  view.querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{const k=+b.dataset.li; Q.sel.has(k)?Q.sel.delete(k):Q.sel.add(k); lettersQuiz();});
  const c=view.querySelector('#lqc'); if(c) c.onclick=()=>{ Q.done=true; if(r[1].length===Q.sel.size&&r[1].every(i=>Q.sel.has(i))){Q.sc++;addPts(1);} say(w); lettersQuiz(); };
  view.querySelectorAll('[data-lo]').forEach(b=>b.onclick=()=>{ Q.pick=b.dataset.lo; Q.done=true; if(Q.pick===it.p){Q.sc++;addPts(1);} say(w); lettersQuiz(); });
  const nx=view.querySelector('#lqn'); if(nx) nx.onclick=()=>{ Q.k++; Q.sel=new Set(); Q.done=false; Q.opt=null; Q.pick=null; Q.played=false; if(Q.k>=Q.items.length){ st.lq=Math.max(st.lq||0,Q.sc); touchStreak(); save(); } lettersQuiz(); };
}
