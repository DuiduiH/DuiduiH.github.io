// ===== App — Unlock, Map, Replay, Quote Overlay, Lang, Theme =====
(function(){
  var DOT_COLORS = {
    hero:'#38bdf8', interest:'#38bdf8', career:'#38bdf8',
    study:'#38bdf8', worldmap:'#38bdf8', skills:'#38bdf8',
    timelines:'#38bdf8', takeaway:'#38bdf8'
  };

  var unlocked = new Set(['hero']);
  var overlaysShown = new Set();
  var completionShown = false;
  var lastScrollY = window.scrollY;
  var scrollingDown = true;

  window.addEventListener('scroll',function(){
    scrollingDown = window.scrollY > lastScrollY;
    lastScrollY = window.scrollY;
  },{passive:true});

  // ——— Minimap dot unlock ———
  function unlockDot(id){
    if(unlocked.has(id)) return;
    unlocked.add(id);
    var dot=document.getElementById('mini-dot-'+id);
    if(dot&&DOT_COLORS[id]){dot.setAttribute('fill',DOT_COLORS[id]);dot.setAttribute('opacity','0.85');}
    var bld=document.querySelector('.map-building[data-target="'+id+'"]');
    if(bld) bld.classList.add('unlocked');
  }

  // Init hero
  (function(){
    var d=document.getElementById('mini-dot-hero');
    if(d){d.setAttribute('fill',DOT_COLORS.hero);d.setAttribute('opacity','.85');}
    var b=document.querySelector('.map-building[data-target="hero"]');
    if(b) b.classList.add('unlocked');
  })();

  // ——— Unlock overlay ———
  var unlockOv=document.getElementById('unlockOverlay');
  var unlockText=document.getElementById('unlockText');
  var pendingScrollTarget=null;

  function showUnlockOverlay(label,nextId){
    if(!unlockOv||!label)return;
    unlockText.textContent=label;
    unlockOv.classList.add('show');
    document.body.style.overflow='hidden';
    pendingScrollTarget=nextId;
  }

  if(unlockOv){
    unlockOv.addEventListener('click',function(){
      unlockOv.classList.remove('show');
      document.body.style.overflow='';
      if(pendingScrollTarget){
        var el=document.getElementById(pendingScrollTarget);
        if(el) setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'center'});},80);
        pendingScrollTarget=null;
      }
    });
  }

  // ——— Section divider observers — only trigger on scroll DOWN ———
  document.querySelectorAll('.section-divider').forEach(function(div){
    var nextId=div.dataset.nextId,nextLabel=div.dataset.nextLabel;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting&&scrollingDown&&nextId&&!overlaysShown.has(nextId)){
          overlaysShown.add(nextId);
          unlockDot(nextId);
          if(nextLabel) showUnlockOverlay(nextLabel,nextId);
        }
      });
    },{threshold:0.1});
    obs.observe(div);
  });

  // ——— Completion overlay ———
  var completionOv=document.getElementById('completionOverlay');
  if(completionOv){
    var endingEl=document.querySelector('[data-map-id="ending"]');
    if(endingEl){
      var endObs=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting&&scrollingDown&&!completionShown){
            completionShown=true;
            Object.keys(DOT_COLORS).forEach(function(id){unlockDot(id);});
            completionOv.classList.add('show');
            document.body.style.overflow='hidden';
          }
        });
      },{threshold:0.3});
      endObs.observe(endingEl);
    }
    completionOv.addEventListener('click',function(){
      completionOv.classList.remove('show');
      document.body.style.overflow='';
    });
  }

  // ——— Map Overlay ———
  var mapBtn=document.getElementById('map-btn');
  var mapOverlay=document.getElementById('map-overlay');
  if(mapBtn&&mapOverlay){
    window.toggleMapOverlay=function(){
      mapOverlay.classList.toggle('open');
      document.body.style.overflow=mapOverlay.classList.contains('open')?'hidden':'';
    };
    mapBtn.addEventListener('click',window.toggleMapOverlay);
    var mapClose=mapOverlay.querySelector('.map-close');
    if(mapClose) mapClose.addEventListener('click',window.toggleMapOverlay);
    mapOverlay.querySelectorAll('.map-building').forEach(function(b){
      b.addEventListener('click',function(){
        var target=b.dataset.target;
        if(target&&unlocked.has(target)){
          var el=document.querySelector('[data-map-id="'+target+'"]');
          if(el){mapOverlay.classList.remove('open');document.body.style.overflow='';setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'});},100);}
        }
      });
    });
    mapOverlay.addEventListener('click',function(e){if(e.target===mapOverlay){mapOverlay.classList.remove('open');document.body.style.overflow='';}});
  }

  // ——— Current section highlight ———
  var sectionObs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id=entry.target.dataset.mapId;
        document.querySelectorAll('.mini-dot').forEach(function(d){d.setAttribute('r','3');});
        var dot=document.getElementById('mini-dot-'+id);
        if(dot) dot.setAttribute('r','5');
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

  // ——— Quote Overlay with Prev/Next ———
  var QUOTES=[
    'If you got tangled up, just tango on.',
    'The best time to plant a tree was 20 years ago. The second best time is now.',
    'Stay hungry, stay foolish.',
    '慢慢来，就是最快的。',
    '相信复利的力量。',
    '无所求必满载而归。',
    '着眼未来，活在当下。',
    '要有节奏感。',
    '多看事实，少看观点。',
    'Done is better than perfect.',
    'The only way to do great work is to love what you do.',
    'Be yourself; everyone else is already taken.',
    'In the middle of difficulty lies opportunity.',
    '生活不止眼前的苟且，还有诗和远方。',
    '把每一天当作最后一天来过，你终将找到正确的方向。',
    'Not all those who wander are lost.',
    'The future belongs to those who believe in the beauty of their dreams.',
    '种一棵树最好的时间是十年前，其次是现在。',
    'Life is what happens when you\'re busy making other plans.',
    '你要悄悄拔尖，然后惊艳所有人。'
  ];

  var quoteIdx=0;
  var quoteOv=document.getElementById('quoteOverlay');
  var quoteOvText=document.getElementById('quoteOvText');
  var quoteTrigger=document.getElementById('quoteTrigger');
  var quotePrev=document.getElementById('quotePrev');
  var quoteNext=document.getElementById('quoteNext');

  function showQuote(idx){
    quoteIdx=((idx%QUOTES.length)+QUOTES.length)%QUOTES.length;
    if(quoteOvText){
      quoteOvText.style.opacity='0';
      setTimeout(function(){
        quoteOvText.textContent=QUOTES[quoteIdx];
        quoteOvText.style.opacity='1';
      },200);
    }
  }

  if(quoteTrigger&&quoteOv){
    quoteTrigger.addEventListener('click',function(){
      showQuote(Math.floor(Math.random()*QUOTES.length));
      quoteOv.classList.add('show');
      document.body.style.overflow='hidden';
    });
  }
  if(quotePrev) quotePrev.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx-1);});
  if(quoteNext) quoteNext.addEventListener('click',function(e){e.stopPropagation();showQuote(quoteIdx+1);});
  if(quoteOv){
    quoteOv.addEventListener('click',function(e){
      if(e.target===quoteOv||e.target.classList.contains('quote-ov-dismiss')){
        quoteOv.classList.remove('show');
        document.body.style.overflow='';
      }
    });
  }

  // ——— Replay ———
  window.resetApp=function(){
    Object.keys(DOT_COLORS).forEach(function(id){
      var dot=document.getElementById('mini-dot-'+id);
      if(dot){dot.setAttribute('fill','#374151');dot.setAttribute('opacity','.4');dot.setAttribute('r','3');}
    });
    document.querySelectorAll('.map-building').forEach(function(b){b.classList.remove('unlocked');});
    unlocked=new Set(['hero']);overlaysShown=new Set();completionShown=false;
    var heroDot=document.getElementById('mini-dot-hero');
    if(heroDot){heroDot.setAttribute('fill',DOT_COLORS.hero);heroDot.setAttribute('opacity','.85');}
    var heroBld=document.querySelector('.map-building[data-target="hero"]');
    if(heroBld) heroBld.classList.add('unlocked');
    var mbag=document.getElementById('mbag');if(mbag)mbag.classList.remove('open');
    var egg=document.getElementById('eggArea');if(egg)egg.classList.remove('cracked');
    var shuffleBtn=document.getElementById('shuffleBtn');if(shuffleBtn)shuffleBtn.click();
    if(unlockOv)unlockOv.classList.remove('show');
    if(completionOv)completionOv.classList.remove('show');
    if(quoteOv)quoteOv.classList.remove('show');
    document.body.style.overflow='';
    window.scrollTo({top:0,behavior:'smooth'});
  };

  // ——— Theme Toggle ———
  var themeToggle=document.getElementById('themeToggle');
  if(themeToggle){
    themeToggle.addEventListener('click',function(){
      var html=document.documentElement;
      var isLight=html.getAttribute('data-theme')==='light';
      html.setAttribute('data-theme',isLight?'dark':'light');
      themeToggle.textContent=isLight?'':'';
      // Update SVG icon
      themeToggle.innerHTML=isLight
        ?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        :'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  }

  // ——— CN / EN Toggle ———
  var TRANSLATIONS={
    'nav-hero':{cn:'我是谁',en:'About Me'},'nav-interest':{cn:'兴趣',en:'Interests'},'nav-career':{cn:'工作',en:'Career'},'nav-study':{cn:'学习',en:'Learning'},'nav-worldmap':{cn:'足迹',en:'Footprints'},'nav-skills':{cn:'技能',en:'Skills'},'nav-timelines':{cn:'经历',en:'Experience'},'nav-takeaway':{cn:'联系XD',en:'Contact XD'},
    'hero-hint':{cn:'点击关键词了解更多',en:'Click a keyword to learn more'},
    'dismiss-click':{cn:'点击任意处关闭',en:'Click anywhere to close'},
    'interest-welcome':{cn:'欢迎来到兴趣游乐场',en:'Welcome to the Hobby Playground'},
    'interest-desc':{cn:'了解一个人，从TA的兴趣开始<br>翻翻卡片，看看小对藏了哪些宝藏爱好',en:'The best way to know someone is through their hobbies<br>Flip the cards to discover XD\'s hidden interests'},
    'interest-title':{cn:'兴趣对对碰',en:'Hobby Match'},
    'interest-rules':{cn:'翻开两张同类卡片即可配对，点击「打乱重来」可重新开始',en:'Flip two cards of the same category to match. Click "Shuffle" to restart'},
    'shuffle-btn':{cn:'打乱重来',en:'Shuffle'},
    'game-hint':{cn:'翻开两张同类卡片试试看！',en:'Try flipping two cards of the same type!'},
    'career-welcome':{cn:'欢迎来到事业大厦',en:'Welcome to the Career Tower'},
    'career-desc':{cn:'小对的职业版图就藏在这里<br>点开钱袋和鸡蛋，来一探究竟',en:'XD\'s career path is hidden here<br>Click the money bag and egg to explore'},
    'career-title':{cn:'金融 × 初创',en:'Finance × Startup'},
    'career-rules':{cn:'点击左边的钱袋和右边的鸡蛋，探索小对的事业版图',en:'Click the money bag (left) and egg (right) to explore'},
    'career-hint-bag':{cn:'点击钱袋',en:'Click the bag'},
    'career-hint-egg':{cn:'点击鸡蛋',en:'Click the egg'},
    'study-welcome':{cn:'欢迎来到学习湖泊',en:'Welcome to the Knowledge Lake'},
    'study-desc':{cn:'学习湖泊里漂浮着许多知识泡泡<br>戳开一个，学习一个新词汇吧',en:'The Knowledge Lake is filled with bubbles<br>Pop one to learn a new term'},
    'study-title':{cn:'知识泡泡',en:'Knowledge Bubbles'},
    'study-rules':{cn:'湖里的泡泡装着各种知识——戳开它，随机学一个新词汇',en:'Each bubble holds knowledge — pop it to learn something new'},
    'bubble-hint':{cn:'戳开泡泡试试看',en:'Try popping a bubble'},
    'worldmap-welcome':{cn:'欢迎来到个人杂货铺',en:'Welcome to the Personal Bazaar'},
    'worldmap-desc':{cn:'小对的足迹遍布世界各地<br>来看看她都去过哪里、会说什么语言',en:'XD\'s footprints span the globe<br>See where she\'s been and what languages she speaks'},
    'worldmap-title':{cn:'我与世界',en:'Me & The World'},
    'map-visit':{cn:'我去过',en:'Visited'},'map-lang':{cn:'我会说这里的语言',en:'I speak the language'},
    'map-travel':{cn:'旅行',en:'Travel'},'map-short':{cn:'短居',en:'Short stay'},'map-long':{cn:'长住',en:'Long stay'},
    'map-beginner':{cn:'入门',en:'Beginner'},'map-proficient':{cn:'熟练',en:'Proficient'},'map-fluent':{cn:'精通',en:'Fluent'},'map-native':{cn:'母语',en:'Native'},
    'map-instr':{cn:'点击标记切换 · 滚轮缩放 · 拖拽平移',en:'Click to toggle · Scroll to zoom · Drag to pan'},
    'skills-welcome':{cn:'欢迎来到技能花园',en:'Welcome to the Skill Garden'},
    'skills-desc':{cn:'每一片叶子都是一项技能<br>一起看看小对的技能全景图',en:'Every leaf represents a skill<br>Explore XD\'s full skill panorama'},
    'skills-title':{cn:'个人技能树',en:'Skill Tree'},
    'timelines-welcome':{cn:'欢迎来到钟表店',en:'Welcome to the Clock Shop'},
    'timelines-desc':{cn:'时间记录着每一段经历<br>跟着时间轴，回顾小对的成长足迹',en:'Time marks every chapter<br>Follow the timeline to trace XD\'s growth'},
    'timelines-title':{cn:'时间轴',en:'Timeline'},
    'timelines-rules':{cn:'按时间顺序记录学业、工作、项目、文化和荣誉',en:'Education, work, projects, culture & honors in chronological order'},
    'tl-edu':{cn:'学业',en:'Education'},'tl-work':{cn:'工作',en:'Work'},'tl-proj':{cn:'项目',en:'Projects'},'tl-culture':{cn:'文化',en:'Culture'},'tl-honor':{cn:'荣誉',en:'Honors'},
    'takeaway-welcome':{cn:'感谢你的探索',en:'Thanks for exploring'},
    'takeaway-desc':{cn:'希望你对小对有了更深的了解',en:'Hope you know XD a little better now'},
    'takeaway-title':{cn:'联系方式',en:'Contact'},
    'contact-wechat':{cn:'微信',en:'WeChat'},'contact-email':{cn:'邮箱',en:'Email'},'contact-linkedin':{cn:'领英',en:'LinkedIn'},
    'ending-label':{cn:'旅途的终点',en:'End of the journey'},
    'quote-trigger':{cn:'点击查看 XD 送给你的一句话',en:'Click to see a quote from XD'},
    'replay-btn':{cn:'再玩一次',en:'Play again'},
    'unlock-congrats':{cn:'恭喜你解锁下一场景',en:'You\'ve unlocked the next scene'},
    'unlock-dismiss':{cn:'点击任意处继续',en:'Click anywhere to continue'},
    'completion-title':{cn:'恭喜你顺利通关！',en:'Congratulations!'},
    'completion-p1':{cn:'认识小对的小游戏到这里就结束啦，',en:'The adventure of getting to know XD ends here,'},
    'completion-p2':{cn:'但小对和你的故事才刚刚开始，',en:'but XD\'s story with you is just beginning,'},
    'completion-p3':{cn:'让我们一起继续探索吧，',en:'let\'s keep exploring together,'},
    'completion-p4':{cn:'相信她一定会给你带来惊喜！',en:'she\'s sure to surprise you!'},
    'quote-prev':{cn:'上一句',en:'Prev'},'quote-next':{cn:'换一句',en:'Next'},'quote-close':{cn:'点击空白处关闭',en:'Click outside to close'}
  };

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
  }
  if(langToggle) langToggle.addEventListener('click',function(){setLang(currentLang==='cn'?'en':'cn');});

})();
