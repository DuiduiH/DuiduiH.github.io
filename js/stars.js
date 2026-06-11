// ===== Star pocket — collect stars from each section =====
(function(){
  var KEY='duidui-stars-v1';
  var ORDER=['hero','interest','career','study','worldmap','timelines','skills','ending'];
  var STAR_POS={
    hero:{x:130,y:104},
    interest:{x:445,y:98},
    career:{x:720,y:142},
    study:{x:690,y:270},
    worldmap:{x:400,y:308},
    timelines:{x:170,y:278},
    skills:{x:145,y:426},
    ending:{x:737,y:426}
  };
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
  var countEl=document.getElementById('starPocketCount');
  var starsEl=document.getElementById('starPocketStars');
  var hintEl=document.getElementById('starPocketHint');
  var starMapOverlay=document.getElementById('star-map-overlay');
  var starMapWrap=document.getElementById('starMapWrap');
  var starMapClose=document.getElementById('starMapClose');
  var TOTAL=ORDER.length;
  var starMapReady=false;

  function isEn(){return document.documentElement.lang==='en';}

  function label(id){
    var key='map-b-'+id;
    var T=window.SITE_TEXT&&window.SITE_TEXT.translations;
    if(T&&T[key]) return T[key][isEn()?'en':'cn']||id;
    return id;
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

  function initStarMap(){
    if(starMapReady||!starMapWrap) return;
    var src=document.querySelector('#map-overlay .illustrated-map');
    if(!src) return;
    var svg=src.cloneNode(true);
    svg.classList.add('star-collection-map');
    svg.removeAttribute('id');
    svg.querySelectorAll('.map-building').forEach(function(g){
      var id=g.getAttribute('data-target');
      if(ORDER.indexOf(id)<0) return;
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
    updateStarMapMarkers();
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
      var p=STAR_POS[id];
      if(!p) return;
      var g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','star-map-marker');
      g.setAttribute('transform','translate('+p.x+','+p.y+')');
      var glow=document.createElementNS('http://www.w3.org/2000/svg','circle');
      glow.setAttribute('r','10');
      glow.setAttribute('fill','rgba(251,191,36,.14)');
      g.appendChild(glow);
      var t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x','0');
      t.setAttribute('y','0');
      t.setAttribute('dy','0.12em');
      t.setAttribute('text-anchor','middle');
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
    if(pocket) pocket.classList.toggle('open',show);
    if(show){
      lockScroll();
      updateStarMapMarkers();
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
    t.innerHTML='<div class="star-toast-inner"><span class="star-toast-icon">✦</span><div class="star-toast-text">'+
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

  updateUI();
  setTimeout(initStarMap,300);
})();
