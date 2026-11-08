  /* ---------- Arabic voice instructions ---------- */
  let vAr=null, arBusy=false, lastAr='';
  const pickAr=()=>{ if(!synth) return; const vs=synth.getVoices(); vAr=vs.find(x=>/^ar[-_](EG|SA)/i.test(x.lang||''))||vs.find(x=>/^ar/i.test(x.lang||''))||null; };
  if(synth){ pickAr(); synth.addEventListener&&synth.addEventListener('voiceschanged',pickAr); }
  const arOn=()=>ME.arv!=null?ME.arv:small;
  function sayAr(t){ if(!synth||!vAr||!t) return; try{ synth.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang=vAr.lang; u.voice=vAr; u.rate=0.95; arBusy=true; u.onend=u.onerror=()=>{arBusy=false;}; setTimeout(()=>{arBusy=false;},6000); synth.speak(u);}catch(e){ arBusy=false; } }
  function instr(force){ const el=root.querySelector('[data-ar]')||root.querySelector('.kmsg'); const t=el?(el.dataset.ar||el.textContent).trim():''; if(!t) return; if(!force&&t===lastAr) return; lastAr=t; if(force||arOn()) sayAr(t); }

  /* ---------- record your voice ---------- */
  let recBusy=false;
  async function recordClip(ms){
    if(!navigator.mediaDevices||!window.MediaRecorder) throw new Error('unsupported');
    const s=await navigator.mediaDevices.getUserMedia({audio:true}); const r=new MediaRecorder(s), ch=[];
    return await new Promise((ok,no)=>{ r.ondataavailable=e=>{ if(e.data&&e.data.size) ch.push(e.data); }; r.onerror=no;
      r.onstop=()=>{ s.getTracks().forEach(t=>t.stop()); ok(URL.createObjectURL(new Blob(ch,{type:r.mimeType||'audio/mp4'}))); };
      r.start(); setTimeout(()=>{ try{r.stop();}catch(e){no(e);} },ms); });
  }
  function recBtn(word){ return `<button class="kbtn c slim recb" type="button" data-rec="${esc(word)}"><span class="em">🎙️</span>سجّل صوتك</button>`; }
  function wireRec(){ root.querySelectorAll('[data-rec]').forEach(b=>b.onclick=async()=>{ if(recBusy) return; recBusy=true; const w=b.dataset.rec; if(synth) synth.cancel();
    b.classList.add('on'); b.innerHTML='<span class="em">🔴</span>قول الكلمة دلوقتي';
    try{ const url=await recordClip(2600); b.innerHTML='<span class="em">👂</span>اسمع صوتك'; const a=new Audio(url);
      a.onended=()=>{ setTimeout(()=>{ say(w); b.innerHTML='<span class="em">🎙️</span>سجّل تاني'; b.classList.remove('on'); recBusy=false; if(!ks.rec){ks.rec=0;} ks.rec++; if(ks.rec%5===1) addStars(1); },300); };
      a.play().catch(()=>{ recBusy=false; b.classList.remove('on'); b.innerHTML='<span class="em">🎙️</span>سجّل صوتك'; });
    }catch(e){ recBusy=false; b.classList.remove('on'); b.innerHTML='<span class="em">🎙️</span>سجّل صوتك'; const m=root.querySelector('.kmsg')||b; toastMsg('المايك مش شغال. اسمح للتطبيق يستخدم المايك من إعدادات المتصفح.'); } }); }

  /* ---------- pet that grows ---------- */
  const PETS=[['🐱','قطة'],['🐶','كلب'],['🐰','أرنب'],['🐼','باندا'],['🦊','تعلب'],['🐲','تنين']];
  const STAGES=[[0,'بيضة'],[10,'صغنن'],[40,'شاطر'],[100,'كبير'],[200,'بطل']];
  const SHOP=[['food','🍎','تفاحة',2],['food','🍪','بسكوتة',3],['food','🥛','لبن',2],['top','🎩','قبعة',10],['top','🎀','فيونكة',10],['top','👑','تاج',30],['face','🕶️','نضارة',15],['neck','🧣','كوفية',12],['side','🎈','بالونة',8],['side','⚽','كورة',12],['side','🎒','شنطة',20]];
  const petStage=()=>{ let s=0; STAGES.forEach((x,k)=>{ if(ks.stars>=x[0]) s=k; }); return s; };
  const coins=()=>ks.stars-(ks.spent||0);
  const fedToday=()=>ks.pet&&ks.pet.fed===today();
  function petView(big){ const st=petStage(), P=ks.pet;
    if(st===0||!P||P.kind==null) return `<span class="petbody s0">🥚</span>`;
    const w=P.wear||{}; return `<span class="petbody s${st}">${PETS[P.kind][0]}${w.top?`<i class="pw-top">${w.top}</i>`:''}${w.face?`<i class="pw-face">${w.face}</i>`:''}${w.neck?`<i class="pw-neck">${w.neck}</i>`:''}${w.side?`<i class="pw-side">${w.side}</i>`:''}${st>=4?'<i class="pw-aura">✨</i>':''}</span>`; }
  function petCard(){ const st=petStage(), next=STAGES[st+1];
    const mood=ks.pet&&ks.pet.kind!=null?(fedToday()?'مبسوط 😊':'جعان 🥺'):(st===0?'لسه بيضة':'جاهز يفقس!');
    return `<button class="petcard" type="button" id="kpet"><span class="petmini">${petView()}</span><span class="tt"><b>${ks.pet&&ks.pet.name?esc(ks.pet.name):'صاحبي'}</b><small>${STAGES[st][1]} · ${mood}</small>${next?`<span class="goalbar"><i style="width:${Math.min(100,(ks.stars-STAGES[st][0])/(next[0]-STAGES[st][0])*100)}%"></i></span>`:''}</span></button>`; }
  function petPage(msg){
    const st=petStage(), P=ks.pet||(ks.pet={kind:null,wear:{},own:[]});
    if(st>0&&P.kind==null){
      render(`<div class="kmsg" data-ar="البيضة فقست! اختار صاحبك">🥚 البيضة فقست! اختار صاحبك</div><div class="kopts c3">${PETS.map((p,k)=>`<button class="kopt" type="button" data-kind="${k}">${p[0]}<small>${p[1]}</small></button>`).join('')}</div>`,home);
      root.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{ P.kind=+b.dataset.kind; P.name=PETS[P.kind][1]; P.fed=null; ksave(); burst(); say('Hello!'); petPage('أهلًا! أنا صاحبك الجديد. أكّلني كل يوم'); });
      instr(); return;
    }
    const next=STAGES[st+1];
    render(`<div class="petstage">${petView(true)}</div>
      <div class="kmsg ${msg?'ok':''}" data-ar="${esc(msg||(st===0?'جمّع نجوم عشان البيضة تفقس':fedToday()?'صاحبك مبسوط. اشتريله حاجة حلوة':'صاحبك جعان. أكّله'))}">${esc(msg||(st===0?'جمّع '+n(10-ks.stars)+' نجوم كمان عشان البيضة تفقس':fedToday()?'صاحبك مبسوط النهاردة':'صاحبك جعان! أكّله'))}</div>
      <div class="tot"><div class="stat"><b>${STAGES[st][1]}</b><span>${next?'هيكبر بعد '+n(next[0]-ks.stars)+' نجمة':'وصل لأعلى مرحلة'}</span></div><div class="stat"><b>⭐ ${n(coins())}</b><span>نجوم تصرفها</span></div></div>
      ${st>0?`<h3 class="kh">🛒 المحل</h3><div class="shop">${SHOP.map(([sl,e,t,c],k)=>{const own=sl!=='food'&&(P.own||[]).includes(e), on=sl!=='food'&&P.wear&&P.wear[sl]===e; return `<button class="shopi ${on?'on':''}" type="button" data-sh="${k}" ${!own&&coins()<c?'disabled':''}><span class="em">${e}</span><small>${esc(t)}</small><b>${own?(on?'لابسه':'البسه'):'⭐ '+n(c)}</b></button>`}).join('')}</div>`:''}`,home);
    root.querySelectorAll('[data-sh]').forEach(b=>b.onclick=()=>{ const [sl,e,t,c]=SHOP[+b.dataset.sh]; P.own=P.own||[]; P.wear=P.wear||{};
      if(sl==='food'){ if(coins()<c) return; ks.spent=(ks.spent||0)+c; const first=!fedToday(); P.fed=today(); ksave(); burst(); say('Yummy!'); return petPage(first?'هممم! شكرًا، أنا شبعت ومبسوط':'هممم! لذيذ'); }
      if(P.own.includes(e)){ P.wear[sl]=P.wear[sl]===e?null:e; ksave(); return petPage(); }
      if(coins()<c) return; ks.spent=(ks.spent||0)+c; P.own.push(e); P.wear[sl]=e; ksave(); burst(); say('Wow!'); petPage('حلو أوي! شكرًا'); });
    instr();
  }

  /* ---------- daily time limit ---------- */
  let useTimer=null;
  function useTick(){ const d=today(); if(!ks.use||ks.use.d!==d) ks.use={d,m:0,x:0}; ks.use.m+=0.5; ksave(); checkLimit(); }
  function limitLeft(){ const lim=ME.lim||0; if(!lim) return Infinity; const d=today(); const u=ks.use&&ks.use.d===d?ks.use:{m:0,x:0}; return lim+(u.x||0)-u.m; }
  function checkLimit(){ if(limitLeft()>0) return false;
    clearInterval(useTimer); useTimer=null; if(synth) synth.cancel(); curBack=null;
    root.innerHTML=head()+`<div class="kcard"><span class="pic">🌙</span><b style="font-size:1.5rem">خلص وقت الإنجليزي النهاردة</b><span class="m">برافو عليك! نكمل بكرة إن شاء الله</span></div>
      <button class="kbtn c" type="button" id="kmore"><span class="em">🔐</span>ماما أو بابا يزودوا وقت</button>`;
    root.querySelector('#kswitch').onclick=()=>parentGate(()=>openPicker());
    root.querySelector('#kstarsb').onclick=()=>{};
    root.querySelector('#kmore').onclick=()=>parentGate(()=>{ ks.use.x=(ks.use.x||0)+15; ksave(); startUse(); home(); toastMsg('اتزود ١٥ دقيقة'); });
    sayAr('خلص وقت الإنجليزي النهاردة. برافو عليك، نكمل بكرة');
    return true; }
  function startUse(){ if(!ME.lim) return; clearInterval(useTimer); useTimer=setInterval(()=>{ if(document.visibilityState==='visible') useTick(); },30000); }
