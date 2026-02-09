// ===== 2.1 Timeline — Full data + Legend Toggle =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var TL_DATA=[
    {y:'2026.01 — 03',t:'work',title:'国金证券 · 投行实习生',titleEn:'Sinolink Securities · IB Intern',d:'资本咨询总部（新兴产业与战略事业部）· 上海浦东',dEn:'Capital Advisory HQ (Emerging Industries) · Shanghai Pudong'},
    {y:'2026.01 — 02',t:'proj',title:'腾讯未来产品经理创造营',titleEn:'Tencent Future PM Camp',d:'产品方法论入门，从0到1了解产品经理，产出20页+笔记',dEn:'PM methodology, built understanding from scratch, 20+ pages of notes'},
    {y:'2025.12 — 至今',t:'proj',title:'复旦大学国际合作处 · 助理管理员',titleEn:'Fudan Intl Cooperation Office · Assistant',d:'负责2026秋季北欧国家校级交换派出协调',dEn:'Coordinating Nordic exchange programs for Fall 2026'},
    {y:'2025.03 — 2026.01',t:'work',title:'沄视科技 · AI产品经理',titleEn:'Yunshi Tech · AI Product Manager',d:'需求挖掘·MVP团队6人组建·SOP制定·客户效率提升50%',dEn:'Demand discovery · Built 6-person MVP team · SOPs · 50% efficiency boost'},
    {y:'2025.03 — 2026.01',t:'work',title:'沄视科技 · CEO助理',titleEn:'Yunshi Tech · CEO Assistant',d:'5人标注团队管理·30+小时高层会议·欧洲市场拓展·签约€10万',dEn:'5-person team mgmt · 30+ hrs exec meetings · EU expansion · €100K signed'},
    {y:'2025.03',t:'honor',title:'HREOS环浙步道自行车女子精英组奖金',titleEn:'HREOS Zhejiang Cycling Women\'s Elite Prize',d:'鸿鲸体育',dEn:'HREOS Sports'},
    {y:'2024.08 — 12',t:'edu',title:'奥斯陆大学 · 人文学院 · 交换',titleEn:'University of Oslo · Humanities · Exchange',d:'挪威 · 奥斯陆',dEn:'Norway · Oslo'},
    {y:'2024.05',t:'honor',title:'上海市大学生自行车锦标赛 · 个人计时赛女子组季军',titleEn:'Shanghai University Cycling Championship — Women\'s 3rd',d:'上海市自行车协会',dEn:'Shanghai Cycling Association'},
    {y:'2024.05',t:'honor',title:'优秀共青团员（五月评优）',titleEn:'Outstanding CYL Member (May)',d:'复旦大学团委',dEn:'Fudan CYL Committee'},
    {y:'2024.03 — 2026.06',t:'culture',title:'复旦大学自行车协会 · 宣传部核心成员',titleEn:'Fudan Cycling Club · Publicity Core Member',d:'远征财务总监·无人机航拍·公众号推文·海报绘制',dEn:'Expedition CFO · Drone aerial · WeChat articles · Poster design'},
    {y:'2023.12',t:'honor',title:'基础学科专业奖学金',titleEn:'Foundational Discipline Scholarship',d:'复旦大学中文系',dEn:'Fudan Chinese Dept'},
    {y:'2023.10',t:'honor',title:'复旦大学优秀学生（十月评优）',titleEn:'Fudan Outstanding Student (October)',d:'复旦大学',dEn:'Fudan University'},
    {y:'2023.09 — 10',t:'proj',title:'乐律文化 ·「芥末唱」App研发助理',titleEn:'Lvlv Culture · "JieMo Sing" App Dev Asst',d:'Praat音频标注·音高切分·乐谱校对',dEn:'Praat audio annotation · Pitch segmentation · Score verification'},
    {y:'2023.09',t:'honor',title:'优秀学生三等奖学金',titleEn:'Third-Class Scholarship',d:'复旦大学',dEn:'Fudan University'},
    {y:'2023.08 — 09',t:'work',title:'戊戌资产 · 投资研究助理',titleEn:'Wuxu Asset Mgmt · Research Asst',d:'Stata因子回归200+数据·Python语调分析·输出证券研究报告',dEn:'Stata factor regression 200+ data · Python tone analysis · Research report'},
    {y:'2023.07 — 08',t:'edu',title:'德克萨斯大学奥斯汀分校 · 暑校',titleEn:'UT Austin · Summer School',d:'会计学 · 美国得克萨斯',dEn:'Accounting · USA · Texas'},
    {y:'2023.05',t:'honor',title:'优秀共青团员（五月评优）',titleEn:'Outstanding CYL Member (May)',d:'复旦大学团委',dEn:'Fudan CYL Committee'},
    {y:'2023.01 — 02',t:'work',title:'国枫律所（西安）· IPO助理',titleEn:'Grandway Law (Xi\'an) · IPO Asst',d:'财务报表分析·20+可视化图表·企业估值·投资建议',dEn:'Financial statements · 20+ charts · Valuation · Investment advice'},
    {y:'2022.07 — 08',t:'work',title:'瑞达期货（陕西）· 投资研究助理',titleEn:'Ruida Futures (Shaanxi) · Research Asst',d:'港股/科创板上市规则·尽职调查·IPO法律意见书',dEn:'HK/STAR Market rules · Due diligence · IPO legal opinions'},
    {y:'2022.02 — 2026.06',t:'culture',title:'复旦大学Echo合唱团',titleEn:'Fudan Echo Choir',d:'新媒体负责人·女高声部长·30+成员管理·10+场音乐厅演出',dEn:'Media Director · Soprano Lead · 30+ members · 10+ concert hall performances'},
    {y:'2021.09 — 2026.06',t:'edu',title:'复旦大学 · 汉语言 + 经济学 & 金融学',titleEn:'Fudan University · Chinese Lang + Econ & Finance',d:'中国 · 上海',dEn:'China · Shanghai'},
    {y:'2018.09 — 2021.06',t:'edu',title:'陕西师范大学附属中学 · 文科',titleEn:'SNNU High School · Liberal Arts',d:'中国 · 陕西 · 西安',dEn:'China · Shaanxi · Xi\'an'}
  ];

  var tm={edu:'tl-edu',work:'tl-work',proj:'tl-proj',culture:'tl-culture',honor:'tl-honor'};
  var lm={edu:{cn:'学业',en:'Education'},work:{cn:'工作',en:'Work'},proj:{cn:'项目',en:'Projects'},culture:{cn:'文化',en:'Culture'},honor:{cn:'荣誉',en:'Honors'}};

  function render(){
    var c=document.getElementById('tlWrap');if(!c)return;
    var line=c.querySelector('.tl-line');
    c.innerHTML='';
    if(line) c.appendChild(line); else {var l=document.createElement('div');l.className='tl-line';c.appendChild(l);}
    var en=isEn();
    // Check which types are hidden
    var hidden={};
    document.querySelectorAll('.tl-legend-item.tl-hidden').forEach(function(item){
      if(item.dataset.type) hidden[item.dataset.type]=true;
    });
    TL_DATA.forEach(function(it){
      var e=document.createElement('div');
      e.className='tl-item '+tm[it.t];
      if(hidden[it.t]) e.style.display='none';
      var catLabel=en?lm[it.t].en:lm[it.t].cn;
      var title=en?(it.titleEn||it.title):it.title;
      var desc=en?(it.dEn||it.d):it.d;
      e.innerHTML='<div class="tl-dot"></div><div class="tl-time">'+it.y+' · '+catLabel+'</div><div class="tl-title">'+title+'</div><div class="tl-desc">'+desc+'</div>';
      c.appendChild(e);
    });
  }

  render();

  // Legend toggle
  document.querySelectorAll('.tl-legend-item').forEach(function(item){
    item.addEventListener('click',function(){
      item.classList.toggle('tl-hidden');
      var type=item.dataset.type;
      if(!type) return;
      var hide=item.classList.contains('tl-hidden');
      document.querySelectorAll('.tl-item.tl-'+type).forEach(function(el){
        el.style.display=hide?'none':'';
      });
    });
  });

  // Re-render on language change
  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
