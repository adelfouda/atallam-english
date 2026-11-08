/* ---------- course: structured curriculum ---------- */
const CRS=D.crs||[], LVN=D.lvn||[];
if(!st.crs) st.crs={};
if(!st.mis) st.mis=[];
const STEPS=[['v','الكلمات','🔤'],['g','القواعد','📐'],['d','الحوار','💬'],['r','القراءة','📖'],['l','الاستماع','🎧'],['s','الكلام','🎤'],['w','الكتابة','✍️'],['t','الاختبار','🏁']];
const cu=i=>st.crs[i]||(st.crs[i]={s:{}});
const uDone=i=>!!(st.crs[i]&&st.crs[i].done);
const lvUnits=lv=>CRS.map((u,i)=>u.lv===lv?i:-1).filter(i=>i>=0);
const PLV=[1,2,3,4,5];
function uOpen(i){
  if(i<0||i>=CRS.length) return false; if(uDone(i)) return true;
  const u=CRS[i], first=lvUnits(u.lv)[0];
  if(i===first){ if(u.lv===1||u.lv===7) return true; if(st.placed&&PLV[st.placed.lv]>=u.lv) return true; return uDone(i-1); }
  return uDone(i-1);
}
function nextUnit(){ for(let i=0;i<CRS.length;i++){ if(CRS[i].lv===7) continue; if(!uDone(i)&&uOpen(i)) return i; } return -1; }
function addMis(m){ const key=JSON.stringify(m); if(st.mis.some(x=>JSON.stringify(x)===key)) return; st.mis.push(m); if(st.mis.length>150) st.mis.shift(); }
function stepDone(i,k,val){ const c=cu(i); const first=c.s[k]==null; c.s[k]=val==null?1:Math.max(c.s[k]||0,val); if(first){ addPts(2); touchStreak(); } save(); stats(); }
let cv={u:null,step:'v',x:{}};
const lvDoneCount=lv=>lvUnits(lv).filter(uDone).length;

