// ===== 1.2 Career — Money Bag (flip) & Egg =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var ov=document.getElementById('careerOv'),ovText=document.getElementById('careerOvText');
  if(!ov)return;

  var LABELS={
    '期货':{cn:'期货',en:'Futures'},
    '律所IPO':{cn:'律所IPO',en:'Law Firm IPO'},
    '私募':{cn:'私募',en:'Private Equity'},
    '券商投行':{cn:'券商投行',en:'Investment Bank'},
    '沄视科技':{cn:'沄视科技',en:'Yunshi Tech'},
    '金融经历':{cn:'金融经历',en:'Finance Experience'},
    '初创经历':{cn:'初创经历',en:'Startup Experience'}
  };

  function showOv(key){
    var label=LABELS[key];
    ovText.textContent=label?(isEn()?label.en:label.cn):key;
    ov.classList.add('show');
  }
  ov.addEventListener('click',function(){ov.classList.remove('show');});

  // money bag
  var mbag=document.getElementById('mbag');
  if(mbag){
    mbag.addEventListener('click',function(e){
      if(e.target.closest('.gcoin'))return;
      mbag.classList.toggle('open');
    });
    var coins=mbag.querySelectorAll('.gcoin');
    for(var i=0;i<coins.length;i++){
      (function(c){
        c.addEventListener('click',function(e){e.stopPropagation();showOv(c.dataset.co);});
      })(coins[i]);
    }
  }

  // egg
  var egg=document.getElementById('eggArea'),cloud=document.getElementById('cloudReveal');
  if(egg){
    egg.addEventListener('click',function(e){
      if(e.target.closest('.cloud-reveal'))return;
      if(!egg.classList.contains('cracked'))egg.classList.add('cracked');
    });
  }
  if(cloud){
    cloud.addEventListener('click',function(e){e.stopPropagation();showOv('沄视科技');});
  }
})();
