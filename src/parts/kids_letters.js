  /* ---------- kids: sleeping letters & letter teams ---------- */
  const KS=(D.snd&&D.snd.ks)||[], KDG=(D.snd&&D.snd.kd)||[];
  const zzW=(w,idx)=>{ const s=new Set(idx); return [...w].map((c,k)=>s.has(k)?`<span class="zz">${esc(c)}<i>💤</i></span>`:esc(c)).join(''); };
  function kSilMenu(){
    render(`<span hidden data-ar="فيه حروف بتتكتب بس نايمة، يعني مبننطقهاش. اختار اتعلم أو العب"></span>
      <div class="kcard"><span class="pic" style="font-size:4rem">🤫</span><b style="font-size:1.4rem">الحروف النايمة</b><span class="m">حروف بنكتبها بس مبنقولهاش</span><span class="w" lang="en" dir="ltr">${zzW('knife',[0])}</span></div>
      <div class="kbig"><button class="kbtn a" type="button" id="zl"><span class="em">📖</span>اتعلم</button><button class="kbtn b" type="button" id="zg"><span class="em">🎮</span>لاقي الحرف النايم</button></div>`,home);
    root.querySelector('#zl').onclick=()=>kSil(0); root.querySelector('#zg').onclick=kSilGame;
  }
  function kSil(k){
    const it=KS[k]; ks.zs=ks.zs||[]; if(!ks.zs.includes(k)){ ks.zs.push(k); addStars(1); }
    render(`<span hidden data-ar="الحرف اللي عليه نوم ده نايم، مبنقولوش. اسمع الكلمة"></span><div class="dots">${KS.map((_,j)=>`<i class="${j<=k?'on':''}"></i>`).join('')}</div>
      <div class="kcard"><span class="pic">${it[2]}</span><span class="w zw" lang="en" dir="ltr">${zzW(it[0],it[1])}</span>${small?'':`<span class="pp">${esc(it[4])}</span>`}<span class="m">${esc(it[3])}</span><span class="m sub">الحرف ${esc(it[1].map(i=>it[0][i]).join(''))} نايم 😴</span></div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${k===0?'disabled':''} aria-label="اللي فات">→</button><button class="ksay" type="button" id="ksay" aria-label="اسمع">${SAYIC}</button><button class="arr" type="button" id="knext" aria-label="اللي بعده">${k===KS.length-1?'✓':'←'}</button></div>
      <div class="center">${recBtn(it[0])}</div>`,kSilMenu);
    const sp=()=>say(it[0]); root.querySelector('#ksay').onclick=sp; setTimeout(sp,300);
    root.querySelector('#kprev').onclick=()=>kSil(k-1); root.querySelector('#knext').onclick=()=>k<KS.length-1?kSil(k+1):kSilGame();
  }
  function kSilGame(){
    const order=shuffle(KS.map((_,j)=>j)).slice(0,6); let r=0, score=0;
    const q=()=>{ if(r>=order.length) return endAct('🤫',score,order.length,kSilGame);
      const it=KS[order[r]]; let miss=false;
      render(`<div class="dots">${order.map((_,j)=>`<i class="${j<r?'on':''}"></i>`).join('')}</div>
        <div class="kcard"><span class="pic">${it[2]}</span><span class="m">${esc(it[3])}</span></div>
        <div class="kmsg" id="zmsg">دوس على الحرف النايم</div>
        <div class="bltiles">${[...it[0]].map((c,k)=>`<button type="button" data-z="${k}">${esc(c)}</button>`).join('')}</div>`,kSilMenu);
      setTimeout(()=>say(it[0]),300);
      root.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{ const k=+b.dataset.z, m=root.querySelector('#zmsg');
        if(it[1].includes(k)){ root.querySelectorAll('[data-z]').forEach(x=>{ x.disabled=true; if(it[1].includes(+x.dataset.z)) x.classList.add('on','zzb'); });
          if(!miss){score++;addStars(1);} burst(); m.className='kmsg ok'; m.textContent='صح! الحرف ده نايم 😴'; say(it[0]); setTimeout(()=>{r++;q();},1700); }
        else { if(!miss) missW(it[0]); miss=true; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); m.className='kmsg no'; m.textContent='الحرف ده صاحي، بنقوله. دور تاني'; } });
    }; q();
  }
  function kDgMenu(){
    ks.dg=ks.dg||{};
    render(`<span hidden data-ar="ساعات حرفين يمسكوا إيد بعض ويقولوا صوت واحد. اختار حرفين"></span>
      <div class="kmsg">حرفين بيمسكوا إيد بعض ويقولوا صوت واحد</div>
      <div class="center"><button class="kbtn b slim" type="button" id="dgg"><span class="em">🎮</span>العب</button></div>
      <div class="lgrid">${KDG.map((g,i)=>`<button class="lt ${ks.dg[i]?'done':''}" type="button" data-d="${i}"><b>${esc(g.p)}</b><span>${g.w[0][1]}</span></button>`).join('')}</div>`,home);
    root.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>kDg(+b.dataset.d)); root.querySelector('#dgg').onclick=kDgGame;
  }
  function kDg(i){
    const g=KDG[i]; if(!ks.dg[i]){ ks.dg[i]=1; addStars(1); }
    const hl=w=>{ const at=w.indexOf(g.p); return at<0?esc(w):esc(w.slice(0,at))+`<b class="dgl">${esc(g.p)}</b>`+esc(w.slice(at+g.p.length)); };
    render(`<span hidden data-ar="الحرفين دول مع بعض بيقولوا ${esc(g.s)}. دوس على كل صورة واسمع"></span>
      <div class="kcard"><span class="letter big2" dir="ltr">${esc(g.p)}</span><span class="m">صوتهم: ${esc(g.s)}</span></div>
      <div class="kopts c3">${g.w.map((w,k)=>`<button class="kopt" type="button" data-w="${k}">${w[1]}<small dir="ltr">${hl(w[0])}</small></button>`).join('')}</div>
      <div class="knav"><button class="arr" type="button" id="kprev" ${i===0?'disabled':''} aria-label="اللي فات">→</button><button class="ksay" type="button" id="ksay" aria-label="اسمع">${SAYIC}</button><button class="arr" type="button" id="knext" ${i===KDG.length-1?'disabled':''} aria-label="اللي بعده">←</button></div>`,kDgMenu);
    root.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>say(g.w[+b.dataset.w][0]));
    const sp=()=>sayQ(g.w.map(w=>w[0])); root.querySelector('#ksay').onclick=sp; setTimeout(sp,350);
    root.querySelector('#kprev').onclick=()=>kDg(i-1); root.querySelector('#knext').onclick=()=>kDg(i+1);
  }
  function kDgGame(){
    const all=KDG.flatMap((g,i)=>g.w.map(w=>({w,i}))); const order=shuffle(all.slice()).slice(0,6); let r=0, score=0;
    const q=()=>{ if(r>=order.length) return endAct('👯',score,order.length,kDgGame);
      const it=order[r], g=KDG[it.i]; let miss=false;
      const opts=shuffle([it.i,...shuffle(KDG.map((_,j)=>j).filter(j=>j!==it.i)).slice(0,2)]);
      const masked=it.w[0].replace(g.p,'__');
      render(`<div class="dots">${order.map((_,j)=>`<i class="${j<r?'on':''}"></i>`).join('')}</div>
        <div class="kcard"><span class="pic">${it.w[1]}</span><span class="w" lang="en" dir="ltr" id="dgw">${esc(masked)}</span></div>
        <div class="kmsg" id="dmsg">اسمع واختار الحرفين الناقصين</div>
        <div class="kopts c3">${opts.map(o=>`<button class="kopt dgo" type="button" data-o="${o}">${esc(KDG[o].p)}</button>`).join('')}</div>`,kDgMenu);
      setTimeout(()=>say(it.w[0]),300);
      root.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{ const o=+b.dataset.o, m=root.querySelector('#dmsg');
        if(o===it.i){ b.classList.add('right'); root.querySelector('#dgw').innerHTML=esc(it.w[0]).replace(esc(g.p),`<b class="dgl">${esc(g.p)}</b>`); if(!miss){score++;addStars(1);} burst(); m.className='kmsg ok'; m.textContent='برافو!'; say(it.w[0]); root.querySelectorAll('[data-o]').forEach(x=>x.disabled=true); setTimeout(()=>{r++;q();},1500); }
        else { if(!miss) missW(it.w[0]); miss=true; b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong'); m.className='kmsg no'; m.textContent='حاول تاني'; setTimeout(()=>say(it.w[0]),300); } });
    }; q();
  }
