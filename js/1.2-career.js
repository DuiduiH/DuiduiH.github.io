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
  var resizeTimer=null;
  var DOOR_MS=520;
  var MOVE_MS=540;
  var OPEN_HOLD_MS=1600;

  var LAYOUT_DESKTOP=[
    {x:'14%',y:'34%',w:'14%',h:'26%'},
    {x:'35%',y:'34%',w:'14%',h:'26%'},
    {x:'56%',y:'34%',w:'14%',h:'26%'},
    {x:'77%',y:'34%',w:'14%',h:'26%'}
  ];
  var LAYOUT_MOBILE=[
    {x:'26%',y:'22%',w:'22%',h:'18%'},
    {x:'74%',y:'22%',w:'22%',h:'18%'},
    {x:'26%',y:'48%',w:'22%',h:'18%'},
    {x:'74%',y:'48%',w:'22%',h:'18%'}
  ];

  function isMobileLayout(){
    return window.matchMedia('(max-width:600px)').matches;
  }

  function hotspotLayout(){
    return isMobileLayout()?LAYOUT_MOBILE:LAYOUT_DESKTOP;
  }

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

  function monitorArt(id,accent,ox,oy,mw,mh){
    var x=ox+10;
    var y=oy+12;
    var w=mw-20;
    var h=mh-24;
    var tint='color-mix(in srgb,'+accent+' 22%,var(--cr-screen-hi))';
    var tint2='color-mix(in srgb,'+accent+' 12%,var(--cr-screen))';
    if(id==='campaign'||id==='report'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.12)+'" width="'+(w*0.28)+'" height="'+(h*0.55)+'" rx="6" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.42)+'" y="'+(y+h*0.18)+'" width="'+(w*0.48)+'" height="'+(h*0.1)+'" rx="2" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.42)+'" y="'+(y+h*0.34)+'" width="'+(w*0.38)+'" height="'+(h*0.1)+'" rx="2" fill="'+tint2+'"/>'+
        '<circle cx="'+(x+w*0.22)+'" cy="'+(y+h*0.52)+'" r="'+(h*0.12)+'" fill="color-mix(in srgb,'+accent+' 35%,var(--cr-screen-hi))"/>';
    }
    if(id==='traffic'||id==='screen'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
        '<polyline points="'+(x+w*0.08)+','+(y+h*0.78)+' '+(x+w*0.28)+','+(y+h*0.42)+' '+(x+w*0.48)+','+(y+h*0.55)+' '+(x+w*0.68)+','+(y+h*0.28)+' '+(x+w*0.88)+','+(y+h*0.48)+'" fill="none" stroke="'+accent+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.1)+'" width="'+(w*0.22)+'" height="'+(h*0.2)+'" rx="3" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.34)+'" y="'+(y+h*0.1)+'" width="'+(w*0.22)+'" height="'+(h*0.2)+'" rx="3" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.6)+'" y="'+(y+h*0.1)+'" width="'+(w*0.22)+'" height="'+(h*0.2)+'" rx="3" fill="color-mix(in srgb,#38bdf8 14%,var(--cr-screen))"/>';
    }
    if(id==='community'||id==='deal'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
        '<circle cx="'+(x+w*0.28)+'" cy="'+(y+h*0.5)+'" r="'+(h*0.18)+'" fill="'+tint+'"/>'+
        '<circle cx="'+(x+w*0.58)+'" cy="'+(y+h*0.44)+'" r="'+(h*0.15)+'" fill="'+tint2+'"/>'+
        '<circle cx="'+(x+w*0.78)+'" cy="'+(y+h*0.62)+'" r="'+(h*0.11)+'" fill="color-mix(in srgb,#38bdf8 16%,var(--cr-screen))"/>';
    }
    if(id==='biz'||id==='terminal'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#0f172a"/>'+
        '<rect x="'+(x+w*0.06)+'" y="'+(y+h*0.1)+'" width="'+(w*0.88)+'" height="'+(h*0.78)+'" rx="3" fill="#1e293b"/>'+
        '<polyline points="'+(x+w*0.1)+','+(y+h*0.72)+' '+(x+w*0.28)+','+(y+h*0.48)+' '+(x+w*0.46)+','+(y+h*0.58)+' '+(x+w*0.64)+','+(y+h*0.38)+' '+(x+w*0.82)+','+(y+h*0.52)+'" fill="none" stroke="'+accent+'" stroke-width="2.2" stroke-linecap="round"/>';
    }
    if(id==='lab'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
        '<circle cx="'+(x+w*0.55)+'" cy="'+(y+h*0.48)+'" r="'+(h*0.28)+'" fill="none" stroke="'+accent+'" stroke-width="1.8" opacity=".55"/>'+
        '<path d="M'+(x+w*0.15)+' '+(y+h*0.72)+' L'+(x+w*0.35)+' '+(y+h*0.28)+' L'+(x+w*0.55)+' '+(y+h*0.52)+' L'+(x+w*0.75)+' '+(y+h*0.32)+'" fill="none" stroke="color-mix(in srgb,#38bdf8 70%,'+accent+')" stroke-width="2.2" stroke-linecap="round"/>';
    }
    if(id==='rhino'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="#0f172a"/>'+
        '<path d="M'+(x+w*0.1)+' '+(y+h*0.75)+' L'+(x+w*0.3)+' '+(y+h*0.25)+' L'+(x+w*0.5)+' '+(y+h*0.48)+' L'+(x+w*0.7)+' '+(y+h*0.2)+' L'+(x+w*0.9)+' '+(y+h*0.62)+'" fill="none" stroke="color-mix(in srgb,#a78bfa 80%,'+accent+')" stroke-width="2.5" stroke-linecap="round"/>';
    }
    if(id==='annotation'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.16)+'" width="'+(w*0.34)+'" height="'+(w*0.34)+'" rx="3" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<circle cx="'+(x+w*0.2)+'" cy="'+(y+h*0.32)+'" r="4" fill="'+accent+'" opacity=".5"/>'+
        '<rect x="'+(x+w*0.52)+'" y="'+(y+h*0.18)+'" width="'+(w*0.32)+'" height="'+(h*0.58)+'" rx="3" fill="'+tint+'"/>';
    }
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="5" fill="var(--cr-screen)"/>'+
      '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.2)+'" width="'+(w*0.8)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint+'"/>'+
      '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.4)+'" width="'+(w*0.62)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint2+'"/>';
  }

  function monitorSlots(mobile){
    if(mobile){
      return [
        {mx:108,my:36,mw:124,mh:84},
        {mx:668,my:36,mw:124,mh:84},
        {mx:108,my:188,mw:124,mh:84},
        {mx:668,my:188,mw:124,mh:84}
      ];
    }
    return [
      {mx:48,my:112,mw:124,mh:84},
      {mx:268,my:112,mw:124,mh:84},
      {mx:488,my:112,mw:124,mh:84},
      {mx:708,my:112,mw:124,mh:84}
    ];
  }

  function personSvg(accent,mobile){
    var cy=mobile?388:352;
    var skin='color-mix(in srgb,var(--text) 5%,#f3ddc8)';
    var hair='color-mix(in srgb,var(--text) 32%,#4a3728)';
    var shirt='color-mix(in srgb,'+accent+' 12%,var(--cr-panel))';
    return '<g class="career-person">'+
      '<ellipse cx="450" cy="'+(cy+98)+'" rx="96" ry="20" fill="color-mix(in srgb,var(--cr-desk) 50%,transparent)" opacity=".45"/>'+
      '<path d="M388 '+(cy+62)+' Q388 '+(cy+18)+' 418 '+(cy+8)+' L482 '+(cy+8)+' Q512 '+(cy+18)+' 512 '+(cy+62)+' L506 '+(cy+88)+' L394 '+(cy+88)+' Z" fill="color-mix(in srgb,var(--text) 14%,var(--cr-panel))" stroke="var(--cr-stroke)" stroke-width="1.2"/>'+
      '<rect x="404" y="'+(cy+62)+'" width="92" height="28" rx="8" fill="color-mix(in srgb,var(--text) 10%,var(--cr-panel))" stroke="var(--cr-stroke)"/>'+
      '<ellipse cx="450" cy="'+(cy+18)+'" rx="58" ry="24" fill="'+shirt+'" stroke="var(--cr-stroke)" stroke-width="1.2"/>'+
      '<path d="M408 '+(cy+22)+' Q450 '+(cy+4)+' 492 '+(cy+22)+' L498 '+(cy+58)+' Q450 '+(cy+68)+' 402 '+(cy+58)+' Z" fill="'+shirt+'" stroke="var(--cr-stroke)" stroke-width="1.1"/>'+
      '<rect x="440" y="'+(cy-8)+'" width="20" height="22" rx="5" fill="'+skin+'" stroke="var(--cr-stroke)"/>'+
      '<circle cx="450" cy="'+(cy-34)+'" r="28" fill="'+skin+'" stroke="var(--cr-stroke)" stroke-width="1.2"/>'+
      '<path d="M424 '+(cy-44)+' Q450 '+(cy-68)+' 476 '+(cy-44)+' Q484 '+(cy-26)+' 476 '+(cy-16)+' Q450 '+(cy-10)+' 424 '+(cy-16)+' Q416 '+(cy-26)+' 424 '+(cy-44)+' Z" fill="'+hair+'"/>'+
      '<path d="M402 '+(cy+20)+' Q376 '+(cy+42)+' 382 '+(cy+62)+' L398 '+(cy+56)+' Q392 '+(cy+38)+' 408 '+(cy+24)+' Z" fill="'+skin+'" stroke="var(--cr-stroke)"/>'+
      '<path d="M498 '+(cy+20)+' Q524 '+(cy+42)+' 518 '+(cy+62)+' L502 '+(cy+56)+' Q508 '+(cy+38)+' 492 '+(cy+24)+' Z" fill="'+skin+'" stroke="var(--cr-stroke)"/>'+
      '<ellipse cx="438" cy="'+(cy-36)+'" rx="4" ry="3" fill="color-mix(in srgb,var(--text) 20%,#c9a88a)"/>'+
      '<ellipse cx="462" cy="'+(cy-36)+'" rx="4" ry="3" fill="color-mix(in srgb,var(--text) 20%,#c9a88a)"/>'+
    '</g>';
  }

  function workspaceSvg(accent,objIds){
    var mobile=isMobileLayout();
    var slots=monitorSlots(mobile);
    var deskY=mobile?268:248;
    var monitors=objIds.map(function(id,i){
      var s=slots[i]||slots[0];
      var mx=s.mx,my=s.my,mw=s.mw,mh=s.mh;
      return '<g class="career-obj" data-obj="'+id+'">'+
        '<rect x="'+(mx-4)+'" y="'+(my-6)+'" width="'+(mw+8)+'" height="'+(mh+18)+'" rx="8" fill="var(--cr-panel)" stroke="var(--cr-stroke)" stroke-width="1.1"/>'+
        '<rect x="'+mx+'" y="'+my+'" width="'+mw+'" height="'+mh+'" rx="5" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        monitorArt(id,accent,mx,my,mw,mh)+
        '<rect x="'+(mx+mw/2-18)+'" y="'+(my+mh)+'" width="36" height="8" rx="2" fill="var(--cr-panel)" stroke="var(--cr-stroke)"/>'+
      '</g>';
    }).join('');

    return '<svg viewBox="0 0 900 560" aria-hidden="true">'+roomDefs(accent)+
      '<rect width="900" height="560" fill="url(#crBg)"/>'+
      '<rect width="900" height="560" fill="url(#crGlow)"/>'+
      '<rect x="0" y="420" width="900" height="140" fill="var(--cr-floor)"/>'+
      '<rect x="48" y="48" width="120" height="64" rx="8" fill="url(#crWin)" stroke="var(--cr-stroke)" opacity=".85"/>'+
      '<rect x="732" y="44" width="120" height="64" rx="8" fill="url(#crWin)" stroke="var(--cr-stroke)" opacity=".85"/>'+
      monitors+
      '<rect x="88" y="'+deskY+'" width="724" height="20" rx="8" fill="var(--cr-desk)" stroke="var(--cr-stroke)"/>'+
      '<rect x="120" y="'+(deskY+18)+'" width="660" height="10" rx="4" fill="color-mix(in srgb,var(--cr-desk) 75%,#000)"/>'+
      personSvg(accent,mobile)+
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
      floatTip.classList.remove('show','has-link','flip-below');
      floatTip.hidden=true;
      floatTip.style.left='';
      floatTip.style.top='';
    }
    if(tipLink){
      tipLink.hidden=true;
      tipLink.setAttribute('hidden','');
      tipLink.textContent='';
      tipLink.removeAttribute('href');
    }
    if(tipTitle){
      tipTitle.hidden=true;
      tipTitle.textContent='';
    }
    clearObjHighlight();
    hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.remove('active');});
  }

  function positionTip(anchorBtn){
    if(!floatTip||!room||!anchorBtn) return;
    var pad=8;
    var roomRect=room.getBoundingClientRect();
    var btnRect=anchorBtn.getBoundingClientRect();
    var tipRect=floatTip.getBoundingClientRect();
    var cx=btnRect.left+btnRect.width/2-roomRect.left;
    var spaceAbove=btnRect.top-roomRect.top;
    var spaceBelow=roomRect.bottom-btnRect.bottom;
    var placeBelow=spaceAbove<tipRect.height+pad+6&&spaceBelow>spaceAbove;
    var top=placeBelow
      ? btnRect.bottom-roomRect.top+pad
      : btnRect.top-roomRect.top-tipRect.height-pad;
    var left=cx-tipRect.width/2;
    left=Math.max(pad,Math.min(roomRect.width-tipRect.width-pad,left));
    top=Math.max(pad,Math.min(roomRect.height-tipRect.height-pad,top));
    floatTip.style.left=left+'px';
    floatTip.style.top=top+'px';
    floatTip.classList.toggle('flip-below',placeBelow);
  }

  function showTip(hotspot,anchorBtn){
    hotspotFloors.add(currentId);
    checkCareerStar();
    setObjHighlight(hotspot.id);
    if(!floatTip||!tipDesc) return;
    if(tipTitle){
      tipTitle.hidden=true;
      tipTitle.textContent='';
    }
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
    requestAnimationFrame(function(){
      positionTip(anchorBtn);
    });
  }

  function applyHotspotLayout(btn,index){
    var box=hotspotLayout()[index];
    if(!box) return;
    btn.style.setProperty('--x',box.x);
    btn.style.setProperty('--y',box.y);
    btn.style.setProperty('--w',box.w);
    btn.style.setProperty('--h',box.h);
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
    item.hotspots.forEach(function(hotspot,index){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='career-hotspot';
      btn.dataset.id=hotspot.id;
      applyHotspotLayout(btn,index);
      btn.setAttribute('aria-label',pick(hotspot.desc));
      btn.addEventListener('mouseenter',function(){
        if(elevatorBusy) return;
        hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.toggle('active',el===btn);});
        showTip(hotspot,btn);
      });
      btn.addEventListener('focus',function(){
        if(!elevatorBusy) showTip(hotspot,btn);
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

  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      var item=DATA.find(function(x){return x.id===currentId;});
      if(item) applyRoomContent(item);
    },160);
  });

  renderFloors();
  applyRoomContent(DATA[0]);
  updateElevatorCar(0,DATA[0]);
  setTimeout(function(){travelToFloor(DATA[0].id,0);},600);
})();
