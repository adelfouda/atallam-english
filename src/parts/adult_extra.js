/* ---------- hard sounds for Arabic speakers ---------- */
const MP=D.mp||[]; let mpo={g:null,q:null};
if(!st.mp) st.mp={};
function renderPairs(){
  if(mpo.g==null){
    view.innerHTML=`<div class="head"><h2>الأصوات الصعبة على العرب</h2><p class="sub">أصوات بنلخبط بينها لإن مفيش زيها في العربي. اسمع الكلمتين، واعرف الفرق في البُق واللسان، وبعدين اختبر ودنك.</p></div>
    <div class="panel">${MP.map((g,k)=>`<button class="lrow" type="button" data-g="${k}"><span class="num en">${esc(g.a)}</span><span class="tt">${esc(g.t)}</span>${st.mp[k]!=null?`<span class="sc ${st.mp[k]>=9?'full':''}">${n(st.mp[k])} من ١٠</span>`:''}</button>`).join('')}</div>`;
    view.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{mpo={g:+b.dataset.g,q:null};renderPairs();window.scrollTo(0,0);}); return;
  }
  const g=MP[mpo.g];
  if(mpo.q) return pairsQuiz(g);
  view.innerHTML=`<div class="head"><h2>${esc(g.t)}</h2></div><div class="tipbox">👄 ${esc(g.tip)}</div>
  <div class="panel">${g.w.map(w=>`<div class="prow"><button class="pw1" type="button" data-say="${esc(w[0])}"><span class="en">${esc(w[0])}</span><small>${esc(w[2])} · ${esc(w[1])}</small></button><span class="vs">≠</span><button class="pw1" type="button" data-say="${esc(w[3])}"><span class="en">${esc(w[3])}</span><small>${esc(w[5])} · ${esc(w[4])}</small></button></div>`).join('')}</div>
  <button class="btn primary" id="mpq" type="button">اختبر ودنك</button>`;
  view.querySelector('#mpq').onclick=()=>{ mpo.q={k:0,sc:0,items:Array.from({length:10},()=>{const w=g.w[Math.floor(Math.random()*g.w.length)]; return {w,side:Math.random()<.5?0:1};}),ans:null}; renderPairs(); };
}
function pairsQuiz(g){
  const Q=mpo.q;
  if(Q.k>=Q.items.length){ st.mp[mpo.g]=Math.max(st.mp[mpo.g]||0,Q.sc); touchStreak(); save();
    view.innerHTML=`<div class="empty"><div class="big">${n(Q.sc)} / ${n(Q.items.length)}</div><h2>${Q.sc>=9?'ودنك ممتازة':Q.sc>=7?'كويس جدًا':'محتاج تسمع أكتر'}</h2><p class="sub">${esc(g.tip)}</p><div class="actions"><button class="btn primary" id="mpa" type="button">تاني</button><button class="btn ghost" id="mpb" type="button">الكلمات</button></div></div>`;
    view.querySelector('#mpa').onclick=()=>{mpo.q=null;view.querySelector('#mpa');renderPairs();document.getElementById('mpq')&&document.getElementById('mpq').click();};
    view.querySelector('#mpb').onclick=()=>{mpo.q=null;renderPairs();}; return; }
  const it=Q.items[Q.k], target=it.side?it.w[3]:it.w[0], a=Q.ans;
  const opt=[[it.w[0],it.w[2],it.w[1]],[it.w[3],it.w[5],it.w[4]]];
  view.innerHTML=`<div class="head"><h2>${esc(g.t)}</h2><p class="sub">سؤال ${n(Q.k+1)} من ${n(Q.items.length)}</p></div>
  <div class="q"><p class="sub">اسمع واختار الكلمة اللي اتقالت</p><div class="actions"><button class="btn primary" type="button" data-say="${esc(target)}">${SPK} اسمع</button><button class="btn ghost" type="button" id="mpslow">ببطء</button></div>
    <div class="opts">${opt.map((o,k)=>{let c='opt'; if(a!=null){ if(k===it.side) c+=' right'; else if(k===a) c+=' wrong'; } return `<button class="${c}" type="button" data-o="${k}" ${a!=null?'disabled':''}><span class="en">${esc(o[0])}</span> <small>${esc(o[1])} · ${esc(o[2])}</small></button>`}).join('')}</div>
    ${a!=null?`<div class="verdict ${a===it.side?'ok':'no'}">${a===it.side?'صح':'اللي اتقالت '+esc(target)}</div><div class="actions"><button class="btn ghost" type="button" data-say="${esc(it.w[0])}">${esc(it.w[0])}</button><button class="btn ghost" type="button" data-say="${esc(it.w[3])}">${esc(it.w[3])}</button></div><button class="btn primary" id="mpn" type="button">اللي بعدها</button>`:''}</div>`;
  if(Q.played!==Q.k){ Q.played=Q.k; setTimeout(()=>say(target),300); }
  view.querySelector('#mpslow').onclick=()=>{const s=st.slow; st.slow=true; say(target); st.slow=s;};
  view.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ Q.ans=+b.dataset.o; if(Q.ans===it.side){Q.sc++;addPts(1);} pairsQuiz(g); });
  const nb=view.querySelector('#mpn'); if(nb) nb.onclick=()=>{Q.k++;Q.ans=null;pairsQuiz(g);};
}

