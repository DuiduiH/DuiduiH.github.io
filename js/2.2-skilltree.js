// ===== 2.2 Skill Tree — Real skills, Apple Tree =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=[
    {name:'语言认证',en:'Certifications',color:'#ef4444',skills:[
      {cn:'CET-4',en:'CET-4',x:145,y:125},{cn:'CET-6',en:'CET-6',x:190,y:165},
      {cn:'IELTS',en:'IELTS',x:160,y:200},{cn:'普通话',en:'Mandarin',x:210,y:210}
    ]},
    {name:'数据编程',en:'Data & Code',color:'#f59e0b',skills:[
      {cn:'Python',en:'Python',x:250,y:100},{cn:'Stata',en:'Stata',x:300,y:115},
      {cn:'Excel',en:'Excel',x:270,y:155},{cn:'VSCode',en:'VSCode',x:315,y:170}
    ]},
    {name:'产品能力',en:'Product',color:'#22c55e',skills:[
      {cn:'PRD',en:'PRD',x:360,y:85},{cn:'Figma',en:'Figma',x:400,y:110},
      {cn:'React',en:'React',x:370,y:145},{cn:'测试',en:'Testing',x:420,y:155}
    ]},
    {name:'AI工具',en:'AI Tools',color:'#3b82f6',skills:[
      {cn:'GPT',en:'GPT',x:460,y:100},{cn:'Gemini',en:'Gemini',x:500,y:130},
      {cn:'豆包',en:'Doubao',x:475,y:165},{cn:'Vibe',en:'Vibe',x:520,y:175}
    ]},
    {name:'创意宣发',en:'Creative',color:'#a855f7',skills:[
      {cn:'Adobe',en:'Adobe',x:540,y:120},{cn:'视频',en:'Video',x:570,y:155},
      {cn:'海报',en:'Poster',x:530,y:195},{cn:'排版',en:'Layout',x:565,y:205}
    ]},
    {name:'工程专业',en:'Engineering',color:'#ec4899',skills:[
      {cn:'CAD',en:'CAD',x:300,y:195},{cn:'Rhino',en:'Rhino',x:350,y:215},
      {cn:'Praat',en:'Praat',x:400,y:200},{cn:'Office',en:'Office',x:450,y:220}
    ]}
  ];

  var wrap=document.getElementById('stWrap');if(!wrap)return;
  var W=700,H=430;

  function render(){
    var en=isEn();
    var s='<svg class="tree-svg" viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg">';
    s+='<ellipse cx="350" cy="'+H+'" rx="300" ry="18" fill="rgba(34,197,94,.08)"/>';
    s+='<path d="M325,'+H+' C318,380 312,340 330,270 L370,270 C388,340 382,380 375,'+H+' Z" fill="#5c3a1e" opacity=".75"/>';
    s+='<path d="M340,380 Q342,350 338,320" fill="none" stroke="#3d2511" stroke-width="1.5" opacity=".2"/>';
    s+='<path d="M360,390 Q358,355 362,330" fill="none" stroke="#3d2511" stroke-width="1" opacity=".15"/>';
    s+='<path d="M335,275 C300,245 250,215 200,175" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".6"/>';
    s+='<path d="M345,265 C340,230 345,190 360,145" fill="none" stroke="#5c3a1e" stroke-width="7" stroke-linecap="round" opacity=".55"/>';
    s+='<path d="M365,275 C400,245 450,220 510,180" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".6"/>';
    s+='<path d="M250,210 C235,195 215,180 195,170" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M280,225 C275,200 285,180 300,160" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M355,200 C380,175 400,160 420,155" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    s+='<path d="M460,210 C480,195 500,180 520,170" fill="none" stroke="#5c3a1e" stroke-width="4" stroke-linecap="round" opacity=".4"/>';
    var greens=[
      {cx:200,cy:160,r:55,c:'#166534',o:.3},{cx:155,cy:175,r:40,c:'#15803d',o:.25},
      {cx:260,cy:140,r:50,c:'#166534',o:.35},{cx:310,cy:120,r:55,c:'#14532d',o:.3},
      {cx:365,cy:95,r:60,c:'#166534',o:.35},{cx:420,cy:110,r:55,c:'#15803d',o:.32},
      {cx:480,cy:130,r:50,c:'#166534',o:.3},{cx:540,cy:155,r:48,c:'#14532d',o:.28},
      {cx:570,cy:185,r:40,c:'#15803d',o:.22},{cx:230,cy:190,r:45,c:'#22c55e',o:.2},
      {cx:350,cy:150,r:65,c:'#166534',o:.28},{cx:300,cy:175,r:50,c:'#15803d',o:.22},
      {cx:440,cy:170,r:48,c:'#166534',o:.25},{cx:400,cy:190,r:42,c:'#22c55e',o:.18},
      {cx:350,cy:210,r:55,c:'#14532d',o:.2},{cx:280,cy:105,r:38,c:'#22c55e',o:.18}
    ];
    greens.forEach(function(g){s+='<circle cx="'+g.cx+'" cy="'+g.cy+'" r="'+g.r+'" fill="'+g.c+'" opacity="'+g.o+'"/>';});
    s+='<text x="350" y="'+(H-25)+'" text-anchor="middle" font-size="12" fill="var(--gold,#fbbf24)" font-weight="700">'+(en?'Core Skills':'核心能力')+'</text>';
    BRANCHES.forEach(function(br){
      var avgX=0,avgY=0;
      br.skills.forEach(function(sk){avgX+=sk.x;avgY+=sk.y;});
      avgX/=br.skills.length;avgY/=br.skills.length;
      s+='<text x="'+avgX+'" y="'+(avgY-22)+'" text-anchor="middle" font-size="9" fill="'+br.color+'" font-weight="700" opacity=".6">'+(en?br.en:br.name)+'</text>';
    });
    BRANCHES.forEach(function(br){
      br.skills.forEach(function(sk){
        var label=en?sk.en:sk.cn;
        s+='<g class="skill-apple" style="cursor:pointer">';
        s+='<ellipse cx="'+sk.x+'" cy="'+(sk.y+14)+'" rx="10" ry="3" fill="rgba(0,0,0,.1)"/>';
        s+='<circle cx="'+sk.x+'" cy="'+sk.y+'" r="13" fill="'+br.color+'" opacity=".85"/>';
        s+='<circle cx="'+(sk.x-3)+'" cy="'+(sk.y-4)+'" r="4" fill="rgba(255,255,255,.35)"/>';
        s+='<line x1="'+sk.x+'" y1="'+(sk.y-13)+'" x2="'+(sk.x+2)+'" y2="'+(sk.y-18)+'" stroke="#5c3a1e" stroke-width="1.5" stroke-linecap="round"/>';
        s+='<ellipse cx="'+(sk.x+5)+'" cy="'+(sk.y-17)+'" rx="5" ry="2.5" fill="#22c55e" opacity=".6" transform="rotate(25 '+(sk.x+5)+' '+(sk.y-17)+')"/>';
        s+='<text x="'+sk.x+'" y="'+(sk.y+3)+'" text-anchor="middle" font-size="7" style="fill:var(--primary,#e0e7ff)" font-weight="700">'+label+'</text>';
        s+='</g>';
      });
    });
    s+='</svg>';
    wrap.innerHTML=s;
  }

  render();
  window.addEventListener('click',function(e){
    if(e.target.id==='langToggle') setTimeout(render,50);
  });
})();
