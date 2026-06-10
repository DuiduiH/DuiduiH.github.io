// ===== 1.2 Career — Elevator + interactive rooms =====
(function(){
  var floorsEl=document.getElementById('careerFloors');
  var elevatorCar=document.getElementById('elevatorCar');
  var elevatorFloorDisplay=document.getElementById('elevatorFloorDisplay');
  var room=document.getElementById('careerRoom');
  var scene=document.getElementById('careerScene');
  var hotspotsEl=document.getElementById('careerHotspots');
  var roomLabel=document.getElementById('careerRoomLabel');
  var floatTip=document.getElementById('careerFloatTip');
  var tipTitle=document.getElementById('careerTipTitle');
  var tipDesc=document.getElementById('careerTipDesc');
  var tipLink=document.getElementById('careerTipLink');
  if(!floorsEl||!room||!scene||!hotspotsEl) return;

  var DATA=(window.MODULE_DATA&&window.MODULE_DATA.careerFloors)||[];
  if(!DATA.length) return;

  var currentId=DATA[0].id;
  var floorIndex=0;
  var floorsSeen=new Set();
  var hotspotFloors=new Set();
  var doorsOpen=false;
  var elevatorBusy=false;
  var doorTimer=null;
  var moveTimer=null;
  var DOOR_MS=520;
  var MOVE_MS=540;
  var OPEN_HOLD_MS=1600;

  function checkCareerStar(){
    if(floorsSeen.size<DATA.length||hotspotFloors.size<DATA.length) return;
    window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'career',origin:room}}));
  }

  function lang(){return document.documentElement.lang==='en'?'en':'cn';}
  function pick(obj){var l=lang();return obj&&typeof obj==='object'?(obj[l]||obj.cn||obj.en):obj;}

  function setFloorBusy(on){
    floorsEl.querySelectorAll('.career-floor').forEach(function(el){
      el.classList.toggle('is-busy',on);
    });
  }

  function brandMark(id){
    if(id==='red'){
      return '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="5" y="5" width="26" height="26" rx="7" fill="none" stroke="var(--floor-accent)" stroke-width="1.8"/><path d="M11 13h14M11 18h10M11 23h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".8"/><circle cx="24" cy="23" r="2.2" fill="var(--floor-accent)"/></svg>';
    }
    if(id==='finance'){
      return '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 6l10 6v8L18 26 8 20v-8Z" fill="none" stroke="var(--floor-accent)" stroke-width="1.8"/><path d="M12 15h12M12 19h9" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".75"/></svg>';
    }
    return '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M10 24c0-8 3.5-14 8-14s8 6 8 14" fill="none" stroke="var(--floor-accent)" stroke-width="1.8"/><circle cx="18" cy="12" r="5" fill="none" stroke="var(--floor-accent)" stroke-width="1.6"/><path d="M14 10h8M18 7v6" stroke="var(--floor-accent)" stroke-width="1" stroke-linecap="round" opacity=".7"/></svg>';
  }

  function roomDefs(accent){
    return '<defs>'+
      '<linearGradient id="crBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--cr-sky)"/><stop offset="100%" stop-color="var(--cr-floor)"/></linearGradient>'+
      '<linearGradient id="crWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="color-mix(in srgb,var(--cr-screen) 80%,#fff)"/><stop offset="100%" stop-color="var(--cr-screen)"/></linearGradient>'+
      '<radialGradient id="crGlow" cx="50%" cy="35%"><stop offset="0%" stop-color="color-mix(in srgb,'+accent+' 16%,transparent)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'+
    '</defs>';
  }

  function monitorArt(id,accent,ox,oy){
    var x=ox+14;
    var y=oy+16;
    var tint='color-mix(in srgb,'+accent+' 22%,var(--cr-screen-hi))';
    var tint2='color-mix(in srgb,'+accent+' 12%,var(--cr-screen))';
    if(id==='campaign'||id==='report'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+10)+'" y="'+(y+12)+'" width="36" height="48" rx="8" fill="'+tint+'"/>'+
        '<rect x="'+(x+54)+'" y="'+(y+18)+'" width="52" height="8" rx="3" fill="'+tint2+'"/>'+
        '<rect x="'+(x+54)+'" y="'+(y+32)+'" width="44" height="8" rx="3" fill="'+tint2+'"/>'+
        '<rect x="'+(x+54)+'" y="'+(y+46)+'" width="36" height="8" rx="3" fill="'+tint2+'"/>'+
        '<circle cx="'+(x+28)+'" cy="'+(y+36)+'" r="10" fill="color-mix(in srgb,'+accent+' 35%,var(--cr-screen-hi))"/>';
    }
    if(id==='traffic'||id==='screen'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
        '<polyline points="'+(x+14)+','+(y+56)+' '+(x+34)+','+(y+32)+' '+(x+54)+','+(y+42)+' '+(x+74)+','+(y+20)+' '+(x+94)+','+(y+34)+'" fill="none" stroke="'+accent+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>'+
        '<rect x="'+(x+10)+'" y="'+(y+8)+'" width="28" height="18" rx="4" fill="'+tint+'"/>'+
        '<rect x="'+(x+44)+'" y="'+(y+8)+'" width="28" height="18" rx="4" fill="'+tint2+'"/>'+
        '<rect x="'+(x+78)+'" y="'+(y+8)+'" width="28" height="18" rx="4" fill="color-mix(in srgb,#38bdf8 14%,var(--cr-screen))"/>';
    }
    if(id==='community'||id==='deal'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
        '<circle cx="'+(x+28)+'" cy="'+(y+36)+'" r="14" fill="'+tint+'"/>'+
        '<circle cx="'+(x+64)+'" cy="'+(y+32)+'" r="12" fill="'+tint2+'"/>'+
        '<circle cx="'+(x+84)+'" cy="'+(y+46)+'" r="9" fill="color-mix(in srgb,#38bdf8 16%,var(--cr-screen))"/>'+
        '<path d="M'+(x+40)+' '+(y+36)+'h16M'+(x+48)+' '+(y+28)+'v16" stroke="'+accent+'" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>';
    }
    if(id==='biz'||id==='terminal'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="#0f172a"/>'+
        '<rect x="'+(x+8)+'" y="'+(y+8)+'" width="104" height="64" rx="4" fill="#1e293b"/>'+
        '<polyline points="'+(x+18)+','+(y+52)+' '+(x+34)+','+(y+36)+' '+(x+50)+','+(y+44)+' '+(x+66)+','+(y+28)+' '+(x+82)+','+(y+38)+' '+(x+98)+','+(y+24)+'" fill="none" stroke="'+accent+'" stroke-width="2.5" stroke-linecap="round"/>'+
        '<rect x="'+(x+18)+'" y="'+(y+16)+'" width="40" height="6" rx="2" fill="color-mix(in srgb,'+accent+' 40%,#334155)"/>';
    }
    if(id==='lab'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
        '<circle cx="'+(x+60)+'" cy="'+(y+36)+'" r="22" fill="none" stroke="'+accent+'" stroke-width="2" opacity=".55"/>'+
        '<ellipse cx="'+(x+60)+'" cy="'+(y+36)+'" rx="22" ry="9" fill="none" stroke="'+accent+'" stroke-width="1.2" opacity=".35"/>'+
        '<path d="M'+(x+20)+' '+(y+52)+' L'+(x+40)+' '+(y+22)+' L'+(x+60)+' '+(y+42)+' L'+(x+80)+' '+(y+26)+'" fill="none" stroke="color-mix(in srgb,#38bdf8 70%,'+accent+')" stroke-width="2.5" stroke-linecap="round"/>'+
        '<circle cx="'+(x+40)+'" cy="'+(y+22)+'" r="4" fill="'+accent+'"/><circle cx="'+(x+60)+'" cy="'+(y+42)+'" r="4" fill="'+accent+'"/>';
    }
    if(id==='rhino'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="#0f172a"/>'+
        '<path d="M'+(x+14)+' '+(y+54)+' L'+(x+34)+' '+(y+18)+' L'+(x+54)+' '+(y+36)+' L'+(x+74)+' '+(y+14)+' L'+(x+94)+' '+(y+40)+'" fill="none" stroke="color-mix(in srgb,#a78bfa 80%,'+accent+')" stroke-width="3" stroke-linecap="round"/>'+
        '<path d="M'+(x+18)+' '+(y+32)+' Q'+(x+60)+' '+(y+8)+' '+(x+102)+' '+(y+32)+'" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="5 4" opacity=".45"/>';
    }
    if(id==='annotation'){
      return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+14)+'" y="'+(y+14)+'" width="44" height="44" rx="4" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<circle cx="'+(x+28)+'" cy="'+(y+28)+'" r="5" fill="'+accent+'" opacity=".5"/><circle cx="'+(x+44)+'" cy="'+(y+42)+'" r="4" fill="#38bdf8" opacity=".45"/>'+
        '<rect x="'+(x+64)+'" y="'+(y+18)+'" width="36" height="48" rx="4" fill="'+tint+'"/>'+
        '<rect x="'+(x+70)+'" y="'+(y+26)+'" width="24" height="5" rx="2" fill="'+tint2+'"/><rect x="'+(x+70)+'" y="'+(y+36)+'" width="18" height="5" rx="2" fill="'+tint2+'"/>';
    }
    return '<rect x="'+x+'" y="'+y+'" width="120" height="80" rx="6" fill="var(--cr-screen)"/>'+
      '<rect x="'+(x+14)+'" y="'+(y+16)+'" width="92" height="10" rx="3" fill="'+tint+'"/>'+
      '<rect x="'+(x+14)+'" y="'+(y+34)+'" width="72" height="10" rx="3" fill="'+tint2+'"/>'+
      '<rect x="'+(x+14)+'" y="'+(y+52)+'" width="52" height="10" rx="3" fill="'+tint2+'"/>';
  }

  function workspaceSvg(accent,objIds){
    var monitors=objIds.map(function(id,i){
      var mx=[88,268,448,628][i];
      var my=132;
      return '<g class="career-obj" data-obj="'+id+'">'+
        '<rect x="'+(mx-6)+'" y="'+(my-8)+'" width="160" height="128" rx="10" fill="var(--cr-panel)" stroke="var(--cr-stroke)" stroke-width="1.2"/>'+
        '<rect x="'+mx+'" y="'+my+'" width="148" height="96" rx="6" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        monitorArt(id,accent,mx,my)+
        '<rect x="'+(mx+54)+'" y="'+(my+96)+'" width="40" height="10" rx="3" fill="var(--cr-panel)" stroke="var(--cr-stroke)"/>'+
      '</g>';
    }).join('');

    return '<svg viewBox="0 0 900 560" aria-hidden="true">'+roomDefs(accent)+
      '<rect width="900" height="560" fill="url(#crBg)"/>'+
      '<rect width="900" height="560" fill="url(#crGlow)"/>'+
      '<rect x="0" y="400" width="900" height="160" fill="var(--cr-floor)"/>'+
      '<rect x="48" y="48" width="120" height="64" rx="8" fill="url(#crWin)" stroke="var(--cr-stroke)" opacity=".85"/>'+
      '<rect x="732" y="44" width="120" height="64" rx="8" fill="url(#crWin)" stroke="var(--cr-stroke)" opacity=".85"/>'+
      monitors+
      '<rect x="120" y="338" width="660" height="22" rx="8" fill="var(--cr-desk)" stroke="var(--cr-stroke)"/>'+
      '<rect x="160" y="356" width="580" height="12" rx="4" fill="color-mix(in srgb,var(--cr-desk) 80%,#000)"/>'+
      '<ellipse cx="450" cy="430" rx="72" ry="52" fill="color-mix(in srgb,'+accent+' 8%,var(--cr-panel))" stroke="var(--cr-stroke)"/>'+
      '<circle cx="450" cy="362" r="28" fill="color-mix(in srgb,var(--cr-panel) 90%,var(--text))" stroke="var(--cr-stroke)"/>'+
      '<path d="M422 350 C430 328 470 328 478 350" fill="color-mix(in srgb,var(--text) 18%,var(--cr-panel))"/>'+
      '<ellipse cx="450" cy="468" rx="88" ry="24" fill="color-mix(in srgb,var(--cr-desk) 70%,transparent)" opacity=".55"/>'+
      '</svg>';
  }

  function roomSvg(id){
    if(id==='red') return workspaceSvg('#ef4444',['campaign','traffic','community','biz']);
    if(id==='finance') return workspaceSvg('#f59e0b',['report','screen','deal','terminal']);
    return workspaceSvg('#8b5cf6',['lab','rhino','annotation','release']);
  }

  function setObjHighlight(id){
    scene.querySelectorAll('.career-obj').forEach(function(g){
      g.classList.toggle('is-active',g.dataset.obj===id);
    });
  }

  function clearObjHighlight(){
    scene.querySelectorAll('.career-obj').forEach(function(g){g.classList.remove('is-active');});
  }

  function setDoors(open){
    if(!elevatorCar) return;
    doorsOpen=!!open;
    elevatorCar.classList.toggle('doors-open',doorsOpen);
  }

  function closeDoors(cb){
    clearTimeout(doorTimer);
    if(!doorsOpen){if(cb) cb();return;}
    setDoors(false);
    setTimeout(function(){if(cb) cb();},DOOR_MS);
  }

  function openDoors(cb){
    clearTimeout(doorTimer);
    setDoors(true);
    doorTimer=setTimeout(function(){
      closeDoors(function(){
        elevatorBusy=false;
        setFloorBusy(false);
        if(cb) cb();
      });
    },OPEN_HOLD_MS);
  }

  function hideTip(){
    if(floatTip){
      floatTip.classList.remove('show','has-link');
      floatTip.hidden=true;
    }
    if(tipLink){
      tipLink.hidden=true;
      tipLink.setAttribute('hidden','');
      tipLink.textContent='';
      tipLink.removeAttribute('href');
    }
    clearObjHighlight();
    hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.remove('active');});
  }

  function showTip(hotspot,anchor){
    hotspotFloors.add(currentId);
    checkCareerStar();
    setObjHighlight(hotspot.id);
    if(!floatTip||!tipTitle||!tipDesc) return;
    tipTitle.textContent=pick(hotspot.title);
    tipDesc.textContent=pick(hotspot.desc);
    var hasLink=hotspot.id==='lab'&&!!hotspot.url;
    if(tipLink){
      if(hasLink){
        tipLink.href=hotspot.url;
        tipLink.textContent=pick(hotspot.linkText)||(lang()==='en'
          ?'This is a really interesting company — tap the link to explore.'
          :'这也是一家很有趣的公司，点击链接来了解一下吧。');
        tipLink.hidden=false;
        tipLink.removeAttribute('hidden');
      }else{
        tipLink.hidden=true;
        tipLink.setAttribute('hidden','');
        tipLink.textContent='';
        tipLink.removeAttribute('href');
      }
    }
    floatTip.hidden=false;
    floatTip.classList.toggle('has-link',hasLink);
    floatTip.classList.add('show');
    if(anchor){
      var ax=Math.min(82,Math.max(18,anchor.x||50));
      var ay=Math.min(70,Math.max(22,anchor.y||50));
      floatTip.style.left=ax+'%';
      floatTip.style.top=ay+'%';
      floatTip.style.transform='translate(-50%, calc(-100% - 10px))';
    }
  }

  function applyRoomContent(item){
    currentId=item.id;
    floorsSeen.add(item.id);
    hideTip();
    room.style.setProperty('--floor-accent',item.accent);
    room.style.color=item.accent;
    if(roomLabel) roomLabel.textContent=pick(item.roomLabel);
    if(elevatorFloorDisplay) elevatorFloorDisplay.textContent=item.floor;
    scene.innerHTML=roomSvg(item.id);
    hotspotsEl.innerHTML='';
    item.hotspots.forEach(function(hotspot){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='career-hotspot';
      btn.dataset.id=hotspot.id;
      btn.dataset.label=pick(hotspot.title);
      btn.style.setProperty('--x',hotspot.x);
      btn.style.setProperty('--y',hotspot.y);
      if(hotspot.w) btn.style.setProperty('--w',hotspot.w);
      if(hotspot.h) btn.style.setProperty('--h',hotspot.h);
      btn.setAttribute('aria-label',pick(hotspot.title));
      btn.addEventListener('mouseenter',function(){
        if(elevatorBusy) return;
        hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.toggle('active',el===btn);});
        showTip(hotspot,{x:parseFloat(hotspot.x),y:parseFloat(hotspot.y)});
      });
      btn.addEventListener('focus',function(){
        if(!elevatorBusy) showTip(hotspot,{x:parseFloat(hotspot.x),y:parseFloat(hotspot.y)});
      });
      btn.addEventListener('mouseleave',function(e){
        btn.classList.remove('active');
        if(floatTip&&floatTip.contains(e.relatedTarget)) return;
        hideTip();
      });
      btn.addEventListener('blur',hideTip);
      hotspotsEl.appendChild(btn);
    });
    floorsEl.querySelectorAll('.career-floor').forEach(function(el){
      el.classList.toggle('active',el.dataset.id===item.id);
    });
  }

  function updateElevatorCar(pos,item){
    if(!elevatorCar) return;
    elevatorCar.dataset.pos=String(pos);
    elevatorCar.style.setProperty('--floor-accent',item.accent);
    if(elevatorFloorDisplay) elevatorFloorDisplay.textContent=item.floor;
  }

  function travelToFloor(id,idx){
    if(elevatorBusy) return;
    var item=DATA.find(function(x){return x.id===id;})||DATA[0];
    var pos=typeof idx==='number'?idx:DATA.findIndex(function(x){return x.id===item.id;});
    if(pos<0) pos=0;

    if(id===currentId&&!doorsOpen){
      elevatorBusy=true;
      setFloorBusy(true);
      applyRoomContent(item);
      openDoors();
      return;
    }
    if(id===currentId) return;

    elevatorBusy=true;
    setFloorBusy(true);
    hideTip();

    closeDoors(function(){
      updateElevatorCar(pos,item);
      floorIndex=pos;
      clearTimeout(moveTimer);
      moveTimer=setTimeout(function(){
        applyRoomContent(item);
        openDoors();
      },MOVE_MS);
    });
  }

  function renderFloors(){
    floorsEl.innerHTML='';
    DATA.forEach(function(item,idx){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='career-floor';
      btn.dataset.id=item.id;
      btn.style.setProperty('--floor-accent',item.accent);
      btn.setAttribute('aria-label',pick(item.label));
      btn.innerHTML='<span class="floor-num">'+item.floor+'</span><span class="floor-mark">'+brandMark(item.id)+'</span>';
      btn.addEventListener('click',function(){
        travelToFloor(item.id,idx);
      });
      floorsEl.appendChild(btn);
    });
  }

  window._renderCareer=function(){
    floorsSeen=new Set();
    hotspotFloors=new Set();
    elevatorBusy=false;
    doorsOpen=false;
    clearTimeout(doorTimer);
    clearTimeout(moveTimer);
    setDoors(false);
    setFloorBusy(false);
    renderFloors();
    var item=DATA[floorIndex]||DATA[0];
    applyRoomContent(item);
    updateElevatorCar(floorIndex,item);
    setTimeout(function(){
      if(!elevatorBusy) travelToFloor(item.id,floorIndex);
    },500);
  };

  room.addEventListener('mouseleave',function(e){
    if(floatTip&&floatTip.contains(e.relatedTarget)) return;
    hideTip();
  });
  if(floatTip){
    floatTip.addEventListener('mouseleave',function(e){
      if(e.relatedTarget&&room.contains(e.relatedTarget)) return;
      hideTip();
    });
  }
  if(tipLink){
    tipLink.addEventListener('click',function(e){e.stopPropagation();});
  }

  renderFloors();
  applyRoomContent(DATA[0]);
  updateElevatorCar(0,DATA[0]);
  setTimeout(function(){travelToFloor(DATA[0].id,0);},600);
})();
