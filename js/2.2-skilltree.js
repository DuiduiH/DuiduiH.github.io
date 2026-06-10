// ===== 2.2 Skill Garden — grid walk + inline flower certs =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=(window.MODULE_DATA&&window.MODULE_DATA.skillBranches)||[];
  var wrap=document.getElementById('stWrap');
  if(!wrap||!BRANCHES.length) return;

  var reviewed=new Set();
  var activeCluster=null;
  var walking=false;
  var player={x:1,y:7};
  var layout=null;

  function isMobile(){return window.matchMedia('(max-width:600px)').matches;}

  function buildLayout(){
    if(isMobile()){
      var COLS=12, ROWS=18;
      var PATH=new Set([
        '1,16','2,16','3,16','4,16','5,16','6,16','7,16','8,16','9,16','10,16','11,16',
        '6,15','6,14','6,13','6,12','6,11','6,10','6,9','6,8','6,7','6,6','6,5','6,4','6,3',
        '3,12','4,12','5,12','7,12','8,12','9,12',
        '3,11','3,10','3,9','3,8','3,7','3,6','3,5','3,4',
        '9,11','9,10','9,9','9,8','9,7','9,6','9,5','9,4',
        '4,7','5,7','7,7','8,7',
        '2,4','3,4','4,4','5,4','7,4','8,4','9,4','10,4',
        '2,3','3,3','4,3','5,3','7,3','8,3','9,3','10,3',
        '1,8','2,8','2,9','2,10','2,11',
        '10,8','10,9','10,10','10,11'
      ]);
      return {
        cols:COLS,rows:ROWS,start:{x:1,y:16},
        path:PATH,
        clusters:[
          {idx:0,fx:3,fy:3,color:'#ef4444'},
          {idx:1,fx:6,fy:3,color:'#f59e0b'},
          {idx:2,fx:9,fy:3,color:'#22c55e'},
          {idx:3,fx:9,fy:10,color:'#3b82f6'},
          {idx:4,fx:6,fy:10,color:'#a855f7'},
          {idx:5,fx:3,fy:10,color:'#ec4899'}
        ]
      };
    }
    var COLS=20, ROWS=11;
    var PATH=new Set([
      '1,7','2,7','3,7','4,7','5,7','6,7','7,7','8,7','9,7','10,7','11,7','12,7','13,7','14,7','15,7','16,7','17,7','18,7',
      '2,8','2,9','2,6','2,5',
      '7,8','7,9','7,6','7,5',
      '12,8','12,9','12,6','12,5',
      '17,8','17,9','17,6',
      '4,6','4,5','4,4','4,3',
      '9,6','9,5','9,4','9,3',
      '14,6','14,5','14,4','14,3',
      '4,8','4,9','4,10',
      '9,8','9,9','9,10',
      '14,8','14,9','14,10',
      '5,7','15,7','16,7'
    ]);
    return {
      cols:COLS,rows:ROWS,start:{x:1,y:7},
      path:PATH,
      clusters:[
        {idx:0,fx:4,fy:3,color:'#ef4444'},
        {idx:1,fx:9,fy:3,color:'#f59e0b'},
        {idx:2,fx:14,fy:3,color:'#22c55e'},
        {idx:3,fx:14,fy:9,color:'#3b82f6'},
        {idx:4,fx:9,fy:9,color:'#a855f7'},
        {idx:5,fx:4,fy:9,color:'#ec4899'}
      ]
    };
  }

  function syncLayout(){
    layout=buildLayout();
    if(!walking){
      player.x=layout.start.x;
      player.y=layout.start.y;
    }
  }
  syncLayout();

  function key(x,y){return x+','+y;}
  function isPath(x,y){return layout.path.has(key(x,y));}
  function inBounds(x,y){return x>=0&&x<layout.cols&&y>=0&&y<layout.rows;}

  function cellX(x){
    return 'calc('+(x+0.5)+' / var(--sg-cols) * 100%)';
  }

  function cellY(y){
    return 'calc('+(y+0.5)+' / var(--sg-rows) * 100%)';
  }

  function isTopRow(fy){
    return fy<=Math.max(3,Math.floor(layout.rows*0.22));
  }

  function adjacentToFlower(c){
    return (Math.abs(player.x-c.fx)+Math.abs(player.y-c.fy))===1;
  }

  function bfs(target){
    var q=[[player.x,player.y]];
    var prev={};
    var sk=key(player.x,player.y);
    prev[sk]=null;
    while(q.length){
      var cur=q.shift();
      var cx=cur[0],cy=cur[1];
      if(cx===target.x&&cy===target.y){
        var path=[];
        var k=key(cx,cy);
        while(k){
          var p=k.split(',');
          path.unshift({x:+p[0],y:+p[1]});
          k=prev[k];
        }
        return path.slice(1);
      }
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){
        var nx=cx+d[0],ny=cy+d[1],nk=key(nx,ny);
        if(inBounds(nx,ny)&&isPath(nx,ny)&&!(nk in prev)){
          prev[nk]=key(cx,cy);
          q.push([nx,ny]);
        }
      });
    }
    return null;
  }

  function walkPath(steps,cb){
    if(!steps||!steps.length){if(cb)cb();return;}
    walking=true;
    var i=0;
    function step(){
      if(i>=steps.length){walking=false;if(cb)cb();render();return;}
      player.x=steps[i].x;player.y=steps[i].y;
      i++;
      render();
      setTimeout(step,120);
    }
    step();
  }

  function tryMove(dx,dy){
    if(walking) return;
    var nx=player.x+dx,ny=player.y+dy;
    if(isPath(nx,ny)){
      player.x=nx;player.y=ny;
      render();
      tryOpenAdjacent();
    }
  }

  function markReviewed(idx){
    if(reviewed.has(idx)) return;
    reviewed.add(idx);
    if(reviewed.size>=layout.clusters.length){
      window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'skills',origin:wrap}}));
    }
  }

  function tryOpenAdjacent(){
    layout.clusters.forEach(function(c){
      if(adjacentToFlower(c)){
        if(activeCluster!==c.idx){
          activeCluster=c.idx;
          markReviewed(c.idx);
          render();
        }
      }
    });
  }

  function buildSheet(c){
    var br=BRANCHES[c.idx];
    if(!br) return '';
    var en=isEn();
    var chips=br.skills.map(function(sk){
      return '<div class="sg-skill-chip" style="border-color:'+c.color+'"><strong>'+(en?sk.en:sk.cn)+'</strong><span>'+(en?sk.pEn:sk.p)+'</span></div>';
    }).join('');
    return '<div class="sg-flower-sheet" style="--sheet-accent:'+c.color+'">'+
      '<div class="sg-sheet-title">'+(en?br.en:br.name)+'</div>'+
      '<div class="sg-skill-grid">'+chips+'</div></div>';
  }

  function render(){
    wrap.innerHTML='';
    var root=document.createElement('div');
    root.className='sg-root';
    var board=document.createElement('div');
    board.className='sg-board'+(isMobile()?' is-portrait':'');
    board.style.setProperty('--sg-cols',layout.cols);
    board.style.setProperty('--sg-rows',layout.rows);

    for(var y=0;y<layout.rows;y++){
      for(var x=0;x<layout.cols;x++){
        var tile=document.createElement('div');
        tile.className='sg-tile';
        tile.classList.add(isPath(x,y)?'path':'grass');
        board.appendChild(tile);
      }
    }

    layout.clusters.forEach(function(c){
      var br=BRANCHES[c.idx];
      if(!br) return;
      var flower=document.createElement('button');
      flower.type='button';
      var isNear=adjacentToFlower(c);
      var isActive=activeCluster===c.idx;
      flower.className='sg-flower'+(reviewed.has(c.idx)?' reviewed':'')+(isNear?' near':'')+(isActive?' open':'')+(isTopRow(c.fy)?' sg-top':'');
      flower.style.setProperty('--fl-color',c.color);
      flower.style.left=cellX(c.fx);
      flower.style.top=cellY(c.fy);
      flower.setAttribute('aria-label',isEn()?br.en:br.name);
      flower.innerHTML='<span class="sg-flower-bush"></span><span class="sg-flower-label">'+(isEn()?br.en:br.name)+'</span>';
      if(isActive&&isNear) flower.innerHTML+=buildSheet(c);
      flower.addEventListener('click',function(e){
        e.stopPropagation();
        if(isNear){
          activeCluster=c.idx;
          markReviewed(c.idx);
          render();
        }
      });
      board.appendChild(flower);
    });

    var avatar=document.createElement('div');
    avatar.className='sg-player';
    avatar.setAttribute('aria-hidden','true');
    avatar.innerHTML='<span class="sg-player-body"></span><span class="sg-player-face"></span>';
    avatar.style.left=cellX(player.x);
    avatar.style.top=cellY(player.y);
    board.appendChild(avatar);

    root.appendChild(board);
    wrap.appendChild(root);
  }

  function gridFromEvent(e){
    var board=wrap.querySelector('.sg-board');
    if(!board) return null;
    var r=board.getBoundingClientRect();
    var tx=Math.floor(((e.clientX-r.left)/r.width)*layout.cols);
    var ty=Math.floor(((e.clientY-r.top)/r.height)*layout.rows);
    if(!inBounds(tx,ty)||!isPath(tx,ty)) return null;
    return {x:tx,y:ty};
  }

  var lastTap=0;
  wrap.addEventListener('dblclick',function(e){
    if(walking) return;
    var t=gridFromEvent(e);
    if(!t||t.x===player.x&&t.y===player.y) return;
    var steps=bfs(t);
    if(steps) walkPath(steps,function(){tryOpenAdjacent();});
  });

  wrap.addEventListener('touchend',function(e){
    if(walking||!e.changedTouches||!e.changedTouches[0]) return;
    var now=Date.now();
    if(now-lastTap<320){
      var touch=e.changedTouches[0];
      var t=gridFromEvent({clientX:touch.clientX,clientY:touch.clientY});
      if(t&&!(t.x===player.x&&t.y===player.y)){
        var steps=bfs(t);
        if(steps) walkPath(steps,function(){tryOpenAdjacent();});
      }
      lastTap=0;
    }else{
      lastTap=now;
    }
  });

  window.addEventListener('keydown',function(e){
    if(!wrap.isConnected) return;
    var map={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
    var d=map[e.key];
    if(d){e.preventDefault();tryMove(d[0],d[1]);}
  });

  window.addEventListener('resize',function(){
    syncLayout();
    activeCluster=null;
    render();
  });

  window._resetSkillGarden=function(){
    syncLayout();
    reviewed=new Set();
    activeCluster=null;
    walking=false;
    render();
  };

  render();

  var obs=new MutationObserver(function(m){
    m.forEach(function(x){
      if(x.attributeName==='lang') render();
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
