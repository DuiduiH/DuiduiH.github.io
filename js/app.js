// ===== App — Unlock, Map, Replay, Quote Overlay, Lang, Theme =====
(function(){
  var ALL_SECTIONS = ['hero','interest','career','study','worldmap','timelines','skills','takeaway'];

  var unlocked = new Set(['hero']);
  var overlaysShown = new Set();
  var lastScrollY = window.scrollY;
  var scrollingDown = true;

  window.addEventListener('scroll',function(){
    scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;
  },{passive:true});

  function unlockDot(id){
    if(unlocked.has(id)) return;
    unlocked.add(id);
    var bld=document.querySelector('.map-building[data-target="'+id+'"]');
    if(bld) bld.classList.add('unlocked');
    var mini=document.querySelector('.mini-bld[data-target="'+id+'"]');
    if(mini) mini.classList.add('unlocked');
  }

  (function(){
    var b=document.querySelector('.map-building[data-target="hero"]');
    if(b) b.classList.add('unlocked');
    var m=document.querySelector('.mini-bld[data-target="hero"]');
    if(m) m.classList.add('unlocked');
  })();

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
        if(entry.isIntersecting&&scrollingDown&&nextId&&!overlaysShown.has(nextId)){
          overlaysShown.add(nextId);
          unlockDot(nextId);
          var label=getSceneLabel(nextId)||div.dataset.nextLabel;
          if(label) showUnlockOverlay(label,nextId);
        }
      });
    },{threshold:0.1});
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
          ALL_SECTIONS.forEach(function(id){unlockDot(id);});
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
  var mapBtn=document.getElementById('map-btn');
  var mapOverlay=document.getElementById('map-overlay');
  if(mapBtn&&mapOverlay){
    window.toggleMapOverlay=function(){
      mapOverlay.classList.toggle('open');
      if(mapOverlay.classList.contains('open')) lockScroll(); else unlockScroll();
    };
    mapBtn.addEventListener('click',window.toggleMapOverlay);
    var mapClose=mapOverlay.querySelector('.map-close');
    if(mapClose) mapClose.addEventListener('click',window.toggleMapOverlay);

    // All map buildings are always clickable (no unlock check)
    mapOverlay.querySelectorAll('.map-building').forEach(function(b){
      b.addEventListener('click',function(){
        var target=b.dataset.target;
        if(target){
          var el=document.getElementById(target)||document.querySelector('[data-map-id="'+target+'"]');
          if(el){
            mapOverlay.classList.remove('open');
            unlockScroll();
            setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},100);
          }
        }
      });
    });

    mapOverlay.addEventListener('click',function(e){if(e.target===mapOverlay){mapOverlay.classList.remove('open');unlockScroll();}});
  }

  // ——— Current section highlight ———
  var sectionObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.dataset.mapId;
        document.querySelectorAll('.mini-bld').forEach(function(b){b.classList.remove('active');});
        var miniB=document.querySelector('.mini-bld[data-target="'+id+'"]');
        if(miniB) miniB.classList.add('active');
        if(mapOverlay) mapOverlay.querySelectorAll('.map-building').forEach(function(b){b.classList.toggle('active',b.dataset.target===id);});
      }
    });
  },{threshold:0.2});
  document.querySelectorAll('[data-map-id]').forEach(function(el){sectionObs.observe(el);});

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

  window._openQuote=function(){
    if(quoteOv){
      showQuote(Math.floor(Math.random()*QUOTES.length),true);
      quoteOv.classList.add('show');
      lockScroll();
    }
  };
  if(quoteTrigger){
    quoteTrigger.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      window._openQuote();
    });
  }
  if(quotePrev) quotePrev.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx-1);});
  if(quoteNext) quoteNext.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx+1);});
  if(quoteOv){
    quoteOv.addEventListener('click',function(e){
      if(e.target===quoteOv||e.target.classList.contains('quote-ov-dismiss')){
        quoteOv.classList.remove('show');
        unlockScroll();
      }
    });
  }

  // ——— Replay ———
  var replayBtn=document.getElementById('replayBtn');
  window.resetApp=function(){
    // Close all overlays first
    if(unlockOv)unlockOv.classList.remove('show');
    if(quoteOv)quoteOv.classList.remove('show');
    if(completionOv){completionOv.classList.remove('show');completionShown=false;}
    if(mapOverlay)mapOverlay.classList.remove('open');
    unlockScroll();

    // Reset map buildings and mini buildings
    document.querySelectorAll('.map-building').forEach(function(b){b.classList.remove('unlocked','active');});
    document.querySelectorAll('.mini-bld').forEach(function(b){b.classList.remove('unlocked','active');});
    unlocked=new Set(['hero']);overlaysShown=new Set();
    var heroBld=document.querySelector('.map-building[data-target="hero"]');
    if(heroBld) heroBld.classList.add('unlocked');
    var heroMini=document.querySelector('.mini-bld[data-target="hero"]');
    if(heroMini) heroMini.classList.add('unlocked');

    // Reset career section
    var mbag=document.getElementById('mbag');if(mbag)mbag.classList.remove('open');
    var egg=document.getElementById('eggArea');if(egg)egg.classList.remove('cracked');
    var careerOv=document.getElementById('careerOv');if(careerOv)careerOv.classList.remove('show');

    // Reset card game — trigger custom reset if available
    if(window._resetCardGame) window._resetCardGame();

    // Reset bubbles overlay
    var spOv=document.getElementById('spOv');if(spOv)spOv.classList.remove('vis');

    // Hero overlay
    var heroOv=document.getElementById('heroOverlay');if(heroOv)heroOv.classList.remove('show');

    // Reset timeline to default (edu)
    var firstLegend=document.querySelector('.tl-legend-item[data-type="edu"]');
    if(firstLegend) firstLegend.click();

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
      if(TRANSLATIONS[key]&&TRANSLATIONS[key][lang]) el.textContent=TRANSLATIONS[key][lang];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function(el){
      var key=el.dataset.i18nHtml;
      if(TRANSLATIONS[key]&&TRANSLATIONS[key][lang]) el.innerHTML=TRANSLATIONS[key][lang];
    });
    if(langToggle) langToggle.textContent=lang==='cn'?'EN':'中文';
    document.documentElement.lang=lang==='cn'?'zh-CN':'en';
    // Update the currently visible quote if the overlay is open
    if(quoteOv&&quoteOv.classList.contains('show')&&quoteOvText){
      quoteOvText.textContent=getQuoteText(QUOTES[quoteIdx]);
    }
  }
  if(langToggle) langToggle.addEventListener('click',function(){setLang(currentLang==='cn'?'en':'cn');});

  // Scroll-hint click -> smooth scroll to next section
  document.querySelectorAll('.scroll-hint').forEach(function(hint){
    hint.style.cursor='pointer';
    hint.addEventListener('click',function(e){
      e.preventDefault();
      var parent=hint.closest('.section-intro-page')||hint.closest('.section-page');
      if(parent&&parent.nextElementSibling){
        parent.nextElementSibling.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Also allow clicking the intro page itself (lower half) to advance
  document.querySelectorAll('.section-intro-page').forEach(function(intro){
    intro.addEventListener('click',function(e){
      // Don't hijack clicks on the scroll-hint itself (already handled)
      if(e.target.closest('.scroll-hint')) return;
      // Only trigger if click is in bottom 40% of the intro
      var rect=intro.getBoundingClientRect();
      if(e.clientY > rect.top + rect.height*0.6){
        var next=intro.nextElementSibling;
        if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  // Allow clicking below the section-frame in any section-page to advance to next section
  document.querySelectorAll('.section-page').forEach(function(page){
    page.addEventListener('click',function(e){
      // Don't hijack clicks on interactive elements inside the frame
      if(e.target.closest('.section-frame')) return;
      if(e.target.closest('button')) return;
      if(e.target.closest('a')) return;
      if(e.target.closest('.scroll-hint')) return;
      if(e.target.closest('.section-intro')) return;
      // Only trigger if click is below the frame (lower part of the page)
      var frame=page.querySelector('.section-frame');
      if(frame){
        var frameRect=frame.getBoundingClientRect();
        if(e.clientY > frameRect.bottom){
          var next=page.nextElementSibling;
          if(next) next.scrollIntoView({behavior:'smooth',block:'start'});
        }
      }
    });
  });

})();