function renderCourse(){
  if(cv.u!=null) return renderUnit();
  const nx=nextUnit();
  view.innerHTML=`<div class="head"><h2>المنهج</h2><p class="sub">${n(CRS.length)} وحدة متسلسلة. كل وحدة فيها كلمات وقواعد وحوار وقراءة واستماع وكلام وكتابة، وفي آخرها اختبار. لما تنجح في الاختبار، الوحدة اللي بعدها بتتفتح.</p></div>
  ${nx>=0?`<button class="contcard" type="button" data-u="${nx}"><span class="em">${CRS[nx].e}</span><span class="tt"><small>كمّل من هنا</small><b>الوحدة ${n(nx+1)}: ${esc(CRS[nx].t)}</b><small>${esc(LVN[CRS[nx].lv])}</small></span><span class="go">←</span></button>`:''}
  ${[1,2,3,4,5,6,7].map(lv=>{const us=lvUnits(lv), d=lvDoneCount(lv); return `<section class="lvsec"><div class="lvhead"><h3 class="lvh">${esc(LVN[lv])}</h3><span class="sub">${n(d)} من ${n(us.length)}</span></div>
    <div class="goalbar"><i style="width:${d/us.length*100}%"></i></div>
    ${d===us.length?`<button class="btn ghost wide" type="button" data-cert="${lv}">🎓 شهادة إتمام المستوى</button>`:(lv<7&&!uOpen(us[0])?'':`<button class="minib lvskip" type="button" data-skip="${lv}">عندك المستوى ده؟ اعمل اختبار تخطي</button>`)}
    <div class="panel">${us.map(i=>{const u=CRS[i], c=st.crs[i], open=uOpen(i), done=uDone(i), steps=c?Object.keys(c.s).length:0;
      return `<button class="lrow urow ${open?'':'locked'}" type="button" data-u="${i}"><span class="num">${done?'✓':open?u.e:'🔒'}</span><span class="tt">${n(i+1)}. ${esc(u.t)}</span><span class="sc ${done?'full':''}">${done?(c.t!=null?n(c.t)+' من ١٠':'خلصت'):steps?n(steps)+' من ٨':''}</span></button>`}).join('')}</div></section>`}).join('')}`;
  view.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.u;
    if(!uOpen(i)){ cv={u:i,step:'t',x:{skip:true}}; renderUnit(); window.scrollTo(0,0); return; }
    const c=st.crs[i]; const first=STEPS.find(s=>!(c&&c.s[s[0]]!=null)); cv={u:i,step:first?first[0]:'v',x:{}}; renderUnit(); window.scrollTo(0,0); });
  view.querySelectorAll('[data-cert]').forEach(b=>b.onclick=()=>showCert(+b.dataset.cert));
  view.querySelectorAll('[data-skip]').forEach(b=>b.onclick=()=>{ cv={u:lvUnits(+b.dataset.skip)[0],step:'t',x:{lvskip:+b.dataset.skip}}; renderUnit(); window.scrollTo(0,0); });
}
function unitHead(i){
  const u=CRS[i], c=st.crs[i]||{s:{}};
  return `<div class="head"><p class="sub">${esc(LVN[u.lv])} · الوحدة ${n(i+1)}</p><h2>${u.e} ${esc(u.t)}</h2></div>
  <div class="steps" role="tablist">${STEPS.map(([k,t,e])=>`<button class="stp ${cv.step===k?'on':''} ${c.s[k]!=null?'ok':''}" type="button" data-step="${k}" role="tab" aria-selected="${cv.step===k}"><span>${c.s[k]!=null?'✓':e}</span>${t}</button>`).join('')}</div>`;
}
function nextStepBtn(){ const k=STEPS.findIndex(s=>s[0]===cv.step); return k<STEPS.length-1?`<button class="btn primary wide" id="nstep" type="button">الخطوة اللي بعدها: ${STEPS[k+1][1]}</button>`:''; }
function wireUnit(){
  view.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{cv.step=b.dataset.step;cv.x={};if(synth)synth.cancel();renderUnit();window.scrollTo(0,0);});
  const ns=view.querySelector('#nstep'); if(ns) ns.onclick=()=>{const k=STEPS.findIndex(s=>s[0]===cv.step); cv.step=STEPS[k+1][0]; cv.x={}; if(synth)synth.cancel(); renderUnit(); window.scrollTo(0,0);};
  view.querySelectorAll('.tw').forEach(t=>t.onclick=()=>wordPop(t.dataset.w));
}
function renderUnit(){
  const i=cv.u, u=CRS[i];
  if(cv.x.skip||cv.x.lvskip!=null) return renderUTest(i);
  const f={v:uVocab,g:uGram,d:uDialog,r:uRead,l:uListen,s:uSpeak,w:uWrite,t:renderUTest}[cv.step];
  f(i,u);
}
/* step: vocabulary */
function uVocab(i,u){
  const c=cu(i);
  view.innerHTML=unitHead(i)+`<p class="sub">اسمع كل كلمة بالنطقين وكررها بصوت عالي. بعد كده ضيفهم لمراجعتك عشان يتكرروا عليك لحد ما تحفظهم.</p>
  <div class="panel">${u.v.map(v=>`<div class="mw"><button class="sp" type="button" data-say="${esc(v[0])}" aria-label="اسمع">${SPK}</button><div class="t"><span class="en" lang="en">${esc(v[0])}</span><span class="pp">أمريكي: ${esc(v[2])}</span><span class="pp gbp">بريطاني: ${esc(v[3])}</span><span>${esc(v[1])}</span></div><button class="sp" type="button" data-acc="gb" data-say="${esc(v[0])}" aria-label="اسمع بريطاني">🇬🇧</button></div>`).join('')}</div>
  <button class="btn ${c.s.v!=null?'ghost':'primary'} wide" id="vadd" type="button">${c.s.v!=null?'الكلمات في مراجعتك ✓':'حفظتهم، ضيفهم لمراجعتي'}</button>${nextStepBtn()}`;
  view.querySelector('#vadd').onclick=()=>{ let k=0; u.v.forEach(v=>{const x=WIDX[v[0].toLowerCase()]; const j=x!=null?x:lookup(v[0]); if(j>=0&&!st.p[j]){st.p[j]=[0,today()];k++;}}); stepDone(i,'v'); toastMsg(k?'اتضافت '+n(k)+' كلمة لمراجعتك':'الكلمات دي موجودة في مراجعتك'); renderUnit(); };
  wireUnit();
}
/* step: grammar */
function uGram(i,u){
  const l=L[u.g], a=cv.x.a||(cv.x.a={}); const answered=Object.keys(a).length, score=Object.entries(a).filter(([q,x])=>l.q[q][2]===x).length;
  view.innerHTML=unitHead(i)+`<div class="lesson"><h2>${esc(l.t)}</h2>${l.x.map(p=>`<p>${esc(p)}</p>`).join('')}
    <div class="pats">${l.pat.map(p=>`<div class="pat"><span class="en">${esc(Array.isArray(p)?p[0]:p)}</span></div>`).join('')}</div>
    <div class="exl">${l.ex.map(e=>`<div class="exi"><span class="en">${esc(e[0])}</span><span class="a">${esc(e[1])}</span><span class="us">أمريكي: ${esc(e[2])}</span>${accBtns(e[0])}</div>`).join('')}</div>
    <h2>تمرين</h2>${l.q.map((q,qi)=>{const x=a[qi]; const parts=q[0].split('___');
      return `<div class="lq"><span class="s">${esc(parts[0])}${parts.length>1?`<u>${x!=null?esc(q[1][x]):'&nbsp;?&nbsp;'}</u>${esc(parts[1]||'')}`:''}</span>
      <div class="os">${q[1].map((o,oi)=>{let cl='o'; if(x!=null){ if(oi===q[2]) cl+=' right'; else if(oi===x) cl+=' wrong'; } return `<button class="${cl}" type="button" data-q="${qi}" data-o="${oi}" ${x!=null?'disabled':''}>${esc(o)}</button>`}).join('')}</div>${x!=null?`<span class="h">${esc(q[3])}</span>`:''}</div>`}).join('')}
    ${answered===l.q.length?`<div class="verdict ${score===l.q.length?'ok':'mid'}">نتيجتك ${n(score)} من ${n(l.q.length)}${score<l.q.length?'. الأسئلة اللي غلطت فيها اتضافت لأخطائك عشان تراجعها.':''}</div>`:''}</div>${nextStepBtn()}`;
  view.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ const qi=+b.dataset.q, o=+b.dataset.o; a[qi]=o; const q=l.q[qi]; say(q[0].replace('___',q[1][q[2]])); if(o!==q[2]) addMis({k:'g',l:u.g,q:qi});
    if(Object.keys(a).length===l.q.length){ const sc=Object.entries(a).filter(([qq,x])=>l.q[qq][2]===x).length; st.les[u.g]=Math.max(st.les[u.g]||0,sc); stepDone(i,'g',sc); }
    const y=window.scrollY; renderUnit(); window.scrollTo(0,y); });
  wireUnit();
}
/* step: dialogue */
function uDialog(i,u){
  const x=cv.x; if(x.mode==null) x.mode='hide'; if(!x.rev) x.rev=new Set(); if(!x.res) x.res={};
  const d=u.d, mine=x.mode==='role';
  view.innerHTML=unitHead(i)+`<p class="sub">${x.mode==='hide'?'اسمع الحوار الأول من غير ما تشوف الكلام، وحاول تفهم. بعدها اكشف النص.':mine?'إنت '+esc(d.r[1])+'. اسمع الجملة اللي قبلك، وبعدين قول جملتك في المايك.':'اقرا واسمع، ودوس على أي كلمة تعرف معناها.'}</p>
  <div class="modes"><button class="fchip" type="button" data-dm="hide" aria-pressed="${x.mode==='hide'}">استماع بس</button><button class="fchip" type="button" data-dm="read" aria-pressed="${x.mode==='read'}">اقرا</button><button class="fchip" type="button" data-dm="role" aria-pressed="${mine}">أنا ${esc(d.r[1])}</button></div>
  <button class="btn primary" id="dplay" type="button">${x.playing!=null?'وقف':'اسمع الحوار كله'}</button>
  <div class="chat">${d.l.map((l,k)=>{const hide=(x.mode==='hide')||(mine&&l[0]===1&&!x.rev.has(k)); const r=x.res[k];
    return `<div class="bub r${l[0]} ${hide?'hide':''} ${x.playing===k?'playing':''}"><span class="who">${esc(d.r[l[0]])}</span><span class="en">${x.mode==='read'?tapWords(l[1]):esc(l[1])}</span>${x.mode==='hide'?'':`<span class="a">${esc(l[2])}</span><span class="us">أمريكي: ${esc(l[3])}</span>`}
    <span class="row2">${hide&&mine?`<button class="minib" type="button" data-rv="${k}">اكشف</button>`:''}${!hide?accBtns(l[1]):''}${mine&&l[0]===1?`<button class="minib" type="button" data-mc="${k}">🎤 قولها</button>`:''}</span>
    ${r?`<div class="verdict ${r.lv||'no'}">${r.err?esc(MICERR[r.err]||'حصلت مشكلة في المايك.'):r.lv==='ok'?'نطقك صح':r.lv==='mid'?'قريب جدًا':'جرب تاني'}</div>`:''}</div>`}).join('')}</div>
  ${x.mode==='hide'?`<button class="btn ghost wide" type="button" data-dm="read">اكشف النص</button>`:''}
  <button class="btn ${cu(i).s.d!=null?'ghost':'primary'} wide" id="ddone" type="button">${cu(i).s.d!=null?'خلصت الحوار ✓':'فهمت الحوار'}</button>${nextStepBtn()}`;
  view.querySelectorAll('[data-dm]').forEach(b=>b.onclick=()=>{x.mode=b.dataset.dm;x.playing=null;if(synth)synth.cancel();renderUnit();});
  view.querySelectorAll('[data-rv]').forEach(b=>b.onclick=()=>{const k=+b.dataset.rv;x.rev.add(k);say(d.l[k][1]);renderUnit();});
  view.querySelectorAll('[data-mc]').forEach(b=>b.onclick=()=>{const k=+b.dataset.mc; b.textContent='بسمعك...'; listen(d.l[k][1],res=>{x.res[k]=res.err?{err:res.err}:judge(d.l[k][1],res.alts); if(!res.err) x.rev.add(k); renderUnit();});});
  view.querySelector('#dplay').onclick=()=>{ if(x.playing!=null){x.playing=null;if(synth)synth.cancel();renderUnit();return;}
    const cur=cv.u; const step=k=>{ if(x.playing==null||cv.u!==cur||cv.step!=='d') return; if(k>=d.l.length){x.playing=null;renderUnit();return;} x.playing=k; const y=window.scrollY; renderUnit(); window.scrollTo(0,y);
      if(mine&&d.l[k][0]===1){ x.playing=null; renderUnit(); toastMsg('دورك! قول جملتك'); return; }
      sayLine(d.l[k][1],()=>setTimeout(()=>{ if(x.playing===k) step(k+1); },350)); };
    x.playing=0; step(0); };
  view.querySelector('#ddone').onclick=()=>{stepDone(i,'d');renderUnit();};
  wireUnit();
}
/* step: reading */
function uRead(i,u){
  const x=cv.x; if(!x.a) x.a={};
  const done=Object.keys(x.a).length===u.rq.length, score=Object.entries(x.a).filter(([q,a])=>u.rq[q][2]===a).length;
  view.innerHTML=unitHead(i)+`<p class="sub">اقرا الفقرة. دوس على أي كلمة مش عارفها، وجاوب الأسئلة في الآخر.</p>
  <div class="actions"><button class="btn ghost" id="rplay" type="button">${SPK} اسمع الفقرة</button><button class="btn ghost" id="rar" type="button">${x.ar?'خبّي الترجمة':'اعرض الترجمة'}</button></div>
  <div class="story">${u.rd.map(s=>`<div class="sen"><span class="en" lang="en">${tapWords(s[0])}</span><span class="us">${esc(s[2])}</span>${x.ar?`<span class="a">${esc(s[1])}</span>`:''}</div>`).join('')}</div>
  <h2>أسئلة</h2>${u.rq.map((q,qi)=>{const a=x.a[qi]; return `<div class="lq"><span class="qa">${esc(q[0])}</span><div class="os ar">${q[1].map((o,oi)=>{let c='o'; if(a!=null){ if(oi===q[2]) c+=' right'; else if(oi===a) c+=' wrong'; } return `<button class="${c}" type="button" data-q="${qi}" data-o="${oi}" ${a!=null?'disabled':''}>${esc(o)}</button>`}).join('')}</div></div>`}).join('')}
  ${done?`<div class="verdict ${score===u.rq.length?'ok':'mid'}">نتيجتك ${n(score)} من ${n(u.rq.length)}</div>`:''}${nextStepBtn()}`;
  view.querySelector('#rar').onclick=()=>{x.ar=!x.ar;const y=window.scrollY;renderUnit();window.scrollTo(0,y);};
  view.querySelector('#rplay').onclick=()=>{ const all=u.rd.map(s=>s[0]); let k=0; const nx=()=>{ if(k<all.length&&cv.step==='r') sayLine(all[k++],()=>setTimeout(nx,250)); }; nx(); };
  view.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ x.a[+b.dataset.q]=+b.dataset.o; if(Object.keys(x.a).length===u.rq.length){ const sc=Object.entries(x.a).filter(([q,a])=>u.rq[q][2]===a).length; stepDone(i,'r',sc);} const y=window.scrollY; renderUnit(); window.scrollTo(0,y); });
  wireUnit();
}
/* step: listening dictation */
const shortLines=u=>[...u.d.l.map(l=>[l[1],l[2],l[3]]),...u.rd.map(r=>[r[0],r[1],r[2]])].filter(s=>{const w=s[0].split(' ').length; return w>=3&&w<=9&&!/["\d]/.test(s[0]);});
function uListen(i,u){
  const x=cv.x; if(!x.items){ x.items=shuffle(shortLines(u)).slice(0,4); x.k=0; x.score=0; x.ans=null; }
  if(x.k>=x.items.length){
    view.innerHTML=unitHead(i)+`<div class="empty"><div class="big">${n(x.score)} / ${n(x.items.length)}</div><h2>${x.score>=3?'ودنك بقت أشطر':'كويس، الاستماع بييجي بالتكرار'}</h2><button class="btn ghost" id="lagain" type="button">جولة تانية</button></div>${nextStepBtn()}`;
    view.querySelector('#lagain').onclick=()=>{cv.x={};renderUnit();}; wireUnit(); return;
  }
  const it=x.items[x.k], done=x.ans!=null, ok=done&&norm(x.ans)===norm(it[0]);
  view.innerHTML=unitHead(i)+`<div class="q"><p class="sub">اسمع الجملة واكتبها بالإنجليزي. ${n(x.k+1)} من ${n(x.items.length)}</p>
    <div class="actions"><button class="btn primary" type="button" data-say="${esc(it[0])}">${SPK} اسمع</button><button class="btn ghost" type="button" id="lslow">اسمع ببطء</button></div>
    <input class="dict-in ${done?(ok?'ok':'no'):''}" id="lin" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en" placeholder="اكتب هنا" ${done?'disabled':''} value="${esc(x.ans||'')}">
    ${done?`<div class="verdict ${ok?'ok':'no'}">${ok?'صح':'فيه غلط'}</div><div class="cmp"><div class="row"><small>الصح</small><span class="en">${diffHTML(it[0],x.ans)}</span></div><div class="row"><small>المعنى</small><span>${esc(it[1])}</span></div><div class="row"><small>النطق</small><span>${esc(it[2])}</span></div></div><button class="btn primary" id="lnx" type="button">اللي بعدها</button>`
    :`<button class="btn primary" id="lchk" type="button">صحح</button>`}</div>`;
  view.querySelector('#lslow').onclick=()=>{const s=st.slow; st.slow=true; say(it[0]); st.slow=s;};
  if(!done){ const inp=view.querySelector('#lin'); const chk=()=>{ if(!inp.value.trim()){inp.focus();return;} x.ans=inp.value; if(norm(x.ans)===norm(it[0])) x.score++; else addMis({k:'s',t:it[0],a:it[1]}); if(x.k===x.items.length-1) stepDone(i,'l',x.score); renderUnit(); };
    view.querySelector('#lchk').onclick=chk; inp.onkeydown=e=>{if(e.key==='Enter')chk();}; if(!x.played){x.played=true; setTimeout(()=>say(it[0]),300);} }
  else view.querySelector('#lnx').onclick=()=>{x.k++;x.ans=null;x.played=false;renderUnit();};
  wireUnit();
}
/* step: speaking (shadowing) */
function uSpeak(i,u){
  const x=cv.x; if(!x.items){ x.items=shuffle(shortLines(u)).slice(0,4); x.k=0; x.ok=0; }
  if(x.k>=x.items.length){
    view.innerHTML=unitHead(i)+`<div class="empty"><div class="big">🎤</div><h2>خلصت تمرين الكلام</h2><p class="sub">${SR?'قلت '+n(x.ok)+' جمل صح من '+n(x.items.length)+'.':'كرر الجمل دي بصوت عالي كل يوم، ده أسرع طريق للطلاقة.'}</p><button class="btn ghost" id="sagain" type="button">جولة تانية</button></div>${nextStepBtn()}`;
    view.querySelector('#sagain').onclick=()=>{cv.x={};renderUnit();}; wireUnit(); return;
  }
  const it=x.items[x.k], r=x.res;
  view.innerHTML=unitHead(i)+`<div class="q"><p class="sub">اسمع الجملة، وبعدين قولها بنفس الطريقة والسرعة. ${n(x.k+1)} من ${n(x.items.length)}</p>
    <div class="prompt en" lang="en" style="font-size:1.35rem">${esc(it[0])}</div><div class="sub">${esc(it[1])}</div><div class="pp">${esc(it[2])}</div>
    <div class="actions"><button class="btn ghost" type="button" data-say="${esc(it[0])}">${SPK} اسمع</button><button class="btn ghost" id="sslow" type="button">ببطء</button></div>
    ${SR?`<button class="mic ${x.busy?'on':''}" id="smic" type="button" aria-label="سجل صوتك">${MIC}</button><p class="sub">${x.busy?'بسمعك دلوقتي...':'دوس على المايك وقول الجملة'}</p>`:`<p class="sub">المايك مش متاح في المتصفح ده، فقول الجملة بصوت عالي وبعدين دوس على قلتها.</p>`}
    ${x.err?`<div class="verdict no">${esc(MICERR[x.err]||'حصلت مشكلة في المايك.')}</div>`:''}
    ${r?`<div class="verdict ${r.lv}">${r.lv==='ok'?'ممتاز، نطقك صح':r.lv==='mid'?'قريب جدًا، جرب تاني':'مش واضح، اسمع وجرب تاني'}</div><div class="heard">${esc(r.heard||'')}</div>`:''}
    <button class="btn primary" id="snx" type="button">${SR?'اللي بعدها':'قلتها، اللي بعدها'}</button></div>`;
  view.querySelector('#sslow').onclick=()=>{const s=st.slow; st.slow=true; say(it[0]); st.slow=s;};
  const m=view.querySelector('#smic'); if(m) m.onclick=()=>{ if(x.busy) return; if(synth) synth.cancel(); x.busy=true; x.err=null; x.res=null; renderUnit(); listen(it[0],res=>{ x.busy=false; if(res.err) x.err=res.err; else { x.res=judge(it[0],res.alts); if(x.res.lv==='ok') x.ok++; } renderUnit(); }); };
  view.querySelector('#snx').onclick=()=>{ x.k++; x.res=null; x.err=null; if(x.k>=x.items.length) stepDone(i,'s',x.ok); renderUnit(); };
  if(!x.played){x.played=x.k+1; setTimeout(()=>say(it[0]),300);} else if(x.played!==x.k+1){x.played=x.k+1; setTimeout(()=>say(it[0]),300);}
  wireUnit();
}
/* step: writing */
function uWrite(i,u){
  const x=cv.x, c=cu(i);
  if(!x.ord){ const pool=shuffle(u.rd.filter(r=>{const w=r[0].split(' ').length; return w>=4&&w<=10;})).slice(0,2); x.ord=pool.map(r=>{const toks=r[0].replace(/[.!?]+$/,'').split(' '); let sh,g=0; do{sh=shuffle(toks.map((w,k)=>({w,k})));g++;}while(sh.every((o,k)=>o.w===toks[k])&&g<10); return {t:r[0],m:r[1],toks,sh,ans:[],done:false};}); x.oi=0; }
  const o=x.ord[x.oi];
  let part1='';
  if(o){ const used=new Set(o.ans), ok=o.done&&o.ans.map(k=>o.sh[k].w).join(' ')===o.toks.join(' ');
    part1=`<h2>رتب الجملة ${n(x.oi+1)} من ${n(x.ord.length)}</h2><div class="q"><div class="prompt" style="font-size:1.1rem">${esc(o.m)}</div>
      <div class="slot ${o.done?(ok?'ok':'no'):''}">${o.ans.map((k,j)=>`<button class="wchip" type="button" data-back="${j}" ${o.done?'disabled':''}>${esc(o.sh[k].w)}</button>`).join('')}</div>
      <div class="pool">${o.sh.map((s,k)=>used.has(k)?'':`<button class="wchip" type="button" data-pick="${k}" ${o.done?'disabled':''}>${esc(s.w)}</button>`).join('')}</div>
      ${o.done?`<div class="verdict ${ok?'ok':'no'}">${ok?'صح':'الترتيب الصح'}</div>${ok?'':`<div class="en">${esc(o.t)}</div>`}<button class="btn primary" id="onx" type="button">التالي</button>`:`<div class="actions"><button class="btn ghost" id="oclr" type="button">امسح</button><button class="btn primary" id="ochk" type="button" ${o.ans.length<o.sh.length?'disabled':''}>صحح</button></div>`}</div>`; }
  const fb=x.fb;
  view.innerHTML=unitHead(i)+part1+`<h2>اكتب بنفسك</h2><div class="q" style="text-align:start"><p>${esc(u.w[0])}</p>
    <textarea class="wbox" id="wtxt" lang="en" dir="ltr" rows="5" placeholder="Write here...">${esc(x.txt!=null?x.txt:(c.wt||''))}</textarea>
    <button class="btn primary" id="wchk" type="button">قارن بالنموذج</button>
    ${fb?`<div class="fb">${fb.map(f=>`<div class="fbi ${f[0]}">${f[0]==='ok'?'✓':'•'} ${esc(f[1])}</div>`).join('')}</div>
      <div class="cmp"><div class="row"><small>إجابة نموذجية</small><span class="en">${esc(u.w[1])}</span></div><div class="row"><small>معناها</small><span>${esc(u.w[2])}</span></div><div class="row"><small>النطق</small><span>${esc(u.w[3])}</span></div></div><div class="center">${accBtns(u.w[1])}</div>`:''}</div>${nextStepBtn()}`;
  if(o){ view.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{o.ans.push(+b.dataset.pick);renderUnit();});
    view.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{o.ans.splice(+b.dataset.back,1);renderUnit();});
    const cl=view.querySelector('#oclr'); if(cl) cl.onclick=()=>{o.ans=[];renderUnit();};
    const ck=view.querySelector('#ochk'); if(ck) ck.onclick=()=>{o.done=true; if(o.ans.map(k=>o.sh[k].w).join(' ')!==o.toks.join(' ')) addMis({k:'s',t:o.t,a:o.m}); say(o.t); renderUnit();};
    const nx=view.querySelector('#onx'); if(nx) nx.onclick=()=>{x.oi++; renderUnit();}; }
  const ta=view.querySelector('#wtxt'); ta.oninput=()=>{x.txt=ta.value;};
  view.querySelector('#wchk').onclick=()=>{ const t=ta.value.trim(); x.txt=t; if(!t){ta.focus();return;}
    const words=t.split(/\s+/).filter(Boolean), sents=t.split(/[.!?]+/).filter(s=>s.trim()).length, low=' '+norm(t)+' ';
    const used=u.v.filter(v=>low.includes(' '+norm(v[0])+' ')).map(v=>v[0]);
    const f=[];
    f.push([words.length>=12?'ok':'tip', 'كتبت '+n(words.length)+' كلمة في '+n(sents)+' جمل'+(words.length<12?'. حاول تكتب أكتر شوية.':'.')]);
    f.push([used.length?'ok':'tip', used.length?'استخدمت من كلمات الوحدة: '+used.join(', '):'حاول تستخدم كلمة أو اتنين من كلمات الوحدة.']);
    f.push([/^[A-Z]/.test(t)?'ok':'tip', /^[A-Z]/.test(t)?'بدأت بحرف كبير.':'الجملة في الإنجليزي بتبدأ بحرف كبير.']);
    f.push([/[.!?]$/.test(t)?'ok':'tip', /[.!?]$/.test(t)?'قفلت الجملة بعلامة صح.':'متنساش النقطة في آخر الجملة.']);
    if(/\bi\b/.test(t)) f.push(['tip','كلمة أنا بالإنجليزي بتتكتب دايمًا حرف كبير.']);
    x.fb=f; c.wt=t; stepDone(i,'w'); renderUnit(); };
  wireUnit();
}
/* unit test (also used to skip a unit or a whole level) */
function buildTest(idxs,count){
  const qs=[]; const pick=a=>a[Math.floor(Math.random()*a.length)];
  const per=Math.max(1,Math.ceil(count/idxs.length));
  idxs.forEach(i=>{ const u=CRS[i], l=L[u.g];
    const vv=shuffle(u.v.slice()); const nV=idxs.length===1?4:1, nG=idxs.length===1?3:1;
    vv.slice(0,nV).forEach(v=>{ const others=shuffle(u.v.filter(o=>o[1]!==v[1])).slice(0,3); qs.push({t:'v',p:v[0],o:shuffle([v[1],...others.map(o=>o[1])]),a:v[1]}); });
    shuffle(l.q.map((_,k)=>k)).slice(0,nG).forEach(k=>{ const q=l.q[k]; qs.push({t:'g',p:q[0],o:q[1].slice(),a:q[1][q[2]],h:q[3],gl:u.g,gq:k}); });
    if(idxs.length===1||Math.random()<0.5){ const lines=u.d.l; const ln=pick(lines); const others=shuffle(lines.filter(o=>o!==ln)).slice(0,2); qs.push({t:'l',p:ln[1],o:shuffle([ln[2],...others.map(o=>o[2])]),a:ln[2]}); }
    if(idxs.length===1){ const ln2=pick(u.d.l.filter(x=>x[0]===1)); const others=shuffle(u.d.l.filter(o=>o!==ln2)).slice(0,2); qs.push({t:'l',p:ln2[1],o:shuffle([ln2[2],...others.map(o=>o[2])]),a:ln2[2]}); const q=pick(u.rq); qs.push({t:'r',p:q[0],o:q[1].slice(),a:q[1][q[2]],ctx:u.rd.map(r=>r[0]).join(' ')}); }
  });
  return shuffle(qs).slice(0,count);
}
function renderUTest(i){
  const x=cv.x, lvs=x.lvskip;
  const idxs=lvs!=null?lvUnits(lvs):[i], total=lvs!=null?15:10, pass=lvs!=null?12:7;
  const title=lvs!=null?'اختبار تخطي: '+LVN[lvs]:x.skip?'اختبار تخطي الوحدة':'اختبار الوحدة';
  const headH=(lvs!=null||x.skip)?`<div class="head"><p class="sub">${esc(lvs!=null?'':LVN[CRS[i].lv])}</p><h2>${esc(title)}</h2></div>`:unitHead(i);
  if(!x.qs){
    view.innerHTML=headH+`<div class="empty"><div class="big">🏁</div><h2>${esc(title)}</h2><p class="sub">${n(total)} سؤال: كلمات وقواعد واستماع${lvs==null?' وقراءة':''}. محتاج ${n(pass)} إجابة صح عشان تنجح${lvs!=null?'، وساعتها كل وحدات المستوى هتتعلم إنها خلصت.':x.skip?' والوحدة تتفتحلك على طول.':' وتفتح الوحدة اللي بعدها.'}</p><button class="btn primary" id="tgo" type="button">ابدأ</button>${(lvs!=null||x.skip)?'<button class="btn ghost" id="tcancel" type="button">رجوع للمنهج</button>':''}</div>`;
    view.querySelector('#tgo').onclick=()=>{ x.qs=buildTest(idxs,total); x.k=0; x.sc=0; x.ans=null; renderUnit(); };
    const cc=view.querySelector('#tcancel'); if(cc) cc.onclick=()=>{cv={u:null,step:'v',x:{}};renderCourse();};
    if(lvs==null&&!x.skip) wireUnit(); return;
  }
  if(x.k>=x.qs.length){
    const ok=x.sc>=pass;
    if(!x.saved){ x.saved=true;
      if(ok){ if(lvs!=null){ idxs.forEach(j=>{const c=cu(j); if(!c.done){c.done=true;c.skip=true;}}); addPts(30); }
        else { const c=cu(i); const first=!c.done; c.done=true; c.t=Math.max(c.t||0,x.sc); if(x.skip) c.skip=true; c.s.t=c.t; if(first) addPts(20+x.sc); }
        touchStreak(); save(); stats(); }
      else if(lvs==null&&!x.skip){ const c=cu(i); c.s.t=c.s.t||0; save(); } }
    const lv=lvs!=null?lvs:CRS[i].lv, lvComplete=ok&&lvUnits(lv).every(uDone);
    view.innerHTML=headH+`<div class="empty"><div class="big">${n(x.sc)} / ${n(x.qs.length)}</div><h2>${ok?(lvComplete?'🎓 خلصت المستوى كله!':'🎉 نجحت'):'محتاج تراجع شوية'}</h2>
      <p class="sub">${ok?(lvs!=null?'كل وحدات المستوى اتعلمت إنها خلصت.':'الوحدة اللي بعدها اتفتحت.'):'راجع الكلمات والقواعد وجرب تاني. الأسئلة اللي غلطت فيها اتضافت لأخطائك.'}</p>
      <div class="actions" style="width:100%">${lvComplete?`<button class="btn primary" id="tcert" type="button">شهادتك</button>`:''}${ok&&lvs==null&&i+1<CRS.length&&uOpen(i+1)&&CRS[i+1].lv===CRS[i].lv?`<button class="btn primary" id="tnext" type="button">الوحدة اللي بعدها</button>`:''}<button class="btn ghost" id="tback" type="button">${ok?'المنهج':'جرب تاني'}</button></div></div>`;
    const tc=view.querySelector('#tcert'); if(tc) tc.onclick=()=>showCert(lv);
    const tn=view.querySelector('#tnext'); if(tn) tn.onclick=()=>{cv={u:i+1,step:'v',x:{}};renderUnit();window.scrollTo(0,0);};
    view.querySelector('#tback').onclick=()=>{ if(ok){cv={u:null,step:'v',x:{}};renderCourse();} else {cv.x=lvs!=null?{lvskip:lvs}:x.skip?{skip:true}:{};renderUnit();} };
    if(ok) burstA();
    if(lvs==null&&!x.skip) wireUnit(); return;
  }
  const q=x.qs[x.k], a=x.ans;
  const lab={v:'معنى الكلمة',g:'قواعد',l:'استماع',r:'قراءة'}[q.t];
  view.innerHTML=headH+`<div class="q"><p class="sub">سؤال ${n(x.k+1)} من ${n(x.qs.length)} · ${lab}</p><div class="goalbar"><i style="width:${x.k/x.qs.length*100}%"></i></div>
    ${q.t==='v'?`<div class="word" lang="en">${esc(q.p)}</div><button class="btn ghost" type="button" data-say="${esc(q.p)}">${SPK} اسمع</button>`:''}
    ${q.t==='g'?`<div class="lq"><span class="s">${esc(q.p)}</span></div>`:''}
    ${q.t==='l'?`<p class="sub">اسمع الجملة واختار معناها</p><button class="btn primary" type="button" data-say="${esc(q.p)}">${SPK} اسمع</button>${a!=null?`<div class="en">${esc(q.p)}</div>`:''}`:''}
    ${q.t==='r'?`<div class="sen" style="text-align:left"><span class="en" lang="en">${esc(q.ctx)}</span></div><b>${esc(q.p)}</b>`:''}
    <div class="opts">${q.o.map((o,k)=>{let c='opt'+(q.t==='g'?' en':''); if(a!=null){ if(o===q.a) c+=' right'; else if(k===a) c+=' wrong'; } return `<button class="${c}" type="button" data-o="${k}" ${a!=null?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
    ${a!=null&&q.h?`<div class="sub">${esc(q.h)}</div>`:''}
    ${a!=null?`<button class="btn primary" id="tnx" type="button">${x.k<x.qs.length-1?'السؤال اللي بعده':'النتيجة'}</button>`:''}</div>`;
  if(q.t==='l'&&a==null&&x.played!==x.k){ x.played=x.k; setTimeout(()=>say(q.p),300); }
  view.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const k=+b.dataset.o; x.ans=k; if(q.o[k]===q.a) x.sc++; else if(q.t==='g') addMis({k:'g',l:q.gl,q:q.gq}); else if(q.t==='l') addMis({k:'s',t:q.p,a:q.a}); if(q.t==='g') say(q.p.replace('___',q.a)); renderUnit(); });
  const nb=view.querySelector('#tnx'); if(nb) nb.onclick=()=>{x.k++;x.ans=null;renderUnit();window.scrollTo(0,0);};
  if(lvs==null&&!x.skip) wireUnit();
}
function burstA(){ if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const b=document.createElement('div'); b.className='burst';
  for(let k=0;k<16;k++){const s=document.createElement('i'); s.textContent=['🎉','⭐','✨','🎓'][k%4]; s.style.left='50%'; s.style.top='40%'; s.style.setProperty('--dx',(Math.random()*320-160)+'px'); s.style.setProperty('--dy',(Math.random()*-300+40)+'px'); b.appendChild(s);}
  document.body.appendChild(b); setTimeout(()=>b.remove(),1300); }

/* ---------- certificate ---------- */
function showCert(lv){
  const cvs=document.createElement('canvas'); cvs.width=1400; cvs.height=990; const g=cvs.getContext('2d');
  g.fillStyle='#FBF8F1'; g.fillRect(0,0,1400,990);
  g.strokeStyle='#1F4E79'; g.lineWidth=14; g.strokeRect(40,40,1320,910); g.strokeStyle='#C9A227'; g.lineWidth=4; g.strokeRect(70,70,1260,850);
  g.textAlign='center'; g.direction='rtl';
  const F='"Readex Pro","Noto Naskh Arabic",Tahoma,sans-serif';
  g.fillStyle='#C9A227'; g.font='bold 54px '+F; g.fillText('🎓',700,170);
  g.fillStyle='#1F4E79'; g.font='bold 76px '+F; g.fillText('شهادة إتمام',700,280);
  g.fillStyle='#444'; g.font='38px '+F; g.fillText('يشهد تطبيق أتعلم إنجليزي بأن',700,380);
  g.fillStyle='#111'; g.font='bold 72px '+F; g.fillText(ME.name==='أنا'?'متعلم مجتهد':ME.name,700,490);
  g.fillStyle='#444'; g.font='38px '+F; g.fillText('أتم بنجاح',700,580);
  g.fillStyle='#1F4E79'; g.font='bold 52px '+F; g.fillText(LVN[lv],700,670);
  const d=new Date(); g.fillStyle='#666'; g.font='32px '+F; g.fillText(d.toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'}),700,790);
  g.fillStyle='#999'; g.font='28px '+F; g.fillText('atallam-english.web.app',700,870);
  const url=cvs.toDataURL('image/png');
  view.innerHTML=`<div class="head"><h2>شهادتك</h2><p class="sub">${esc(LVN[lv])}</p></div><img class="cert" src="${url}" alt="شهادة إتمام ${esc(LVN[lv])}">
  <div class="actions"><a class="btn primary" href="${url}" download="certificate-level-${lv}.png">حمّل الشهادة</a><button class="btn ghost" id="cshare" type="button">شارك</button></div><button class="btn ghost wide" id="cback" type="button">رجوع للمنهج</button>`;
  view.querySelector('#cback').onclick=()=>{cv={u:null,step:'v',x:{}};renderCourse();};
  view.querySelector('#cshare').onclick=()=>{ cvs.toBlob(b=>{ try{ const f=new File([b],'certificate.png',{type:'image/png'}); if(navigator.canShare&&navigator.canShare({files:[f]})) navigator.share({files:[f],text:'خلصت '+LVN[lv]+' في أتعلم إنجليزي 🎓'}).catch(()=>{}); else toastMsg('حمّل الصورة وابعتها'); }catch(e){ toastMsg('حمّل الصورة وابعتها'); } }); };
}

/* ---------- mistakes review ---------- */
let mz=null;
function renderMistakes(){
  if(!st.mis.length){ view.innerHTML=`<div class="empty"><div class="big">✨</div><h2>مفيش أخطاء دلوقتي</h2><p class="sub">أي سؤال قواعد أو جملة تغلط فيها في المنهج بتتجمع هنا عشان تراجعها لحد ما تتقنها.</p></div>`; return; }
  if(!mz){ mz={k:0,items:st.mis.slice(-10).reverse(),ans:null,ord:null}; }
  if(mz.k>=mz.items.length){ view.innerHTML=`<div class="empty"><div class="big">💪</div><h2>خلصت جولة المراجعة</h2><p class="sub">فاضل ${n(st.mis.length)} في أخطائك.</p><button class="btn primary" id="mzagain" type="button">جولة تانية</button></div>`; view.querySelector('#mzagain').onclick=()=>{mz=null;renderMistakes();}; return; }
  const m=mz.items[mz.k];
  const fix=ok=>{ if(ok){ const key=JSON.stringify(m); st.mis=st.mis.filter(x=>JSON.stringify(x)!==key); addPts(1); save(); } };
  if(m.k==='g'){ const q=L[m.l].q[m.q], a=mz.ans;
    view.innerHTML=`<div class="head"><h2>أخطائي</h2><p class="sub">${n(st.mis.length)} عنصر محتاج مراجعة. لو جاوبت صح بيتشال من القايمة.</p></div>
    <div class="q"><p class="sub">${esc(L[m.l].t)}</p><div class="lq"><span class="s">${esc(q[0])}</span><div class="os">${q[1].map((o,oi)=>{let c='o'; if(a!=null){ if(oi===q[2]) c+=' right'; else if(oi===a) c+=' wrong'; } return `<button class="${c}" type="button" data-o="${oi}" ${a!=null?'disabled':''}>${esc(o)}</button>`}).join('')}</div>${a!=null?`<span class="h">${esc(q[3])}</span>`:''}</div>
    ${a!=null?`<div class="verdict ${a===q[2]?'ok':'no'}">${a===q[2]?'صح، اتشالت من أخطائك':'لسه، هتتكرر عليك تاني'}</div><button class="btn primary" id="mznx" type="button">اللي بعده</button>`:''}</div>`;
    view.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ mz.ans=+b.dataset.o; fix(mz.ans===q[2]); say(q[0].replace('___',q[1][q[2]])); renderMistakes(); });
  } else {
    if(!mz.ord){ const toks=m.t.replace(/[.!?]+$/,'').split(' '); let sh,g=0; do{sh=shuffle(toks.map((w,k)=>({w,k})));g++;}while(sh.every((o,k)=>o.w===toks[k])&&g<10); mz.ord={toks,sh,ans:[],done:false}; }
    const o=mz.ord, used=new Set(o.ans), ok=o.done&&o.ans.map(k=>o.sh[k].w).join(' ')===o.toks.join(' ');
    view.innerHTML=`<div class="head"><h2>أخطائي</h2><p class="sub">${n(st.mis.length)} عنصر محتاج مراجعة. اسمع الجملة ورتب كلماتها.</p></div>
    <div class="q"><div class="prompt" style="font-size:1.1rem">${esc(m.a)}</div><button class="btn ghost" type="button" data-say="${esc(m.t)}">${SPK} اسمع</button>
      <div class="slot ${o.done?(ok?'ok':'no'):''}">${o.ans.map((k,j)=>`<button class="wchip" type="button" data-back="${j}" ${o.done?'disabled':''}>${esc(o.sh[k].w)}</button>`).join('')}</div>
      <div class="pool">${o.sh.map((s,k)=>used.has(k)?'':`<button class="wchip" type="button" data-pick="${k}" ${o.done?'disabled':''}>${esc(s.w)}</button>`).join('')}</div>
      ${o.done?`<div class="verdict ${ok?'ok':'no'}">${ok?'صح، اتشالت من أخطائك':'الترتيب الصح'}</div>${ok?'':`<div class="en">${esc(m.t)}</div>`}<button class="btn primary" id="mznx" type="button">اللي بعده</button>`:`<button class="btn primary" id="mzchk" type="button" ${o.ans.length<o.sh.length?'disabled':''}>صحح</button>`}</div>`;
    view.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{o.ans.push(+b.dataset.pick);renderMistakes();});
    view.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{o.ans.splice(+b.dataset.back,1);renderMistakes();});
    const ck=view.querySelector('#mzchk'); if(ck) ck.onclick=()=>{o.done=true; fix(o.ans.map(k=>o.sh[k].w).join(' ')===o.toks.join(' ')); say(m.t); renderMistakes();};
  }
  const nx=view.querySelector('#mznx'); if(nx) nx.onclick=()=>{mz.k++;mz.ans=null;mz.ord=null;renderMistakes();};
}

/* ---------- kids report for parents ---------- */
function renderKidsReport(){
  const kids=PROFILES.filter(p=>p.type!=='adult');
  if(!kids.length){ view.innerHTML=`<div class="empty"><div class="big">👨‍👧</div><h2>مفيش حسابات أطفال</h2><p class="sub">اعمل حساب لكل طفل من زرار الصورة اللي فوق.</p></div>`; return; }
  const K=D.kids, KX=D.kx||{};
  view.innerHTML=`<div class="head"><h2>تقرير الأولاد</h2><p class="sub">كل طفل اتعلم إيه، وأكتر كلمات بيغلط فيها عشان تراجعها معاه.</p></div>`+kids.map(p=>{
    const k=lsGet(profKey(p),{})||{}; const seen=Object.values(k.seen||{}).reduce((a,x)=>a+x.length,0), total=K.reduce((a,t)=>a+t.items.length,0);
    const topics=Object.keys(k.seen||{}).length, badges=Object.keys(k.badges||{}).length, ph=(k.ph||[]).length, tr=Object.keys(k.tr||{}).length, ps=Object.keys(k.ps||{}).length;
    const miss=Object.entries(k.miss||{}).sort((a,b)=>b[1]-a[1]).slice(0,8);
    const emo=w=>{for(const t of K){const it=t.items.find(x=>x[0]===w); if(it) return it[1];} return '';};
    const ar=w=>{for(const t of K){const it=t.items.find(x=>x[0]===w); if(it) return it[2];} return '';};
    return `<div class="panel" style="padding:14px;display:flex;flex-direction:column;gap:10px"><div style="display:flex;align-items:center;gap:10px"><span style="font-size:2rem">${esc(p.av)}</span><b style="flex:1;font-size:1.15rem">${esc(p.name)}</b><span class="sub">${esc(TYPES[p.type].t)} · ${ago(k.ts)}</span></div>
      <div class="tot"><div class="stat"><b>${n(k.stars||0)}</b><span>نجمة</span></div><div class="stat"><b>${n(badges)} من ${n(K.length)}</b><span>شارة</span></div><div class="stat"><b>${n(seen)} من ${n(total)}</b><span>كلمة شافها</span></div><div class="stat"><b>${n(topics)}</b><span>موضوع بدأه</span></div><div class="stat"><b>${n(ph)} من ٢٦</b><span>صوت حرف</span></div><div class="stat"><b>${n(tr)}</b><span>حرف رسمه</span></div><div class="stat"><b>${n(ps)} من ${n((KX.ps||[]).length)}</b><span>حكاية</span></div><div class="stat"><b>${n((k.pts&&k.pts.wk===wk())?k.pts.v:0)}</b><span>نجمة الأسبوع ده</span></div></div>
      ${miss.length?`<b>كلمات محتاج يراجعها</b><div class="chips">${miss.map(([w,c])=>`<button class="fchip" type="button" data-say="${esc(w)}">${emo(w)} ${esc(w)} · ${esc(ar(w))}</button>`).join('')}</div>`:'<p class="sub">مفيش كلمات بيغلط فيها كتير لحد دلوقتي.</p>'}</div>`;}).join('');
}

/* ---------- daily reminder (calendar file) ---------- */
function reminderICS(hhmm){
  const [h,m]=hhmm.split(':').map(Number); const d=new Date(); d.setDate(d.getDate()+1);
  const pad=x=>String(x).padStart(2,'0'); const ds=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate());
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Atallam English//AR','BEGIN:VEVENT','UID:atallam-daily-'+Date.now()+'@atallam-english.web.app','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z',
    'DTSTART:'+ds+'T'+pad(h)+pad(m)+'00','DURATION:PT20M','RRULE:FREQ=DAILY','SUMMARY:وقت الإنجليزي 📚','DESCRIPTION:افتح أتعلم إنجليزي وكمّل درسك: https://atallam-english.web.app','URL:https://atallam-english.web.app',
    'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:وقت الإنجليزي','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'})); a.download='atallam-reminder.ics'; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1000);
}
