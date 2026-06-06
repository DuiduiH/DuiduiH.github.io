// ===== 2.2 Skill Tree — Interactive Apple Tree with leaf-parting =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=(window.MODULE_DATA&&window.MODULE_DATA.skillBranches)||[];

  var wrap=document.getElementById('stWrap');if(!wrap)return;
  var W=700,H=540; // slightly taller to avoid cropping canopy

  /* ── Each branch has a fixed cluster center on the tree ──
     Laid out so each cluster sits on its own major branch,
     forming a round 🌳 canopy shape. Pulled inward to avoid clipping. */

  var CLUSTER_CENTERS=[
    {cx:155,cy:185},  // 0 — far left branch (语言认证)
    {cx:245,cy:115},  // 1 — upper-left branch (数据编程)
    {cx:350,cy:85},   // 2 — top center branch (产品能力)
    {cx:455,cy:115},  // 3 — upper-right branch (AI工具)
    {cx:545,cy:185},  // 4 — far right branch (创意宣发)
    {cx:350,cy:225}   // 5 — center-low branch (工程专业)
  ];

  // Compute non-overlapping apple positions — more scattered and organic
  function arrangeApples(count,cx,cy,radius,brIdx){
    var positions=[];
    // Wide-spread, irregular offsets per branch — each is unique
    var patterns=[
      [{dx:-0.6,dy:-0.2},{dx:0.15,dy:-0.65},{dx:0.6,dy:0.1},{dx:-0.15,dy:0.6}],
      [{dx:-0.55,dy:-0.5},{dx:0.4,dy:-0.15},{dx:-0.2,dy:0.45},{dx:0.6,dy:0.55}],
      [{dx:-0.5,dy:-0.6},{dx:0.5,dy:-0.4},{dx:-0.55,dy:0.35},{dx:0.35,dy:0.55}],
      [{dx:-0.35,dy:-0.6},{dx:0.55,dy:-0.15},{dx:-0.6,dy:0.3},{dx:0.25,dy:0.6}],
      [{dx:-0.6,dy:-0.35},{dx:0.25,dy:-0.6},{dx:0.6,dy:0.25},{dx:-0.25,dy:0.55}],
      [{dx:-0.55,dy:-0.5},{dx:0.2,dy:-0.25},{dx:-0.2,dy:0.35},{dx:0.55,dy:0.55}]
    ];
    var pat=patterns[brIdx%patterns.length];
    for(var i=0;i<count;i++){
      var p=pat[i]||{dx:0,dy:0};
      positions.push({x:cx+p.dx*radius,y:cy+p.dy*radius});
    }
    return positions;
  }

  var APPLE_SIZE=30; // uniform apple diameter

  function render(){
    var en=isEn();
    wrap.innerHTML='';

    // Scaling wrapper — uses new H for aspect ratio
    var scaler=document.createElement('div');
    scaler.style.cssText='width:100%;max-width:min(700px, calc((100vh - 200px) * 700 / 540));margin:0 auto;aspect-ratio:700/540;position:relative;overflow:visible';

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
    svg.innerHTML+='<path d="M320,'+H+' C310,460 308,400 325,320 L375,320 C392,400 390,460 380,'+H+' Z" fill="#5c3a1e" opacity=".75"/>';
    // Trunk texture
    svg.innerHTML+='<path d="M340,480 Q338,420 342,370" fill="none" stroke="#3d2511" stroke-width="1.5" opacity=".18"/>';
    svg.innerHTML+='<path d="M362,485 Q360,430 365,385" fill="none" stroke="#3d2511" stroke-width="1" opacity=".12"/>';

    // === Major branches — one per cluster, pulled inward ===
    // 0: far-left
    svg.innerHTML+='<path d="M330,325 C290,300 230,260 165,205" fill="none" stroke="#5c3a1e" stroke-width="9" stroke-linecap="round" opacity=".55"/>';
    // 1: upper-left
    svg.innerHTML+='<path d="M338,318 C320,275 290,200 250,135" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 2: straight up center
    svg.innerHTML+='<path d="M350,318 C350,270 350,180 350,100" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 3: upper-right
    svg.innerHTML+='<path d="M362,318 C380,275 410,200 450,135" fill="none" stroke="#5c3a1e" stroke-width="8" stroke-linecap="round" opacity=".55"/>';
    // 4: far-right
    svg.innerHTML+='<path d="M370,325 C410,300 470,260 535,205" fill="none" stroke="#5c3a1e" stroke-width="9" stroke-linecap="round" opacity=".55"/>';
    // 5: center-low — short stubby branch
    svg.innerHTML+='<path d="M350,320 C350,340 350,360 350,245" fill="none" stroke="#5c3a1e" stroke-width="7" stroke-linecap="round" opacity=".45"/>';

    // Small sub-branches
    svg.innerHTML+='<path d="M210,250 C195,235 180,220 165,215" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M290,180 C275,160 260,145 248,135" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M410,180 C425,160 440,145 452,135" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';
    svg.innerHTML+='<path d="M490,250 C505,235 520,220 535,215" fill="none" stroke="#5c3a1e" stroke-width="3" stroke-linecap="round" opacity=".3"/>';

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
      var positions=arrangeApples(br.skills.length,center.cx,center.cy,58,brIdx);

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

      // ── Apple slots — branch-colored with stem + leaf ──
      var brColor=br.color||'#dc2626';
      br.skills.forEach(function(sk,skIdx){
        var pos=positions[skIdx];
        var appleX=(pos.x-minX)/cw*100;
        var appleY=(pos.y-minY)/ch*100;
        var apple=document.createElement('div');
        apple.className='tree-apple';
        apple.style.cssText='position:absolute;z-index:3;'+
          'left:calc('+appleX+'% - '+(APPLE_SIZE/2)+'px);top:calc('+appleY+'% - '+(APPLE_SIZE/2)+'px);'+
          'width:'+APPLE_SIZE+'px;height:'+(APPLE_SIZE+8)+'px;'+
          'opacity:0;transform:scale(.5);'+
          'transition:opacity .35s .08s,transform .35s .08s;'+
          'pointer-events:auto;cursor:default;display:flex;flex-direction:column;align-items:center';

        // Stem + leaf (top part)
        var stemWrap=document.createElement('div');
        stemWrap.style.cssText='width:100%;height:8px;position:relative;flex-shrink:0';
        // Stem
        var stem=document.createElement('div');
        stem.style.cssText='position:absolute;left:50%;top:0;width:2px;height:7px;background:#5c3a1e;border-radius:1px;transform:translateX(-50%)';
        stemWrap.appendChild(stem);
        // Leaf
        var leaf=document.createElement('div');
        leaf.style.cssText='position:absolute;left:calc(50% + 1px);top:1px;width:8px;height:5px;background:#22c55e;border-radius:0 60% 60% 0;transform:rotate(15deg);opacity:.7';
        stemWrap.appendChild(leaf);
        apple.appendChild(stemWrap);

        // Apple body (round)
        var body=document.createElement('div');
        body.style.cssText='width:'+APPLE_SIZE+'px;height:'+APPLE_SIZE+'px;border-radius:50%;'+
          'background:'+brColor+';display:flex;align-items:center;justify-content:center;'+
          'border:1.5px solid rgba(255,255,255,.15);box-shadow:0 2px 8px rgba(0,0,0,.1),inset -2px -2px 4px rgba(0,0,0,.1),inset 1px 1px 3px rgba(255,255,255,.12);position:relative;transition:box-shadow .2s';

        // Small highlight on apple
        var highlight=document.createElement('div');
        highlight.style.cssText='position:absolute;top:4px;left:5px;width:7px;height:5px;border-radius:50%;background:rgba(255,255,255,.2)';
        body.appendChild(highlight);

        // Skill name text
        var txt=document.createElement('div');
        txt.style.cssText='font-size:6.5px;font-weight:500;color:#fff;text-align:center;line-height:1.15;position:relative;z-index:1;padding:0 2px;user-select:none;font-family:Inter,Noto Sans SC,sans-serif';
        txt.textContent=en?sk.en:sk.cn;
        body.appendChild(txt);

        // Proficiency tooltip — placed in floatingLabel so it's never obscured
        var tip=document.createElement('div');
        tip.className='apple-tip';
        var tipX=(pos.x/W*100);
        var tipY=((pos.y+APPLE_SIZE/2+6)/H*100);
        tip.style.cssText='position:absolute;left:'+tipX+'%;top:'+tipY+'%;transform:translateX(-50%) scale(.9);'+
          'background:var(--bg2,#161e30);border:1px solid var(--frame-border,rgba(255,255,255,.08));'+
          'border-radius:8px;padding:4px 10px;white-space:nowrap;font-size:9px;font-weight:500;'+
          'color:'+brColor+';opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;'+
          'box-shadow:0 3px 12px rgba(0,0,0,.15);font-family:Inter,Noto Sans SC,sans-serif;letter-spacing:.3px';
        tip.textContent=en?sk.pEn:sk.p;
        floatingLabel.appendChild(tip);

        body.addEventListener('mouseenter',function(){
          tip.style.opacity='1';tip.style.transform='translateX(-50%) scale(1)';
        });
        body.addEventListener('mouseleave',function(){
          tip.style.opacity='0';tip.style.transform='translateX(-50%) scale(.9)';
        });

        apple.appendChild(body);
        cluster.appendChild(apple);
      });

      // ── Branch label (shown in floating layer on hover, always visible on top) ──
      var lbl=document.createElement('div');
      lbl.className='cluster-label';
      lbl.style.cssText='position:absolute;'+
        'left:'+(center.cx/W*100)+'%;top:'+((minY-8)/H*100)+'%;'+
        'transform:translateX(-50%);'+
        'font-size:11px;font-weight:600;letter-spacing:.5px;color:'+br.color+';'+
        'opacity:0;white-space:nowrap;pointer-events:none;text-align:center;'+
        'transition:opacity .3s;text-shadow:0 1px 6px rgba(0,0,0,.25);z-index:101;font-family:Inter,Noto Sans SC,sans-serif';
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
