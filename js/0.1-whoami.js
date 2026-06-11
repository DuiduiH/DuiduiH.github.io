// ===== 0.1 Who am I — Clickable star keywords =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var KW_DATA=(window.MODULE_DATA&&window.MODULE_DATA.keywords)||[];

  var c=document.getElementById('hero-kw');
  var ov=document.getElementById('heroOverlay');
  var ovWord=document.getElementById('heroOvWord');
  var ovDesc=document.getElementById('heroOvDesc');
  if(!c||!ov||!KW_DATA.length) return;

  var kwEls=[];
  var DECO_COUNT=48;
  var keywordsSeen=new Set();
  var KEYWORDS_FOR_STAR=3;

  function maybeHeroStar(origin){
    if(keywordsSeen.size<KEYWORDS_FOR_STAR) return;
    window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'hero',origin:origin||c}}));
  }

  function pickDecoPosition(){
    var x,y;
    for(var i=0;i<40;i++){
      x=4+Math.random()*92;
      y=8+Math.random()*82;
      var inTitleZone=x>35&&x<65&&y>36&&y<58;
      var inNavZone=y<7;
      if(!inTitleZone&&!inNavZone) break;
    }
    return {x:x,y:y};
  }

  function pickKeywordPosition(index,total){
    var angle=(index/total)*Math.PI*2-Math.PI/2;
    var ring=index%3;
    var radius=22+ring*9;
    var x=50+Math.cos(angle)*radius*0.95;
    var y=46+Math.sin(angle)*radius*0.72;
    x=Math.max(8,Math.min(92,x));
    y=Math.max(10,Math.min(88,y));
    return {x:x,y:y};
  }

  function addDecoStar(index){
    var pos=pickDecoPosition();
    var starSize=1.2+Math.random()*3.2;
    var starGlow=8+Math.random()*14;
    var twinkle=0.35+Math.random()*0.45;
    var kw=KW_DATA[index%KW_DATA.length];
    var e=document.createElement('span');
    e.className='hkw hkw-deco';
    e.setAttribute('role','button');
    e.setAttribute('tabindex','0');
    e.setAttribute('aria-label',isEn()?kw.wEn:kw.wCn);
    e.style.left=pos.x+'%';
    e.style.top=pos.y+'%';
    e.style.setProperty('--star-size',starSize+'px');
    e.style.setProperty('--star-glow',starGlow+'px');
    e.style.setProperty('--star-opacity',twinkle);
    e.style.animationDelay=(-Math.random()*8)+'s';
    e.style.animationDuration=(5+Math.random()*7)+'s';
    var label=document.createElement('span');
    label.className='hkw-label';
    label.textContent=isEn()?kw.wEn:kw.wCn;
    e.appendChild(label);
    e.addEventListener('click',function(evt){openKeyword(evt,kw,e);});
    e.addEventListener('keydown',function(evt){
      if(evt.key==='Enter'||evt.key===' '){
        evt.preventDefault();
        openKeyword(evt,kw,e);
      }
    });
    kwEls.push({el:e,label:label,data:kw});
    c.appendChild(e);
  }

  function openKeyword(evt,kw,originEl){
    evt.stopPropagation();
    var text=isEn()?kw.wEn:kw.wCn;
    keywordsSeen.add(text);
    ovWord.textContent=text;
    ovDesc.textContent=isEn()?kw.dEn:kw.d;
    ov.classList.add('show');
    maybeHeroStar(originEl);
  }

  KW_DATA.forEach(function(kw,ki){
    var pos=pickKeywordPosition(ki,KW_DATA.length);
    var starSize=3.2+((ki%3)*0.6);
    var starGlow=14+((ki%4)*3);
    var twinkle=0.62+((ki%5)*0.06);

    var e=document.createElement('span');
    e.className='hkw hkw-key';
    e.setAttribute('role','button');
    e.setAttribute('tabindex','0');
    e.setAttribute('aria-label',isEn()?kw.wEn:kw.wCn);
    e.style.left=pos.x+'%';
    e.style.top=pos.y+'%';
    e.style.setProperty('--star-size',starSize+'px');
    e.style.setProperty('--star-glow',starGlow+'px');
    e.style.setProperty('--star-opacity',twinkle);
    e.style.animationDelay=((ki%7)*-0.85)+'s';
    e.style.animationDuration=(5.5+((ki%4)*0.8))+'s';

    var label=document.createElement('span');
    label.className='hkw-label';
    label.textContent=isEn()?kw.wEn:kw.wCn;
    e.appendChild(label);

    e.addEventListener('click',function(evt){openKeyword(evt,kw,e);});
    e.addEventListener('keydown',function(evt){
      if(evt.key==='Enter'||evt.key===' '){
        evt.preventDefault();
        openKeyword(evt,kw,e);
      }
    });

    kwEls.push({el:e,label:label,data:kw});
    c.appendChild(e);
  });

  for(var d=0;d<DECO_COUNT;d++) addDecoStar(d);

  window._resetHeroKeywords=function(){
    keywordsSeen=new Set();
  };

  ov.addEventListener('click',function(){ov.classList.remove('show');});

  window.addEventListener('click',function(evt){
    if(evt.target.id==='langToggle'){
      setTimeout(function(){
        var en=isEn();
        kwEls.forEach(function(k){
          var text=en?k.data.wEn:k.data.wCn;
          k.label.textContent=text;
          k.el.setAttribute('aria-label',text);
        });
      },50);
    }
  });
})();
