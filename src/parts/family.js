
/* ---------- family profiles ---------- */
const PKEY='eng-profiles';
const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
let PROFILES=lsGet(PKEY,null);
if(!Array.isArray(PROFILES)||!PROFILES.length) PROFILES=[{id:'me',name:'أنا',type:'adult',av:'🧑'}];
const saveProfiles=()=>{lsSet(PKEY,PROFILES); if(window.__onProfiles) window.__onProfiles(PROFILES);};
const TYPES={adult:{t:'كبير',d:'الكلمات والتمارين والدروس كاملة'},kidBig:{t:'طفل بيقرا',d:'من ٧ سنين وأكبر: صور وكلمات وتهجي'},kidSmall:{t:'طفل صغير',d:'أقل من ٧ سنين: صور وصوت من غير قراية'}};
const AVS=['🧑','👩','👨','👦','👧','🧒','👶','🦁','🐼','🐱','🦊','🐸','🐯','🚀','⚽','🌟'];
const profKey=p=>p.type==='adult'?(p.id==='me'?'eng-cards-v1':'eng-cards-v1:'+p.id):'eng-kid:'+p.id;
function profStat(p){
  const s=lsGet(profKey(p),{});
  if(p.type==='adult'){ const n1=Object.values(s.p||{}).filter(v=>v[0]>0).length; return n(n1)+' كلمة محفوظة'; }
  return n(s.stars||0)+' نجمة · '+n(Object.keys(s.badges||{}).length)+' شارة';
}
let activeId=null; try{activeId=sessionStorage.getItem('eng-active');}catch(e){}
if(!PROFILES.find(p=>p.id===activeId)) activeId=PROFILES.length===1?PROFILES[0].id:null;
function choose(id){ try{sessionStorage.setItem('eng-active',id); sessionStorage.removeItem('eng-tab');}catch(e){} location.reload(); }
function openPicker(){
  let el=document.getElementById('picker'); if(!el){el=document.createElement('div');el.id='picker';el.className='picker';el.dir='rtl';document.body.appendChild(el);}
  let mode='list', form={name:'',type:'kidSmall',av:'👦'}, delArm=null;
  const paint=()=>{
    if(mode==='list'){
      el.innerHTML=`<div class="in"><h1>مين هيتعلم دلوقتي؟</h1>
      <div class="pgrid">${PROFILES.map(p=>`<div class="pcard"><button type="button" class="kback" style="all:unset;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;width:100%" data-pick="${p.id}"><span class="av">${p.av}</span><b>${esc(p.name)}</b><small>${TYPES[p.type].t}</small><span class="st">${profStat(p)}</span></button>${p.id!=='me'?`<button class="del" type="button" data-del="${p.id}">${delArm===p.id?'متأكد؟ احذف':'حذف'}</button>`:''}</div>`).join('')}
        <button class="pcard add" type="button" id="padd"><span class="av">＋</span><b>حساب جديد</b><small>لطفل أو لحد من العيلة</small></button></div>
      ${activeId?'<button class="btn ghost" type="button" id="pclose">رجوع</button>':''}</div>`;
      el.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>choose(b.dataset.pick));
      el.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation(); const id=b.dataset.del; if(delArm!==id){delArm=id;paint();return;}
        PROFILES=PROFILES.filter(p=>p.id!==id); saveProfiles(); try{localStorage.removeItem('eng-kid:'+id);localStorage.removeItem('eng-cards-v1:'+id);}catch(e){} delArm=null; if(activeId===id){try{sessionStorage.removeItem('eng-active')}catch(e){} location.reload();return;} paint();});
      el.querySelector('#padd').onclick=()=>{mode='add';paint();};
      const c=el.querySelector('#pclose'); if(c) c.onclick=()=>{el.remove();};
    } else {
      el.innerHTML=`<div class="in"><h1>حساب جديد</h1><div class="pform">
        <label for="pname">الاسم</label><input id="pname" type="text" maxlength="20" placeholder="مثلًا: يوسف" value="${esc(form.name)}">
        <span>نوع الحساب</span><div class="types">${Object.entries(TYPES).map(([k,v])=>`<button type="button" data-type="${k}" aria-pressed="${form.type===k}"><b>${v.t}</b><small>${v.d}</small></button>`).join('')}</div>
        <span>اختار صورة</span><div class="avs">${AVS.map(a=>`<button type="button" data-av="${a}" aria-pressed="${form.av===a}">${a}</button>`).join('')}</div>
        <div class="actions"><button class="btn ghost" type="button" id="pcancel">إلغاء</button><button class="btn primary" type="button" id="psave">حفظ</button></div></div></div>`;
      const nm=el.querySelector('#pname'); nm.oninput=()=>form.name=nm.value;
      el.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{form.type=b.dataset.type;paint();});
      el.querySelectorAll('[data-av]').forEach(b=>b.onclick=()=>{form.av=b.dataset.av;paint();});
      el.querySelector('#pcancel').onclick=()=>{mode='list';paint();};
      el.querySelector('#psave').onclick=()=>{ const name=(form.name||'').trim(); if(!name){nm.focus();nm.placeholder='اكتب الاسم الأول';return;}
        PROFILES.push({id:'p'+Date.now().toString(36),name,type:form.type,av:form.av}); saveProfiles(); form={name:'',type:'kidSmall',av:'👦'}; mode='list'; paint(); };
    }
  };
  paint();
}

