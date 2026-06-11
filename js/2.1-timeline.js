// ===== 2.1 Timeline — single bell tower + category rotation =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var TL_DATA=(window.MODULE_DATA&&window.MODULE_DATA.timeline)||[];

  var TYPE_ORDER=['edu','work','proj','culture','honor'];
  var tm={edu:'tl-edu',work:'tl-work',proj:'tl-proj',culture:'tl-culture',honor:'tl-honor'};
  var lm={edu:{cn:'学业',en:'Education'},work:{cn:'工作',en:'Work'},proj:{cn:'项目',en:'Projects'},culture:{cn:'文化',en:'Culture'},honor:{cn:'荣誉',en:'Honors'}};

  var activeType='edu';
  var typesClicked=new Set(['edu']);
  var towerRotation=0;
  var dragging=false;
  var dragStartX=0;
  var rotAtDragStart=0;
  var DRAG_SENS=0.65;
  var CATEGORY_STEP=72;
  var TOWER_DEPTH=44;

  var towerWrap=document.querySelector('.tl-tower-facade');
  var towerStage=document.getElementById('tlTowerStage');

  function towerFaceSvg(){
    return '<svg viewBox="0 0 100 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
      '<path d="M18 260 L82 260 L78 248 L78 118 L22 118 L22 248 Z" fill="#475569" stroke="#64748b" stroke-width="1"/>'+
      '<path d="M26 248 L26 122 L74 122 L74 248 Z" fill="none" stroke="rgba(255,255,255,.08)" stroke-width=".6"/>'+
      '<path d="M38 248 Q50 232 62 248" fill="#334155" stroke="#64748b" stroke-width=".8"/>'+
      '<circle cx="50" cy="176" r="24" fill="#0f172a" stroke="#cbd5e1" stroke-width="2"/>'+
      '<g class="tl-clock-hands" transform="translate(50,176)">'+
        '<line class="tl-clock-hour" x1="0" y1="0" x2="0" y2="-16" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round"/>'+
        '<line class="tl-clock-min" x1="0" y1="0" x2="0" y2="-20" stroke="#e2e8f0" stroke-width="1.4" stroke-linecap="round"/>'+
      '</g>'+
      '<rect x="24" y="108" width="52" height="18" rx="2" fill="#5b21b6"/>'+
      '<path d="M28 108 L50 88 L72 108 Z" fill="#7c3aed" stroke="#5b21b6" stroke-width=".8"/>'+
      '<rect x="30" y="96" width="40" height="14" rx="1" fill="rgba(71,85,105,.55)" stroke="rgba(255,255,255,.08)" stroke-width=".6"/>'+
      '<ellipse cx="44" cy="102" rx="3.5" ry="3" fill="#fbbf24" opacity=".9"/>'+
      '<ellipse cx="56" cy="102" rx="3.5" ry="3" fill="#fbbf24" opacity=".9"/>'+
      '<circle cx="50" cy="82" r="3" fill="#fbbf24" opacity=".75"/>'+
    '</svg>';
  }

  var clockTimer=null;

  function updateClockHands(){
    if(!towerStage) return;
    var hourHands=towerStage.querySelectorAll('.tl-clock-hour');
    var minHands=towerStage.querySelectorAll('.tl-clock-min');
    if(!hourHands.length||!minHands.length) return;
    var now=new Date();
    var sec=now.getSeconds()+now.getMilliseconds()/1000;
    var min=now.getMinutes()+sec/60;
    var hr=(now.getHours()%12)+min/60;
    hourHands.forEach(function(hourHand){
      hourHand.setAttribute('transform','rotate('+(hr*30)+')');
    });
    minHands.forEach(function(minHand){
      minHand.setAttribute('transform','rotate('+(min*6)+')');
    });
  }

  function startClock(){
    updateClockHands();
    if(clockTimer) clearInterval(clockTimer);
    clockTimer=setInterval(updateClockHands,1000);
  }

  function buildTower(){
    if(!towerStage||towerStage.dataset.built) return;
    towerStage.innerHTML=towerFaceSvg();
    towerStage.dataset.built='1';
    startClock();
  }

  function updateTimelineLine(){
    var wrap=document.getElementById('tlWrap');
    if(!wrap) return;
    var line=wrap.querySelector('.tl-line');
    if(!line) return;
    var items=wrap.querySelectorAll('.tl-item');
    var visible=[];
    items.forEach(function(el){
      if(el.style.display!=='none') visible.push(el);
    });
    if(!visible.length){
      line.style.height='0';
      return;
    }
    var wrapRect=wrap.getBoundingClientRect();
    var firstDot=visible[0].querySelector('.tl-dot');
    var lastDot=visible[visible.length-1].querySelector('.tl-dot');
    if(!firstDot||!lastDot) return;
    var y1=firstDot.getBoundingClientRect().top+firstDot.offsetHeight/2-wrapRect.top+wrap.scrollTop;
    var y2=lastDot.getBoundingClientRect().top+lastDot.offsetHeight/2-wrapRect.top+wrap.scrollTop;
    line.style.top=y1+'px';
    line.style.height=Math.max(0,y2-y1)+'px';
  }

  function render(){
    var c=document.getElementById('tlWrap');if(!c)return;
    var line=c.querySelector('.tl-line');
    c.innerHTML='';
    if(line) c.appendChild(line); else {var l=document.createElement('div');l.className='tl-line';c.appendChild(l);}
    var en=isEn();
    TL_DATA.forEach(function(it){
      var e=document.createElement('div');
      e.className='tl-item '+tm[it.t];
      if(it.t!==activeType) e.style.display='none';
      var catLabel=en?lm[it.t].en:lm[it.t].cn;
      var title=en?(it.titleEn||it.title):it.title;
      var desc=en?(it.dEn||it.d):it.d;
      e.innerHTML='<div class="tl-dot"></div><div class="tl-time">'+it.y+' · '+catLabel+'</div><div class="tl-title">'+title+'</div><div class="tl-desc">'+desc+'</div>';
      c.appendChild(e);
    });
    requestAnimationFrame(updateTimelineLine);
  }

  function applyTowerRotation(){
    if(!towerStage) return;
    towerStage.style.transform='rotateY('+towerRotation+'deg)';
  }

  function indexForType(type){
    var i=TYPE_ORDER.indexOf(type);
    return i<0?0:i;
  }

  function rotationForType(type){
    return -indexForType(type)*CATEGORY_STEP;
  }

  function typeForRotation(deg){
    var idx=Math.round(-deg/CATEGORY_STEP);
    idx=((idx%TYPE_ORDER.length)+TYPE_ORDER.length)%TYPE_ORDER.length;
    return TYPE_ORDER[idx];
  }

  function quantizeRotation(deg){
    return Math.round(deg/CATEGORY_STEP)*CATEGORY_STEP;
  }

  function setActiveType(type,opts){
    if(TYPE_ORDER.indexOf(type)<0) return;
    activeType=type;
    typesClicked.add(type);
    if(!opts||!opts.keepRotation){
      towerRotation=rotationForType(type);
      applyTowerRotation();
    }
    updateLegendUI();
    filterTimelineItems();
    maybeStar();
    if(towerStage&&!dragging){
      towerStage.classList.remove('tl-ring');
      void towerStage.offsetWidth;
      towerStage.classList.add('tl-ring');
      setTimeout(function(){towerStage.classList.remove('tl-ring');},560);
    }
  }

  function filterTimelineItems(){
    document.querySelectorAll('.tl-item').forEach(function(el){
      var isMatch=false;
      Object.keys(tm).forEach(function(k){
        if(el.classList.contains(tm[k])&&k===activeType) isMatch=true;
      });
      el.style.display=isMatch?'':'none';
    });
    requestAnimationFrame(updateTimelineLine);
  }

  function updateLegendUI(){
    document.querySelectorAll('.tl-legend-item').forEach(function(item){
      if(item.dataset.type===activeType){
        item.classList.remove('tl-hidden');
        item.classList.add('tl-active');
      } else {
        item.classList.add('tl-hidden');
        item.classList.remove('tl-active');
      }
    });
  }

  function maybeStar(){
    if(typesClicked.size>=5){
      window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'timelines',origin:towerWrap}}));
    }
  }

  function snapRotation(){
    towerRotation=quantizeRotation(towerRotation);
    applyTowerRotation();
    setActiveType(typeForRotation(towerRotation),{keepRotation:true});
  }

  function onPointerDown(e){
    if(e.button!==undefined&&e.button!==0) return;
    dragging=true;
    if(towerWrap) towerWrap.classList.add('tl-dragging');
    dragStartX=e.clientX;
    rotAtDragStart=towerRotation;
    if(towerStage) towerStage.style.transition='none';
    e.preventDefault();
  }

  function onPointerMove(e){
    if(!dragging) return;
    var delta=e.clientX-dragStartX;
    towerRotation=quantizeRotation(rotAtDragStart+delta*DRAG_SENS);
    applyTowerRotation();
    var nextType=typeForRotation(towerRotation);
    if(nextType!==activeType){
      activeType=nextType;
      typesClicked.add(activeType);
      updateLegendUI();
      filterTimelineItems();
      maybeStar();
    }
  }

  function onPointerUp(){
    if(!dragging) return;
    dragging=false;
    if(towerWrap) towerWrap.classList.remove('tl-dragging');
    if(towerStage){
      towerStage.style.transition='transform .35s cubic-bezier(.34,1.2,.64,1)';
      setTimeout(function(){if(towerStage) towerStage.style.transition='';},380);
    }
    snapRotation();
  }

  buildTower();

  if(towerWrap){
    towerWrap.style.cursor='grab';
    towerWrap.setAttribute('role','slider');
    towerWrap.setAttribute('aria-label',isEn()?'Drag left or right to turn the tower':'左右拖动，让钟楼立体转向');
    towerWrap.addEventListener('mousedown',onPointerDown);
    window.addEventListener('mousemove',onPointerMove);
    window.addEventListener('mouseup',onPointerUp);
    towerWrap.addEventListener('touchstart',function(e){
      if(!e.touches[0]) return;
      onPointerDown({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,button:0,preventDefault:function(){e.preventDefault();}});
    },{passive:false});
    window.addEventListener('touchmove',function(e){
      if(!dragging||!e.touches[0]) return;
      onPointerMove({clientX:e.touches[0].clientX,clientY:e.touches[0].clientY});
    },{passive:true});
    window.addEventListener('touchend',onPointerUp);
  }

  document.querySelectorAll('.tl-legend-item').forEach(function(item){
    item.addEventListener('click',function(){
      var type=item.dataset.type;
      if(type) setActiveType(type);
    });
  });

  window._resetTimeline=function(){
    activeType='edu';
    typesClicked=new Set(['edu']);
    towerRotation=0;
    applyTowerRotation();
    updateLegendUI();
    render();
  };

  updateLegendUI();
  render();
  applyTowerRotation();
  setTimeout(updateTimelineLine,120);

  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });

  var tlWrap=document.getElementById('tlWrap');
  if(tlWrap){
    tlWrap.addEventListener('scroll',updateTimelineLine);
    window.addEventListener('resize',updateTimelineLine);
  }
})();
