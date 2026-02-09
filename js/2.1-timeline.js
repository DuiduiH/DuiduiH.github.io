// ===== 2.1 Timeline =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var TL_DATA=[
    {y:'2025',t:'edu',title:'学校名称 · 专业/学位',titleEn:'University · Major/Degree',d:'简要描述',dEn:'Brief description'},
    {y:'2024',t:'work',title:'公司/机构 · 职位',titleEn:'Company · Position',d:'工作内容简述',dEn:'Work description'},
    {y:'2024',t:'proj',title:'项目名称',titleEn:'Project Name',d:'项目描述与你的角色',dEn:'Project description & your role'},
    {y:'2023',t:'culture',title:'文化活动/交流',titleEn:'Cultural Activity',d:'简要描述',dEn:'Brief description'},
    {y:'2023',t:'honor',title:'荣誉/奖项',titleEn:'Honor/Award',d:'获奖描述',dEn:'Award description'},
    {y:'2023',t:'edu',title:'学校名称 · 专业/学位',titleEn:'University · Major/Degree',d:'简要描述',dEn:'Brief description'},
    {y:'2022',t:'work',title:'公司/机构 · 职位',titleEn:'Company · Position',d:'工作内容简述',dEn:'Work description'},
    {y:'2022',t:'proj',title:'项目名称',titleEn:'Project Name',d:'项目描述与你的角色',dEn:'Project description & your role'},
    {y:'2021',t:'honor',title:'荣誉/奖项',titleEn:'Honor/Award',d:'获奖描述',dEn:'Award description'},
    {y:'2021',t:'edu',title:'学校名称 · 专业/学位',titleEn:'University · Major/Degree',d:'简要描述',dEn:'Brief description'}
  ];

  var tm={edu:'tl-edu',work:'tl-work',proj:'tl-proj',culture:'tl-culture',honor:'tl-honor'};
  var lm={edu:{cn:'学业',en:'Education'},work:{cn:'工作',en:'Work'},proj:{cn:'项目',en:'Project'},culture:{cn:'文化',en:'Culture'},honor:{cn:'荣誉',en:'Honor'}};

  function render(){
    var c=document.getElementById('tlWrap');if(!c)return;
    // Keep the tl-line, remove old items
    var line=c.querySelector('.tl-line');
    c.innerHTML='';
    if(line) c.appendChild(line); else { var l=document.createElement('div');l.className='tl-line';c.appendChild(l);}
    var en=isEn();
    TL_DATA.forEach(function(it){
      var e=document.createElement('div');
      e.className='tl-item '+tm[it.t];
      var catLabel=en?lm[it.t].en:lm[it.t].cn;
      var title=en?(it.titleEn||it.title):it.title;
      var desc=en?(it.dEn||it.d):it.d;
      e.innerHTML='<div class="tl-dot"></div><div class="tl-time">'+it.y+' · '+catLabel+'</div><div class="tl-title">'+title+'</div><div class="tl-desc">'+desc+'</div>';
      c.appendChild(e);
    });
  }

  render();
  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
