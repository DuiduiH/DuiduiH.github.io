// ===== App — Unlock, Map, Replay, Quote Overlay, Lang, Theme =====
(function(){
  var ALL_SECTIONS = ['hero','interest','career','study','worldmap','timelines','skills','takeaway','ending'];
  var UNLOCK_KEY='duidui-unlocked-sections-v2';
  var VISITED_KEY='duidui-visited-sections-v1';

  function loadUnlocked(){
    try{
      var saved=JSON.parse(localStorage.getItem(UNLOCK_KEY)||'[]');
      if(Array.isArray(saved)&&saved.length) return new Set(saved.filter(function(id){return ALL_SECTIONS.indexOf(id)>-1;}));
    }catch(e){}
    return new Set(['hero']);
  }

  function loadVisited(){
    try{
      var saved=JSON.parse(localStorage.getItem(VISITED_KEY)||'[]');
      if(Array.isArray(saved)&&saved.length) return new Set(saved.filter(function(id){return ALL_SECTIONS.indexOf(id)>-1;}));
    }catch(e){}
    return new Set(['hero']);
  }

  var unlocked = loadUnlocked();
  unlocked.add('hero');
  var visited = loadVisited();
  visited.add('hero');
  var overlaysShown = new Set();
  var lastScrollY = window.scrollY;
  var scrollingDown = true;

  window.addEventListener('scroll',function(){
    scrollingDown = window.scrollY > lastScrollY;
    if(scrollingDown) scrollIntentSinceUnlock+=Math.max(0,window.scrollY-lastScrollY);
    lastScrollY = window.scrollY;
    syncMapVisitedUI();
  },{passive:true});

  // Touchpads emit a stream of wheel events for one gesture. Treat each gesture
  // as a single page turn so a hard swipe never skips several sections.
  var pageWheelLocked=false;
  var pageWheelIntent=0;
  var pageWheelResetTimer=null;

  function getSnapPages(){
    return Array.from(document.querySelectorAll('.section-page,.section-intro-page,.ending-section'));
  }

  function getCurrentSnapIndex(pages){
    var center=window.innerHeight*0.5;
    var bestIdx=0;
    var bestDist=Infinity;
    pages.forEach(function(page,idx){
      var rect=page.getBoundingClientRect();
      var pageCenter=rect.top+rect.height*0.5;
      var dist=Math.abs(pageCenter-center);
      if(dist<bestDist){
        bestDist=dist;
        bestIdx=idx;
      }
    });
    return bestIdx;
  }

  var scrollIntentSinceUnlock=0;
  var lastSectionScrollY=window.scrollY;

  function getCurrentSectionId(){
    var pages=document.querySelectorAll('.section-page,.section-intro-page,.ending-section');
    var center=window.innerHeight*0.5;
    var best=null,bestDist=Infinity;
    pages.forEach(function(page){
      var id=page.dataset.mapId||page.id;
      if(!id||ALL_SECTIONS.indexOf(id)<0) return;
      var rect=page.getBoundingClientRect();
      var dist=Math.abs(rect.top+rect.height*0.5-center);
      if(dist<bestDist){bestDist=dist;best=id;}
    });
    return best||'hero';
  }

  function canJumpToSection(target){
    if(ALL_SECTIONS.indexOf(target)<0) return false;
    var ci=ALL_SECTIONS.indexOf(getCurrentSectionId());
    var ti=ALL_SECTIONS.indexOf(target);
    return ti<=ci;
  }

  function syncMapVisitedUI(){
    var ci=ALL_SECTIONS.indexOf(getCurrentSectionId());
    document.querySelectorAll('.map-building').forEach(function(el){
      var id=el.dataset.target;
      if(!id) return;
      var ti=ALL_SECTIONS.indexOf(id);
      el.classList.remove('unlocked','map-visited','map-jumpable','map-locked');
      if(visited.has(id)){
        el.classList.add('map-visited');
      }else if(ti>-1&&ti<=ci){
        el.classList.add('map-jumpable');
      }else{
        el.classList.add('map-locked');
      }
    });
    if(window.refreshStarMapMarkers) window.refreshStarMapMarkers();
  }

  function jumpToSection(target){
    if(!canJumpToSection(target)) return false;
    var el=document.getElementById(target)||document.querySelector('[data-map-id="'+target+'"]');
    if(!el) return false;
    var targetIdx=ALL_SECTIONS.indexOf(target);
    if(targetIdx>-1){
      for(var i=0;i<=targetIdx;i++){
        if(unlocked.has(ALL_SECTIONS[i])) overlaysShown.add(ALL_SECTIONS[i]);
      }
    }
    document.documentElement.style.scrollSnapType='none';
    document.documentElement.style.scrollBehavior='auto';
    setTimeout(function(){
      el.scrollIntoView({block:'start'});
      setTimeout(function(){
        document.documentElement.style.scrollSnapType='';
        document.documentElement.style.scrollBehavior='';
        syncMapVisitedUI();
      },50);
    },100);
    return true;
  }

  window.getCurrentSectionId=getCurrentSectionId;
  window.canJumpToSection=canJumpToSection;
  window.isSectionVisited=function(id){return visited.has(id);};
  window.jumpToSection=jumpToSection;

  function markVisited(id){
    if(ALL_SECTIONS.indexOf(id)<0||visited.has(id)) return;
    visited.add(id);
    try{localStorage.setItem(VISITED_KEY,JSON.stringify(Array.from(visited)));}catch(e){}
    syncMapVisitedUI();
  }

  syncMapVisitedUI();

  function canInnerScroll(target,deltaY){
    var node=target;
    while(node&&node!==document.body&&node!==document.documentElement){
      if(node.classList&&(
        node.classList.contains('tl-wrap')||
        node.classList.contains('dui-chat-messages')||
        node.classList.contains('story-map-modal')||
        node.classList.contains('map-overlay')||
        node.classList.contains('leaflet-container')
      )){
        var style=getComputedStyle(node);
        var scrollable=/(auto|scroll)/.test(style.overflowY)||node.classList.contains('leaflet-container');
        if(scrollable&&node.scrollHeight>node.clientHeight){
          if(deltaY>0&&node.scrollTop+node.clientHeight<node.scrollHeight-2) return true;
          if(deltaY<0&&node.scrollTop>2) return true;
        }
      }
      node=node.parentElement;
    }
    return false;
  }

  function pageTurn(deltaY){
    var pages=getSnapPages();
    if(!pages.length) return;
    var idx=getCurrentSnapIndex(pages);
    var targetIdx=Math.max(0,Math.min(pages.length-1,idx+(deltaY>0?1:-1)));
    if(targetIdx===idx) return;
    pageWheelLocked=true;
    scrollingDown=deltaY>0;
    pages[targetIdx].scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){
      pageWheelLocked=false;
      pageWheelIntent=0;
    },820);
  }

  window.addEventListener('wheel',function(evt){
    if(evt.ctrlKey||evt.metaKey) return;
    if(Math.abs(evt.deltaY)<Math.abs(evt.deltaX)) return;
    if(canInnerScroll(evt.target,evt.deltaY)) return;
    evt.preventDefault();
    if(pageWheelLocked) return;
    pageWheelIntent+=evt.deltaY;
    clearTimeout(pageWheelResetTimer);
    pageWheelResetTimer=setTimeout(function(){pageWheelIntent=0;},180);
    if(Math.abs(pageWheelIntent)<18) return;
    pageTurn(pageWheelIntent);
  },{passive:false});

  function unlockDot(id){
    if(unlocked.has(id)) return;
    unlocked.add(id);
    try{localStorage.setItem(UNLOCK_KEY,JSON.stringify(Array.from(unlocked)));}catch(e){}
  }

  // ——— Unlock overlay ———
  var unlockOv=document.getElementById('unlockOverlay');
  var unlockText=document.getElementById('unlockText');
  var pendingScrollTarget=null;

  function lockScroll(){document.body.style.overflow='hidden';document.documentElement.style.overflow='hidden';}
  function unlockScroll(){document.body.style.overflow='';document.documentElement.style.overflow='';}

  function showUnlockOverlay(label,nextId){
    if(!unlockOv||!label)return;
    unlockText.textContent=label;
    unlockOv.classList.add('show');
    lockScroll();
    pendingScrollTarget=nextId;
  }

  if(unlockOv){
    unlockOv.addEventListener('click',function(){
      unlockOv.classList.remove('show');
      unlockScroll();
      if(pendingScrollTarget){
        var el=document.getElementById(pendingScrollTarget);
        if(el) setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'center'});},80);
        pendingScrollTarget=null;
      }
    });
  }

  // ——— Section divider observers ———
  var TRANSLATIONS=window.SITE_TEXT&&window.SITE_TEXT.translations||{};
  function getSceneLabel(nextId){
    var key='map-b-'+nextId;
    var lang=document.documentElement.lang==='en'?'en':'cn';
    return (TRANSLATIONS[key]&&TRANSLATIONS[key][lang])||'';
  }
  document.querySelectorAll('.section-divider').forEach(function(div){
    var nextId=div.dataset.nextId;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting||!scrollingDown||!nextId||overlaysShown.has(nextId)||unlocked.has(nextId)) return;
        if(scrollIntentSinceUnlock<48) return;
        overlaysShown.add(nextId);
        unlockDot(nextId);
        scrollIntentSinceUnlock=0;
        lastSectionScrollY=window.scrollY;
        var label=getSceneLabel(nextId)||div.dataset.nextLabel;
        if(label) showUnlockOverlay(label,nextId);
      });
    },{threshold:0.35,rootMargin:'0px 0px -12% 0px'});
    obs.observe(div);
  });

  // ——— Completion overlay (triggered when takeaway section is reached) ———
  var completionOv=document.getElementById('completionOverlay');
  var completionShown=false;
  var takeawayEl=document.getElementById('takeaway');
  if(takeawayEl&&completionOv){
    var compObs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting&&scrollingDown&&!completionShown){
          completionShown=true;
          unlockDot('takeaway');
          completionOv.classList.add('show');
          lockScroll();
        }
      });
    },{threshold:0.1});
    compObs.observe(takeawayEl);
  }
  if(completionOv){
    completionOv.addEventListener('click',function(){
      completionOv.classList.remove('show');
      unlockScroll();
      var tw=document.getElementById('takeaway');
      if(tw) setTimeout(function(){tw.scrollIntoView({behavior:'smooth',block:'start'});},100);
    });
  }

  // ——— Map Overlay ———
  var mapOverlay=document.getElementById('map-overlay');
  var mapNoticeTimer=null;
  function showMapNotice(){
    var notice=document.querySelector('.map-overlay.open .map-notice')||document.getElementById('mapNotice');
    if(!notice) return;
    clearTimeout(mapNoticeTimer);
    notice.classList.add('show');
    mapNoticeTimer=setTimeout(function(){notice.classList.remove('show');},1500);
  }
  window.showMapNotice=showMapNotice;
  if(mapOverlay){
    window.toggleMapOverlay=function(){
      mapOverlay.classList.toggle('open');
      if(mapOverlay.classList.contains('open')) lockScroll(); else unlockScroll();
    };
    var mapClose=mapOverlay.querySelector('.map-close');
    if(mapClose) mapClose.addEventListener('click',window.toggleMapOverlay);

    mapOverlay.querySelectorAll('.map-building').forEach(function(b){
      b.addEventListener('click',function(){
        var target=b.dataset.target;
        if(!target) return;
        if(!canJumpToSection(target)){
          showMapNotice();
          return;
        }
        mapOverlay.classList.remove('open');
        unlockScroll();
        jumpToSection(target);
      });
    });

    mapOverlay.addEventListener('click',function(e){if(e.target===mapOverlay){mapOverlay.classList.remove('open');unlockScroll();}});

    // ——— Dynamic viewBox: adapt to container aspect ratio ———
    var mapSvg=mapOverlay.querySelector('.illustrated-map');
    var mapWrap=mapOverlay.querySelector('.map-svg-wrap');
    if(mapSvg&&mapWrap&&typeof ResizeObserver!=='undefined'){
      var MAP_CX=450,MAP_CY=260,MAP_BW=860,MAP_BH=540,MAP_BAR=MAP_BW/MAP_BH;
      new ResizeObserver(function(entries){
        var r=entries[0].contentRect;
        if(!r.width||!r.height) return;
        var ar=r.width/r.height,vw,vh;
        if(ar>MAP_BAR){vh=MAP_BH;vw=MAP_BH*ar;}else{vw=MAP_BW;vh=MAP_BW/ar;}
        mapSvg.setAttribute('viewBox',(MAP_CX-vw/2)+' '+(MAP_CY-vh/2)+' '+vw+' '+vh);
      }).observe(mapWrap);
    }
  }

  // ——— Current section highlight ———
  var sectionObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.dataset.mapId;
        if(mapOverlay) mapOverlay.querySelectorAll('.map-building').forEach(function(b){b.classList.toggle('active',b.dataset.target===id);});
      }
    });
  },{threshold:0.2});
  document.querySelectorAll('[data-map-id]').forEach(function(el){sectionObs.observe(el);});

  var visitObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var id=entry.target.dataset.mapId||entry.target.id;
      if(id) markVisited(id);
    });
  },{threshold:0.22});
  document.querySelectorAll('.section-page,.section-intro-page,.ending-section').forEach(function(el){
    var id=el.dataset.mapId||el.id;
    if(id&&ALL_SECTIONS.indexOf(id)>-1) visitObs.observe(el);
  });

  // ——— Nav link click: suppress intermediate unlock overlays ———
  document.querySelectorAll('.nav a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var target=a.getAttribute('href').replace('#','');
      if(target){
        e.preventDefault();
        var targetIdx=ALL_SECTIONS.indexOf(target);
        if(targetIdx>-1){
          for(var i=0;i<=targetIdx;i++){
            overlaysShown.add(ALL_SECTIONS[i]);
            unlockDot(ALL_SECTIONS[i]);
          }
        }
        var el=document.getElementById(target)||document.querySelector('[data-map-id="'+target+'"]');
        if(el){
          document.documentElement.style.scrollSnapType='none';
          document.documentElement.style.scrollBehavior='auto';
          el.scrollIntoView({block:'start'});
          setTimeout(function(){
            document.documentElement.style.scrollSnapType='';
            document.documentElement.style.scrollBehavior='';
          },50);
        }
      }
    });
  });

  // ——— Nav active link ———
  var navObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.dataset.mapId||entry.target.id;
        document.querySelectorAll('.nav a').forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+id);});
      }
    });
  },{threshold:0.15});
  document.querySelectorAll('[data-map-id]').forEach(function(el){navObs.observe(el);});

  // ——— Quote Overlay (bilingual) ———
  var QUOTES=(window.SITE_TEXT&&window.SITE_TEXT.quotes)||[
    {cn:'乱了节奏也没关系，继续跳你的探戈吧。',en:'If you got tangled up, just tango on.'}
  ];

  var quoteIdx=0;
  var quoteOv=document.getElementById('quoteOverlay');
  var quoteOvText=document.getElementById('quoteOvText');
  var quoteTrigger=document.getElementById('quoteTrigger');
  var quotePrev=document.getElementById('quotePrev');
  var quoteNext=document.getElementById('quoteNext');

  function getQuoteText(q){
    if(typeof q==='string') return q;
    return currentLang==='en'?(q.en||q.cn):(q.cn||q.en);
  }

  function showQuote(idx,instant){
    quoteIdx=((idx%QUOTES.length)+QUOTES.length)%QUOTES.length;
    if(quoteOvText){
      var text=getQuoteText(QUOTES[quoteIdx]);
      if(instant){
        quoteOvText.textContent=text;
        quoteOvText.style.opacity='1';
      } else {
        quoteOvText.style.opacity='0';
        setTimeout(function(){
          quoteOvText.textContent=getQuoteText(QUOTES[quoteIdx]);
          quoteOvText.style.opacity='1';
        },200);
      }
    }
  }

  window._openQuote=function(fromEnding){
    if(quoteOv){
      showQuote(Math.floor(Math.random()*QUOTES.length),true);
      quoteOv.classList.add('show');
      lockScroll();
      if(fromEnding){
        window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'ending',origin:document.getElementById('ending')}}));
      }
    }
  };
  if(quoteTrigger){
    quoteTrigger.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      window._openQuote(true);
    });
  }
  if(quotePrev) quotePrev.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx-1);});
  if(quoteNext) quoteNext.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx+1);});
  var quoteClose=document.getElementById('quoteClose');
  function closeQuote(){quoteOv.classList.remove('show');unlockScroll();}
  if(quoteOv){
    quoteOv.addEventListener('click',function(e){
      if(e.target===quoteOv||e.target.classList.contains('quote-ov-dismiss')) closeQuote();
    });
  }
  if(quoteClose) quoteClose.addEventListener('click',function(e){e.stopPropagation();closeQuote();});

  // ——— Replay ———
  var replayBtn=document.getElementById('replayBtn');
  window.resetApp=function(){
    // Close all overlays first
    if(unlockOv)unlockOv.classList.remove('show');
    if(quoteOv)quoteOv.classList.remove('show');
    if(completionOv){completionOv.classList.remove('show');completionShown=false;}
    if(mapOverlay)mapOverlay.classList.remove('open');
    if(window.toggleStarMapOverlay) window.toggleStarMapOverlay(false);
    unlockScroll();

    // Reset map buildings and mini buildings
    document.querySelectorAll('.map-building').forEach(function(b){
      b.classList.remove('unlocked','active','map-visited','map-jumpable','map-locked');
    });
    unlocked=new Set(['hero']);visited=new Set(['hero']);overlaysShown=new Set();
    scrollIntentSinceUnlock=0;
    document.documentElement.setAttribute('data-theme','dark');
    var themeToggle=document.getElementById('themeToggle');
    if(themeToggle){
      themeToggle.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
    try{localStorage.setItem(UNLOCK_KEY,JSON.stringify(['hero']));}catch(e){}
    try{localStorage.setItem(VISITED_KEY,JSON.stringify(['hero']));}catch(e){}
    syncMapVisitedUI();

    // Reset career section
    if(window._renderCareer) window._renderCareer();

    // Reset card game — trigger custom reset if available
    if(window._resetCardGame) window._resetCardGame();
    if(window._resetSkillGarden) window._resetSkillGarden();
    if(window._resetLearning) window._resetLearning();
    if(window.resetStars) window.resetStars();
    if(window._resetHeroKeywords) window._resetHeroKeywords();

    // Reset bubbles overlay
    var spOv=document.getElementById('spOv');if(spOv)spOv.classList.remove('vis');

    // Hero overlay
    var heroOv=document.getElementById('heroOverlay');if(heroOv)heroOv.classList.remove('show');

    // Reset timeline to default (edu)
    if(window._resetTimeline) window._resetTimeline();
    else {
      var firstLegend=document.querySelector('.tl-legend-item[data-type="edu"]');
      if(firstLegend) firstLegend.click();
    }

    // Scroll to the very top instantly
    document.documentElement.style.scrollBehavior='auto';
    window.scrollTo(0,0);
    setTimeout(function(){document.documentElement.style.scrollBehavior='';},50);
  };
  if(replayBtn){
    replayBtn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      window.resetApp();
    });
  }

  // ——— Theme Toggle ———
  var themeToggle=document.getElementById('themeToggle');
    if(themeToggle){
    themeToggle.addEventListener('click',function(){
      var html=document.documentElement;
      var isLight=html.getAttribute('data-theme')==='light';
      html.setAttribute('data-theme',isLight?'dark':'light');
      themeToggle.innerHTML=isLight
        ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        :'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      updateHeroProgress();
    });
  }

  // ——— CN / EN Toggle ———
  // Add scroll-hint translation
  if(!TRANSLATIONS['scroll-hint']) TRANSLATIONS['scroll-hint']={cn:'向下滑动',en:'Scroll down'};

  var currentLang='cn';
  var langToggle=document.getElementById('langToggle');
  function setLang(lang){
    currentLang=lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key=el.dataset.i18n;
      if(!TRANSLATIONS[key]||!TRANSLATIONS[key][lang]) return;
      var txt=TRANSLATIONS[key][lang];
      // SVG map labels: split English words into tspan lines
      if(el.classList&&el.classList.contains('map-label')){
        var words=lang==='en'?txt.split(' '):[txt];
        if(words.length>1){
          var baseY=parseFloat(el.getAttribute('y'))||0;
          el.textContent='';
          words.forEach(function(w,i){
            var ts=document.createElementNS('http://www.w3.org/2000/svg','tspan');
            ts.setAttribute('x',el.getAttribute('x'));
            ts.setAttribute('dy',i===0?'0':'1.15em');
            ts.textContent=w;
            el.appendChild(ts);
          });
        } else {
          el.textContent=txt;
        }
      } else {
        el.textContent=txt;
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      var key=el.dataset.i18nHtml;
      if(TRANSLATIONS[key]&&TRANSLATIONS[key][lang]) el.innerHTML=TRANSLATIONS[key][lang];
    });
    // Update nav tooltip text for icon-only mode
    document.querySelectorAll('[data-tooltip-key]').forEach(function(el){
      var key=el.dataset.tooltipKey;
      if(TRANSLATIONS[key]&&TRANSLATIONS[key][lang]) el.dataset.tooltip=TRANSLATIONS[key][lang];
    });
    if(langToggle) langToggle.textContent=lang==='cn'?'EN':'CN';
    document.documentElement.lang=lang==='cn'?'zh-CN':'en';
    // Update the currently visible quote if the overlay is open
    if(quoteOv&&quoteOv.classList.contains('show')&&quoteOvText){
      quoteOvText.textContent=getQuoteText(QUOTES[quoteIdx]);
    }
    if(window._renderCareer) window._renderCareer();
  }
  if(langToggle) langToggle.addEventListener('click',function(){setLang(currentLang==='cn'?'en':'cn');});

  // ——— Nav overflow detection: auto icon-only when labels would collide ———
  var navEl=document.querySelector('.nav');
  function checkNavOverflow(){
    if(!navEl) return;
    // Temporarily show labels to measure
    navEl.classList.remove('icon-only');
    // requestAnimationFrame to let the browser layout
    requestAnimationFrame(function(){
      var navRight=navEl.getBoundingClientRect().right;
      var toggleGroup=document.querySelector('.toggle-group');
      var toggleLeft=toggleGroup?toggleGroup.getBoundingClientRect().left:navRight;
      // Check if any nav link's right edge would reach the toggle area
      var links=navEl.querySelectorAll('a');
      var lastLink=links[links.length-1];
      var lastRight=lastLink?lastLink.getBoundingClientRect().right:0;
      // Also check if scrollWidth exceeds clientWidth (overflow)
      var overflows=navEl.scrollWidth>navEl.clientWidth || lastRight>(toggleLeft-12);
      if(overflows) navEl.classList.add('icon-only');
    });
  }
  checkNavOverflow();
  window.addEventListener('resize',checkNavOverflow);
  // Re-check after language switch (labels change width)
  var origSetLang=setLang;
  setLang=function(lang){origSetLang(lang);setTimeout(checkNavOverflow,50);};

  // Scroll-hint click -> smooth scroll to next section
  document.querySelectorAll('.scroll-hint').forEach(function(hint){
    hint.style.cursor='pointer';
    hint.addEventListener('click',function(e){
      e.preventDefault();
      var parent=hint.closest('.section-intro-page')||hint.closest('.section-page');
      if(parent){
        var nextSnap=findNextSnap(parent);
        if(nextSnap) nextSnap.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Click outside the frame: top = previous page, bottom = next page
  function findPrevSnap(el){
    var prev=el.previousElementSibling;
    while(prev){
      if(prev.classList.contains('section-page')||prev.classList.contains('section-intro-page')||prev.classList.contains('ending-section')||prev.id==='hero') return prev;
      prev=prev.previousElementSibling;
    }
    return null;
  }
  function findNextSnap(el){
    var next=el.nextElementSibling;
    while(next){
      if(next.classList.contains('section-page')||next.classList.contains('section-intro-page')||next.classList.contains('ending-section')) return next;
      next=next.nextElementSibling;
    }
    return null;
  }

  // Hero page: click bottom half → next section (same as intro pages)
  var heroPage=document.getElementById('hero');
  if(heroPage){
    heroPage.addEventListener('click',function(e){
      if(e.target.closest('.hkw')) return;
      if(e.target.closest('.scroll-hint')) return;
      if(e.target.closest('#hero-c h1')) return;
      var rect=heroPage.getBoundingClientRect();
      var clickY=e.clientY-rect.top;
      if(clickY>rect.height*0.65){
        var next=findNextSnap(heroPage);
        if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }

  // Ending page: click top half → scroll to previous
  var endingPage=document.getElementById('ending');
  if(endingPage){
    endingPage.addEventListener('click',function(e){
      if(e.target.closest('button')) return;
      if(e.target.closest('a')) return;
      var rect=endingPage.getBoundingClientRect();
      if(e.clientY < rect.top+rect.height*0.5){
        var prev=findPrevSnap(endingPage);
        if(prev) prev.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  }

  // Intro pages: top → previous, bottom → next
  document.querySelectorAll('.section-intro-page').forEach(function(intro){
    intro.addEventListener('click',function(e){
      if(e.target.closest('.scroll-hint')) return;
      var rect=intro.getBoundingClientRect();
      var clickY=e.clientY-rect.top;
      if(clickY < rect.height*0.35){
        var prev=findPrevSnap(intro);
        if(prev) prev.scrollIntoView({behavior:'smooth',block:'start'});
      } else if(clickY > rect.height*0.65){
        var next=findNextSnap(intro);
        if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Section pages: click outside frame — above frame = previous, below frame = next
  document.querySelectorAll('.section-page').forEach(function(page){
    if(page.id==='hero') return; // handled above
    page.addEventListener('click',function(e){
      if(e.target.closest('.section-frame')) return;
      if(e.target.closest('button')) return;
      if(e.target.closest('a')) return;
      if(e.target.closest('.scroll-hint')) return;
      if(e.target.closest('.section-intro')) return;
      var frame=page.querySelector('.section-frame');
      if(!frame) return;
      var frameRect=frame.getBoundingClientRect();
      if(e.clientY < frameRect.top){
        var prev=findPrevSnap(page);
        if(prev) prev.scrollIntoView({behavior:'smooth',block:'start'});
      } else if(e.clientY > frameRect.bottom){
        var next=findNextSnap(page);
        if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

})();
