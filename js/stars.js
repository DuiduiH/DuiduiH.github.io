// ===== Star pocket — collect stars from each section =====
(function(){
  var KEY='duidui-stars-v1';
  var ORDER=['hero','interest','career','study','worldmap','timelines','skills','ending'];
  var BUILDING_ANCHOR={
    hero:{x:130,y:68},
    interest:{x:445,y:55},
    career:{x:720,y:94},
    study:{x:690,y:232},
    worldmap:{x:400,y:273},
    timelines:{x:170,y:220},
    skills:{x:145,y:386},
    ending:{x:735,y:394}
  };
  var BUILDING_HIT={
    hero:30,interest:30,career:34,study:34,worldmap:30,timelines:34,skills:30,ending:28
  };
  var HOVER_SCALE=1.03;
  var HOVER_LIFT=-1;
  var STAR_OFFSET=34;
  // Site order 1–8 = hero … ending. Grid slots [col,row] per layout:
  // Landscape 4×2 — row0: 1 2 3 4 → route → row1: 8 7 6 5 (Z: right, down, left)
  //   1 hero      [0,0]   5 worldmap  [3,1]
  //   2 interest  [1,0]   6 timelines [2,1]
  //   3 career    [2,0]   7 skills    [1,1]
  //   4 study     [3,0]   8 ending    [0,1]
  var ROUTE_LANDSCAPE=[[0,0],[1,0],[2,0],[3,0],[3,1],[2,1],[1,1],[0,1]];
  // Portrait 2×4 — row0: 1 2 | row1: 4 3 | row2: 5 6 | row3: 8 7 (snake: → ↓ ← ↓ → ↓ ←)
  //   1 hero      [0,0]   5 worldmap  [0,2]
  //   2 interest  [1,0]   6 timelines [1,2]
  //   3 career    [1,1]   7 skills    [1,3]
  //   4 study     [0,1]   8 ending    [0,3]
  var ROUTE_PORTRAIT=[[0,0],[1,0],[1,1],[0,1],[0,2],[1,2],[1,3],[0,3]];
  var SVG_BOUNDS={x:20,y:-10,w:860,h:540};
  function makeGridCenters(cols,rows,padX,padY){
    var x0=SVG_BOUNDS.x+padX,y0=SVG_BOUNDS.y+padY;
    var innerW=SVG_BOUNDS.w-padX*2,innerH=SVG_BOUNDS.h-padY*2;
    var xs=[],ys=[];
    for(var c=0;c<cols;c++) xs.push(x0+(c+0.5)*(innerW/cols));
    for(var r=0;r<rows;r++) ys.push(y0+(r+0.5)*(innerH/rows));
    return {x:xs,y:ys};
  }
  var CELL_CENTER={
    landscape:makeGridCenters(4,2,52,44),
    portrait:makeGridCenters(2,4,118,36)
  };
  var placementCache={landscape:null,portrait:null};
  var layoutObs=null;

  function isMobilePortrait(){
    return layoutMq.matches;
  }

  function isDevicePortrait(){
    return isMobilePortrait();
  }

  function isMapPortraitLayout(){
    if(starMapWrap){
      var r=starMapWrap.getBoundingClientRect();
      if(r.width>48&&r.height>48) return r.height>r.width;
    }
    return isMobilePortrait();
  }

  function getLayoutMode(forPocket){
    if(forPocket) return isDevicePortrait()?'portrait':'landscape';
    if(starMapOverlay&&starMapOverlay.classList.contains('open')){
      return isMapPortraitLayout()?'portrait':'landscape';
    }
    return isDevicePortrait()?'portrait':'landscape';
  }

  function routeSlots(){
    return getLayoutMode()==='portrait'?ROUTE_PORTRAIT:ROUTE_LANDSCAPE;
  }

  function buildPlacementCache(key,slots){
    var pl={};
    ORDER.forEach(function(id,i){
      if(!slots[i]) return;
      pl[id]={c:slots[i][0],r:slots[i][1]};
    });
    placementCache[key]=pl;
    return pl;
  }

  function getPlacementMap(forPocket){
    var key=getLayoutMode(!!forPocket);
    if(!placementCache[key]) buildPlacementCache(key,key==='portrait'?ROUTE_PORTRAIT:ROUTE_LANDSCAPE);
    return placementCache[key];
  }

  function getPlacement(id,forPocket){
    var pl=getPlacementMap(forPocket);
    return pl[id]||null;
  }

  function gridMetrics(forPocket){
    return getLayoutMode(!!forPocket)==='portrait'?CELL_CENTER.portrait:CELL_CENTER.landscape;
  }

  function cellCenter(c,r,forPocket){
    var g=gridMetrics(forPocket);
    if(g.x[c]==null||g.y[r]==null) return null;
    return {x:g.x[c], y:g.y[r]};
  }

  function getTargetPos(id,forPocket){
    var pl=getPlacement(id,forPocket);
    if(!pl) return null;
    return cellCenter(pl.c,pl.r,forPocket);
  }
  var earned=load();

  function load(){
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'[]');
      if(Array.isArray(s)) return new Set(s.filter(function(id){return ORDER.indexOf(id)>-1;}));
    }catch(e){}
    return new Set();
  }

  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(Array.from(earned)));}catch(e){}
  }

  var pocket=document.getElementById('star-pocket');
  var cornerDock=document.getElementById('cornerDock');
  var countEl=document.getElementById('starPocketCount');
  var starsPop=null;
  var starsHideTimer=null;
  var starsEl=document.getElementById('starPocketStars');
  var hintEl=document.getElementById('starPocketHint');
  var starMapOverlay=document.getElementById('star-map-overlay');
  var starMapWrap=document.getElementById('starMapWrap');
  var starMapClose=document.getElementById('starMapClose');
  var TOTAL=ORDER.length;
  var starMapReady=false;
  var layoutMq=window.matchMedia('(max-width:600px) and (orientation:portrait)');

  function isEn(){return document.documentElement.lang==='en';}

  function isPortraitLayout(forPocket){
    return getLayoutMode(!!forPocket)==='portrait';
  }

  function isStarMapOpen(){
    return !!(starMapOverlay&&starMapOverlay.classList.contains('open'));
  }

  function setPocketMapOpen(on){
    if(cornerDock) cornerDock.classList.toggle('star-map-open', !!on);
    if(pocket){
      pocket.classList.toggle('open', !!on);
      if(on) pocket.classList.remove('show-stars');
    }
  }

  function bindPocketStarsReveal(){
    if(!pocket||!countEl) return;
    starsPop=pocket.querySelector('.star-pocket-pop');
    countEl.setAttribute('tabindex','0');
    function showStars(){
      if(isStarMapOpen()) return;
      clearTimeout(starsHideTimer);
      pocket.classList.add('show-stars');
      if(starsPop) starsPop.setAttribute('aria-hidden','false');
    }
    function hideStars(){
      clearTimeout(starsHideTimer);
      starsHideTimer=setTimeout(function(){
        starsHideTimer=null;
        pocket.classList.remove('show-stars');
        if(starsPop) starsPop.setAttribute('aria-hidden','true');
      },140);
    }
    countEl.addEventListener('mouseenter', showStars);
    countEl.addEventListener('mouseleave', hideStars);
    countEl.addEventListener('focus', showStars);
    countEl.addEventListener('blur', hideStars);
    pocket.addEventListener('mouseenter', function(){
      if(pocket.classList.contains('show-stars')) showStars();
    });
    pocket.addEventListener('mouseleave', hideStars);
  }

  function label(id){
    var key='map-b-'+id;
    var T=window.SITE_TEXT&&window.SITE_TEXT.translations;
    if(T&&T[key]) return T[key][isEn()?'en':'cn']||id;
    return id;
  }

  function getStarMarkerOffset(id,forPocket){
    var pl=getPlacement(id,forPocket);
    if(!pl) return {dx:0,dy:0};
    var portrait=isPortraitLayout(!!forPocket);
    if(portrait){
      return {dx:pl.c===0?-STAR_OFFSET:STAR_OFFSET,dy:0};
    }
    return {dx:0,dy:pl.r===0?-STAR_OFFSET:STAR_OFFSET};
  }

  function getStarMarkerPos(id,forPocket){
    var p=getTargetPos(id,forPocket);
    if(!p) return null;
    var off=getStarMarkerOffset(id,forPocket);
    return {x:p.x+off.dx, y:p.y+off.dy};
  }

  function getStarMarkerTextAnchor(id){
    if(!isPortraitLayout()) return 'middle';
    var pl=getPlacement(id);
    return pl&&pl.c===0?'end':'start';
  }

  function getRoutePoints(forPocket){
    return ORDER.map(function(id){return getTargetPos(id,forPocket);}).filter(Boolean);
  }

  function buildRoutePath(points){
    if(!points.length) return '';
    var d='M'+points[0].x+','+points[0].y;
    for(var i=1;i<points.length;i++) d+=' L'+points[i].x+','+points[i].y;
    return d;
  }

  function applyBuildingTransform(g, target, anchor, scale){
    scale=scale||1;
    var lift=scale>1?HOVER_LIFT:0;
    g.setAttribute('transform',
      'translate('+target.x+','+(target.y+lift)+') scale('+scale+') translate('+(-anchor.x)+','+(-anchor.y)+')');
  }

  function calibrateBuildingHit(g, id){
    var anchor=BUILDING_ANCHOR[id];
    if(!anchor) return;
    var r=BUILDING_HIT[id]||30;
    g.querySelectorAll('.map-hit').forEach(function(hit){
      var tag=hit.tagName.toLowerCase();
      if(tag==='circle'){
        hit.setAttribute('cx',anchor.x);
        hit.setAttribute('cy',anchor.y);
        hit.setAttribute('r',r);
      }else if(tag==='rect'){
        hit.setAttribute('x',anchor.x-r);
        hit.setAttribute('y',anchor.y-r);
        hit.setAttribute('width',r*2);
        hit.setAttribute('height',r*2);
        if(!hit.getAttribute('rx')) hit.setAttribute('rx',r);
      }else if(tag==='ellipse'){
        hit.setAttribute('cx',anchor.x);
        hit.setAttribute('cy',anchor.y);
        hit.setAttribute('rx',r);
        hit.setAttribute('ry',Math.round(r*.72));
      }
    });
  }

  function bindBuildingHover(g, id){
    if(g.dataset.hoverBound) return;
    g.dataset.hoverBound='1';
    var anchor=BUILDING_ANCHOR[id];
    g.addEventListener('mouseenter', function(){
      if(g.classList.contains('star-site-locked')) return;
      var target=getTargetPos(id);
      if(!target||!anchor) return;
      applyBuildingTransform(g, target, anchor, HOVER_SCALE);
    });
    g.addEventListener('mouseleave', function(){
      var target=getTargetPos(id);
      if(!target||!anchor) return;
      applyBuildingTransform(g, target, anchor, 1);
    });
  }

  function syncMapLayoutClass(){
    if(!starMapWrap) return;
    var portrait=getLayoutMode()=== 'portrait';
    starMapWrap.classList.toggle('is-portrait', portrait);
    starMapWrap.classList.toggle('is-landscape', !portrait);
    var svg=starMapWrap.querySelector('svg.star-collection-map');
    if(svg){
      svg.classList.toggle('is-portrait', portrait);
      svg.classList.toggle('is-landscape', !portrait);
    }
  }

  function applyPocketGrid(){
    if(!starsEl) return;
    var portrait=isPortraitLayout(true);
    starsEl.classList.toggle('is-portrait', portrait);
    starsEl.classList.toggle('is-landscape', !portrait);
    ORDER.forEach(function(id, idx){
      var slot=starsEl.children[idx];
      if(!slot) return;
      var pl=getPlacement(id, true);
      if(!pl) return;
      slot.style.gridColumn=String(pl.c+1);
      slot.style.gridRow=String(pl.r+1);
    });
  }

  function updateUI(){
    var n=earned.size;
    if(countEl) countEl.textContent=n+'/'+TOTAL;
    if(starsEl){
      starsEl.innerHTML='';
      ORDER.forEach(function(id){
        var s=document.createElement('span');
        s.className='star-slot'+(earned.has(id)?' filled':' empty');
        s.textContent='✦';
        s.title=label(id);
        s.setAttribute('aria-label',label(id));
        starsEl.appendChild(s);
      });
      applyPocketGrid();
    }
    if(hintEl){
      if(n===TOTAL-1&&!earned.has('ending')){
        hintEl.textContent=isEn()?'1 star left ✦':'还差 1 颗 ✦';
        hintEl.hidden=false;
      }else if(n>=TOTAL){
        hintEl.textContent=isEn()?'Pocket full!':'口袋满啦 ✦';
        hintEl.hidden=false;
      }else{
        hintEl.hidden=true;
      }
    }
    updateStarMapMarkers();
  }

  function lockScroll(){
    document.body.style.overflow='hidden';
    document.documentElement.style.overflow='hidden';
  }

  function unlockScroll(){
    document.body.style.overflow='';
    document.documentElement.style.overflow='';
  }

  function applyStarMapLayout(){
    if(!starMapReady||!starMapWrap) return;
    syncMapLayoutClass();
    var svg=starMapWrap.querySelector('svg.star-collection-map');
    if(!svg) return;

    svg.querySelectorAll('.map-building').forEach(function(g){
      var id=g.getAttribute('data-target');
      if(ORDER.indexOf(id)<0){
        g.setAttribute('display','none');
        return;
      }
      g.removeAttribute('display');
      g.classList.remove('unlocked','active','map-jumpable','map-visited','map-locked');
      var target=getTargetPos(id);
      var anchor=BUILDING_ANCHOR[id];
      if(!target||!anchor) return;
      delete g.dataset.hoverBound;
      calibrateBuildingHit(g, id);
      applyBuildingTransform(g, target, anchor, 1);
      bindBuildingHover(g, id);
    });

    var route=buildRoutePath(getRoutePoints(false));
    svg.querySelectorAll('path').forEach(function(path){
      var sw=path.getAttribute('stroke-width');
      if(sw==='14'||sw==='4.5') path.setAttribute('d',route);
    });
    var dots=svg.querySelector('.map-trail-dots');
    if(dots){
      dots.innerHTML='';
      getRoutePoints(false).forEach(function(p){
        var c=document.createElementNS('http://www.w3.org/2000/svg','circle');
        c.setAttribute('cx',p.x);
        c.setAttribute('cy',p.y);
        c.setAttribute('r','3');
        c.setAttribute('fill','var(--map-route-dash)');
        dots.appendChild(c);
      });
    }
    updateStarMapMarkers();
  }

  function initStarMap(){
    if(starMapReady||!starMapWrap) return;
    var src=document.querySelector('#map-overlay .illustrated-map');
    if(!src) return;
    var svg=src.cloneNode(true);
    svg.classList.add('star-collection-map');
    svg.removeAttribute('id');
    svg.querySelectorAll('.map-building').forEach(function(g){
      var id=g.getAttribute('data-target');
      if(ORDER.indexOf(id)<0){
        g.setAttribute('display','none');
        return;
      }
      g.classList.remove('unlocked','active','map-jumpable','map-visited','map-locked');
      calibrateBuildingHit(g, id);
      g.querySelectorAll('.map-hit').forEach(function(h){
        h.style.pointerEvents='auto';
        h.addEventListener('click',function(e){
          e.stopPropagation();
          if(window.canJumpToSection&&window.canJumpToSection(id)){
            window.jumpToSection(id);
            toggleStarMap(false);
          }else if(window.showMapNotice){
            window.showMapNotice();
          }
        });
      });
    });
    var markers=document.createElementNS('http://www.w3.org/2000/svg','g');
    markers.setAttribute('id','starMapMarkers');
    var firstBuilding=svg.querySelector('.map-building');
    if(firstBuilding) svg.insertBefore(markers,firstBuilding);
    else svg.appendChild(markers);
    starMapWrap.appendChild(svg);
    starMapReady=true;
    applyStarMapLayout();
  }

  function updateStarMapMarkers(){
    if(!starMapReady) return;
    var svg=starMapWrap&&starMapWrap.querySelector('svg');
    if(!svg) return;
    svg.querySelectorAll('.map-building').forEach(function(g){
      var id=g.getAttribute('data-target');
      if(ORDER.indexOf(id)<0) return;
      var siteVisited=window.isSectionVisited&&window.isSectionVisited(id);
      var jumpable=window.canJumpToSection&&window.canJumpToSection(id);
      g.classList.remove('star-earned','star-missing','star-jumpable','star-site-visited','star-site-locked');
      if(siteVisited) g.classList.add('star-site-visited');
      else if(jumpable) g.classList.add('star-jumpable');
      else g.classList.add('star-site-locked');
      g.style.cursor=jumpable?'pointer':'default';
    });
    var markers=svg.querySelector('#starMapMarkers');
    if(!markers) return;
    markers.innerHTML='';
    ORDER.forEach(function(id){
      if(!earned.has(id)) return;
      var pos=getStarMarkerPos(id);
      if(!pos) return;
      var g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','star-map-marker');
      g.setAttribute('transform','translate('+pos.x+','+pos.y+')');
      var glow=document.createElementNS('http://www.w3.org/2000/svg','circle');
      glow.setAttribute('r','10');
      glow.setAttribute('fill','rgba(251,191,36,.14)');
      g.appendChild(glow);
      var t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x','0');
      t.setAttribute('y','0');
      t.setAttribute('dy','0.12em');
      t.setAttribute('text-anchor',getStarMarkerTextAnchor(id));
      t.setAttribute('dominant-baseline','central');
      t.setAttribute('alignment-baseline','central');
      t.setAttribute('font-size','18');
      t.setAttribute('fill','#fbbf24');
      t.textContent='✦';
      g.appendChild(t);
      markers.appendChild(g);
    });
  }

  function toggleStarMap(open){
    if(!starMapOverlay) return;
    initStarMap();
    var show=typeof open==='boolean'?open:!starMapOverlay.classList.contains('open');
    starMapOverlay.classList.toggle('open',show);
    setPocketMapOpen(show);
    if(show){
      lockScroll();
      placementCache.landscape=null;
      placementCache.portrait=null;
      requestAnimationFrame(function(){
        applyStarMapLayout();
        updateStarMapMarkers();
        requestAnimationFrame(applyStarMapLayout);
      });
    }else{
      unlockScroll();
    }
  }

  window.toggleStarMapOverlay=toggleStarMap;

  function flyStar(fromRect){
    if(!pocket) return;
    var star=document.createElement('div');
    star.className='star-fly';
    star.textContent='✦';
    document.body.appendChild(star);
    var pr=pocket.getBoundingClientRect();
    var sx=fromRect?fromRect.left+fromRect.width/2:window.innerWidth/2;
    var sy=fromRect?fromRect.top+fromRect.height/2:window.innerHeight/2;
    star.style.left=sx+'px';
    star.style.top=sy+'px';
    var burst=document.createElement('div');
    burst.className='star-burst';
    burst.style.setProperty('--bx',((sx/window.innerWidth)*100)+'%');
    burst.style.setProperty('--by',((sy/window.innerHeight)*100)+'%');
    document.body.appendChild(burst);
    requestAnimationFrame(function(){
      burst.classList.add('show');
      star.style.left=(pr.left+pr.width/2)+'px';
      star.style.top=(pr.top+pr.height/2)+'px';
      star.style.opacity='0';
      star.style.transform='scale(.25) rotate(180deg)';
    });
    setTimeout(function(){star.remove();burst.classList.remove('show');setTimeout(function(){burst.remove();},400);},900);
    pocket.classList.add('star-bump');
    setTimeout(function(){pocket.classList.remove('star-bump');},620);
  }

  function showToast(id){
    var hints={
      hero:{cn:'探索 3 颗不同的星星关键词',en:'Explore 3 different star keywords'},
      interest:{cn:'完成全部卡片配对',en:'Match all card pairs'},
      career:{cn:'前往 3 个楼层并分别点开 1 个显示屏',en:'Visit all 3 floors and open one monitor on each'},
      study:{cn:'戳开 5 个知识泡泡',en:'Pop 5 knowledge bubbles'},
      worldmap:{cn:'展开 2 张卷轴地图',en:'Unroll both scroll maps'},
      timelines:{cn:'拖动钟楼转圈 5 个标签都看过',en:'Spin the clock tower and view all 5 categories'},
      skills:{cn:'走遍 6 片花丛查看技能',en:'Visit all 6 flower beds to view skills'},
      ending:{cn:'点击查看 收集最后 1 颗星星',en:'Tap to collect the final star'}
    };
    var H=hints[id]||{cn:'',en:''};
    var t=document.createElement('div');
    t.className='star-toast';
    t.innerHTML='<div class="star-toast-inner"><div class="star-toast-text"><span class="star-toast-icon">✦</span>'+
      (isEn()?('Star · '+label(id)):('获得星星 · '+label(id)))+
      '</div><span class="star-toast-sub">'+(isEn()?H.en:H.cn)+'</span></div>';
    document.body.appendChild(t);
    requestAnimationFrame(function(){t.classList.add('show');});
    setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},450);},2800);
  }

  function award(id,originEl){
    if(ORDER.indexOf(id)<0||earned.has(id)) return false;
    earned.add(id);
    save();
    updateUI();
    var rect=originEl&&originEl.getBoundingClientRect?originEl.getBoundingClientRect():null;
    flyStar(rect);
    showToast(id);
    return true;
  }

  function watchMapLayout(){
    if(!starMapWrap||layoutObs||typeof ResizeObserver==='undefined') return;
    layoutObs=new ResizeObserver(function(){
      if(!starMapOverlay||!starMapOverlay.classList.contains('open')) return;
      onLayoutChange();
    });
    layoutObs.observe(starMapWrap);
  }

  function onLayoutChange(){
    placementCache.landscape=null;
    placementCache.portrait=null;
    applyPocketGrid();
    applyStarMapLayout();
  }

  window.awardStar=award;
  window.resetStars=function(){earned=new Set();save();updateUI();};
  window.getStarCount=function(){return earned.size;};
  window.refreshStarMapMarkers=updateStarMapMarkers;

  window.addEventListener('section-complete',function(e){
    if(!e.detail||!e.detail.id) return;
    award(e.detail.id,e.detail.origin||null);
  });

  if(pocket){
    pocket.addEventListener('click',function(e){
      e.stopPropagation();
      toggleStarMap(true);
    });
  }

  if(starMapClose){
    starMapClose.addEventListener('click',function(e){
      e.stopPropagation();
      toggleStarMap(false);
    });
  }

  if(starMapOverlay){
    starMapOverlay.addEventListener('click',function(e){
      if(e.target===starMapOverlay) toggleStarMap(false);
    });
  }

  var langObs=new MutationObserver(function(){updateUI();});
  langObs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  if(layoutMq.addEventListener) layoutMq.addEventListener('change', onLayoutChange);
  else if(layoutMq.addListener) layoutMq.addListener(onLayoutChange);
  window.addEventListener('resize', onLayoutChange);
  window.addEventListener('orientationchange', function(){setTimeout(onLayoutChange, 120);});

  updateUI();
  bindPocketStarsReveal();
  watchMapLayout();
  setTimeout(initStarMap,300);
})();
