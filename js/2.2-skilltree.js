// ===== 2.2 Skill Tree — Interactive Apple Tree =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=[
    {name:'语言',en:'Languages',color:'#ef4444',skills:[
      {cn:'中文',en:'Chinese',x:145,y:125},{cn:'English',en:'English',x:190,y:165},{cn:'日本語',en:'Japanese',x:160,y:200},{cn:'한국어',en:'Korean',x:210,y:210}
    ]},
    {name:'金融',en:'Finance',color:'#f59e0b',skills:[
      {cn:'投行',en:'IB',x:250,y:100},{cn:'私募',en:'PE',x:300,y:115},{cn:'期货',en:'Futures',x:270,y:155},{cn:'IPO',en:'IPO',x:315,y:170}
    ]},
    {name:'技术',en:'Tech',color:'#22c55e',skills:[
      {cn:'Python',en:'Python',x:360,y:85},{cn:'SQL',en:'SQL',x:400,y:110},{cn:'数据分析',en:'Analytics',x:370,y:145},{cn:'AI',en:'AI',x:420,y:155}
    ]},
    {name:'产品',en:'Product',color:'#3b82f6',skills:[
      {cn:'用户研究',en:'UX Research',x:460,y:100},{cn:'原型设计',en:'Prototyping',x:500,y:130},{cn:'需求分析',en:'Requirements',x:475,y:165},{cn:'项目管理',en:'PM',x:520,y:175}
    ]},
    {name:'创意',en:'Creative',color:'#a855f7',skills:[
      {cn:'写作',en:'Writing',x:540,y:120},{cn:'摄影',en:'Photography',x:570,y:155},{cn:'设计',en:'Design',x:530,y:195},{cn:'音乐',en:'Music',x:565,y:205}
    ]},
    {name:'软实力',en:'Soft Skills',color:'#ec4899',skills:[
      {cn:'演讲',en:'Speaking',x:300,y:195},{cn:'沟通',en:'Comms',x:350,y:215},{cn:'领导力',en:'Leadership',x:400,y:200},{cn:'团队协作',en:'Teamwork',x:450,y:220}
    ]}
  ];

  var wrap=document.getElementById('stWrap');if(!wrap)return;
  var W=700,H=430;

  function render(){
    var en=isEn();
    var s='<svg class="tree-svg" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
    // Ground
    s+='<ellipse cx="350" cy="'+H+'" rx="300" ry="18" fill="rgba(34,197,94,.08)"/>';
    // Trunk
    s+='<path d="M325,'+H+' C318,380 312,340 330,270 L370,270 C388,340 382,380 375,'+H+' Z" fill="#5c3a1e" opacity=".75"/>';
    // Bark texture
    s+='<path d="M340,380 Q342,350 338,320" fill="none" stroke="#3d2511" stroke-width="1.5" opacity=".2"/>';
    s+='<path d="M360,390 Q358,355 362,330" fill="none" stroke="#3d2511" stroke-width="1" opacity=".15"/>';
    // Main branches
    s+='<path d="M335,275 C300,245 250,215 200,175" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".6"/>';
    s+='<path d="M345,265 C340,230 345,190 360,145" fill="none" stroke="#5c3a1e" stroke-width="7" stroke-linecap="round" opacity=".55"/>';
    s+='<path d="M365,275 C400,245 450,220 510,180" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".6"/>';
    // Sub-branches
    s+='<path d="M250,210 C235,195 215,180 195,170" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M280,225 C275,200 285,180 300,160" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M355,200 C380,175 400,160 420,155" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M460,210 C480,195 500,180 520,170" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    // Canopy (layered green blobs)
    var greens=[
      {cx:200,cy:160,r:55,c:'#166534',o:.3},
      {cx:155,cy:175,r:40,c:'#15803d',o:.25},
      {cx:260,cy:140,r:50,c:'#166534',o:.35},
      {cx:310,cy:120,r:55,c:'#14532d',o:.3},
      {cx:365,cy:95,r:60,c:'#166534',o:.35},
      {cx:420,cy:110,r:55,c:'#15803d',o:.32},
      {cx:480,cy:130,r:50,c:'#166534',o:.3},
      {cx:540,cy:155,r:48,c:'#14532d',o:.28},
      {cx:570,cy:185,r:40,c:'#15803d',o:.22},
      {cx:230,cy:190,r:45,c:'#22c55e',o:.2},
      {cx:350,cy:150,r:65,c:'#166534',o:.28},
      {cx:300,cy:175,r:50,c:'#15803d',o:.22},
      {cx:440,cy:170,r:48,c:'#166534',o:.25},
      {cx:400,cy:190,r:42,c:'#22c55e',o:.18},
      {cx:350,cy:210,r:55,c:'#14532d',o:.2},
      {cx:280,cy:105,r:38,c:'#22c55e',o:.18}
    ];
    greens.forEach(function(g){
      s+='<circle cx="'+g.cx+'" cy="'+g.cy+'" r="'+g.r+'" fill="'+g.c+'" opacity="'+g.o+'"/>';
    });
    // Trunk label
    s+='<text x="350" y="'+(H-25)+'" text-anchor="middle" font-size="12" fill="var(--gold,#fbbf24)" font-weight="700">'+(en?'Core Skills':'核心能力')+'</text>';
    // Branch labels (subtle, along branches)
    BRANCHES.forEach(function(br){
      var avgX=0,avgY=0;
      br.skills.forEach(function(sk){avgX+=sk.x;avgY+=sk.y;});
      avgX/=br.skills.length;avgY/=br.skills.length;
      s+='<text x="'+avgX+'" y="'+(avgY-22)+'" text-anchor="middle" font-size="9" fill="'+br.color+'" font-weight="700" opacity=".6">'+(en?br.en:br.name)+'</text>';
    });
    // Apples (skills)
    BRANCHES.forEach(function(br){
      br.skills.forEach(function(sk){
        var label=en?sk.en:sk.cn;
        s+='<g class="skill-apple" style="cursor:pointer">';
        // Apple shadow
        s+='<ellipse cx="'+sk.x+'" cy="'+(sk.y+14)+'" rx="10" ry="3" fill="rgba(0,0,0,.1)"/>';
        // Apple body
        s+='<circle cx="'+sk.x+'" cy="'+sk.y+'" r="13" fill="'+br.color+'" opacity=".85"/>';
        // Apple shine
        s+='<circle cx="'+(sk.x-3)+'" cy="'+(sk.y-4)+'" r="4" fill="rgba(255,255,255,.35)"/>';
        // Stem
        s+='<line x1="'+sk.x+'" y1="'+(sk.y-13)+'" x2="'+(sk.x+2)+'" y2="'+(sk.y-18)+'" stroke="#5c3a1e" stroke-width="1.5" stroke-linecap="round"/>';
        // Leaf
        s+='<ellipse cx="'+(sk.x+5)+'" cy="'+(sk.y-17)+'" rx="5" ry="2.5" fill="#22c55e" opacity=".6" transform="rotate(25 '+(sk.x+5)+' '+(sk.y-17)+')"/>';
        // Label
        s+='<text x="'+sk.x+'" y="'+(sk.y+3)+'" text-anchor="middle" font-size="7" fill="#fff" font-weight="700">'+label+'</text>';
        s+='</g>';
      });
    });
    s+='</svg>';
    wrap.innerHTML=s;
  }

  render();
  // Re-render on language change
  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
