// ===== 2.1 Timeline — Drag bell tower to rotate categories =====
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
  var dragStartAngle=0;
  var rotAtDragStart=0;

  var towerWrap=document.querySelector('.tl-tower-facade');
  var towerSvg=document.getElementById('tlTowerSvg');

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
  }

  function applyTowerRotation(){
    if(!towerSvg) return;
    towerSvg.style.transform='rotate('+towerRotation+'deg)';
  }

  function indexForType(type){
    var i=TYPE_ORDER.indexOf(type);
    return i<0?0:i;
  }

  function setActiveType(type,opts){
    if(TYPE_ORDER.indexOf(type)<0) return;
    activeType=type;
    typesClicked.add(type);
    var idx=indexForType(type);
    if(!opts||!opts.keepRotation){
      towerRotation=idx*72;
      applyTowerRotation();
    }
    updateLegendUI();
    filterTimelineItems();
    maybeStar();
    if(towerSvg&&!dragging){
      towerSvg.classList.remove('tl-ring');
      void towerSvg.offsetWidth;
      towerSvg.classList.add('tl-ring');
      setTimeout(function(){towerSvg.classList.remove('tl-ring');},560);
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
    var idx=Math.round(towerRotation/72);
    idx=((idx%5)+5)%5;
    towerRotation=idx*72;
    applyTowerRotation();
    setActiveType(TYPE_ORDER[idx],{keepRotation:true});
  }

  function angleFromPointer(clientX,clientY){
    if(!towerWrap) return 0;
    var rect=towerWrap.getBoundingClientRect();
    var cx=rect.left+rect.width/2;
    var cy=rect.top+rect.height*0.55;
    return Math.atan2(clientY-cy,clientX-cx)*180/Math.PI;
  }

  function onPointerDown(e){
    if(e.button!==undefined&&e.button!==0) return;
    dragging=true;
    if(towerWrap) towerWrap.classList.add('tl-dragging');
    dragStartAngle=angleFromPointer(e.clientX,e.clientY);
    rotAtDragStart=towerRotation;
    if(towerSvg) towerSvg.style.transition='none';
    e.preventDefault();
  }

  function onPointerMove(e){
    if(!dragging) return;
    var angle=angleFromPointer(e.clientX,e.clientY);
    var delta=angle-dragStartAngle;
    towerRotation=rotAtDragStart+delta;
    applyTowerRotation();
    var idx=Math.round(towerRotation/72);
    idx=((idx%5)+5)%5;
    var nextType=TYPE_ORDER[idx];
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
    if(towerSvg){
      towerSvg.style.transition='transform .35s cubic-bezier(.34,1.2,.64,1)';
      setTimeout(function(){if(towerSvg) towerSvg.style.transition='';},380);
    }
    snapRotation();
  }

  if(towerWrap){
    towerWrap.style.cursor='grab';
    towerWrap.setAttribute('role','slider');
    towerWrap.setAttribute('aria-label',isEn()?'Drag to spin clock tower':'拖动钟楼切换类别');
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

  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
