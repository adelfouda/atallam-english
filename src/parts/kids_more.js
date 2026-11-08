  /* ---------- more kids activities ---------- */
  const KX=D.kx||{ph:[],cvc:[],ch:[],ps:[]};
  const SND={}; KX.ph.forEach(p=>SND[p[0].toLowerCase()]=p[1]);
  const missW=w=>{ ks.miss=ks.miss||{}; ks.miss[w]=(ks.miss[w]||0)+1; ksave(); };
  const sayQ=(list,gap)=>{ if(!synth) return; synth.cancel(); list.forEach(t=>{ const u=new SpeechSynthesisUtterance(t); u.lang='en-US'; if(v) u.voice=v; u.rate=small?0.7:0.8; synth.speak(u); }); };
  function topicStars(i){ const t=K[i], s=(ks.seen[i]||[]).length; return (s>0?1:0)+(s>=t.items.length?1:0)+(ks.badges[i]?1:0); }
  function home(){
    const nextT=K.findIndex((_,i)=>!ks.badges[i]);
    const acts=[['ph','🔤','الحروف وأصواتها'],['tr','✏️','ارسم الحروف'],['bl','🧩',small?'اسمع واختار الكلمة':'اقرا الكلمة'],['ch','🎵','أناشيد'],['ps','📚','حكايات بالصور']];
    render(`<div class="kacts">${acts.map(a=>`<button class="kact" type="button" data-a="${a[0]}"><span class="em">${a[1]}</span><b>${a[2]}</b></button>`).join('')}</div>
      <h3 class="kh">🗺️ رحلتي</h3>
      <div class="kmap">${K.map((t,i)=>{const s=topicStars(i); return `${i?'<i class="mlink"></i>':''}<button class="mnode p${i%4} ${i===nextT?'next':''} ${s===3?'done':''}" type="button" data-t="${i}"><span class="circ">${t.e}</span><b>${esc(t.t)}</b><span class="mst">${'⭐'.repeat(s)}${'☆'.repeat(3-s)}</span></button>`}).join('')}</div>`);
    root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>topic(+b.dataset.t));
    root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>({ph:phHome,tr:()=>phHome(true),bl:blend,ch:chHome,ps:psHome})[b.dataset.a]());
    const nx=root.querySelector('.mnode.next'); if(nx&&nextT>2) setTimeout(()=>nx.scrollIntoView({block:'center'}),50);
  }
  /* letters and their sounds */
  function phHome(trace){
    ks.ph=ks.ph||[]; ks.tr=ks.tr||{};
    render(`<div class="kmsg">${trace?'اختار حرف وارسمه بصباعك':'اختار حرف واسمع صوته'}</div>
      <div class="lgrid">${KX.ph.map((p,k)=>`<button class="lt ${(trace?ks.tr[p[0]]:ks.ph.includes(k))?'done':''}" type="button" data-k="${k}"><b>${p[0]}${p[0].toLowerCase()}</b><span>${p[4]}</span></button>`).join('')}</div>`,home);
    root.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>trace?traceL(+b.dataset.k,true,()=>phHome(true)):phCard(+b.dataset.k));
  }
  function phCard(k){
    const p=KX.ph[k]; ks.ph=ks.ph||[]; if(!ks.ph.includes(k)){ ks.ph.push(k); addStars(1); }
    render(`<div class="kcard"><span class="letter big2">${p[0]} ${p[0].toLowerCase()}</span><span class="m">صوته: ${esc(p[2])}</span><span class="pic">${p[4]}</span><span class="w" lang="en">${esc(p[3])}</span>${small?'':`<span class="pp">${esc(p[5])}</span>`}</div>
      <div class="kbig"><button class="kbtn b" type="button" id="psnd"><span class="em">🔊</span>صوت الحرف</button><button class="kbtn c" type="button" id="ptr"><span class="em">✏️</span>ارسمه</button></div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${k===0?'disabled':''} aria-label="اللي فات">→</button><button class="ksay" type="button" id="ksay" aria-label="اسمع الكلمة">${SAYIC}</button><button class="arr" type="button" id="knext" ${k===KX.ph.length-1?'disabled':''} aria-label="اللي بعده">←</button></div>`,()=>phHome(false));
    const snd=()=>sayQ([p[1],p[1],p[3]]);
    root.querySelector('#psnd').onclick=snd; root.querySelector('#ksay').onclick=()=>say(p[3]); setTimeout(snd,250);
    root.querySelector('#ptr').onclick=()=>traceL(k,true,()=>phCard(k));
    root.querySelector('#kprev').onclick=()=>phCard(k-1); root.querySelector('#knext').onclick=()=>phCard(k+1);
  }
  /* tracing with the finger */
  function traceL(k,up,back){
    const p=KX.ph[k], ch=up?p[0]:p[0].toLowerCase(); ks.tr=ks.tr||{};
    render(`<div class="kmsg" id="tmsg">ارسم الحرف ${ch} بصباعك فوق الخط الباهت</div>
      <div class="trwrap"><canvas id="trc" width="600" height="600" aria-label="مساحة الرسم"></canvas></div>
      <div class="kbig"><button class="kbtn c" type="button" id="trclr"><span class="em">🧽</span>امسح</button><button class="kbtn b" type="button" id="trok"><span class="em">✓</span>خلصت</button></div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${k===0?'disabled':''} aria-label="الحرف اللي فات">→</button><button class="kback" type="button" id="trcase">${up?'الحرف الصغير '+p[0].toLowerCase():'الحرف الكبير '+p[0]}</button><button class="arr" type="button" id="knext" ${k===KX.ph.length-1?'disabled':''} aria-label="الحرف اللي بعده">←</button></div>`,back);
    const c=root.querySelector('#trc'), g=c.getContext('2d'), S=600;
    const FONT='bold '+(up?430:470)+'px "Andika","Comic Sans MS","Trebuchet MS",Arial,sans-serif';
    const mask=document.createElement('canvas'); mask.width=mask.height=S; const mg=mask.getContext('2d');
    mg.font=FONT; mg.textAlign='center'; mg.textBaseline='middle'; mg.fillStyle='#000'; mg.strokeStyle='#000'; mg.lineWidth=26; mg.lineJoin='round';
    mg.fillText(ch,S/2,S/2+(up?20:-10)); mg.strokeText(ch,S/2,S/2+(up?20:-10));
    const ink=document.createElement('canvas'); ink.width=ink.height=S; const ig=ink.getContext('2d'); ig.lineCap='round'; ig.lineJoin='round'; ig.lineWidth=48; ig.strokeStyle='#000';
    const css=getComputedStyle(document.documentElement);
    const paint=()=>{ g.clearRect(0,0,S,S); g.font=FONT; g.textAlign='center'; g.textBaseline='middle';
      g.fillStyle=(css.getPropertyValue('--line')||'#ddd').trim()||'#ddd'; g.fillText(ch,S/2,S/2+(up?20:-10));
      g.globalAlpha=.9; g.drawImage(tint(),0,0); g.globalAlpha=1; };
    const tint=()=>{ const t=document.createElement('canvas'); t.width=t.height=S; const tg=t.getContext('2d'); tg.drawImage(ink,0,0); tg.globalCompositeOperation='source-in'; tg.fillStyle=(css.getPropertyValue('--accent')||'#1F4E79').trim()||'#1F4E79'; tg.fillRect(0,0,S,S); return t; };
    paint();
    let drawing=false, last=null;
    const pos=e=>{ const r=c.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*S,(e.clientY-r.top)/r.height*S]; };
    c.onpointerdown=e=>{ drawing=true; last=pos(e); try{c.setPointerCapture(e.pointerId);}catch(_){} ig.beginPath(); ig.moveTo(last[0],last[1]); ig.lineTo(last[0]+.1,last[1]+.1); ig.stroke(); paint(); e.preventDefault(); };
    c.onpointermove=e=>{ if(!drawing) return; const q=pos(e); ig.beginPath(); ig.moveTo(last[0],last[1]); ig.lineTo(q[0],q[1]); ig.stroke(); last=q; paint(); e.preventDefault(); };
    c.onpointerup=c.onpointercancel=()=>{ drawing=false; };
    root.querySelector('#trclr').onclick=()=>{ ig.clearRect(0,0,S,S); paint(); };
    root.querySelector('#trcase').onclick=()=>traceL(k,!up,back);
    root.querySelector('#kprev').onclick=()=>traceL(k-1,up,back); root.querySelector('#knext').onclick=()=>traceL(k+1,up,back);
    root.querySelector('#trok').onclick=()=>{
      const M=mg.getImageData(0,0,S,S).data, I=ig.getImageData(0,0,S,S).data; let m=0,cov=0,inkN=0,out=0;
      for(let y=0;y<S;y+=4) for(let x=0;x<S;x+=4){ const a=(y*S+x)*4+3; const inM=M[a]>40, inI=I[a]>40; if(inM){m++; if(inI) cov++;} if(inI){inkN++; if(!inM) out++;} }
      const coverage=m?cov/m:0, spill=inkN?out/inkN:1; const msg=root.querySelector('#tmsg');
      if(coverage>=0.45&&spill<=0.55){ msg.className='kmsg ok'; msg.textContent='برافو! رسمت الحرف '+ch; if(!ks.tr[p[0]+(up?'':'_l')]){ ks.tr[p[0]+(up?'':'_l')]=1; ks.tr[p[0]]=1; addStars(2);} burst(); sayQ([PRAISE[k%PRAISE.length],p[1],p[3]]); }
      else if(coverage<0.45){ msg.className='kmsg no'; msg.textContent='كمّل الحرف كله، فاضل حتت مرسمتهاش'; }
      else { msg.className='kmsg no'; msg.textContent='حاول ترسم فوق الخط بالظبط'; }
    };
    setTimeout(()=>sayQ([p[0],p[1]]),250);
  }
  /* blending: sound out short words */
  function blend(){
    const P=KX.cvc; if(!P.length) return home(); const order=shuffle(P.map((_,j)=>j)).slice(0,6); let r=0, score=0;
    const q=()=>{ if(r>=order.length){ ks.bl=Math.max(ks.bl||0,score); ksave(); return endAct('🧩',score,order.length,blend); }
      const it=P[order[r]], w=it[0], letters=w.split(''); let heard=new Set(), miss=false;
      const opts=shuffle([order[r],...shuffle(P.map((_,j)=>j).filter(j=>j!==order[r]&&P[j][1]!==it[1])).slice(0,2)]);
      const paint=(msg,cls)=>{ render(`<div class="dots">${order.map((_,j)=>`<i class="${j<r?'on':''}"></i>`).join('')}</div>
        <div class="kmsg ${cls||''}">${msg||(small?'دوس على كل حرف واسمع صوته، وبعدين اختار الصورة':'دوس على كل حرف، وبعدين اقرا الكلمة واختار صورتها')}</div>
        <div class="bltiles">${letters.map((l,k)=>`<button type="button" class="${heard.has(k)?'on':''}" data-l="${k}">${l}</button>`).join('')}</div>
        <div class="center"><button class="kbtn b slim" type="button" id="blsay"><span class="em">🔊</span>الكلمة كلها</button></div>
        <div class="kopts c3">${opts.map(o=>`<button class="kopt" type="button" data-o="${o}">${P[o][1]}</button>`).join('')}</div>`,home);
        root.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ const k=+b.dataset.l; heard.add(k); say(SND[letters[k]]||letters[k],0.7); b.classList.add('on'); });
        root.querySelector('#blsay').onclick=()=>sayQ([letters.map(l=>SND[l]||l).join(' '),w]);
        root.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const o=+b.dataset.o;
          if(o===order[r]){ b.classList.add('right'); if(!miss){score++;addStars(1);} burst(); root.querySelectorAll('[data-o]').forEach(x=>x.disabled=true); sayQ([w,PRAISE[r%PRAISE.length]]); setTimeout(()=>{r++;q();},1500); }
          else { miss=true; missW(w); b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); setTimeout(()=>sayQ([w]),300); } }); };
      paint();
    }; q();
  }
  function endAct(em,score,total,again){
    render(`<div class="kcard"><span class="pic">${em}</span><b style="font-size:2rem">${n(score)} من ${n(total)}</b><b style="font-size:1.3rem">${score>=total*0.8?'ممتاز! برافو عليك':'كويس! يلا نلعب تاني'}</b></div>
      <div class="kbig"><button class="kbtn b" type="button" id="kagain">🔁 تاني</button><button class="kbtn a" type="button" id="khome">🏠 الرئيسية</button></div>`,home);
    burst(); say(score>=total*0.8?'Amazing!':'Well done!');
    root.querySelector('#kagain').onclick=again; root.querySelector('#khome').onclick=home;
  }
  /* chants */
  function chHome(){
    ks.ch=ks.ch||{};
    render(`<div class="kmsg">اختار نشيد واسمعه ورَدد وراه</div><div class="ktopics">${KX.ch.map((c,i)=>`<button class="ktile ${ks.ch[i]?'done':''}" type="button" data-c="${i}"><span class="em">${c.e}</span><b>${esc(c.t)}</b><small>${ks.ch[i]?'🎵 سمعته':n(c.l.length)+' سطور'}</small></button>`).join('')}</div>`,home);
    root.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>chant(+b.dataset.c));
  }
  function chant(ci){
    const c=KX.ch[ci]; let cur=-1, mode=null, timer=null;
    const stop=()=>{ mode=null; cur=-1; clearTimeout(timer); if(synth) synth.cancel(); };
    const paint=()=>{ render(`<div class="kcard"><span class="pic" style="font-size:4rem">${c.e}</span><b style="font-size:1.5rem">${esc(c.t)}</b></div>
      <div class="kbig"><button class="kbtn b" type="button" id="chplay"><span class="em">${mode==='play'?'⏹':'▶️'}</span>${mode==='play'?'وقف':'شغل النشيد'}</button><button class="kbtn c" type="button" id="chrep"><span class="em">${mode==='rep'?'⏹':'🔁'}</span>${mode==='rep'?'وقف':'ردد ورايا'}</button></div>
      <div class="chl">${c.l.map((l,k)=>`<button class="chline ${k===cur?'on':''}" type="button" data-k="${k}"><span class="em">${l[4]}</span><span class="tx"><span class="en" lang="en">${esc(l[0])}</span><small>${esc(l[1])}</small></span></button>`).join('')}</div>
      ${mode==='rep'&&cur>=0?'<div class="kmsg ok">دورك! قول السطر ده</div>':''}`,()=>{stop();chHome();});
      root.querySelector('#chplay').onclick=()=>{ if(mode==='play'){stop();paint();return;} stop(); mode='play'; run(0); };
      root.querySelector('#chrep').onclick=()=>{ if(mode==='rep'){stop();paint();return;} stop(); mode='rep'; run(0); };
      root.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ stop(); cur=+b.dataset.k; paint(); say(c.l[cur][0]); });
      const on=root.querySelector('.chline.on'); if(on) on.scrollIntoView({block:'nearest'}); };
    const run=k=>{ if(!mode) return; if(k>=c.l.length){ if(!ks.ch[ci]){ks.ch[ci]=1; addStars(2);} burst(); stop(); paint(); return; }
      cur=k; const m=mode; paint();
      if(!synth){ timer=setTimeout(()=>run(k+1),2500); return; }
      const u=new SpeechSynthesisUtterance(c.l[k][0]); u.lang='en-US'; if(v) u.voice=v; u.rate=small?0.75:0.85;
      u.onend=()=>{ if(mode!==m) return; timer=setTimeout(()=>run(k+1), m==='rep'?Math.max(2200,c.l[k][0].split(' ').length*650):350); };
      synth.cancel(); synth.speak(u); };
    paint();
  }
  /* picture stories */
  function psHome(){
    ks.ps=ks.ps||{};
    render(`<div class="kmsg">اختار حكاية</div><div class="ktopics">${KX.ps.map((s,i)=>`<button class="ktile ${ks.ps[i]?'done':''}" type="button" data-s="${i}"><span class="em">${s.e}</span><b>${esc(s.t)}</b><small>${ks.ps[i]?'⭐ قريتها':n(s.s.length)+' صور'}</small></button>`).join('')}</div>`,home);
    root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>pstory(+b.dataset.s,0));
  }
  function pstory(si,k){
    const s=KX.ps[si];
    if(k>=s.s.length){ const q=s.q; let miss=false;
      render(`<div class="kcard"><span class="pic" style="font-size:3.5rem">❓</span><b style="font-size:1.4rem">${esc(q[0])}</b></div><div class="kmsg" id="pmsg">اختار الإجابة</div>
        <div class="kopts c3">${q[1].map((o,j)=>`<button class="kopt" type="button" data-o="${j}">${o}</button>`).join('')}</div>`,()=>pstory(si,s.s.length-1));
      root.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const o=+b.dataset.o, m=root.querySelector('#pmsg');
        if(o===q[2]){ b.classList.add('right'); const first=!ks.ps[si]; ks.ps[si]=1; addStars(first?(miss?2:3):1); burst(); say('Great job!'); m.className='kmsg ok'; m.textContent='برافو! إجابة صح'; root.querySelectorAll('[data-o]').forEach(x=>x.disabled=true); setTimeout(psHome,1600); }
        else { miss=true; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); m.className='kmsg no'; m.textContent='حاول تاني'; } });
      return; }
    const sc=s.s[k];
    render(`<div class="dots">${s.s.map((_,j)=>`<i class="${j<=k?'on':''}"></i>`).join('')}</div>
      <div class="kcard"><span class="pic">${sc[0]}</span><span class="psen" lang="en">${esc(sc[1]).replace(/[A-Za-z']+/g,m=>`<span class="pw" data-w="${m}">${m}</span>`)}</span>${small?'':`<span class="pp">${esc(sc[3])}</span>`}<span class="m">${esc(sc[2])}</span></div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${k===0?'disabled':''} aria-label="اللي فات">→</button><button class="ksay" type="button" id="ksay" aria-label="اسمع">${SAYIC}</button><button class="arr" type="button" id="knext" aria-label="اللي بعده">${k===s.s.length-1?'✓':'←'}</button></div>`,psHome);
    root.querySelectorAll('.pw').forEach(w=>w.onclick=()=>say(w.dataset.w,0.7));
    const sp=()=>say(sc[1]); root.querySelector('#ksay').onclick=sp; setTimeout(sp,300);
    root.querySelector('#kprev').onclick=()=>pstory(si,k-1); root.querySelector('#knext').onclick=()=>pstory(si,k+1);
  }
