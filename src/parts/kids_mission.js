  /* ---------- daily mission, sticker album, movement game ---------- */
  const STK=KX.stk||[], MV=KX.mv||[];
  const MTYPES={learn:['📖','اتعلم ٥ كلمات',5],game:['🎮','العب لعبة',1],listen:['🎵','اسمع نشيد أو حكاية',1],letters:['🔤','اتعلم ٣ حروف',3],move:['🤸','العب لعبة الحركة',1]};
  function mission(){ const d=today(); if(!ks.ms||ks.ms.d!==d){ const keys=Object.keys(MTYPES); const pick=[keys[d%5],keys[(d+2)%5],keys[(d+4)%5]]; ks.ms={d,t:pick,c:{},got:false}; ksave(); } return ks.ms; }
  function missionHit(type,inc){ const m=mission(); if(!m.t.includes(type)) return; m.c[type]=(m.c[type]||0)+(inc||1); 
    if(!m.got&&m.t.every(k=>(m.c[k]||0)>=MTYPES[k][2])){ m.got=true; ks.alb=ks.alb||[]; const nx=STK.find(s=>!ks.alb.includes(s))||STK[Math.floor(Math.random()*STK.length)]; ks.alb.push(nx); m.st=nx; addStars(3); setTimeout(()=>{ burst(); toastMsg('🎉 خلصت مهمة النهاردة! خدت ملصق '+nx); sayAr('برافو! خلصت مهمة النهاردة وخدت ملصق جديد'); },400); }
    ksave(); }
  function missionCard(){ const m=mission();
    return `<div class="mission ${m.got?'got':''}"><div class="mh"><b>🎯 مهمة النهاردة</b>${m.got?`<span>خلصتها! ملصقك ${m.st||''}</span>`:''}</div>
      ${m.t.map(k=>{const [e,t,need]=MTYPES[k], c=Math.min(m.c[k]||0,need); return `<button class="mrow ${c>=need?'ok':''}" type="button" data-m="${k}"><span class="em">${c>=need?'✅':e}</span><span class="tt">${t}</span><span class="cnt">${n(c)}/${n(need)}</span></button>`}).join('')}
      <button class="kback" type="button" id="kalb">📒 ألبومي: ${n((ks.alb||[]).length)} ملصق</button></div>`; }
  function goMission(k){ const nextT=Math.max(0,K.findIndex((_,i)=>!ks.badges[i]));
    ({learn:()=>learn(nextT,0),game:()=>topic(nextT),listen:()=>(today()%2?psHome():chHome()),letters:()=>phHome(false),move:moveGame})[k](); }
  function album(){ const a=ks.alb||[];
    render(`<span hidden data-ar="ده ألبوم الملصقات بتاعك. كل يوم تخلص المهمة تاخد ملصق جديد"></span><div class="kmsg">📒 عندك ${n(a.length)} من ${n(STK.length)} ملصق</div>
      <div class="album">${STK.map(s=>`<span class="stk ${a.includes(s)?'':'no'}">${a.includes(s)?s:'❔'}</span>`).join('')}</div>`,home); }
  function moveGame(){
    const order=shuffle(MV.map((_,j)=>j)).slice(0,6); let r=0, tm=null;
    const q=()=>{ clearTimeout(tm); if(r>=order.length){ missionHit('move'); return endAct('🤸',order.length,order.length,moveGame); }
      const m=MV[order[r]]; let shown=small;
      const paint=()=>{ render(`<span hidden data-ar="اسمع الأمر واعمل الحركة"></span><div class="dots">${order.map((_,j)=>`<i class="${j<r?'on':''}"></i>`).join('')}</div>
        <div class="kcard mvcard"><span class="pic">${shown?m[2]:'👂'}</span><span class="w" lang="en" dir="ltr">${esc(m[0])}</span>${shown?`<span class="m">${esc(m[1])}</span>`:'<span class="m">اسمع واعمل الحركة!</span>'}</div>
        <div class="mvbar"><i id="mvb"></i></div>
        <div class="kbig"><button class="kbtn c" type="button" id="mvr"><span class="em">🔁</span>اسمع تاني</button><button class="kbtn b" type="button" id="mvn"><span class="em">✅</span>عملتها!</button></div>`,()=>{clearTimeout(tm);home();});
        root.querySelector('#mvr').onclick=()=>sayQ([m[0]]); root.querySelector('#mvn').onclick=()=>{ addStars(1); burst(); say(PRAISE[r%PRAISE.length]); r++; setTimeout(q,900); }; };
      paint(); setTimeout(()=>sayQ([m[0],m[0]]),350);
      if(!shown) tm=setTimeout(()=>{ shown=true; paint(); },3500);
      requestAnimationFrame(()=>{ const b=root.querySelector('#mvb'); if(b){ b.style.transition='width 8s linear'; requestAnimationFrame(()=>b.style.width='100%'); } });
    }; q();
  }
