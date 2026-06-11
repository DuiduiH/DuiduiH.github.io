// ===== 2.2 Skill Garden — maze grid + inline flower certs =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  var BRANCHES=(window.MODULE_DATA&&window.MODULE_DATA.skillBranches)||[];
  var wrap=document.getElementById('stWrap');
  if(!wrap||!BRANCHES.length) return;

  var FLOWER_COLORS=['#ef4444','#f59e0b','#22c55e','#3b82f6','#a855f7','#ec4899'];
  var reviewed=new Set();
  var displayedCluster=null;
  var sheetCloseTimer=null;
  var SHEET_HOLD_MS=2000;
  var walking=false;
  var player={x:1,y:11};
  var layout=null;
  var boardActive=false;
  var boardEl=null;
  var avatarEl=null;
  var flowerEls={};

  function isSkillsSectionVisible(){
    if(window.getCurrentSectionId) return window.getCurrentSectionId()==='skills';
    var page=document.querySelector('.section-page[data-map-id="skills"]');
    if(!page) return false;
    var rect=page.getBoundingClientRect();
    var mid=window.innerHeight*0.5;
    return rect.top<=mid&&rect.bottom>=mid;
  }

  function setBoardActive(on){
    boardActive=!!on;
    window.skillGardenBoardActive=boardActive;
    var board=wrap.querySelector('.sg-board');
    if(board) board.classList.toggle('is-play-active',boardActive);
    var shell=wrap.querySelector('.sg-board-shell');
    if(shell) shell.classList.toggle('is-play-active',boardActive);
  }

  function isMobile(){return window.matchMedia('(max-width:600px)').matches;}

  function pk(x,y){return x+','+y;}

  function isOuterRing(x,y,cols,rows){
    return x===0||y===0||x===cols-1||y===rows-1;
  }

  function seededRand(seed){
    return function(){
      seed=(seed*48271)%2147483647;
      return (seed&2147483647)/2147483647;
    };
  }

  function shuffleDirs(dirs,rand){
    for(var i=dirs.length-1;i>0;i--){
      var j=Math.floor(rand()*(i+1));
      var t=dirs[i];dirs[i]=dirs[j];dirs[j]=t;
    }
    return dirs;
  }

  function generateMaze(cols,rows,seed){
    var path=new Set();
    var visited={};
    var rand=seededRand(seed);

    function add(x,y){
      if(isOuterRing(x,y,cols,rows)) return;
      path.add(pk(x,y));
    }

    function carve(cx,cy){
      if(cx<1||cy<1||cx>cols-2||cy>rows-2) return;
      if(cx%2!==1||cy%2!==1) return;
      if(visited[pk(cx,cy)]) return;
      visited[pk(cx,cy)]=true;
      add(cx,cy);
      var dirs=shuffleDirs([[0,-2],[2,0],[0,2],[-2,0]],rand);
      dirs.forEach(function(d){
        var nx=cx+d[0],ny=cy+d[1];
        if(nx>=1&&nx<=cols-2&&ny>=1&&ny<=rows-2&&nx%2===1&&ny%2===1&&!visited[pk(nx,ny)]){
          add(cx+d[0]/2,cy+d[1]/2);
          carve(nx,ny);
        }
      });
    }

    carve(1,1);
    return path;
  }

  function linkEntrance(path,cols,rows,entX,entY){
    path.add(pk(entX,entY));
    var y=entY;
    while(y>1){
      y--;
      path.add(pk(entX,y));
      var linked=[[1,0],[-1,0],[0,-1],[0,1]].some(function(d){
        var k=pk(entX+d[0],y+d[1]);
        return k!==pk(entX,y+1)&&path.has(k);
      });
      if(linked) break;
    }
  }

  function pathNeighbors(x,y,path){
    var n=0;
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){
      if(path.has(pk(x+d[0],y+d[1]))) n++;
    });
    return n;
  }

  function manhattan(a,b){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  }

  function pickFlowerSpots(path,cols,rows,start,count){
    var candidates=[];
    for(var y=1;y<rows-1;y++){
      for(var x=1;x<cols-1;x++){
        if(path.has(pk(x,y))) continue;
        var adj=[[0,-1],[0,1],[-1,0],[1,0]].filter(function(d){
          return path.has(pk(x+d[0],y+d[1]));
        });
        if(adj.length<1) continue;
        var px=x+adj[0][0],py=y+adj[0][1];
        var score=pathNeighbors(px,py,path)===1?120:40;
        score+=manhattan({x:px,y:py},start);
        candidates.push({fx:x,fy:y,score:score});
      }
    }
    candidates.sort(function(a,b){return b.score-a.score;});
    var chosen=[];
    candidates.forEach(function(c){
      if(chosen.length>=count) return;
      if(chosen.some(function(o){
        return Math.abs(o.fx-c.fx)+Math.abs(o.fy-c.fy)<3;
      })) return;
      chosen.push(c);
    });
    var i=0;
    while(chosen.length<count&&i<candidates.length){
      var c=candidates[i++];
      if(chosen.some(function(o){return o.fx===c.fx&&o.fy===c.fy;})) continue;
      chosen.push(c);
    }
    return chosen.slice(0,count).map(function(c,idx){
      return {idx:idx,fx:c.fx,fy:c.fy,color:FLOWER_COLORS[idx]};
    });
  }

  function buildLayout(){
    if(isMobile()){
      var COLS=11,ROWS=17,SEED=7102;
      var start={x:1,y:ROWS-2};
      var path=generateMaze(COLS,ROWS,SEED);
      linkEntrance(path,COLS,ROWS,start.x,start.y);
      return {
        cols:COLS,rows:ROWS,start:start,
        path:path,
        clusters:pickFlowerSpots(path,COLS,ROWS,start,6)
      };
    }
    var COLS=15,ROWS=13,SEED=4206;
    var start={x:1,y:ROWS-2};
    var path=generateMaze(COLS,ROWS,SEED);
    linkEntrance(path,COLS,ROWS,start.x,start.y);
    return {
      cols:COLS,rows:ROWS,start:start,
      path:path,
      clusters:pickFlowerSpots(path,COLS,ROWS,start,6)
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

  function isPath(x,y){
    if(isOuterRing(x,y,layout.cols,layout.rows)) return false;
    return layout.path.has(pk(x,y));
  }
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

  function isBottomRow(fy){
    return fy>=layout.rows-1-Math.max(3,Math.floor(layout.rows*0.22));
  }

  function isLeftCol(fx){
    return fx<=Math.max(2,Math.floor(layout.cols*0.18));
  }

  function isRightCol(fx){
    return fx>=layout.cols-1-Math.max(2,Math.floor(layout.cols*0.18));
  }

  function sheetPlacementClass(c){
    var cls='';
    if(isTopRow(c.fy)&&!isBottomRow(c.fy)) cls+=' sg-top';
    if(isLeftCol(c.fx)) cls+=' sg-sheet-left';
    else if(isRightCol(c.fx)) cls+=' sg-sheet-right';
    return cls;
  }

  function adjacentPathCells(c){
    var cells=[];
    [[0,-1],[0,1],[-1,0],[1,0]].forEach(function(d){
      var nx=c.fx+d[0],ny=c.fy+d[1];
      if(inBounds(nx,ny)&&isPath(nx,ny)) cells.push({x:nx,y:ny});
    });
    return cells;
  }

  function nearestTriggerForFlower(c){
    var adj=adjacentPathCells(c);
    if(!adj.length) return null;
    var best=null,bestLen=Infinity;
    adj.forEach(function(target){
      var steps=bfs(target);
      if(!steps) return;
      if(steps.length<bestLen){
        bestLen=steps.length;
        best=target;
      }
    });
    return best;
  }

  function clearSheetTimer(){
    if(sheetCloseTimer){
      clearTimeout(sheetCloseTimer);
      sheetCloseTimer=null;
    }
  }

  function showSheet(idx){
    clearSheetTimer();
    if(displayedCluster===idx) return;
    displayedCluster=idx;
    markReviewed(idx);
    updateFlowerStates();
  }

  function adjacentToFlower(c){
    return (Math.abs(player.x-c.fx)+Math.abs(player.y-c.fy))===1;
  }

  function bfs(target){
    var q=[[player.x,player.y]];
    var prev={};
    var sk=pk(player.x,player.y);
    prev[sk]=null;
    while(q.length){
      var cur=q.shift();
      var cx=cur[0],cy=cur[1];
      if(cx===target.x&&cy===target.y){
        var pathSteps=[];
        var k=pk(cx,cy);
        while(k){
          var p=k.split(',');
          pathSteps.unshift({x:+p[0],y:+p[1]});
          k=prev[k];
        }
        return pathSteps.slice(1);
      }
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){
        var nx=cx+d[0],ny=cy+d[1],nk=pk(nx,ny);
        if(inBounds(nx,ny)&&isPath(nx,ny)&&!(nk in prev)){
          prev[nk]=pk(cx,cy);
          q.push([nx,ny]);
        }
      });
    }
    return null;
  }

  function walkPath(steps,cb){
    if(!steps||!steps.length){if(cb)cb();tryOpenAdjacent();return;}
    walking=true;
    var i=0;
    function step(){
      if(i>=steps.length){walking=false;if(cb)cb();tryOpenAdjacent();return;}
      player.x=steps[i].x;player.y=steps[i].y;
      i++;
      updatePlayerPos();
      tryOpenAdjacent();
      setTimeout(step,120);
    }
    step();
  }

  function walkToFlower(c){
    if(walking||!c) return;
    setBoardActive(true);
    var target=nearestTriggerForFlower(c);
    if(!target) return;
    if(target.x===player.x&&target.y===player.y){
      tryOpenAdjacent();
      return;
    }
    var steps=bfs(target);
    if(steps) walkPath(steps);
  }

  function tryMove(dx,dy){
    if(walking) return;
    var nx=player.x+dx,ny=player.y+dy;
    if(isPath(nx,ny)){
      player.x=nx;player.y=ny;
      updatePlayerPos();
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
    var found=null;
    layout.clusters.forEach(function(c){
      if(adjacentToFlower(c)) found=c.idx;
    });
    if(found!==null){
      clearSheetTimer();
      if(displayedCluster!==found) showSheet(found);
      else updateFlowerStates();
      return;
    }
    if(displayedCluster!==null&&!sheetCloseTimer){
      sheetCloseTimer=setTimeout(function(){
        sheetCloseTimer=null;
        displayedCluster=null;
        updateFlowerStates();
      },SHEET_HOLD_MS);
    }
  }

  function updatePlayerPos(){
    if(!avatarEl) return;
    avatarEl.style.left=cellX(player.x);
    avatarEl.style.top=cellY(player.y);
  }

  function updateFlowerStates(){
    if(!boardEl) return;
    layout.clusters.forEach(function(c){
      var flower=flowerEls[c.idx];
      if(!flower) return;
      var isNear=adjacentToFlower(c);
      var isActive=displayedCluster===c.idx;
      flower.className='sg-flower'+(reviewed.has(c.idx)?' reviewed':'')+(isNear?' near':'')+(isActive?' open':'')+sheetPlacementClass(c);
      var sheet=flower.querySelector('.sg-flower-sheet');
      if(isActive&&!sheet) flower.insertAdjacentHTML('beforeend',buildSheet(c));
      else if(!isActive&&sheet) sheet.remove();
    });
  }

  function flowerVisual(){
    function bloom(cx,cy,scale,rot){
      var petals=[0,72,144,216,288].map(function(deg){
        return '<ellipse class="sg-petal-shape" cx="0" cy="-6.8" rx="'+(4.4*scale)+'" ry="'+(7.6*scale)+'" transform="rotate('+(deg+rot)+')"/>';
      }).join('');
      return '<g transform="translate('+cx+' '+cy+')">'+petals+
        '<circle class="sg-flower-core-svg" cx="0" cy="0" r="'+(4.1*scale)+'"/>'+
        '<circle cx="0" cy="0" r="'+(2.4*scale)+'" fill="#fbbf24" opacity=".34"/>'+
      '</g>';
    }
    return '<svg class="sg-flower-svg" viewBox="0 0 64 58" aria-hidden="true">'+
      '<g opacity=".95">'+
        '<ellipse class="sg-flower-leaf-shape" cx="18" cy="42" rx="12" ry="6" transform="rotate(-18 18 42)"/>'+
        '<ellipse class="sg-flower-leaf-shape" cx="34" cy="44" rx="15" ry="6.5" transform="rotate(8 34 44)"/>'+
        '<ellipse class="sg-flower-leaf-shape" cx="48" cy="41" rx="12" ry="5.5" transform="rotate(20 48 41)"/>'+
      '</g>'+
      '<path class="sg-flower-stem-line" d="M22 42C24 34 25 31 25 25M33 44C33 35 34 31 36 24M45 42C43 34 43 31 42 27" fill="none"/>'+
      bloom(25,24,1.02,-8)+
      bloom(38,22,.92,14)+
      bloom(46,29,.78,-18)+
      bloom(17,30,.74,10)+
      '</svg>';
  }

  function buildSheet(c){
    var br=BRANCHES[c.idx];
    if(!br) return '';
    var en=isEn();
    var chips=br.skills.map(function(sk){
      return '<div class="sg-skill-chip"><strong>'+(en?sk.en:sk.cn)+'</strong><span>'+(en?sk.pEn:sk.p)+'</span></div>';
    }).join('');
    return '<div class="sg-flower-sheet" style="--sheet-accent:'+c.color+'">'+
      '<div class="sg-sheet-head"><div class="sg-sheet-title">'+(en?br.en:br.name)+'</div></div>'+
      '<div class="sg-skill-grid">'+chips+'</div></div>';
  }

  function render(){
    wrap.innerHTML='';
    flowerEls={};
    boardEl=null;
    avatarEl=null;
    var root=document.createElement('div');
    root.className='sg-root';
    var shell=document.createElement('div');
    shell.className='sg-board-shell';
    var board=document.createElement('div');
    board.className='sg-board'+(isMobile()?' is-portrait':'');
    board.style.setProperty('--sg-cols',layout.cols);
    board.style.setProperty('--sg-rows',layout.rows);
    boardEl=board;

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
      var flower=document.createElement('div');
      flower.className='sg-flower'+(reviewed.has(c.idx)?' reviewed':'')+sheetPlacementClass(c);
      flower.style.setProperty('--fl-color',c.color);
      flower.style.left=cellX(c.fx);
      flower.style.top=cellY(c.fy);
      flower.setAttribute('role','button');
      flower.setAttribute('tabindex','0');
      flower.setAttribute('aria-label',(isEn()?br.en:br.name)||'Skill flower');
      flower.innerHTML='<span class="sg-flower-bush" aria-hidden="true">'+flowerVisual()+'</span>';
      flower.addEventListener('click',function(e){
        e.stopPropagation();
        walkToFlower(c);
      });
      flower.addEventListener('keydown',function(e){
        if(e.key!=='Enter'&&e.key!==' ') return;
        e.preventDefault();
        e.stopPropagation();
        walkToFlower(c);
      });
      flowerEls[c.idx]=flower;
      board.appendChild(flower);
    });

    var avatar=document.createElement('div');
    avatar.className='sg-player';
    avatar.setAttribute('aria-hidden','true');
    avatar.innerHTML='<span class="sg-player-body"></span><span class="sg-player-face"></span>';
    avatar.style.left=cellX(player.x);
    avatar.style.top=cellY(player.y);
    board.appendChild(avatar);
    avatarEl=avatar;

    root.appendChild(shell);
    shell.appendChild(board);
    wrap.appendChild(root);
    if(boardActive){
      board.classList.add('is-play-active');
      shell.classList.add('is-play-active');
    }
    updateFlowerStates();
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
  wrap.addEventListener('pointerdown',function(e){
    if(e.target.closest('.sg-board')){
      setBoardActive(true);
      return;
    }
    if(wrap.contains(e.target)) setBoardActive(false);
  });

  document.addEventListener('pointerdown',function(e){
    if(!wrap.contains(e.target)) setBoardActive(false);
  });

  wrap.addEventListener('click',function(e){
    if(walking) return;
    var t=gridFromEvent(e);
    if(!t||t.x===player.x&&t.y===player.y) return;
    var steps=bfs(t);
    if(steps) walkPath(steps,function(){tryOpenAdjacent();});
  });

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
    if(!wrap.isConnected||!isSkillsSectionVisible()) return;
    var moveKeys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
    var d=moveKeys[e.key];
    if(!d) return;
    if(boardActive){
      e.preventDefault();
      tryMove(d[0],d[1]);
      return;
    }
    if(e.key==='ArrowUp'||e.key==='ArrowDown'||e.key==='w'||e.key==='s'){
      if(window.pageTurnFromKey){
        e.preventDefault();
        window.pageTurnFromKey(e.key==='ArrowUp'||e.key==='w'?-1:1);
      }
    }
  });

  window.addEventListener('resize',function(){
    syncLayout();
    clearSheetTimer();
    displayedCluster=null;
    render();
  });

  window._resetSkillGarden=function(){
    syncLayout();
    reviewed=new Set();
    clearSheetTimer();
    displayedCluster=null;
    walking=false;
    setBoardActive(false);
    render();
  };

  window.skillGardenBoardActive=false;
  setBoardActive(false);

  render();

  var obs=new MutationObserver(function(m){
    m.forEach(function(x){
      if(x.attributeName==='lang') render();
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
