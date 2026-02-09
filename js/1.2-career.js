// ===== 1.2 Career — Money Bag (flip) & Egg, real companies =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var ov=document.getElementById('careerOv'),ovText=document.getElementById('careerOvText');
  if(!ov)return;

  var LABELS=(window.MODULE_DATA&&window.MODULE_DATA.careerLabels)||{};

  function showOv(key){
    var label=LABELS[key];
    ovText.textContent=label?(isEn()?label.en:label.cn):key;
    ov.classList.add('show');
  }
  ov.addEventListener('click',function(){ov.classList.remove('show');});

  // money bag — click on the SVG itself
  var mbag=document.getElementById('mbag');
  var mbagSvg=mbag?mbag.querySelector('.mbag-svg'):null;
  if(mbag&&mbagSvg){
    mbagSvg.addEventListener('click',function(e){
      e.stopPropagation();
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
