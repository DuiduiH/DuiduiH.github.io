// ===== 1.1 Card Matching Game (bilingual, colored status, inline shuffle trigger) =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var isLight=function(){return document.documentElement.getAttribute('data-theme')==='light';};
  var CAT=(window.MODULE_DATA&&window.MODULE_DATA.hobbyCategories)||{};
  var HOBBIES=(window.MODULE_DATA&&window.MODULE_DATA.hobbies)||[];
  var T=(window.SITE_TEXT&&window.SITE_TEXT.translations)||{};

  var board=document.getElementById('gameBoard');
  // Use the section-rules element for game status feedback
  var rulesEl=board?board.closest('.section-frame').querySelector('.section-rules'):null;
  if(!board)return;
  var cards,flipped=[],matched=0,canFlip=true,revertTimer=null;

  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  function getColor(cat){
    var s=CAT[cat];
    if(!s) return '#666';
    return isLight()?(s.cl||s.c):s.c;
  }

  function rulesHTML(){
    var en=isEn();
    var htmlKey='interest-rules-html';
    if(T[htmlKey]&&T[htmlKey][en?'en':'cn']) return T[htmlKey][en?'en':'cn'];
    if(en) return 'Flip two cards of the same category to match. Click "<a class="shuffle-link" href="#">Shuffle</a>" to restart';
    return '翻开两张同类卡片即可配对，点击「<a class="shuffle-link" href="#">打乱重来</a>」可重新开始';
  }

  function setRulesDefault(){
    if(!rulesEl)return;
    rulesEl.innerHTML=rulesHTML();
    rulesEl.style.color='';
    rulesEl.style.fontWeight='';
    // Bind shuffle trigger inside the rules text
    var link=rulesEl.querySelector('.shuffle-link');
    if(link) link.addEventListener('click',function(e){e.preventDefault();init();});
  }

  function setStatus(msg,color,persist){
    if(!rulesEl)return;
    if(revertTimer){clearTimeout(revertTimer);revertTimer=null;}
    rulesEl.textContent=msg;
    rulesEl.style.color=color||'';
    rulesEl.style.fontWeight=color?'700':'';
    if(!persist){
      revertTimer=setTimeout(function(){
        setRulesDefault();
      },3000);
    }
  }

  function init(){
    board.innerHTML='';cards=HOBBIES.slice();shuffle(cards);flipped=[];matched=0;canFlip=true;
    if(revertTimer){clearTimeout(revertTimer);revertTimer=null;}
    setRulesDefault();
    var en=isEn();
    cards.forEach(function(it){
      var s=CAT[it.c],el=document.createElement('div');
      el.className='card';el.dataset.category=it.c;el.dataset.itemCn=it.n;el.dataset.itemEn=it.en||it.n;el.dataset.catKey=it.c;
      var catLabel=en?(s.en||s.l):s.l;
      var itemLabel=en?(it.en||it.n):it.n;
      var color=getColor(it.c);
      var iconPath=it.i||(s&&s.i)||'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z';
      el.innerHTML='<div class="card-inner"><div class="card-front" style="background:'+color+'"><span class="cname">'+catLabel+'</span><div class="clogo"><svg viewBox="0 0 24 24" fill="currentColor"><path d="'+iconPath+'"/></svg></div><span class="iname">'+itemLabel+'</span></div><div class="card-back"></div></div>';
      board.appendChild(el);
    });
  }

  // Update card labels without re-init (preserves flip/match state)
  function updateCardLang(){
    var en=isEn();
    board.querySelectorAll('.card').forEach(function(card){
      var catKey=card.dataset.catKey;
      var s=CAT[catKey];
      if(!s)return;
      var cnameEl=card.querySelector('.cname');
      var inameEl=card.querySelector('.iname');
      if(cnameEl) cnameEl.textContent=en?(s.en||s.l):s.l;
      if(inameEl) inameEl.textContent=en?(card.dataset.itemEn||card.dataset.itemCn):card.dataset.itemCn;
    });
    // Also update the rules/status text if it's currently showing the default
    if(rulesEl&&!revertTimer){
      setRulesDefault();
    }
  }

  function flip(card){
    if(!canFlip||card.classList.contains('flipped')||card.classList.contains('matched'))return;
    card.classList.add('flipped');flipped.push(card);
    var en=isEn();
    if(flipped.length===2){
      canFlip=false;var a=flipped[0],b=flipped[1];
      if(a!==b&&a.dataset.category===b.dataset.category){
        a.classList.add('matched');b.classList.add('matched');flipped=[];matched+=2;canFlip=true;
        // Use the matched category's color for the status message
        var matchColor=getColor(a.dataset.category);
        if(matched>=cards.length){
          setStatus(en?'All matched! Well done!':'恭喜你完成全部配对！',matchColor,true);
          window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'interest'}}));
        } else {
          setStatus(en?('Match! '+matched+'/'+cards.length):('配对成功！'+matched+'/'+cards.length),matchColor,false);
        }
      } else {
        setStatus(en?'No match, try again':'不匹配，再试一次','',false);
        setTimeout(function(){a.classList.remove('flipped');b.classList.remove('flipped');flipped=[];canFlip=true;},900);
      }
    }
  }

  // Event delegation on the board — click anywhere inside a .card triggers flip
  board.addEventListener('click',function(e){
    var card=e.target.closest('.card');
    if(card) flip(card);
  });

  // Event delegation for shuffle-link inside the rules area (survives innerHTML updates)
  var frame=board.closest('.section-frame');
  if(frame) frame.addEventListener('click',function(e){
    if(e.target.classList.contains('shuffle-link')){
      e.preventDefault();
      init();
    }
  });

  // Expose reset for replay
  window._resetCardGame=init;

  init();

  // On theme change: update card colors WITHOUT resetting game progress
  function updateCardColors(){
    board.querySelectorAll('.card').forEach(function(card){
      var catKey=card.dataset.catKey;
      var color=getColor(catKey);
      var front=card.querySelector('.card-front');
      if(front) front.style.background=color;
    });
  }

  var obs=new MutationObserver(function(mutations){
    mutations.forEach(function(m){
      if(m.attributeName==='data-theme') updateCardColors();
      if(m.attributeName==='lang') updateCardLang();
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','lang']});
})();
