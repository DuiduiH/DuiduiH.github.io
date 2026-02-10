// ===== 2.2 Skill Tree — Interactive Apple Tree with leaf-parting =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=(window.MODULE_DATA&&window.MODULE_DATA.skillBranches)||[];

  var wrap=document.getElementById('stWrap');if(!wrap)return;
  var W=700,H=500;

  /* ── Each branch has a fixed cluster center on the tree ──
     Laid out so each cluster sits on its own major branch,
     forming a round 🌳 canopy shape. */

  var CLUSTER_CENTERS=[
    {cx:140,cy:165},  // 0 — far left branch (语言认证)
    {cx:245,cy:95},   // 1 — upper-left branch (数据编程)
    {cx:350,cy:65},   // 2 — top center branch (产品能力)
    {cx:455,cy:95},   // 3 — upper-right branch (AI工具)
    {cx:560,cy:165},  // 4 — far right branch (创意宣发)
    {cx:350,cy:195}   // 5 — center-low branch (工程专业)
  ];

  // Red apple palette — varying red shades for a natural look
  var APPLE_REDS=['#dc2626','#ef4444','#b91c1c','#f87171','#e11d48','#c0392b','#e74c3c','#d63031'];

  // Compute non-overlapping apple positions — scattered organically
  // Uses a seeded offset pattern so apples don't form a perfect grid
  function arrangeApples(count,cx,cy,radius,brIdx){
    var positions=[];
    // Pre-defined organic offsets per slot (dx%, dy% from center)
    // Each branch gets a different scatter pattern via brIdx
    var patterns=[
      // pattern 0: diamond-ish
      [{dx:-0.55,dy:-0.15},{dx:0.1,dy:-0.55},{dx:0.55,dy:0.15},{dx:-0.1,dy:0.55}],
      // pattern 1: zigzag
      [{dx:-0.5,dy:-0.4},{dx:0.35,dy:-0.2},{dx:-0.25,dy:0.35},{dx:0.55,dy:0.45}],
      // pattern 2: scattered arc
      [{dx:-0.45,dy:-0.5},{dx:0.45,dy:-0.35},{dx:-0.5,dy:0.3},{dx:0.3,dy:0.5}],
      // pattern 3: loose cluster
      [{dx:-0.3,dy:-0.55},{dx:0.5,dy:-0.1},{dx:-0.55,dy:0.25},{dx:0.2,dy:0.5}],
      // pattern 4: spread wide
      [{dx:-0.55,dy:-0.3},{dx:0.2,dy:-0.55},{dx:0.55,dy:0.2},{dx:-0.2,dy:0.5}],
      // pattern 5: diagonal scatter
      [{dx:-0.5,dy:-0.45},{dx:0.15,dy:-0.2},{dx:-0.15,dy:0.3},{dx:0.5,dy:0.5}]
    ];
    var pat=patterns[brIdx%patterns.length];
    for(var i=0;i<count;i++){
      var p=pat[i]||{dx:0,dy:0};
      positions.push({x:cx+p.dx*radius,y:cy+p.dy*radius});
    }
    return positions;
  }

  var APPLE_SIZE=32; // uniform apple diameter

  function render(){
    var en=isEn();
    wrap.innerHTML='';

    // Scaling wrapper
    var scaler=document.createElement('div');
    scaler.style.cssText='width:100%;max-width:min(700px, calc((100vh - 220px) * 1.4));margin:0 auto;aspect-ratio:700/500;position:relative;overflow:visible';

    var container=document.createElement('div');
    container.style.cssText='position:absolute;inset:0;width:100%;height:100%';

    // SVG tree
    var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    svg.setAttribute('class','tree-svg');
    svg.style.cssText='width:100%;height:100%;display:block';

    // Ground
    svg.innerHTML='<ellipse cx="350" cy="'+H+'" rx="280" ry="22" fill="rgba(34,197,94,.08)"/>';

    // Trunk — thicker, rooted
    svg.innerHTML+='<path d="M320,'+H+' C310,420 308,370 325,290 L375,290 C392,370 390,420 380,'+H+' Z" fill="#5c3a1e" opacity=".75"/>';
    // Trunk texture
    svg.innerHTML+='<path d="M340,440 Q338,390 342,340" fill="none" stroke="#3d2511" stroke-width="1.5" opacity=".18"/>';
    svg.innerHTML+='<path d="M362,445 Q360,400 365,355" fill="none" stroke="#3d2511" stroke-width="1" opacity=".12"/>';

    // === Major branches — one per cluster, spreading out round ===
    // 0: far-left — curves left and slightly down
    svg.innerHTML+='<path d="M330,295 C290,275 230,240 155,185" fill="none" stroke="#5c3a1e" stroke-width="9" stroke-linecap="round" opacity=".55"/>';
    // 1: upper-left
    svg.innerHTML+='<path d="M338,290 C320,250 290,180 250,115" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 2: straight up center
    svg.innerHTML+='<path d="M350,290 C350,240 350,160 350,80" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 3: upper-right
    svg.innerHTML+='<path d="M362,290 C380,250 410,180 450,115" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 4: far-right — curves right and slightly down
    svg.innerHTML+='<path d="M370,295 C410,275 470,240 545,185" fill="none" stroke="#5c3a1e" stroke-width="9" stroke-linecap="round" opacity=".55"/>';
    // 5: center-low — short stubby branch going down-center
    svg.innerHTML+='<path d="M350,295 C350,310 350,330 350,215" fill="none" stroke="#5c3a1e" stroke-width="7" stroke-linecap="round" opacity=".45"/>';

    // Small sub-branches for visual richness
    svg.innerHTML+='<path d="M200,225 C185,210 170,200 155,195" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M290,160 C275,140 260,125 248,115" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M410,160 C425,140 440,125 452,115" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M500,225 C515,210 530,200 545,195" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';

    // (canopy backdrop removed for minimal style)

    container.appendChild(svg);

    // Overlay for interactive elements
    var overlay=document.createElement('div');
    overlay.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none';
    container.appendChild(overlay);

    // Floating label container (shown on hover, always on top)
    var floatingLabel=document.createElement('div');
    floatingLabel.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100';
    container.appendChild(floatingLabel);

    BRANCHES.forEach(function(br,brIdx){
      var center=CLUSTER_CENTERS[brIdx]||{cx:350,cy:200};
      var positions=arrangeApples(br.skills.length,center.cx,center.cy,52,brIdx);

      // Calculate cluster bounding box from apple positions
      var pad=APPLE_SIZE/2+18;
      var minX=9999,maxX=0,minY=9999,maxY=0;
      positions.forEach(function(p){
        if(p.x-pad<minX) minX=p.x-pad;
        if(p.x+pad>maxX) maxX=p.x+pad;
        if(p.y-pad<minY) minY=p.y-pad;
        if(p.y+pad>maxY) maxY=p.y+pad;
      });

      var cw=maxX-minX,ch=maxY-minY;

      // Cluster wrapper
      var cluster=document.createElement('div');
      cluster.style.cssText='position:absolute;pointer-events:auto;cursor:pointer;'+
        'left:'+(minX/W*100)+'%;top:'+(minY/H*100)+'%;'+
        'width:'+(cw/W*100)+'%;height:'+(ch/H*100)+'%';

      // ── Leaf cover ──
      var leafWrap=document.createElement('div');
      leafWrap.className='leaf-cover';
      leafWrap.style.cssText='position:absolute;inset:-15%;transition:opacity .4s,transform .4s;pointer-events:none;z-index:2';

      // More leaves, arranged in a rounder blob
      var leafPositions=[
        {x:0.5,y:0.5,r:0.65},  // big center leaf
        {x:0.2,y:0.3,r:0.48},{x:0.8,y:0.3,r:0.48},
        {x:0.2,y:0.7,r:0.45},{x:0.8,y:0.7,r:0.45},
        {x:0.5,y:0.15,r:0.4},{x:0.5,y:0.85,r:0.4},
        {x:0.1,y:0.5,r:0.38},{x:0.9,y:0.5,r:0.38}
      ];
      var greens=['#166534','#15803d','#14532d','#22c55e','#166534','#15803d','#14532d','#22c55e','#166534'];
      leafPositions.forEach(function(lp,i){
        var ld=document.createElement('div');
        var baseSize=Math.min(cw,ch)*1.3; // bigger leaves for the expanded inset area
        var sz=lp.r*baseSize;
        ld.style.cssText='position:absolute;border-radius:50%;pointer-events:none;'+
          'background:'+greens[i%greens.length]+';opacity:.5;'+
          'left:calc('+(lp.x*100)+'% - '+sz/2+'px);top:calc('+(lp.y*100)+'% - '+sz/2+'px);'+
          'width:'+sz+'px;height:'+sz+'px;transition:transform .45s,opacity .45s';
        ld.className='leaf-blob';
        // Direction to scatter when parted
        ld.dataset.ox=''+(lp.x<0.4?-1:lp.x>0.6?1:0);
        ld.dataset.oy=''+(lp.y<0.4?-1:lp.y>0.6?1:0);
        leafWrap.appendChild(ld);
      });
      cluster.appendChild(leafWrap);

      // ── Apple slots (flat, minimal, red shades) ──
      br.skills.forEach(function(sk,skIdx){
        var pos=positions[skIdx];
        var appleX=(pos.x-minX)/cw*100;
        var appleY=(pos.y-minY)/ch*100;
        var redColor=APPLE_REDS[(brIdx*4+skIdx)%APPLE_REDS.length];
        var apple=document.createElement('div');
        apple.className='tree-apple';
        apple.style.cssText='position:absolute;z-index:3;'+
          'left:calc('+appleX+'% - '+(APPLE_SIZE/2)+'px);top:calc('+appleY+'% - '+(APPLE_SIZE/2)+'px);'+
          'width:'+APPLE_SIZE+'px;height:'+APPLE_SIZE+'px;border-radius:50%;'+
          'background:'+redColor+';opacity:0;transform:scale(.5);'+
          'transition:opacity .35s .08s,transform .35s .08s;'+
          'display:flex;align-items:center;justify-content:center;'+
          'border:1.5px solid rgba(255,255,255,.15);'+
          'pointer-events:auto;cursor:default';

        // Skill name text
        var txt=document.createElement('div');
        txt.style.cssText='font-size:7px;font-weight:700;color:#fff;text-align:center;line-height:1.1;position:relative;z-index:1;padding:0 2px;user-select:none';
        txt.textContent=en?sk.en:sk.cn;
        apple.appendChild(txt);

        // Proficiency tooltip — below apple, high z-index, never obstructed
        var tip=document.createElement('div');
        tip.className='apple-tip';
        tip.style.cssText='position:absolute;top:calc(100% + 5px);left:50%;transform:translateX(-50%) scale(.85);'+
          'background:var(--bg2,#161e30);border:1px solid var(--frame-border,rgba(255,255,255,.08));'+
          'border-radius:6px;padding:3px 8px;white-space:nowrap;font-size:10px;font-weight:600;'+
          'color:'+redColor+';opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:200;'+
          'box-shadow:0 2px 8px rgba(0,0,0,.2)';
        tip.textContent=en?sk.pEn:sk.p;
        apple.appendChild(tip);

        apple.addEventListener('mouseenter',function(){
          tip.style.opacity='1';tip.style.transform='translateX(-50%) scale(1)';
        });
        apple.addEventListener('mouseleave',function(){
          tip.style.opacity='0';tip.style.transform='translateX(-50%) scale(.85)';
        });

        cluster.appendChild(apple);
      });

      // ── Branch label (shown in floating layer on hover, always visible on top) ──
      var lbl=document.createElement('div');
      lbl.className='cluster-label';
      lbl.style.cssText='position:absolute;'+
        'left:'+(center.cx/W*100)+'%;top:'+((minY-8)/H*100)+'%;'+
        'transform:translateX(-50%);'+
        'font-size:12px;font-weight:800;letter-spacing:.5px;color:'+br.color+';'+
        'opacity:0;white-space:nowrap;pointer-events:none;text-align:center;'+
        'transition:opacity .3s;text-shadow:0 1px 6px rgba(0,0,0,.4);z-index:101';
      lbl.textContent=en?br.en:br.name;
      floatingLabel.appendChild(lbl);

      // ── Hover logic ──
      cluster.addEventListener('mouseenter',function(){
        // Part leaves outward
        var blobs=leafWrap.querySelectorAll('.leaf-blob');
        blobs.forEach(function(b){
          var dx=parseInt(b.dataset.ox)*22;
          var dy=parseInt(b.dataset.oy)*16;
          b.style.transform='translate('+dx+'px,'+dy+'px) scale(.45)';
          b.style.opacity='.1';
        });
        // Show apples
        var apples=cluster.querySelectorAll('.tree-apple');
        apples.forEach(function(a){
          a.style.opacity='1';a.style.transform='scale(1)';
        });
        // Show branch label
        lbl.style.opacity='1';
      });
      cluster.addEventListener('mouseleave',function(){
        // Close leaves
        var blobs=leafWrap.querySelectorAll('.leaf-blob');
        blobs.forEach(function(b){
          b.style.transform='';b.style.opacity='.5';
        });
        // Hide apples
        var apples=cluster.querySelectorAll('.tree-apple');
        apples.forEach(function(a){
          a.style.opacity='0';a.style.transform='scale(.5)';
        });
        // Hide branch label
        lbl.style.opacity='0';
      });

      overlay.appendChild(cluster);
    });

    scaler.appendChild(container);
    wrap.appendChild(scaler);
  }

  render();
  // Re-render on lang toggle
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.attributeName==='lang') render();
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
