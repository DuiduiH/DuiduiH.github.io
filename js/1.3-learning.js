// ===== 1.3 Colorful Knowledge Bubbles =====
(function(){
  var TOPICS=[
    {id:'internet',name:'互联网',en:'Internet',color:'#60a5fa',entries:[{term:'互联网黑话',en:'Buzzwords',desc:'赋能、抓手、底层逻辑、颗粒度……这些词在互联网公司的会议里每天都在飞。',descEn:'Empower, leverage, underlying logic, granularity... buzzwords flying in every tech meeting.'},{term:'DAU / MAU',en:'DAU / MAU',desc:'日活跃用户/月活跃用户，衡量一个产品有多少人真的在用。',descEn:'Daily/Monthly Active Users — the core metric for how many people actually use a product.'},{term:'用户增长飞轮',en:'Growth Flywheel',desc:'通过产品体验→口碑→新用户→更多数据→更好体验的循环实现自增长。',descEn:'A self-reinforcing loop: better product → word of mouth → new users → more data → even better product.'}]},
    {id:'ecommerce',name:'电商',en:'E-commerce',color:'#f87171',entries:[{term:'GMV',en:'GMV',desc:'Gross Merchandise Volume，成交总额。电商人每天盯着看的核心数字。',descEn:'Gross Merchandise Volume — the total sales value e-commerce people watch daily.'},{term:'转化率',en:'Conversion Rate',desc:'从浏览到下单的比例，每提高0.1%都意味着巨大的收入增长。',descEn:'The ratio from browsing to purchasing. Every 0.1% improvement means huge revenue growth.'},{term:'复购率',en:'Repurchase Rate',desc:'用户买了一次之后还会不会再来？这决定了生意能不能持续。',descEn:'Will customers come back? This determines whether a business is sustainable.'}]},
    {id:'pm',name:'产品经理',en:'Product Mgmt',color:'#a78bfa',entries:[{term:'需求池',en:'Backlog',desc:'产品经理的武器库——所有待做的功能和改进都在这里排队等候。',descEn:'The PM\'s arsenal — all features and improvements queued up and waiting.'},{term:'MVP',en:'MVP',desc:'最小可行产品。先做一个最简单的版本验证想法，再逐步迭代。',descEn:'Minimum Viable Product. Build the simplest version first, then iterate.'},{term:'用户故事',en:'User Story',desc:'"作为一个XX用户，我想要XX，以便XX"——产品经理思考需求的标准句式。',descEn:'"As a [user], I want [feature] so that [benefit]" — the standard PM requirement format.'}]},
    {id:'retail',name:'零售',en:'Retail',color:'#34d399',entries:[{term:'SKU',en:'SKU',desc:'Stock Keeping Unit，最小存货单位。一个颜色、一个尺码就是一个SKU。',descEn:'Stock Keeping Unit — the smallest inventory unit. One color + one size = one SKU.'},{term:'坪效',en:'Sales per sqm',desc:'每平米产生的销售额，衡量零售空间效率的核心指标。',descEn:'Sales per square meter — the core metric for retail space efficiency.'},{term:'动销率',en:'Sell-through Rate',desc:'有多少比例的商品在一定时间内卖出去了？库存管理的关键。',descEn:'What percentage of inventory was sold in a given period? Key to inventory management.'}]},
    {id:'ai',name:'AI',en:'AI',color:'#c084fc',entries:[{term:'大模型（LLM）',en:'LLM',desc:'在海量文本上训练出的"语言大脑"，能理解和生成人类语言。',descEn:'A "language brain" trained on massive text data, capable of understanding and generating human language.'},{term:'Prompt Engineering',en:'Prompt Engineering',desc:'如何给AI写好指令？这是一门新兴的"提问的艺术"。',descEn:'How to write good instructions for AI? It\'s an emerging "art of asking questions."'},{term:'幻觉',en:'Hallucination',desc:'AI有时会自信地编造不存在的事实——就像人类有时也会记错。',descEn:'When AI confidently fabricates non-existent facts — just like humans sometimes misremember.'}]},
    {id:'nn',name:'神经网络',en:'Neural Nets',color:'#f9a8d4',entries:[{term:'反向传播',en:'Backpropagation',desc:'神经网络的"自我纠正"机制——通过误差一层层反推，自动调整权重。',descEn:'The neural network\'s self-correction mechanism — errors propagate back layer by layer to adjust weights.'},{term:'Transformer',en:'Transformer',desc:'注意力机制的集大成者，ChatGPT背后的核心架构。',descEn:'The pinnacle of attention mechanisms — the core architecture behind ChatGPT.'}]},
    {id:'economics',name:'经济学',en:'Economics',color:'#fbbf24',entries:[{term:'边际效用递减',en:'Diminishing Returns',desc:'第一块披萨最香，第十块就只是填肚子——经济学最直观的规律。',descEn:'The first slice of pizza tastes the best, the tenth is just filling — economics\' most intuitive law.'},{term:'沉没成本谬误',en:'Sunk Cost Fallacy',desc:'已经投入的时间和金钱不应该影响未来决策，但人们总是放不下。',descEn:'Past investments shouldn\'t affect future decisions, yet people can never let go.'},{term:'帕累托法则',en:'Pareto Principle',desc:'80/20法则——20%的努力产生80%的结果。',descEn:'The 80/20 rule — 20% of effort produces 80% of results.'}]},
    {id:'invest',name:'投资',en:'Investing',color:'#fcd34d',entries:[{term:'分散投资',en:'Diversification',desc:'不要把鸡蛋放在一个篮子里——这是投资的第一课。',descEn:'Don\'t put all your eggs in one basket — the first lesson of investing.'},{term:'蒙特卡洛模拟',en:'Monte Carlo',desc:'用大量随机模拟来预测不确定性结果，金融工程师的常用工具。',descEn:'Using massive random simulations to predict uncertain outcomes — a financial engineer\'s go-to tool.'}]},
    {id:'linguistics',name:'语言学',en:'Linguistics',color:'#5eead4',entries:[{term:'结构主义',en:'Structuralism',desc:'索绪尔提出：语言是一个系统，每个词的意义来自它与其他词的关系。',descEn:'Saussure proposed: language is a system where each word\'s meaning comes from its relation to others.'},{term:'语言相对论',en:'Sapir-Whorf',desc:'你说什么语言，可能会影响你怎么思考世界。',descEn:'The language you speak may shape how you think about the world.'}]},
    {id:'comm',name:'传播学',en:'Communications',color:'#fdba74',entries:[{term:'5W模型',en:'5W Model',desc:'Who说What通过What Channel对Whom产生What Effect——拉斯韦尔的经典传播模型。',descEn:'Who says What through What Channel to Whom with What Effect — Lasswell\'s classic communication model.'},{term:'回音室效应',en:'Echo Chamber',desc:'算法让你只看到自己认同的观点，世界观越来越窄。',descEn:'Algorithms show you only views you agree with, making your worldview increasingly narrow.'}]},
    {id:'symphony',name:'交响乐',en:'Symphony',color:'#c4b5fd',entries:[{term:'交响乐团编制',en:'Orchestra Sections',desc:'弦乐组铺底色，木管出旋律，铜管加高光，打击乐点睛——一个好乐团像一家好公司。',descEn:'Strings lay the foundation, woodwinds carry melody, brass adds highlights, percussion punctuates — a good orchestra runs like a good company.'},{term:'指挥的角色',en:'The Conductor',desc:'指挥不发出声音，但决定了所有声音如何融合——真正的领导力。',descEn:'The conductor makes no sound, yet decides how all sounds blend — true leadership.'}]},
    {id:'choir',name:'合唱',en:'Choir',color:'#f0abfc',entries:[{term:'四个声部',en:'SATB',desc:'Soprano · Alto · Tenor · Bass——SATB，合唱的基本编制。',descEn:'Soprano · Alto · Tenor · Bass — the four fundamental voice parts of a choir.'},{term:'和声',en:'Harmony',desc:'多个声部同时发声，各自独立却又完美融合——这就是合唱的魔力。',descEn:'Multiple voices singing independently yet blending perfectly — that\'s the magic of choral music.'}]},
    {id:'meme',name:'互联网热梗',en:'Memes',color:'#fca5a5',entries:[{term:'遥遥领先',en:'Way Ahead',desc:'从华为发布会金句变成全民口头禅——热梗的传播力就是这么强。',descEn:'From Huawei\'s keynote catchphrase to everyone\'s daily slang — that\'s the power of memes.'},{term:'City不City',en:'City or not City',desc:'外国博主的一句中式英语，瞬间席卷全网。',descEn:'A foreign vlogger\'s Chinglish phrase that instantly went viral across the internet.'}]}
  ];

  var isEn = function(){ return document.documentElement.lang === 'en'; };
  var container=document.getElementById('kSpores');if(!container)return;
  var canvas=document.getElementById('spCanvas'),area=document.getElementById('spArea'),hint=document.getElementById('spHint');
  var ov=document.getElementById('spOv'),oT=document.getElementById('spOvTerm'),oD=document.getElementById('spOvDesc'),ovBox=ov?ov.querySelector('.sp-ov-box'):null;
  var MIN_B=6,AMP=22,FBASE=5;
  var bubs=[],parts=[],t0=0,raf=0,focused=false;

  function resize(){var r=container.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';var ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.scale(d,d);}
  function hex(h){var n=parseInt(h.slice(1),16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function explode(cx,cy,h){var c=hex(h);for(var i=0;i<14;i++){var a=Math.PI*2*i/14+Math.random()*.4,s=2+Math.random()*4;parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:.018+Math.random()*.015,r:c.r,g:c.g,b:c.b});}}

  function makeBub(){
    var topic=TOPICS[Math.floor(Math.random()*TOPICS.length)];
    var r=container.getBoundingClientRect(),sz=55+Math.random()*38;
    var bx=sz+Math.random()*(r.width-sz*2),y=r.height+sz;
    var el=document.createElement('div');el.className='sp-bub';
    el.style.width=el.style.height=sz+'px';
    el.style.left=(bx-sz/2)+'px';el.style.top=(y-sz/2)+'px';
    // Colored bubble matching topic
    var c=hex(topic.color);
    el.style.background='radial-gradient(circle at 30% 25%, rgba(255,255,255,.6) 0%, rgba(255,255,255,.15) 30%, transparent 55%),radial-gradient(circle at 70% 75%, rgba(255,255,255,.12) 0%, transparent 40%),radial-gradient(circle at 50% 50%, rgba('+c.r+','+c.g+','+c.b+',.35) 0%, rgba('+c.r+','+c.g+','+c.b+',.15) 50%, rgba('+c.r+','+c.g+','+c.b+',.05) 100%)';
    el.style.border='1.5px solid rgba('+c.r+','+c.g+','+c.b+',.35)';
    el.style.boxShadow='inset 0 0 20px rgba(255,255,255,.08), 0 4px 20px rgba('+c.r+','+c.g+','+c.b+',.12)';
    el.textContent=isEn()?(topic.en||topic.name):topic.name;
    var state={el:el,y:y-sz/2,bx:bx,phase:Math.random()*Math.PI*2,spd:(r.height+100)/(FBASE*60),topic:topic,sz:sz};
    bubs.push(state);area.appendChild(el);
    el.addEventListener('click',function(e){
      e.stopPropagation();var rr=container.getBoundingClientRect();
      explode(e.clientX-rr.left,e.clientY-rr.top,state.topic.color);
      var entries=state.topic.entries||[];
      if(entries.length){
        var en=entries[Math.floor(Math.random()*entries.length)];
        oT.textContent=isEn()?(en.en||en.term):en.term;
        oD.textContent=isEn()?(en.descEn||en.desc):en.desc;
        // Color the overlay box border
        if(ovBox) ovBox.style.borderColor='rgba('+c.r+','+c.g+','+c.b+',.35)';
        if(ovBox) ovBox.style.boxShadow='0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba('+c.r+','+c.g+','+c.b+',.08)';
        oT.style.color=state.topic.color;
        ov.classList.add('vis');focused=true;
      }
      state.el.remove();bubs=bubs.filter(function(b){return b!==state;});
    });
    return state;
  }

  function tick(t){
    if(!container.isConnected){cancelAnimationFrame(raf);return;}
    var r=container.getBoundingClientRect(),dt=(t-t0)/1000;t0=t;
    var ctx=canvas.getContext('2d');ctx.clearRect(0,0,r.width,r.height);
    parts=parts.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;p.life-=p.decay;if(p.life<=0)return false;ctx.globalAlpha=p.life;ctx.fillStyle='rgb('+p.r+','+p.g+','+p.b+')';ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return true;});
    var sf=focused?.15:1;
    bubs.forEach(function(b){b.y-=b.spd*60*dt*sf;var nx=b.bx+AMP*Math.sin(t*.002+b.phase);b.el.style.left=(nx-b.sz/2)+'px';b.el.style.top=b.y+'px';});
    bubs=bubs.filter(function(b){if(b.y<-b.sz){b.el.remove();return false;}return true;});
    if(bubs.length<MIN_B)makeBub();
    raf=requestAnimationFrame(tick);
  }

  resize();window.addEventListener('resize',resize);
  hint.classList.add('vis');setTimeout(function(){hint.classList.add('fade');},2500);
  for(var i=0;i<MIN_B;i++){(function(idx){setTimeout(function(){makeBub();},idx*350);})(i);}
  t0=performance.now();raf=requestAnimationFrame(tick);
  ov.addEventListener('click',function(){ov.classList.remove('vis');focused=false;oT.style.color='';});
})();
