// ===== 0.1 Who am I — Clickable floating keywords (CN/EN toggle) =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var KW_DATA=[
    {wCn:'有韧性',wEn:'Resilient',d:'面对项目多次方向调整，始终保持乐观和高产出',dEn:'Stayed optimistic and productive through multiple project pivots'},
    {wCn:'善转型',wEn:'Pivot',d:'从金融赛道转向科技创业，快速适应新领域',dEn:'Transitioned from finance to tech startup, adapting quickly'},
    {wCn:'果敢',wEn:'Assertive',d:'敢于在会议中表达不同观点，推动团队更优决策',dEn:'Boldly voices different perspectives, driving better decisions'},
    {wCn:'善取舍',wEn:'Trade-off',d:'善于在有限资源下做取舍，优先攻克高杠杆任务',dEn:'Skilled at trade-offs with limited resources, prioritizing high-leverage tasks'},
    {wCn:'全局思维',wEn:'Top-down',d:'先看全局再拆解细节，确保每一步方向正确',dEn:'Sees the big picture first, then breaks down details'},
    {wCn:'相信复利',wEn:'Compound',d:'持续学习积累，相信每天进步一点点的力量',dEn:'Believes in compounding — a little progress every day adds up'},
    {wCn:'有节奏感',wEn:'Rhythm',d:'合理规划工作与生活节奏，保持长期高效',dEn:'Balances work and life rhythm for sustained performance'},
    {wCn:'重效率',wEn:'Efficient',d:'善用工具和方法论，更少时间完成更多高质量工作',dEn:'Leverages tools to deliver more quality work in less time'},
    {wCn:'有审美',wEn:'Aesthetic',d:'对产品设计和视觉有高标准，注重用户体验细节',dEn:'High standards for design and visual presentation'},
    {wCn:'爱探索',wEn:'Explorer',d:'足迹遍布15+国家，主动接触不同文化和领域',dEn:'Traveled 15+ countries, engaging with diverse cultures'},
    {wCn:'自信',wEn:'Confident',d:'多次公开演讲和路演，展现从容自信的台风',dEn:'Multiple public speeches and pitches with poise'},
    {wCn:'好学',wEn:'Curious',d:'从金融到AI，持续跨领域学习并快速上手',dEn:'Learns across domains — from finance to AI — and picks up fast'},
    {wCn:'极具主动性',wEn:'Proactive',d:'曾主动挖掘客户需求，贡献于客户续约',dEn:'Proactively identified client needs, contributing to retention'},
    {wCn:'风险对冲',wEn:'Hedging',d:'注重风险分散，兼顾多条职业发展路径',dEn:'Diversifies both investment portfolio and career paths'},
    {wCn:'机会成本',wEn:'Opp. Cost',d:'每次重大选择前评估放弃的可能性，理性决策',dEn:'Evaluates opportunity costs before every major decision'},
    {wCn:'着眼未来',wEn:'Forward',d:'提前布局AI和数据分析技能，为未来做准备',dEn:'Proactively building AI and analytics skills for the future'},
    {wCn:'继续前行',wEn:'Tango On',d:'遇到困难不退缩，优雅地继续前行',dEn:'Faces challenges head-on, moves forward with grace'},
    {wCn:'超级现充',wEn:'Wholesome',d:'工作之余积极参与社交、运动、音乐等丰富活动',dEn:'Active in socializing, sports, and music beyond work'},
    {wCn:'向上管理',wEn:'Manage Up',d:'主动与上级沟通进展和需求，建立高效协作关系',dEn:'Proactively communicates with managers on progress'},
    {wCn:'刨根究底',wEn:'Dig Deep',d:'不满足于表面答案，深入分析根本原因',dEn:'Never settles for surface answers — finds root causes'},
    {wCn:'有思想',wEn:'Thinker',d:'对商业模式和社会现象保持独立思考和深度见解',dEn:'Independent thinking on business and society'},
    {wCn:'数据驱动',wEn:'Data-driven',d:'决策基于数据和事实，而非主观臆断',dEn:'Decisions based on data and facts, not assumptions'}
  ];

  var c=document.getElementById('hero-kw');
  var ov=document.getElementById('heroOverlay');
  var ovWord=document.getElementById('heroOvWord');
  var ovDesc=document.getElementById('heroOvDesc');
  if(!c||!ov) return;

  var kwEls=[];

  KW_DATA.forEach(function(item){
    var e=document.createElement('span');
    e.className='hkw';
    e.textContent=isEn()?item.wEn:item.wCn;
    e.style.left=(5+Math.random()*85)+'%';
    e.style.top=(10+Math.random()*80)+'%';
    e.style.fontSize=(14+Math.random()*28)+'px';
    e.style.animationDelay=(-Math.random()*8)+'s';
    e.style.animationDuration=(6+Math.random()*6)+'s';

    e.addEventListener('click',function(){
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
