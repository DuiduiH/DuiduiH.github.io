// ===== 0.1 Who am I — Clickable floating keywords with evidence overlay =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  const KW_DATA = [
    {w:'Resilient', d:'面对项目多次方向调整，始终保持乐观和高产出', dEn:'Stayed optimistic and productive through multiple project pivots'},
    {w:'Pivot', d:'从金融赛道转向科技创业，快速适应新领域', dEn:'Transitioned from finance to tech startup, adapting quickly to a new field'},
    {w:'Assertive', d:'敢于在会议中表达不同观点，推动团队做出更优决策', dEn:'Boldly voices different perspectives in meetings, driving better team decisions'},
    {w:'Trade-off', d:'善于在有限资源下做取舍，优先攻克高杠杆任务', dEn:'Skilled at making trade-offs with limited resources, prioritizing high-leverage tasks'},
    {w:'Top-down', d:'先看全局再拆解细节，确保每一步方向正确', dEn:'Sees the big picture first, then breaks down details to ensure direction is right'},
    {w:'复利 Compound', d:'持续学习积累，相信每天进步一点点的力量', dEn:'Believes in compounding — a little progress every day adds up to something great'},
    {w:'节奏 Rhythm', d:'合理规划工作与生活节奏，保持长期高效状态', dEn:'Balances work and life rhythm for sustained high performance'},
    {w:'效率 Efficiency', d:'善用工具和方法论，用更少时间完成更多高质量工作', dEn:'Leverages tools and methodologies to deliver more quality work in less time'},
    {w:'审美 Aesthetics', d:'对产品设计和视觉呈现有高标准，注重用户体验细节', dEn:'Sets high standards for design and visual presentation, attentive to UX details'},
    {w:'探索 Explore', d:'足迹遍布多国，主动接触不同文化和领域', dEn:'Has traveled across many countries, proactively engaging with diverse cultures'},
    {w:'自信 Confident', d:'多次公开演讲和路演，展现从容自信的台风', dEn:'Delivered multiple public speeches and pitches with poise and confidence'},
    {w:'好学 Curious', d:'从金融到AI，持续跨领域学习并快速上手', dEn:'Continuously learns across domains — from finance to AI — and picks up fast'},
    {w:'主动 Proactive', d:'曾主动挖掘客户需求，贡献于客户续约', dEn:'Proactively identified client needs, contributing to client retention'},
    {w:'风险对冲 Hedging', d:'投资组合中注重风险分散，兼顾多条职业发展路径', dEn:'Diversifies both investment portfolio and career development paths'},
    {w:'机会成本 Opp. Cost', d:'每次重大选择前都会评估放弃的可能性，做出理性决策', dEn:'Evaluates opportunity costs before every major decision'},
    {w:'着眼未来 Forward', d:'提前布局AI和数据分析技能，为未来职业方向做准备', dEn:'Proactively building AI and data analytics skills for the future'},
    {w:'Tango on', d:'遇到困难不退缩，优雅地继续前行', dEn:'Faces challenges head-on and moves forward with grace'},
    {w:'现充 Wholesome', d:'工作之余积极参与社交、运动、音乐等丰富活动', dEn:'Actively participates in socializing, sports, and music beyond work'},
    {w:'向上管理 Manage Up', d:'主动与上级沟通进展和需求，建立高效协作关系', dEn:'Proactively communicates with managers on progress and needs'},
    {w:'刨根究底 Dig Deep', d:'面对问题不满足于表面答案，深入分析根本原因', dEn:'Never settles for surface answers — digs deep to find root causes'},
    {w:'思想 Thinker', d:'对商业模式和社会现象保持独立思考和深度见解', dEn:'Maintains independent thinking and deep insights on business and society'},
    {w:'多看事实 Data-driven', d:'决策基于数据和事实，而非主观臆断', dEn:'Makes decisions based on data and facts, not assumptions'}
  ];

  const c = document.getElementById('hero-kw');
  const ov = document.getElementById('heroOverlay');
  const ovWord = document.getElementById('heroOvWord');
  const ovDesc = document.getElementById('heroOvDesc');
  if(!c || !ov) return;

  KW_DATA.forEach(item => {
    const e = document.createElement('span');
    e.className = 'hkw';
    e.textContent = item.w;
    e.style.left = (5 + Math.random() * 85) + '%';
    e.style.top = (10 + Math.random() * 80) + '%';
    e.style.fontSize = (14 + Math.random() * 28) + 'px';
    e.style.animationDelay = (-Math.random() * 8) + 's';
    e.style.animationDuration = (6 + Math.random() * 6) + 's';

    e.addEventListener('click', () => {
      ovWord.textContent = item.w;
      ovDesc.textContent = isEn() ? (item.dEn||item.d) : item.d;
      ov.classList.add('show');
    });

    c.appendChild(e);
  });

  ov.addEventListener('click', () => {
    ov.classList.remove('show');
  });
})();
