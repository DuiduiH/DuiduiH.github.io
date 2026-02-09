// ===== 2.1 Timeline — Exclusive selection (click one = show only that one) =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var TL_DATA=(window.MODULE_DATA&&window.MODULE_DATA.timeline)||[];

  var tm={edu:'tl-edu',work:'tl-work',proj:'tl-proj',culture:'tl-culture',honor:'tl-honor'};
  var lm={edu:{cn:'学业',en:'Education'},work:{cn:'工作',en:'Work'},proj:{cn:'项目',en:'Projects'},culture:{cn:'文化',en:'Culture'},honor:{cn:'荣誉',en:'Honors'}};

  var activeType='edu'; // only one active at a time

  function render(){
    var c=document.getElementById('tlWrap');if(!c)return;
    var line=c.querySelector('.tl-line');
    c.innerHTML='';
    if(line) c.appendChild(line); else {var l=document.createElement('div');l.className='tl-line';c.appendChild(l);}
    var en=isEn();
    TL_DATA.forEach(function(it){
      var e=document.createElement('div');
      e.className='tl-item '+tm[it.t];
      if(it.t!==activeType) e.style.display='none';
      var catLabel=en?lm[it.t].en:lm[it.t].cn;
      var title=en?(it.titleEn||it.title):it.title;
      var desc=en?(it.dEn||it.d):it.d;
      e.innerHTML='<div class="tl-dot"></div><div class="tl-time">'+it.y+' · '+catLabel+'</div><div class="tl-title">'+title+'</div><div class="tl-desc">'+desc+'</div>';
      c.appendChild(e);
    });
  }

  function updateLegendUI(){
    document.querySelectorAll('.tl-legend-item').forEach(function(item){
      if(item.dataset.type===activeType){
        item.classList.remove('tl-hidden');
        item.classList.add('tl-active');
      } else {
        item.classList.add('tl-hidden');
        item.classList.remove('tl-active');
      }
    });
  }

  // Initial state
  updateLegendUI();
  render();

  // Legend click — exclusive: click one, only that one shows
  document.querySelectorAll('.tl-legend-item').forEach(function(item){
    item.addEventListener('click',function(){
      var type=item.dataset.type;
      if(!type) return;
      activeType=type;
      updateLegendUI();
      // Show/hide timeline items
      document.querySelectorAll('.tl-item').forEach(function(el){
        var isMatch=false;
        // Check which type this item belongs to
        Object.keys(tm).forEach(function(k){
          if(el.classList.contains(tm[k])&&k===activeType) isMatch=true;
        });
        el.style.display=isMatch?'':'none';
      });
    });
  });

  // Re-render on language change
  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
