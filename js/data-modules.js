// ═══════════════════════════════════════════════════════════════
//  data-modules.js — 各模块的动态数据内容
//  Dynamic content for each interactive module.
//  修改此文件即可修改关键词、兴趣卡片、事业标签、知识泡泡、技能树、时间轴等。
// ═══════════════════════════════════════════════════════════════
window.MODULE_DATA = {

  // ─── Who Am I 关键词 ───
  keywords: [
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
  ],

  // ─── 兴趣对对碰 ───
  // c = dark-mode color, cl = light-mode Morandi color
  hobbyCategories: {
    music:{l:'音乐类',en:'Music',c:'#9333ea',cl:'#c4a8d8'},
    sports:{l:'运动类',en:'Sports',c:'#16a34a',cl:'#8ec5a0'},
    experience:{l:'体验类',en:'Experience',c:'#0284c7',cl:'#89bdd3'},
    arts:{l:'文艺类',en:'Arts',c:'#ea580c',cl:'#e0b08a'}
  },
  // Each hobby has its own SVG icon path (24×24 viewBox)
  hobbies: [
    {n:'合唱',en:'Choir',c:'music',i:'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z'},
    {n:'钢琴',en:'Piano',c:'music',i:'M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12H8V8h4v6zm6 0h-4V8h4v6z'},
    {n:'小提琴',en:'Violin',c:'music',i:'M20.7 3.3a1 1 0 0 0-1.4 0L17 5.6l-1.3-1.3-1.4 1.4L15.6 7l-4.3 4.3c-1.4-.7-3.2-.4-4.3.7L5.6 13.4a3 3 0 0 0 0 4.2l1 1a3 3 0 0 0 4.2 0L12.1 17c1.1-1.1 1.4-2.9.7-4.3L17 8.4l1.3 1.3 1.4-1.4L18.4 7l2.3-2.3a1 1 0 0 0 0-1.4z'},
    {n:'音乐剧',en:'Musical',c:'music',i:'M2 16.1A5 5 0 0 0 11 18V6.83l10-2.5V12a3.5 3.5 0 1 1-2-3.17V2L9 4.5V15a3.5 3.5 0 1 1-2-3.17V8L2 9.5v6.6z'},
    {n:'铁三',en:'Triathlon',c:'sports',i:'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 1.1-5.2C15.3 12 16.1 12 16.5 12c.8 0 1.5-.1 2-.3V6c-.5.2-1.2.3-2 .3-.6 0-1.2-.1-1.7-.3l-2-1-1-1.1L9.8 8.9z'},
    {n:'公路车',en:'Road Bike',c:'sports',i:'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM10.9 8.6l2.1 2v4.9h-2V12l-3.8-3.2L10.9 8.6z'},
    {n:'Gravel',en:'Gravel',c:'sports',i:'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM4 17c-2.2 0-4 1.8-4 4h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.2-1.8-4-4-4zm16 0c-2.2 0-4 1.8-4 4h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-2.2-1.8-4-4-4zM12.6 9L8 13h3.3l-1.8 5h2.2l5-7h-3.5l1.4-2z'},
    {n:'马拉松',en:'Marathon',c:'sports',i:'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-2.8C15 12.8 17 14 19.5 14v-2c-2 0-3.7-1-4.5-2.5l-1-1.7c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L7 8.8V13h2V9.6l.8-.7z'},
    {n:'游泳',en:'Swimming',c:'sports',i:'M22 21c-1.1 0-1.7-.4-2.2-.8-.4-.3-.7-.5-1-.5s-.6.2-1 .5c-.5.4-1.1.8-2.2.8s-1.7-.4-2.2-.8c-.4-.3-.7-.5-1-.5s-.6.2-1 .5c-.5.4-1.1.8-2.2.8s-1.7-.4-2.2-.8c-.4-.3-.7-.5-1-.5s-.6.2-1 .5c-.5.4-1.1.8-2.2.8v-2c.3 0 .6-.2 1-.5.5-.4 1.1-.8 2.2-.8s1.7.4 2.2.8c.4.3.7.5 1 .5s.6-.2 1-.5c.5-.4 1.1-.8 2.2-.8s1.7.4 2.2.8c.4.3.7.5 1 .5s.6-.2 1-.5c.5-.4 1.1-.8 2.2-.8s1.7.4 2.2.8c.4.3.7.5 1 .5v2zM22 16.4c-1.1 0-1.7-.4-2.2-.8-.4-.3-.7-.5-1-.5s-.6.2-1 .5c-.5.4-1.1.8-2.2.8s-1.7-.4-2.2-.8c-.4-.3-.7-.5-1-.5s-.6.2-1 .5c-.5.4-1.1.8-2.2.8V14l5.5-3.4a2 2 0 0 0 .3-2.9l-2.5-3-.6 3.4L10 10V6.5l3.5-1c.5-.1.9-.5 1-1l.4-2.3c-.9.1-1.7.6-2.1 1.3L10 7.4 7 9v5.6c.8 0 1.5.3 2 .7.4.3.7.5 1 .5s.6-.2 1-.5c.5-.4 1.1-.8 2.2-.8s1.7.4 2.2.8c.4.3.7.5 1 .5s.6-.2 1-.5c.5-.4 1.1-.8 2.2-.8s1.7.4 2.2.8c.4.3.7.5 1 .5v2z'},
    {n:'徒步',en:'Hiking',c:'sports',i:'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-2.8C15 12.8 17 14 19.5 14v-2c-2 0-3.7-1-4.5-2.5l-1-1.7c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L7 8.8V13h2V9.6l.8-.7z'},
    {n:'旅行',en:'Travel',c:'experience',i:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'},
    {n:'摄影',en:'Photo',c:'experience',i:'M12 10.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'},
    {n:'学语言',en:'Languages',c:'experience',i:'M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'},
    {n:'美食探店',en:'Foodie',c:'experience',i:'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z'},
    {n:'KTV',en:'KTV',c:'experience',i:'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21c0 .55.45 1 1 1s1-.45 1-1v-3.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z'},
    {n:'无人机',en:'Drone',c:'experience',i:'M22 11V8.8l-2.6-.6c-.1-.4-.3-.7-.5-1l1.1-2.4-1.6-1.6-2.4 1.1c-.3-.2-.6-.4-1-.5L14.4 1h-2.2l-.6 2.6c-.4.1-.7.3-1 .5L8.2 3 6.6 4.6l1.1 2.4c-.2.3-.4.6-.5 1L4.6 8.6V11H2v2h2.6l.6 2.6c.1.4.3.7.5 1L4.6 19l1.6 1.6 2.4-1.1c.3.2.6.4 1 .5l.6 2.6h2.2l.6-2.6c.4-.1.7-.3 1-.5l2.4 1.1 1.6-1.6-1.1-2.4c.2-.3.4-.6.5-1l2.6-.6V13h2v-2h-2.6zM12 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z'},
    {n:'阅读',en:'Reading',c:'arts',i:'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'},
    {n:'电影',en:'Film',c:'arts',i:'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z'},
    {n:'主持',en:'Hosting',c:'arts',i:'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V21c0 .55.45 1 1 1s1-.45 1-1v-3.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z'},
    {n:'写作',en:'Writing',c:'arts',i:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'}
  ],

  // ─── 事业标签 ───
  careerLabels: {
    '期货':{cn:'瑞达期货 · 投资研究助理',en:'Ruida Futures · Research Asst'},
    '律所IPO':{cn:'国枫律所 · IPO助理',en:'Grandway Law · IPO Asst'},
    '私募':{cn:'戊戌资产 · 投资研究助理',en:'Wuxu Asset · Research Asst'},
    '券商投行':{cn:'国金证券 · 投行实习生',en:'Sinolink Securities · IB Intern'},
    '沄视科技':{cn:'沄视科技 · AI产品经理 & CEO助理',en:'Yunshi Tech · AI PM & CEO Asst'},
    '金融经历':{cn:'金融经历',en:'Finance Experience'},
    '初创经历':{cn:'初创经历',en:'Startup Experience'}
  },

  // ─── 知识泡泡 ───
  bubbleTopics: [
    {id:'internet',name:'互联网',en:'Internet',color:'#60a5fa',entries:[{term:'互联网黑话',en:'Buzzwords',desc:'赋能、抓手、底层逻辑、颗粒度……这些词在互联网公司的会议里每天都在飞。',descEn:'Empower, leverage, underlying logic, granularity... buzzwords flying in every tech meeting.'},{term:'DAU / MAU',en:'DAU / MAU',desc:'日活跃用户/月活跃用户，衡量一个产品有多少人真的在用。',descEn:'Daily/Monthly Active Users — the core metric for how many people actually use a product.'},{term:'用户增长飞轮',en:'Growth Flywheel',desc:'通过产品体验→口碑→新用户→更多数据→更好体验的循环实现自增长。',descEn:'A self-reinforcing loop: better product → word of mouth → new users → more data → even better product.'}]},
    {id:'ecommerce',name:'电商',en:'E-commerce',color:'#f87171',entries:[{term:'GMV',en:'GMV',desc:'Gross Merchandise Volume，成交总额。电商人每天盯着看的核心数字。',descEn:'Gross Merchandise Volume — the total sales value e-commerce people watch daily.'},{term:'转化率',en:'Conversion Rate',desc:'从浏览到下单的比例，每提高0.1%都意味着巨大的收入增长。',descEn:'The ratio from browsing to purchasing. Every 0.1% improvement means huge revenue growth.'}]},
    {id:'pm',name:'产品经理',en:'Product Mgmt',color:'#a78bfa',entries:[{term:'需求池',en:'Backlog',desc:'产品经理的武器库——所有待做的功能和改进都在这里排队等候。',descEn:'The PM\'s arsenal — all features and improvements queued up and waiting.'},{term:'MVP',en:'MVP',desc:'最小可行产品。先做一个最简单的版本验证想法，再逐步迭代。',descEn:'Minimum Viable Product. Build the simplest version first, then iterate.'},{term:'用户故事',en:'User Story',desc:'"作为一个XX用户，我想要XX，以便XX"——产品经理思考需求的标准句式。',descEn:'"As a [user], I want [feature] so that [benefit]" — the standard PM requirement format.'}]},
    {id:'retail',name:'零售',en:'Retail',color:'#34d399',entries:[{term:'SKU',en:'SKU',desc:'Stock Keeping Unit，最小存货单位。一个颜色、一个尺码就是一个SKU。',descEn:'Stock Keeping Unit — the smallest inventory unit. One color + one size = one SKU.'},{term:'坪效',en:'Sales per sqm',desc:'每平米产生的销售额，衡量零售空间效率的核心指标。',descEn:'Sales per square meter — the core metric for retail space efficiency.'}]},
    {id:'ai',name:'AI',en:'AI',color:'#c084fc',entries:[{term:'大模型（LLM）',en:'LLM',desc:'在海量文本上训练出的"语言大脑"，能理解和生成人类语言。',descEn:'A "language brain" trained on massive text data, capable of understanding and generating human language.'},{term:'Prompt Engineering',en:'Prompt Engineering',desc:'如何给AI写好指令？这是一门新兴的"提问的艺术"。',descEn:'How to write good instructions for AI? It\'s an emerging "art of asking questions."'},{term:'幻觉',en:'Hallucination',desc:'AI有时会自信地编造不存在的事实——就像人类有时也会记错。',descEn:'When AI confidently fabricates non-existent facts — just like humans sometimes misremember.'}]},
    {id:'nn',name:'神经网络',en:'Neural Nets',color:'#f9a8d4',entries:[{term:'反向传播',en:'Backpropagation',desc:'神经网络的"自我纠正"机制——通过误差一层层反推，自动调整权重。',descEn:'The neural network\'s self-correction mechanism — errors propagate back layer by layer to adjust weights.'},{term:'Transformer',en:'Transformer',desc:'注意力机制的集大成者，ChatGPT背后的核心架构。',descEn:'The pinnacle of attention mechanisms — the core architecture behind ChatGPT.'}]},
    {id:'economics',name:'经济学',en:'Economics',color:'#fbbf24',entries:[{term:'边际效用递减',en:'Diminishing Returns',desc:'第一块披萨最香，第十块就只是填肚子——经济学最直观的规律。',descEn:'The first slice of pizza tastes the best, the tenth is just filling — economics\' most intuitive law.'},{term:'沉没成本谬误',en:'Sunk Cost Fallacy',desc:'已经投入的时间和金钱不应该影响未来决策，但人们总是放不下。',descEn:'Past investments shouldn\'t affect future decisions, yet people can never let go.'},{term:'帕累托法则',en:'Pareto Principle',desc:'80/20法则——20%的努力产生80%的结果。',descEn:'The 80/20 rule — 20% of effort produces 80% of results.'}]},
    {id:'invest',name:'投资',en:'Investing',color:'#fcd34d',entries:[{term:'分散投资',en:'Diversification',desc:'不要把鸡蛋放在一个篮子里——这是投资的第一课。',descEn:'Don\'t put all your eggs in one basket — the first lesson of investing.'},{term:'蒙特卡洛模拟',en:'Monte Carlo',desc:'用大量随机模拟来预测不确定性结果，金融工程师的常用工具。',descEn:'Using massive random simulations to predict uncertain outcomes — a financial engineer\'s go-to tool.'}]},
    {id:'linguistics',name:'语言学',en:'Linguistics',color:'#5eead4',entries:[{term:'结构主义',en:'Structuralism',desc:'索绪尔提出：语言是一个系统，每个词的意义来自它与其他词的关系。',descEn:'Saussure proposed: language is a system where each word\'s meaning comes from its relation to others.'}]},
    {id:'comm',name:'传播学',en:'Communications',color:'#fdba74',entries:[{term:'5W模型',en:'5W Model',desc:'Who说What通过What Channel对Whom产生What Effect——拉斯韦尔的经典传播模型。',descEn:'Who says What through What Channel to Whom with What Effect — Lasswell\'s classic communication model.'}]},
    {id:'symphony',name:'交响乐',en:'Symphony',color:'#c4b5fd',entries:[{term:'交响乐团编制',en:'Orchestra Sections',desc:'弦乐组铺底色，木管出旋律，铜管加高光，打击乐点睛——一个好乐团像一家好公司。',descEn:'Strings lay the foundation, woodwinds carry melody, brass adds highlights, percussion punctuates — a good orchestra runs like a good company.'}]},
    {id:'choir',name:'合唱',en:'Choir',color:'#f0abfc',entries:[{term:'四个声部',en:'SATB',desc:'Soprano · Alto · Tenor · Bass——SATB，合唱的基本编制。',descEn:'Soprano · Alto · Tenor · Bass — the four fundamental voice parts of a choir.'}]},
    {id:'meme',name:'互联网热梗',en:'Memes',color:'#fca5a5',entries:[{term:'遥遥领先',en:'Way Ahead',desc:'从华为发布会金句变成全民口头禅——热梗的传播力就是这么强。',descEn:'From Huawei\'s keynote catchphrase to everyone\'s daily slang — that\'s the power of memes.'}]}
  ],

  // ─── 技能树 ───
  skillBranches: [
    {name:'语言认证',en:'Certifications',color:'#ef4444',skills:[{cn:'CET-4',en:'CET-4',x:145,y:125},{cn:'CET-6',en:'CET-6',x:190,y:165},{cn:'IELTS',en:'IELTS',x:160,y:200},{cn:'普通话',en:'Mandarin',x:210,y:210}]},
    {name:'数据编程',en:'Data & Code',color:'#f59e0b',skills:[{cn:'Python',en:'Python',x:250,y:100},{cn:'Stata',en:'Stata',x:300,y:115},{cn:'Excel',en:'Excel',x:270,y:155},{cn:'VSCode',en:'VSCode',x:315,y:170}]},
    {name:'产品能力',en:'Product',color:'#22c55e',skills:[{cn:'PRD',en:'PRD',x:360,y:85},{cn:'Figma',en:'Figma',x:400,y:110},{cn:'React',en:'React',x:370,y:145},{cn:'测试',en:'Testing',x:420,y:155}]},
    {name:'AI工具',en:'AI Tools',color:'#3b82f6',skills:[{cn:'GPT',en:'GPT',x:460,y:100},{cn:'Gemini',en:'Gemini',x:500,y:130},{cn:'豆包',en:'Doubao',x:475,y:165},{cn:'Vibe',en:'Vibe',x:520,y:175}]},
    {name:'创意宣发',en:'Creative',color:'#a855f7',skills:[{cn:'Adobe',en:'Adobe',x:540,y:120},{cn:'视频',en:'Video',x:570,y:155},{cn:'海报',en:'Poster',x:530,y:195},{cn:'排版',en:'Layout',x:565,y:205}]},
    {name:'工程专业',en:'Engineering',color:'#ec4899',skills:[{cn:'CAD',en:'CAD',x:300,y:195},{cn:'Rhino',en:'Rhino',x:350,y:215},{cn:'Praat',en:'Praat',x:400,y:200},{cn:'Office',en:'Office',x:450,y:220}]}
  ],

  // ─── 世界地图 — 城市级标记 ───
  // visit: transit / travel / short / long
  // lang: beginner / proficient / fluent / native
  mapPlaces: [
    // ═══ 中国 · 长住 ═══
    {name:'西安',en:'Xi\'an',lat:34.26,lng:108.94,visit:'long',desc:'家乡！在这里长大，满满的回忆',descEn:'Hometown! Grew up here, full of memories',img:'xian.jpg'},
    {name:'上海',en:'Shanghai',lat:31.23,lng:121.47,visit:'long',desc:'大学四年，这里是第二个家',descEn:'Four years of university — my second home',img:'shanghai.jpg'},
    // ═══ 中国 · 短居 ═══
    {name:'汉中',en:'Hanzhong',lat:33.07,lng:107.03,visit:'short',desc:'秦巴山间的宁静小城',descEn:'A tranquil town nestled between mountains',img:'hanzhong.jpg'},
    {name:'衢州',en:'Quzhou',lat:28.97,lng:118.87,visit:'short',desc:'古城墙下的江南水乡',descEn:'A water town beneath ancient city walls',img:'quzhou.jpg'},
    {name:'三亚',en:'Sanya',lat:18.25,lng:109.5,visit:'short',desc:'椰风海韵，度假胜地',descEn:'Coconut palms, ocean breeze — tropical paradise',img:'sanya.jpg'},
    // ═══ 中国 · 旅行 ═══
    {name:'北京',en:'Beijing',lat:39.9,lng:116.4,visit:'travel',lang:'native',langLabel:'中国 · 普通话',langLabelEn:'China · Mandarin',langDesc:'从小说普通话，母语',langDescEn:'Native speaker, spoken since birth',desc:'故宫、长城、胡同，历史与现代交织',descEn:'Forbidden City, Great Wall, hutongs — history meets modernity',img:'beijing.jpg'},
    {name:'武汉',en:'Wuhan',lat:30.59,lng:114.3,visit:'travel',desc:'热干面、黄鹤楼，英雄之城',descEn:'Hot dry noodles, Yellow Crane Tower — city of heroes',img:'wuhan.jpg'},
    {name:'西宁',en:'Xining',lat:36.62,lng:101.77,visit:'travel',desc:'青藏高原门户，塔尔寺朝圣',descEn:'Gateway to the Tibetan Plateau, Kumbum Monastery',img:'xining.jpg'},
    {name:'南京',en:'Nanjing',lat:32.06,lng:118.8,visit:'travel',desc:'六朝古都，梧桐大道美极了',descEn:'Ancient capital, gorgeous sycamore-lined avenues',img:'nanjing.jpg'},
    {name:'苏州',en:'Suzhou',lat:31.3,lng:120.62,visit:'travel',desc:'园林之城，上有天堂下有苏杭',descEn:'City of gardens — heaven on earth',img:'suzhou.jpg'},
    {name:'青岛',en:'Qingdao',lat:36.07,lng:120.38,visit:'travel',desc:'红瓦绿树、碧海蓝天',descEn:'Red roofs, green trees, blue sea',img:'qingdao.jpg'},
    {name:'烟台',en:'Yantai',lat:37.46,lng:121.45,visit:'travel',desc:'黄海之滨的葡萄酒之都',descEn:'Wine capital on the Yellow Sea',img:'yantai.jpg'},
    {name:'济南',en:'Jinan',lat:36.65,lng:116.99,visit:'travel',desc:'泉城，四面荷花三面柳',descEn:'City of Springs — lotuses and willows',img:'jinan.jpg'},
    {name:'天津',en:'Tianjin',lat:39.13,lng:117.2,visit:'travel',desc:'狗不理包子、相声发源地',descEn:'Goubuli buns and the birthplace of crosstalk',img:'tianjin.jpg'},
    {name:'郑州',en:'Zhengzhou',lat:34.75,lng:113.65,visit:'travel',desc:'中原腹地，交通枢纽',descEn:'Heart of the Central Plains, transport hub',img:'zhengzhou.jpg'},
    {name:'昆明',en:'Kunming',lat:25.04,lng:102.68,visit:'travel',desc:'春城，四季如春',descEn:'Spring City — eternal spring weather',img:'kunming.jpg'},
    {name:'大理',en:'Dali',lat:25.61,lng:100.27,visit:'travel',desc:'苍山洱海，风花雪月',descEn:'Cangshan & Erhai — wind, flowers, snow, moon',img:'dali.jpg'},
    {name:'丽江',en:'Lijiang',lat:26.86,lng:100.23,visit:'travel',desc:'古城慢时光，玉龙雪山',descEn:'Ancient town vibes & Jade Dragon Snow Mountain',img:'lijiang.jpg'},
    {name:'广州',en:'Guangzhou',lat:23.13,lng:113.26,visit:'travel',desc:'早茶文化，吃不完的美食',descEn:'Morning tea culture, endless culinary delights',img:'guangzhou.jpg'},
    {name:'深圳',en:'Shenzhen',lat:22.54,lng:114.06,visit:'travel',desc:'科技之都，创新前沿',descEn:'Tech capital, innovation frontier',img:'shenzhen.jpg'},
    {name:'宁波',en:'Ningbo',lat:29.87,lng:121.54,visit:'travel',desc:'东海明珠，海鲜天堂',descEn:'Pearl of the East Sea, seafood paradise',img:'ningbo.jpg'},
    {name:'台州',en:'Taizhou',lat:28.66,lng:121.42,visit:'travel',desc:'神仙居的仙境',descEn:'Fairyland at Shenxianju',img:'taizhou.jpg'},
    {name:'金华',en:'Jinhua',lat:29.08,lng:119.65,visit:'travel',desc:'双龙洞、金华火腿',descEn:'Shuanglong Cave & Jinhua ham',img:'jinhua.jpg'},
    {name:'丽水',en:'Lishui',lat:28.47,lng:119.92,visit:'travel',desc:'浙南绿谷，秀山丽水',descEn:'Green valley of southern Zhejiang',img:'lishui.jpg'},
    {name:'黄山',en:'Huangshan',lat:29.72,lng:118.34,visit:'travel',desc:'五岳归来不看山，黄山归来不看岳',descEn:'After Huangshan, no mountain compares',img:'huangshan.jpg'},
    {name:'日照',en:'Rizhao',lat:35.42,lng:119.53,visit:'travel',desc:'阳光海岸，日出之城',descEn:'Sunshine coast, city of sunrise',img:'rizhao.jpg'},
    {name:'大连',en:'Dalian',lat:38.91,lng:121.6,visit:'travel',desc:'北方明珠，浪漫海滨',descEn:'Pearl of the North, romantic seaside',img:'dalian.jpg'},
    // ═══ 中国 · 途经 ═══
    {name:'重庆',en:'Chongqing',lat:29.56,lng:106.55,visit:'transit',desc:'8D魔幻城市，火锅之都',descEn:'8D magical city, hotpot capital',img:'chongqing.jpg'},
    {name:'成都',en:'Chengdu',lat:30.57,lng:104.07,visit:'transit',desc:'天府之国，熊猫故里',descEn:'Land of Abundance, home of pandas',img:'chengdu.jpg'},
    // ═══ 欧洲 · 长住 ═══
    {name:'奥斯陆',en:'Oslo',lat:59.91,lng:10.75,visit:'long',lang:'proficient',langLabel:'挪威 · 挪威语',langLabelEn:'Norway · Norwegian',langDesc:'交换期间沉浸式学习挪威语',langDescEn:'Immersive Norwegian learning during exchange',desc:'交换学期，爱上了北欧的宁静',descEn:'Exchange semester — fell in love with Nordic tranquility',img:'oslo.jpg'},
    // ═══ 欧洲 · 旅行 ═══
    {name:'维也纳',en:'Vienna',lat:48.21,lng:16.37,visit:'travel',desc:'音乐之都，古典之美',descEn:'City of Music, classical beauty everywhere',img:'vienna.jpg'},
    {name:'慕尼黑',en:'Munich',lat:48.14,lng:11.58,visit:'travel',desc:'巴伐利亚的啤酒和艺术',descEn:'Bavarian beer and art',img:'munich.jpg'},
    {name:'柏林',en:'Berlin',lat:52.52,lng:13.41,visit:'travel',lang:'proficient',langLabel:'德国 · 德语',langLabelEn:'Germany · German',langDesc:'大学期间系统学习德语',langDescEn:'Systematically studied German at university',desc:'历史与前卫并存的酷城市',descEn:'A cool city where history and avant-garde coexist',img:'berlin.jpg'},
    {name:'萨尔茨堡',en:'Salzburg',lat:47.8,lng:13.04,visit:'travel',desc:'莫扎特故乡，音乐之声取景地',descEn:'Mozart\'s hometown, Sound of Music filming site',img:'salzburg.jpg'},
    {name:'布拉格',en:'Prague',lat:50.08,lng:14.44,visit:'travel',desc:'千塔之城，波西米亚风情',descEn:'City of a thousand spires, Bohemian charm',img:'prague.jpg'},
    {name:'布达佩斯',en:'Budapest',lat:47.5,lng:19.04,visit:'travel',desc:'多瑙河畔的明珠',descEn:'Pearl of the Danube',img:'budapest.jpg'},
    {name:'巴黎',en:'Paris',lat:48.86,lng:2.35,visit:'travel',lang:'beginner',langLabel:'法国 · 法语',langLabelEn:'France · French',langDesc:'多邻国学习法语',langDescEn:'Learning French on Duolingo',desc:'铁塔、卢浮宫、塞纳河畔的浪漫',descEn:'Eiffel Tower, Louvre, romance along the Seine',img:'paris.jpg'},
    {name:'哥本哈根',en:'Copenhagen',lat:55.68,lng:12.57,visit:'travel',desc:'安徒生的故乡，童话般的城市',descEn:'Andersen\'s hometown, a fairytale city',img:'copenhagen.jpg'},
    {name:'斯德哥尔摩',en:'Stockholm',lat:59.33,lng:18.07,visit:'travel',desc:'水上之城，北欧设计美学',descEn:'City on water, Nordic design aesthetics',img:'stockholm.jpg'},
    {name:'塔林',en:'Tallinn',lat:59.44,lng:24.75,visit:'travel',desc:'中世纪古城，波罗的海宝石',descEn:'Medieval old town, Baltic gem',img:'tallinn.jpg'},
    {name:'卑尔根',en:'Bergen',lat:60.39,lng:5.32,visit:'travel',desc:'挪威峡湾之门，彩色木屋',descEn:'Gateway to fjords, colorful wooden houses',img:'bergen.jpg'},
    {name:'赫尔辛基',en:'Helsinki',lat:60.17,lng:24.94,visit:'travel',desc:'芬兰设计之都，极简美学',descEn:'Finnish design capital, minimalist beauty',img:'helsinki.jpg'},
    {name:'里加',en:'Riga',lat:56.95,lng:24.11,visit:'travel',desc:'新艺术建筑群，拉脱维亚首都',descEn:'Art Nouveau architecture, Latvian capital',img:'riga.jpg'},
    {name:'日内瓦',en:'Geneva',lat:46.2,lng:6.14,visit:'travel',desc:'联合国之城，日内瓦湖畔',descEn:'UN city, by Lake Geneva',img:'geneva.jpg'},
    {name:'洛桑',en:'Lausanne',lat:46.52,lng:6.63,visit:'travel',desc:'奥林匹克之都',descEn:'Olympic capital',img:'lausanne.jpg'},
    {name:'苏黎世',en:'Zurich',lat:47.37,lng:8.54,visit:'travel',desc:'阿尔卑斯山脚下的精致城市',descEn:'An exquisite city at the foot of the Alps',img:'zurich.jpg'},
    {name:'格林德瓦',en:'Grindelwald',lat:46.62,lng:8.04,visit:'travel',desc:'少女峰脚下的世外桃源',descEn:'Paradise at the foot of Jungfrau',img:'grindelwald.jpg'},
    {name:'里昂',en:'Lyon',lat:45.76,lng:4.84,visit:'travel',desc:'法国美食之都',descEn:'France\'s culinary capital',img:'lyon.jpg'},
    // ═══ 欧洲 · 途经 ═══
    {name:'阿姆斯特丹',en:'Amsterdam',lat:52.37,lng:4.9,visit:'transit',desc:'运河之都，短暂停留',descEn:'Canal capital, brief stop',img:'amsterdam.jpg'},
    {name:'法兰克福',en:'Frankfurt',lat:50.11,lng:8.68,visit:'transit',desc:'欧洲金融中心，转机城市',descEn:'European finance hub, transit city',img:'frankfurt.jpg'},
    // ═══ 美洲 · 短居 ═══
    {name:'奥斯汀',en:'Austin',lat:30.27,lng:-97.74,visit:'short',desc:'UT Austin暑校，感受德州热情',descEn:'UT Austin summer school, feeling Texas warmth',img:'austin.jpg'},
    // ═══ 美洲 · 旅行 ═══
    {name:'圣安东尼奥',en:'San Antonio',lat:29.42,lng:-98.49,visit:'travel',desc:'河畔步道，德州风情',descEn:'Riverwalk, Texas charm',img:'sanantonio.jpg'},
    {name:'休斯顿',en:'Houston',lat:29.76,lng:-95.37,visit:'travel',desc:'NASA太空中心所在地',descEn:'Home of NASA Space Center',img:'houston.jpg'},
    // ═══ 亚洲 · 旅行 ═══
    {name:'曼谷',en:'Bangkok',lat:13.76,lng:100.5,visit:'travel',desc:'佛寺、夜市、泰式风情',descEn:'Temples, night markets, and Thai vibes',img:'bangkok.jpg'},
    {name:'芭提雅',en:'Pattaya',lat:12.93,lng:100.88,visit:'travel',desc:'海滩度假天堂',descEn:'Beach resort paradise',img:'pattaya.jpg'},
    {name:'济州岛',en:'Jeju Island',lat:33.5,lng:126.53,visit:'travel',desc:'韩国度假胜地，火山与海',descEn:'Korean resort island, volcano & sea',img:'jeju.jpg'}
  ],

  // 语言独立标记（不与城市重合的语言标记，定位到首都）
  langOnlyPlaces: [
    // 母语
    {name:'中国 · 普通话',en:'China · Mandarin',lat:39.91,lng:116.4,lang:'native',desc:'从小说普通话，母语',descEn:'Native speaker, spoken since birth'},
    // 精通
    {name:'英国 · 英语',en:'UK · English',lat:51.51,lng:-0.13,lang:'fluent',desc:'从小学习英语，CET-6 586 / IELTS 7.0',descEn:'Studied since childhood, CET-6 586 / IELTS 7.0'},
    {name:'美国 · 英语',en:'USA · English',lat:38.91,lng:-77.04,lang:'fluent',desc:'UT Austin暑校全英文环境',descEn:'Full English immersion at UT Austin summer school'},
    // 入门
    {name:'西班牙 · 西班牙语',en:'Spain · Spanish',lat:40.42,lng:-3.7,lang:'beginner',desc:'多邻国学习西班牙语',descEn:'Learning Spanish on Duolingo'},
    {name:'墨西哥 · 西班牙语',en:'Mexico · Spanish',lat:19.43,lng:-99.13,lang:'beginner',desc:'多邻国学习西班牙语',descEn:'Learning Spanish on Duolingo'},
    {name:'中国 · 粤语',en:'China · Cantonese',lat:22.32,lng:114.17,lang:'beginner',desc:'日常接触学习粤语',descEn:'Picked up Cantonese through daily exposure'},
    {name:'日本 · 日语',en:'Japan · Japanese',lat:35.68,lng:139.69,lang:'beginner',desc:'多邻国学习日语',descEn:'Learning Japanese on Duolingo'},
    {name:'韩国 · 韩语',en:'Korea · Korean',lat:37.57,lng:126.98,lang:'beginner',desc:'日常接触学习韩语',descEn:'Picked up Korean through daily exposure'},
    {name:'俄罗斯 · 俄语',en:'Russia · Russian',lat:55.76,lng:37.62,lang:'beginner',desc:'多邻国学习俄语',descEn:'Learning Russian on Duolingo'},
    {name:'意大利 · 意大利语',en:'Italy · Italian',lat:41.9,lng:12.5,lang:'beginner',desc:'多邻国学习意大利语',descEn:'Learning Italian on Duolingo'},
    {name:'法国 · 法语',en:'France · French',lat:48.86,lng:2.35,lang:'beginner',desc:'多邻国学习法语',descEn:'Learning French on Duolingo'}
  ],

  // ─── 时间轴 ───
  timeline: [
    {y:'2026.01 — 2026.03',t:'work',title:'国金证券 · 投行实习生',titleEn:'Sinolink Securities · IB Intern',d:'资本咨询总部（新兴产业与战略事业部）· 上海浦东',dEn:'Capital Advisory HQ (Emerging Industries) · Shanghai Pudong'},
    {y:'2026.01 — 2026.02',t:'proj',title:'腾讯未来产品经理创造营',titleEn:'Tencent Future PM Camp',d:'产品方法论入门，从0到1了解产品经理，产出20页+笔记',dEn:'PM methodology, built understanding from scratch, 20+ pages of notes'},
    {y:'2025.12 — 至今',t:'proj',title:'复旦大学国际合作处 · 助理管理员',titleEn:'Fudan Intl Cooperation Office · Assistant',d:'负责2026秋季北欧国家校级交换派出协调',dEn:'Coordinating Nordic exchange programs for Fall 2026'},
    {y:'2025.03 — 2026.01',t:'work',title:'沄视科技 · AI产品经理',titleEn:'Yunshi Tech · AI Product Manager',d:'需求挖掘·MVP团队6人组建·SOP制定·客户效率提升50%',dEn:'Demand discovery · Built 6-person MVP team · SOPs · 50% efficiency boost'},
    {y:'2025.03 — 2026.01',t:'work',title:'沄视科技 · CEO助理',titleEn:'Yunshi Tech · CEO Assistant',d:'5人标注团队管理·30+小时高层会议·欧洲市场拓展·签约€10万',dEn:'5-person team mgmt · 30+ hrs exec meetings · EU expansion · €100K signed'},
    {y:'2025.03',t:'honor',title:'HREOS环浙步道自行车女子精英组奖金',titleEn:'HREOS Zhejiang Cycling Women\'s Elite Prize',d:'鸿鲸体育',dEn:'HREOS Sports'},
    {y:'2024.08 — 2024.12',t:'edu',title:'奥斯陆大学 · 人文学院 · 交换',titleEn:'University of Oslo · Humanities · Exchange',d:'挪威 · 奥斯陆',dEn:'Norway · Oslo'},
    {y:'2024.05',t:'honor',title:'上海市大学生自行车锦标赛 · 个人计时赛女子组季军',titleEn:'Shanghai University Cycling Championship — Women\'s 3rd',d:'上海市自行车协会',dEn:'Shanghai Cycling Association'},
    {y:'2024.05',t:'honor',title:'优秀共青团员（五月评优）',titleEn:'Outstanding CYL Member (May)',d:'复旦大学团委',dEn:'Fudan CYL Committee'},
    {y:'2024.03 — 2026.06',t:'culture',title:'复旦大学自行车协会 · 宣传部核心成员',titleEn:'Fudan Cycling Club · Publicity Core Member',d:'远征财务总监·无人机航拍·公众号推文·海报绘制',dEn:'Expedition CFO · Drone aerial · WeChat articles · Poster design'},
    {y:'2023.12',t:'honor',title:'基础学科专业奖学金',titleEn:'Foundational Discipline Scholarship',d:'复旦大学中文系',dEn:'Fudan Chinese Dept'},
    {y:'2023.10',t:'honor',title:'复旦大学优秀学生（十月评优）',titleEn:'Fudan Outstanding Student (October)',d:'复旦大学',dEn:'Fudan University'},
    {y:'2023.09 — 2023.10',t:'proj',title:'乐律文化 ·「芥末唱」App研发助理',titleEn:'Lvlv Culture · "JieMo Sing" App Dev Asst',d:'Praat音频标注·音高切分·乐谱校对',dEn:'Praat audio annotation · Pitch segmentation · Score verification'},
    {y:'2023.09',t:'honor',title:'优秀学生三等奖学金',titleEn:'Third-Class Scholarship',d:'复旦大学',dEn:'Fudan University'},
    {y:'2023.08 — 2023.09',t:'work',title:'戊戌资产 · 投资研究助理',titleEn:'Wuxu Asset Mgmt · Research Asst',d:'Stata因子回归200+数据·Python语调分析·输出证券研究报告',dEn:'Stata factor regression 200+ data · Python tone analysis · Research report'},
    {y:'2023.07 — 2023.08',t:'edu',title:'德克萨斯大学奥斯汀分校 · 暑校',titleEn:'UT Austin · Summer School',d:'会计学 · 美国得克萨斯',dEn:'Accounting · USA · Texas'},
    {y:'2023.05',t:'honor',title:'优秀共青团员（五月评优）',titleEn:'Outstanding CYL Member (May)',d:'复旦大学团委',dEn:'Fudan CYL Committee'},
    {y:'2023.01 — 2023.02',t:'work',title:'国枫律所（西安）· IPO助理',titleEn:'Grandway Law (Xi\'an) · IPO Asst',d:'财务报表分析·20+可视化图表·企业估值·投资建议',dEn:'Financial statements · 20+ charts · Valuation · Investment advice'},
    {y:'2022.07 — 2022.08',t:'work',title:'瑞达期货（陕西）· 投资研究助理',titleEn:'Ruida Futures (Shaanxi) · Research Asst',d:'港股/科创板上市规则·尽职调查·IPO法律意见书',dEn:'HK/STAR Market rules · Due diligence · IPO legal opinions'},
    {y:'2022.02 — 2026.06',t:'culture',title:'复旦大学Echo合唱团',titleEn:'Fudan Echo Choir',d:'新媒体负责人·女高声部长·30+成员管理·10+场音乐厅演出',dEn:'Media Director · Soprano Lead · 30+ members · 10+ concert hall performances'},
    {y:'2021.09 — 2026.06',t:'edu',title:'复旦大学 · 汉语言 + 经济学 & 金融学',titleEn:'Fudan University · Chinese Lang + Econ & Finance',d:'中国 · 上海',dEn:'China · Shanghai'},
    {y:'2018.09 — 2021.06',t:'edu',title:'陕西师范大学附属中学 · 文科',titleEn:'SNNU High School · Liberal Arts',d:'中国 · 陕西 · 西安',dEn:'China · Shaanxi · Xi\'an'}
  ]
};
