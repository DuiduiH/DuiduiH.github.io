// ===== 0.1 Who am I — Clickable floating keywords (grid-layout, no overlap) =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var KW_DATA=(window.MODULE_DATA&&window.MODULE_DATA.keywords)||[];

  var c=document.getElementById('hero-kw');
  var ov=document.getElementById('heroOverlay');
  var ovWord=document.getElementById('heroOvWord');
  var ovDesc=document.getElementById('heroOvDesc');
  if(!c||!ov) return;

  var kwEls=[];

  // Grid layout: 5 columns × 5 rows = 25 cells for 22 keywords
  var COLS=5, ROWS=5, TOTAL=COLS*ROWS;
  var CW=17, CH=15;     // cell size in %
  var SX=4,  SY=10;     // start offset in %

  // Shuffle cell indices for organic appearance
  var cells=[];
  for(var i=0;i<TOTAL;i++) cells.push(i);
  for(var i=cells.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=cells[i];cells[i]=cells[j];cells[j]=t;
  }

  KW_DATA.forEach(function(item,idx){
    var cell=cells[idx];
    var col=cell%COLS, row=Math.floor(cell/COLS);
    var x=SX + col*CW + Math.random()*CW*0.35;
    var y=SY + row*CH + Math.random()*CH*0.25;
    var fs=14+Math.random()*10;

    var e=document.createElement('span');
    e.className='hkw';
    e.textContent=isEn()?item.wEn:item.wCn;
    e.style.left=x+'%';
    e.style.top=y+'%';
    e.style.fontSize=fs+'px';
    e.style.animationDelay=(-Math.random()*8)+'s';
    e.style.animationDuration=(6+Math.random()*6)+'s';

    e.addEventListener('click',function(evt){
      evt.stopPropagation();
      ovWord.textContent=isEn()?item.wEn:item.wCn;
      ovDesc.textContent=isEn()?item.dEn:item.d;
      ov.classList.add('show');
    });

    kwEls.push({el:e,data:item});
    c.appendChild(e);
  });

  ov.addEventListener('click',function(){ov.classList.remove('show');});

  // Update keyword text on language change
  window.addEventListener('click',function(evt){
    if(evt.target.id==='langToggle'){
      setTimeout(function(){
        var en=isEn();
        kwEls.forEach(function(k){
          k.el.textContent=en?k.data.wEn:k.data.wCn;
        });
      },50);
    }
  });
})();