/* ---------- kids ---------- */
function startKid(ME){
  document.getElementById('app').hidden=true; document.querySelector('.tabs').hidden=true;
  const K=D.kids, small=ME.type==='kidSmall', SKEY=profKey(ME);
  let ks=Object.assign({stars:0,seen:{},best:{},badges:{}},lsGet(SKEY,{}));
  const ksave=()=>{ks.ts=Date.now(); lsSet(SKEY,ks); if(window.__onKidSave) window.__onKidSave(SKEY,ks);};
  const root=document.getElementById('kid'); root.hidden=false;
  const synth=window.speechSynthesis; let v=null;
  const pick=()=>{ if(!synth) return; const vs=synth.getVoices(); v=vs.find(x=>(x.lang||'').replace('_','-')==='en-US'&&/Samantha|Google US|Aria|Jenny|Ava/i.test(x.name))||vs.find(x=>(x.lang||'').replace('_','-')==='en-US')||null; };
  if(synth){pick(); synth.addEventListener&&synth.addEventListener('voiceschanged',pick);}
  const say=(t,rate)=>{ if(!synth) return; try{synth.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='en-US'; if(v) u.voice=v; u.rate=rate||(small?0.75:0.85); synth.speak(u);}catch(e){} };
  const SAYIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const shuffle=a=>{for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};
  const PRAISE=['Great job!','Well done!','Super!','Amazing!','Good job!'];
  function burst(){ if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const b=document.createElement('div'); b.className='burst';
    for(let k=0;k<14;k++){const i=document.createElement('i'); i.textContent=['⭐','🌟','✨'][k%3]; i.style.left='50%'; i.style.top='45%'; i.style.setProperty('--dx',(Math.random()*300-150)+'px'); i.style.setProperty('--dy',(Math.random()*-300+40)+'px'); b.appendChild(i);}
    document.body.appendChild(b); setTimeout(()=>b.remove(),1200); }
  function addStars(k){ ks.stars+=k; ksave(); const s=document.getElementById('kstars'); if(s) s.textContent=n(ks.stars); }
  const head=()=>`<div class="khead"><div class="hi"><button class="avbtn" type="button" id="kswitch" aria-label="تغيير المستخدم">${ME.av}</button><b>أهلًا يا ${esc(ME.name)}</b></div><button class="stars" type="button" id="kstarsb">⭐ <span id="kstars">${n(ks.stars)}</span></button></div>`;
  const wire=()=>{ root.querySelector('#kswitch').onclick=openPicker; root.querySelector('#kstarsb').onclick=showBadges; const b=root.querySelector('#kback'); if(b) b.onclick=b._go; };
  function render(html,back){ if(synth) synth.cancel(); root.innerHTML=head()+(back?`<button class="kback" type="button" id="kback">→ رجوع</button>`:'')+html; if(back) root.querySelector('#kback')._go=back; wire(); window.scrollTo(0,0); }
  function home(){
    render(`<div class="ktopics">${K.map((t,i)=>{const seen=(ks.seen[i]||[]).length; return `<button class="ktile ${ks.badges[i]?'done':''}" type="button" data-t="${i}"><span class="em">${t.e}</span><b>${esc(t.t)}</b><small>${ks.badges[i]?'🏅 ':''}${n(seen)} من ${n(t.items.length)}</small></button>`}).join('')}</div>`);
    root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>topic(+b.dataset.t));
  }
  function topic(ti){
    const t=K[ti];
    const games=small?[['tap','👂','اسمع واختار'],['mem','🃏','الذاكرة']]:[['tap','👂','اسمع واختار'],['mem','🃏','الذاكرة'],['spell','✍️','اكتب الكلمة'],['speak','🎤','قول الكلمة']];
    render(`<div class="kcard"><span class="pic" style="font-size:4rem">${t.e}</span><b style="font-size:1.6rem">${esc(t.t)}</b></div>
      <div class="kbig"><button class="kbtn a" type="button" id="klearn"><span class="em">📖</span>اتعلم</button>${games.map(g=>`<button class="kbtn ${g[0]==='tap'?'b':'c'}" type="button" data-g="${g[0]}"><span class="em">${g[1]}</span>${g[2]}</button>`).join('')}</div>`,home);
    root.querySelector('#klearn').onclick=()=>learn(ti,0);
    root.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>({tap:gTap,mem:gMem,spell:gSpell,speak:gSpeak})[b.dataset.g](ti));
  }
  function learn(ti,k){
    const t=K[ti], it=t.items[k]; const seen=ks.seen[ti]||(ks.seen[ti]=[]);
    if(!seen.includes(k)){ seen.push(k); addStars(1); }
    render(`<div class="dots">${t.items.map((_,j)=>`<i class="${j<=k?'on':''}"></i>`).join('')}</div>
      <div class="kcard">${t.letters?`<span class="letter">${esc(it[5])} ${esc(it[5].toLowerCase())}</span>`:''}<span class="pic">${it[1]}</span><span class="w" lang="en">${esc(it[0])}</span>
      ${small?`<span class="m">${esc(it[2])}</span>`:`<span class="pp">${esc(it[3])}</span><span class="m">${esc(it[2])}</span>`}</div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${k===0?'disabled':''} aria-label="اللي فات">→</button><button class="ksay" type="button" id="ksay" aria-label="اسمع">${SAYIC}</button><button class="arr" type="button" id="knext" aria-label="اللي بعده">${k===t.items.length-1?'✓':'←'}</button></div>`,()=>topic(ti));
    const sp=()=>t.letters?say(it[5]+'. '+it[0]):say(it[0]);
    root.querySelector('#ksay').onclick=sp; setTimeout(sp,250);
    root.querySelector('#kprev').onclick=()=>learn(ti,k-1);
    root.querySelector('#knext').onclick=()=>{ if(k<t.items.length-1) learn(ti,k+1); else done(ti,null,'خلصت كل كلمات الموضوع! يلا نلعب'); };
  }
  function done(ti,score,msg){
    let badge=false;
    if(score){ const pct=score[0]/score[1]; ks.best[ti]=Math.max(ks.best[ti]||0,score[0]); if(pct>=0.8&&!ks.badges[ti]){ks.badges[ti]=true;badge=true;} ksave(); }
    render(`<div class="kcard"><span class="pic">${badge?'🏅':'🎉'}</span>${score?`<b style="font-size:2rem">${n(score[0])} من ${n(score[1])}</b>`:''}<b style="font-size:1.4rem">${badge?'شارة جديدة! برافو عليك':msg||'برافو!'}</b></div>
      <div class="kbig"><button class="kbtn b" type="button" id="kagain">🔁 تاني</button><button class="kbtn a" type="button" id="khome">🏠 الرئيسية</button></div>`,()=>topic(ti));
    burst(); say(badge?'You got a badge! Amazing!':'Well done!');
    root.querySelector('#kagain').onclick=()=>topic(ti); root.querySelector('#khome').onclick=home;
  }
  /* game: listen and tap */
  function gTap(ti){
    const t=K[ti], N=small?3:4, rounds=Math.min(6,t.items.length); const order=shuffle(t.items.map((_,j)=>j)).slice(0,rounds); let r=0, score=0, miss=false;
    const q=()=>{ if(r>=rounds) return done(ti,[score,rounds]);
      const ans=order[r]; const opts=shuffle([ans,...shuffle(t.items.map((_,j)=>j).filter(j=>j!==ans)).slice(0,N-1)]); miss=false;
      render(`<div class="dots">${order.map((_,j)=>`<i class="${j<r?'on':''}"></i>`).join('')}</div><div class="center"><button class="ksay" type="button" id="ksay" aria-label="اسمع تاني">${SAYIC}</button></div>
        <div class="kmsg" id="kmsg">${small?'اسمع ودوس على الصورة':'اسمع واختار الصورة الصح'}</div>
        <div class="kopts ${N===3?'c3':'c4'}">${opts.map(o=>`<button class="kopt" type="button" data-o="${o}">${t.items[o][1]}</button>`).join('')}</div>`,()=>topic(ti));
      const w=t.items[ans][0]; root.querySelector('#ksay').onclick=()=>say(w); setTimeout(()=>say(w),300);
      root.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const o=+b.dataset.o; const m=root.querySelector('#kmsg');
        if(o===ans){ b.classList.add('right'); if(!miss){score++;addStars(1);} burst(); m.className='kmsg ok'; m.textContent='برافو!'; say(PRAISE[r%PRAISE.length]); root.querySelectorAll('[data-o]').forEach(x=>x.disabled=true); setTimeout(()=>{r++;q();},1300); }
        else { miss=true; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); m.className='kmsg no'; m.textContent='حاول تاني'; setTimeout(()=>say(w),400); } });
    }; q();
  }
  /* game: memory */
  function gMem(ti){
    const t=K[ti], P=small?3:4; const pick=shuffle(t.items.map((_,j)=>j)).slice(0,Math.min(P,t.items.length));
    const cards=shuffle(pick.flatMap(j=>[{j,k:'p'},{j,k:small?'p':'w'}])).map((c,i)=>({...c,i,open:false,got:false}));
    let first=null, lock=false, tries=0;
    const paint=()=>{ render(`<div class="kmsg">${small?'لاقي الصور اللي شبه بعض':'وصّل كل كلمة بصورتها'}</div><div class="mem ${cards.length>6?'m4':''}">${cards.map(c=>`<button class="mc ${c.got?'got':c.open?'open':''}" type="button" data-c="${c.i}" ${c.got?'disabled':''}>${c.open||c.got?(c.k==='p'?t.items[c.j][1]:`<span class="wd">${esc(t.items[c.j][0])}</span>`):'?'}</button>`).join('')}</div>`,()=>topic(ti));
      root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>flip(+b.dataset.c)); };
    const flip=i=>{ const c=cards[i]; if(lock||c.open||c.got) return; c.open=true; say(t.items[c.j][0]);
      if(!first){first=c;paint();return;}
      tries++; const a=first; first=null; paint();
      if(a.j===c.j){ a.got=c.got=true; a.open=c.open=false; addStars(1); burst(); setTimeout(()=>{ paint(); if(cards.every(x=>x.got)) done(ti,[pick.length,Math.max(tries,pick.length)]); },500); }
      else { lock=true; setTimeout(()=>{a.open=c.open=false;lock=false;paint();},900); } };
    paint();
  }
  /* game: spell (big kids) */
  function gSpell(ti){
    const t=K[ti]; const pool=t.items.map((_,j)=>j).filter(j=>/^[a-z]{2,7}$/i.test(t.items[j][0]));
    const order=shuffle(pool).slice(0,Math.min(5,pool.length)); let r=0, score=0;
    const q=()=>{ if(r>=order.length) return done(ti,[score,order.length]);
      const it=t.items[order[r]], word=it[0].toLowerCase(); const tiles=shuffle(word.split('').map((ch,k)=>({ch,k}))); let got=[], miss=false;
      const paint=(msg,cls)=>{ render(`<div class="kcard"><span class="pic" style="font-size:4.5rem">${it[1]}</span><span class="m">${esc(it[2])}</span><button class="ksay" type="button" id="ksay" aria-label="اسمع">${SAYIC}</button></div>
        <div class="spell">${word.split('').map((_,k)=>`<span class="slot1 ${got[k]!=null?'f':''}">${got[k]!=null?esc(tiles[got[k]].ch):''}</span>`).join('')}</div>
        <div class="kmsg ${cls||''}">${msg||'رتب الحروف'}</div>
        <div class="tiles">${tiles.map((tl,k)=>`<button type="button" data-k="${k}" ${got.includes(k)?'disabled':''}>${esc(tl.ch)}</button>`).join('')}</div>
        ${got.length?'<div class="center"><button class="kback" type="button" id="kundo">امسح آخر حرف</button></div>':''}`,()=>topic(ti));
        root.querySelector('#ksay').onclick=()=>say(it[0]);
        root.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ got.push(+b.dataset.k); say(tiles[+b.dataset.k].ch,0.9);
          if(got.length===word.length){ const ok=got.map(k=>tiles[k].ch).join('')===word;
            if(ok){ if(!miss){score++;addStars(2);} burst(); say(PRAISE[r%PRAISE.length]); paint('برافو! '+it[0],'ok'); setTimeout(()=>{r++;q();},1400); }
            else { miss=true; got=[]; paint('قربت! حاول تاني','no'); setTimeout(()=>say(it[0]),300); } }
          else paint(); });
        const u=root.querySelector('#kundo'); if(u) u.onclick=()=>{got.pop();paint();}; };
      paint(); setTimeout(()=>say(it[0]),300);
    }; q();
  }
  /* game: speak (big kids) */
  function gSpeak(ti){
    const t=K[ti]; const SRc=window.SpeechRecognition||window.webkitSpeechRecognition; const order=shuffle(t.items.map((_,j)=>j)).slice(0,Math.min(5,t.items.length)); let r=0, score=0;
    const q=(msg,cls)=>{ if(r>=order.length) return done(ti,[score,order.length]); const it=t.items[order[r]];
      render(`<div class="kcard"><span class="pic">${it[1]}</span><span class="w" lang="en">${esc(it[0])}</span><span class="pp">${esc(it[3])}</span></div>
        <div class="kmsg ${cls||''}">${msg||'اسمع وبعدين دوس على المايك وقول الكلمة'}</div>
        <div class="kbig"><button class="kbtn c" type="button" id="ksay"><span class="em">🔊</span>اسمع</button><button class="kbtn b" type="button" id="kmic"><span class="em">🎤</span>قول</button></div>
        <div class="center"><button class="kback" type="button" id="kskip">الكلمة اللي بعدها</button></div>`,()=>topic(ti));
      root.querySelector('#ksay').onclick=()=>say(it[0]);
      root.querySelector('#kskip').onclick=()=>{r++;q();};
      root.querySelector('#kmic').onclick=()=>{ if(!SRc) return q('المايك مش شغال في المتصفح ده. افتح التطبيق من كروم.','no');
        try{ if(synth) synth.cancel(); const rec=new SRc(); rec.lang='en-US'; rec.maxAlternatives=5; let got=false; root.querySelector('#kmic').innerHTML='<span class="em">👂</span>بسمعك...';
          rec.onresult=e=>{got=true; const alts=Array.from(e.results[0]).map(a=>a.transcript.toLowerCase().trim()); const w=it[0].toLowerCase();
            if(alts.some(a=>a.replace(/[^a-z ]/g,'').trim()===w||a.includes(w))){ score++; addStars(2); burst(); say(PRAISE[r%PRAISE.length]); setTimeout(()=>{r++;q();},1300); q('برافو! نطقك صح','ok'); }
            else q('قربت! اسمع تاني وجرب','no'); };
          rec.onerror=e=>{got=true; q(e.error==='not-allowed'||e.error==='service-not-allowed'?'محتاجين إذن المايك من المتصفح':'مسمعتش كويس، جرب تاني','no');};
          rec.onend=()=>{ if(!got) q('مسمعتش حاجة، جرب تاني','no'); };
          rec.start(); }catch(e){ q('المايك مش شغال دلوقتي','no'); } };
      setTimeout(()=>say(it[0]),300);
    }; q();
  }
  function showBadges(){
    render(`<div class="kcard"><span class="pic" style="font-size:4rem">⭐</span><b style="font-size:2.2rem">${n(ks.stars)}</b><span class="m">نجمة جمعتها</span></div>
      <b style="font-size:1.2rem">شاراتي</b><div class="badges">${K.map((t,i)=>`<div class="badge1 ${ks.badges[i]?'':'lock'}">${t.e}<small>${esc(t.t)}</small></div>`).join('')}</div>
      <p class="sub" style="text-align:center">تاخد شارة لما تجاوب صح على ٨ من كل ١٠ في أي لعبة.</p>`,home);
  }
  window.__kid={get:()=>ks,set:r=>{ks=Object.assign(ks,r);lsSet(SKEY,ks);home();},key:SKEY};
  home();
}
if(!activeId){ document.getElementById('app').hidden=true; document.querySelector('.tabs').hidden=true; openPicker(); return; }
const ME=PROFILES.find(p=>p.id===activeId);
if(ME.type!=='adult'){ startKid(ME); return; }