/* ---------- say it in English (reverse translation) ---------- */
const PHI=(D.phr&&D.phr.items)||[]; let rtv=null;
if(!st.rt2) st.rt2={};
function rtSession(){
  const t=today(), due=[], fresh=[];
  PHI.forEach((x,i)=>{ const r=st.rt2[i]; if(r){ if(r[1]<=t) due.push(i); } else fresh.push(i); });
  const short=fresh.filter(i=>PHI[i].en.split(' ').length<=9);
  return shuffle(due).slice(0,6).concat(short.slice(0,10)).slice(0,10);
}
function renderRT(){
  if(!rtv) rtv={items:rtSession(),k:0,txt:'',chk:null,busy:false,good:0};
  const R=rtv;
  if(!R.items.length){ view.innerHTML=`<div class="empty"><div class="big">🏁</div><h2>خلصت كل الجمل</h2><p class="sub">ارجع بكرة عشان تراجع اللي ميعادها جه.</p></div>`; return; }
  if(R.k>=R.items.length){ touchStreak(); save();
    view.innerHTML=`<div class="empty"><div class="big">${n(R.good)} / ${n(R.items.length)}</div><h2>${R.good>=8?'إنت بتتكلم من دماغك!':'كل يوم هتبقى أسرع'}</h2><p class="sub">الجمل اللي غلطت فيها هترجعلك بكرة، واللي صح هترجعلك بعد أيام.</p><button class="btn primary" id="rta" type="button">جولة تانية</button></div>`;
    view.querySelector('#rta').onclick=()=>{rtv=null;renderRT();}; return; }
  const i=R.items[R.k], x=PHI[i], c=R.chk;
  view.innerHTML=`<div class="head"><h2>قولها بالإنجليزي</h2><p class="sub">اقرا الجملة بالعربي، وحاول تقولها أو تكتبها بالإنجليزي من دماغك قبل ما تشوف الإجابة. ${n(R.k+1)} من ${n(R.items.length)}</p></div>
  <div class="q"><div class="prompt" style="font-size:1.3rem">${esc(x.m)}</div>
    <textarea class="wbox" id="rtin" lang="en" dir="ltr" rows="2" placeholder="Type in English..." ${c?'disabled':''}>${esc(R.txt)}</textarea>
    ${c?'':`<div class="actions">${SR?`<button class="btn ghost" id="rtmic" type="button">${R.busy?'🔴 بسمعك...':'🎤 قولها'}</button>`:''}<button class="btn ghost" id="rthint" type="button">${R.hint?'':'تلميح'}${R.hint?esc(x.en.split(' ').slice(0,2).join(' ')+' ...'):''}</button></div><button class="btn primary" id="rtchk" type="button">شوف الإجابة</button>`}
    ${c?`<div class="verdict ${c.lv}">${c.lv==='ok'?'ممتاز، صح':c.lv==='mid'?'قريب جدًا':R.txt.trim()?'فيه فرق، قارن':'دي الإجابة'}</div>
      <div class="cmp"><div class="row"><small>الإجابة</small><span class="en">${R.txt.trim()?diffHTML(x.en,R.txt):esc(x.en)}</span></div><div class="row"><small>النطق</small><span>${esc(x.p)}</span></div></div><div class="center">${accBtns(x.en)}</div>
      <p class="sub">قيّم نفسك بصراحة:</p><div class="actions"><button class="btn ghost" id="rtno" type="button">لسه</button><button class="btn primary" id="rtok" type="button">قلتها صح</button></div>`:''}</div>`;
  const inp=view.querySelector('#rtin'); if(inp) inp.oninput=()=>{R.txt=inp.value;};
  const m=view.querySelector('#rtmic'); if(m) m.onclick=()=>{ if(R.busy) return; R.busy=true; renderRT(); listen(x.en,res=>{ R.busy=false; if(!res.err&&res.alts&&res.alts[0]) R.txt=res.alts[0]; renderRT(); }); };
  const h=view.querySelector('#rthint'); if(h) h.onclick=()=>{R.hint=true;renderRT();};
  const ck=view.querySelector('#rtchk'); if(ck) ck.onclick=()=>{ const t=norm(x.en).split(' '), u=new Set(norm(R.txt).split(' ')); const hit=R.txt.trim()?t.filter(w=>u.has(w)).length/t.length:0; R.chk={lv:norm(R.txt)===norm(x.en)?'ok':hit>=0.75?'mid':'no'}; say(x.en); renderRT(); };
  const grade=ok=>{ const r=st.rt2[i]||[0,0]; const box=ok?Math.min(r[0]+1,INTERVALS.length-1):0; st.rt2[i]=[box,today()+(ok?INTERVALS[box]||1:1)]; if(ok){R.good++;addPts(2);} save(); R.k++; R.txt=''; R.chk=null; R.hint=false; renderRT(); };
  const o=view.querySelector('#rtok'); if(o){ o.onclick=()=>grade(true); view.querySelector('#rtno').onclick=()=>grade(false); }
}
