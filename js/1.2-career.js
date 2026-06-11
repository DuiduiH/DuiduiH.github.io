// ===== 1.2 Career — Elevator + interactive rooms =====
(function(){
  var floorsEl=document.getElementById('careerFloors');
  var elevatorCar=document.getElementById('elevatorCar');
  var room=document.getElementById('careerRoom');
  var scene=document.getElementById('careerScene');
  var hotspotsEl=document.getElementById('careerHotspots');
  var roomLabel=document.getElementById('careerRoomLabel');
  var floatTip=document.getElementById('careerFloatTip');
  var tipTitle=document.getElementById('careerTipTitle');
  var tipDesc=document.getElementById('careerTipDesc');
  var tipLink=document.getElementById('careerTipLink');
  if(!floorsEl||!room||!scene||!hotspotsEl) return;

  var DATA=(window.MODULE_DATA&&window.MODULE_DATA.careerFloors)||[];
  if(!DATA.length) return;

  var currentId=DATA[0].id;
  var floorIndex=0;
  var floorsSeen=new Set();
  var hotspotFloors=new Set();
  var doorsOpen=false;
  var elevatorBusy=false;
  var doorTimer=null;
  var moveTimer=null;
  var resizeTimer=null;
  var DOOR_MS=520;
  var MOVE_MS=540;

  function isMobileLayout(){
    return window.matchMedia('(max-width:600px)').matches;
  }

  function isPortraitMobile(){
    return window.matchMedia('(max-width:600px) and (orientation:portrait)').matches;
  }

  function usePortraitMonitorGrid(){
    return isPortraitMobile();
  }

  function checkCareerStar(){
    if(floorsSeen.size<DATA.length||hotspotFloors.size<DATA.length) return;
    window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'career',origin:room}}));
  }

  function lang(){return document.documentElement.lang==='en'?'en':'cn';}
  function pick(obj){var l=lang();return obj&&typeof obj==='object'?(obj[l]||obj.cn||obj.en):obj;}

  function screenFont(w, h, ratio, min, max){
    min=min||7; max=max||10;
    return Math.min(max, Math.max(min, Math.min(w, h)*ratio));
  }

  function setFloorBusy(on){
    floorsEl.querySelectorAll('.career-floor').forEach(function(el){
      el.classList.toggle('is-busy',on);
    });
  }

  function brandMark(id){
    if(id==='red'){
      return '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="5" y="5" width="26" height="26" rx="7" fill="color-mix(in srgb,#ef4444 18%,var(--bg2))" stroke="#ef4444" stroke-width="1.6"/><path d="M11 13h14M11 18h10M11 23h12" stroke="#ef4444" stroke-width="1.35" stroke-linecap="round"/><circle cx="24" cy="23" r="2.4" fill="#ef4444"/></svg>';
    }
    if(id==='finance'){
      return '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="6" y="8" width="24" height="22" rx="5" fill="color-mix(in srgb,#fbbf24 32%,var(--bg2))" stroke="#f59e0b" stroke-width="1.6"/><polyline points="10,24 13.5,19 16.5,21 20,15 23,17 26,12" fill="none" stroke="#d97706" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if(id==='ai'){
      return '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M14 24h9.5c2.6 0 4.7-2.1 4.7-4.7 0-2.2-1.5-4-3.6-4.5-.8-2.6-3.2-4.5-6-4.5-2.4 0-4.5 1.4-5.5 3.5-2.5.3-4.4 2.4-4.4 4.9 0 2.7 2.2 4.8 4.8 4.8z" fill="color-mix(in srgb,#1d4ed8 18%,var(--bg2))" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    }
    return '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M14 24h9.5c2.6 0 4.7-2.1 4.7-4.7 0-2.2-1.5-4-3.6-4.5-.8-2.6-3.2-4.5-6-4.5-2.4 0-4.5 1.4-5.5 3.5-2.5.3-4.4 2.4-4.4 4.9 0 2.7 2.2 4.8 4.8 4.8z" fill="color-mix(in srgb,#1d4ed8 18%,var(--bg2))" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }

  function monitorArt(id,accent,ox,oy,mw,mh){
    var x=ox+10;
    var y=oy+10;
    var w=mw-20;
    var h=mh-20;
    var tint='color-mix(in srgb,'+accent+' 22%,var(--cr-screen-hi))';
    var tint2='color-mix(in srgb,'+accent+' 12%,var(--cr-screen))';
    if(id==='campaign'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.1)+'" width="'+(w*0.28)+'" height="'+(h*0.72)+'" rx="5" fill="'+tint+'" stroke="var(--cr-stroke)"/>'+
        '<circle cx="'+(x+w*0.22)+'" cy="'+(y+h*0.25)+'" r="'+(h*0.06)+'" fill="#fef2f2"/>'+
        '<rect x="'+(x+w*0.14)+'" y="'+(y+h*0.43)+'" width="'+(w*0.16)+'" height="'+(h*0.2)+'" rx="2" fill="#ef4444" opacity=".8"/>'+
        '<rect x="'+(x+w*0.43)+'" y="'+(y+h*0.14)+'" width="'+(w*0.42)+'" height="'+(h*0.08)+'" rx="2" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.43)+'" y="'+(y+h*0.3)+'" width="'+(w*0.5)+'" height="'+(h*0.08)+'" rx="2" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.43)+'" y="'+(y+h*0.5)+'" width="'+(w*0.34)+'" height="'+(h*0.18)+'" rx="3" fill="color-mix(in srgb,#ef4444 30%,var(--cr-screen-hi))"/>';
    }
    if(id==='traffic'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.12)+'" width="'+(w*0.84)+'" height="'+(h*0.16)+'" rx="3" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.36)+'" width="'+(w*0.18)+'" height="'+(h*0.42)+'" rx="2" fill="color-mix(in srgb,#ef4444 36%,var(--cr-screen-hi))"/>'+
        '<rect x="'+(x+w*0.36)+'" y="'+(y+h*0.48)+'" width="'+(w*0.18)+'" height="'+(h*0.3)+'" rx="2" fill="color-mix(in srgb,#38bdf8 32%,var(--cr-screen-hi))"/>'+
        '<rect x="'+(x+w*0.62)+'" y="'+(y+h*0.28)+'" width="'+(w*0.18)+'" height="'+(h*0.5)+'" rx="2" fill="color-mix(in srgb,#fbbf24 32%,var(--cr-screen-hi))"/>'+
        '<polyline points="'+(x+w*0.08)+','+(y+h*0.78)+' '+(x+w*0.28)+','+(y+h*0.42)+' '+(x+w*0.48)+','+(y+h*0.55)+' '+(x+w*0.68)+','+(y+h*0.28)+' '+(x+w*0.88)+','+(y+h*0.48)+'" fill="none" stroke="'+accent+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>';
    }
    if(id==='community'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.16)+'" width="'+(w*0.34)+'" height="'+(h*0.18)+'" rx="7" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.5)+'" y="'+(y+h*0.28)+'" width="'+(w*0.38)+'" height="'+(h*0.18)+'" rx="7" fill="'+tint2+'"/>'+
        '<rect x="'+(x+w*0.18)+'" y="'+(y+h*0.54)+'" width="'+(w*0.52)+'" height="'+(h*0.18)+'" rx="7" fill="color-mix(in srgb,#ef4444 24%,var(--cr-screen-hi))"/>'+
        '<circle cx="'+(x+w*0.16)+'" cy="'+(y+h*0.25)+'" r="'+(h*0.05)+'" fill="#fff"/>'+
        '<circle cx="'+(x+w*0.84)+'" cy="'+(y+h*0.37)+'" r="'+(h*0.05)+'" fill="#fff"/>';
    }
    if(id==='biz'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.14)+'" width="'+(w*0.34)+'" height="'+(h*0.58)+'" rx="4" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<rect x="'+(x+w*0.54)+'" y="'+(y+h*0.16)+'" width="'+(w*0.34)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.54)+'" y="'+(y+h*0.36)+'" width="'+(w*0.28)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint2+'"/>'+
        '<path d="M'+(x+w*0.18)+' '+(y+h*0.5)+'q'+(w*0.1)+' '+(-h*0.16)+' '+(w*0.22)+' 0t'+(w*0.22)+' 0" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>';
    }
    if(id==='report'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.12)+'" width="'+(w*0.3)+'" height="'+(h*0.68)+'" rx="3" fill="#f8fafc" opacity=".9"/>'+
        '<rect x="'+(x+w*0.13)+'" y="'+(y+h*0.2)+'" width="'+(w*0.2)+'" height="'+(h*0.06)+'" rx="1" fill="#f59e0b"/>'+
        '<rect x="'+(x+w*0.13)+'" y="'+(y+h*0.34)+'" width="'+(w*0.18)+'" height="'+(h*0.04)+'" rx="1" fill="#94a3b8"/>'+
        '<rect x="'+(x+w*0.13)+'" y="'+(y+h*0.45)+'" width="'+(w*0.21)+'" height="'+(h*0.04)+'" rx="1" fill="#94a3b8"/>'+
        '<rect x="'+(x+w*0.48)+'" y="'+(y+h*0.14)+'" width="'+(w*0.36)+'" height="'+(h*0.18)+'" rx="3" fill="'+tint+'"/>'+
        '<polyline points="'+(x+w*0.48)+','+(y+h*0.74)+' '+(x+w*0.58)+','+(y+h*0.5)+' '+(x+w*0.7)+','+(y+h*0.57)+' '+(x+w*0.84)+','+(y+h*0.36)+'" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round"/>';
    }
    if(id==='screen'){
      var fs=screenFont(w,h,0.1,7,9);
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<polyline points="'+(x+w*0.08)+','+(y+h*0.72)+' '+(x+w*0.2)+','+(y+h*0.55)+' '+(x+w*0.32)+','+(y+h*0.62)+' '+(x+w*0.46)+','+(y+h*0.34)+' '+(x+w*0.62)+','+(y+h*0.42)+' '+(x+w*0.84)+','+(y+h*0.24)+'" fill="none" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'+
        '<text x="'+(x+w*0.08)+'" y="'+(y+h*0.22)+'" fill="#f8fafc" font-size="'+fs+'" font-weight="700">AAPL</text>'+
        '<text x="'+(x+w*0.52)+'" y="'+(y+h*0.22)+'" fill="#22c55e" font-size="'+fs+'">+2.4%</text>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.82)+'" width="'+(w*0.76)+'" height="2" fill="'+tint2+'"/>';
    }
    if(id==='deal'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.16)+'" width="'+(w*0.32)+'" height="'+(h*0.5)+'" rx="3" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.56)+'" y="'+(y+h*0.16)+'" width="'+(w*0.32)+'" height="'+(h*0.5)+'" rx="3" fill="'+tint2+'"/>'+
        '<path d="M'+(x+w*0.4)+' '+(y+h*0.44)+'h'+(w*0.18)+'" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/>'+
        '<circle cx="'+(x+w*0.26)+'" cy="'+(y+h*0.74)+'" r="'+(h*0.05)+'" fill="#f8fafc"/><circle cx="'+(x+w*0.72)+'" cy="'+(y+h*0.74)+'" r="'+(h*0.05)+'" fill="#f8fafc"/>';
    }
    if(id==='terminal'){
      var tfs=screenFont(w,h,0.1,6.5,9);
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="#06111f"/>'+
        '<text x="'+(x+w*0.1)+'" y="'+(y+h*0.24)+'" fill="#22c55e" font-size="'+tfs+'" font-family="monospace">factor.py</text>'+
        '<text x="'+(x+w*0.1)+'" y="'+(y+h*0.44)+'" fill="#93c5fd" font-size="'+tfs+'" font-family="monospace">alpha .18</text>'+
        '<text x="'+(x+w*0.1)+'" y="'+(y+h*0.62)+'" fill="#fbbf24" font-size="'+tfs+'" font-family="monospace">sharpe 1.42</text>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.74)+'" width="'+(w*0.54)+'" height="2" fill="#22c55e"/>';
    }
    if(id==='lab'){
      var lfs=screenFont(w,h,0.11,7,9);
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.08)+'" y="'+(y+h*0.12)+'" width="'+(w*0.38)+'" height="'+(h*0.58)+'" rx="3" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<path d="M'+(x+w*0.14)+' '+(y+h*0.58)+' L'+(x+w*0.28)+' '+(y+h*0.32)+' L'+(x+w*0.42)+' '+(y+h*0.48)+'" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>'+
        '<circle cx="'+(x+w*0.68)+'" cy="'+(y+h*0.43)+'" r="'+(Math.min(w,h)*0.12)+'" fill="none" stroke="'+accent+'" stroke-width="1.4" opacity=".7"/>'+
        '<text x="'+(x+w/2)+'" y="'+(y+h*0.82)+'" fill="#60a5fa" font-size="'+lfs+'" font-weight="700" text-anchor="middle">Scan2BIM</text>';
    }
    if(id==='rhino'){
      var rfs=screenFont(w,h,0.11,7,9);
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<text x="'+(x+w*0.08)+'" y="'+(y+h*0.18)+'" fill="#60a5fa" font-size="'+rfs+'" font-weight="700">Rhino</text>'+
        '<g stroke="var(--cr-stroke)" stroke-width=".7" opacity=".62"><path d="M'+(x+w*0.08)+' '+(y+h*0.72)+'h'+(w*0.76)+'M'+(x+w*0.14)+' '+(y+h*0.58)+'h'+(w*0.64)+'M'+(x+w*0.22)+' '+(y+h*0.44)+'h'+(w*0.48)+'M'+(x+w*0.3)+' '+(y+h*0.3)+'h'+(w*0.32)+'"/><path d="M'+(x+w*0.12)+' '+(y+h*0.76)+'l'+(w*0.26)+' -'+(h*0.5)+'M'+(x+w*0.28)+' '+(y+h*0.76)+'l'+(w*0.22)+' -'+(h*0.5)+'M'+(x+w*0.44)+' '+(y+h*0.76)+'l'+(w*0.18)+' -'+(h*0.5)+'"/></g>'+
        '<path d="M'+(x+w*0.26)+' '+(y+h*0.58)+' C'+(x+w*0.34)+' '+(y+h*0.28)+' '+(x+w*0.62)+' '+(y+h*0.28)+' '+(x+w*0.74)+' '+(y+h*0.5)+' C'+(x+w*0.62)+' '+(y+h*0.72)+' '+(x+w*0.36)+' '+(y+h*0.72)+' '+(x+w*0.26)+' '+(y+h*0.58)+'Z" fill="color-mix(in srgb,'+accent+' 18%,transparent)" stroke="color-mix(in srgb,'+accent+' 82%,#38bdf8)" stroke-width="1.8"/>'+
        '<path d="M'+(x+w*0.36)+' '+(y+h*0.58)+' C'+(x+w*0.46)+' '+(y+h*0.44)+' '+(x+w*0.6)+' '+(y+h*0.44)+' '+(x+w*0.68)+' '+(y+h*0.55)+'" fill="none" stroke="#38bdf8" stroke-width="1.4" opacity=".85"/>';
    }
    if(id==='annotation'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.16)+'" width="'+(w*0.34)+'" height="'+(w*0.34)+'" rx="3" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<path d="M'+(x+w*0.16)+' '+(y+h*0.52)+'h'+(w*0.22)+'M'+(x+w*0.27)+' '+(y+h*0.41)+'v'+(h*0.22)+'" stroke="#38bdf8" stroke-width="1.6"/>'+
        '<rect x="'+(x+w*0.52)+'" y="'+(y+h*0.18)+'" width="'+(w*0.32)+'" height="'+(h*0.58)+'" rx="3" fill="'+tint+'"/>'+
        '<path d="M'+(x+w*0.58)+' '+(y+h*0.34)+'h'+(w*0.18)+'M'+(x+w*0.58)+' '+(y+h*0.48)+'h'+(w*0.22)+'M'+(x+w*0.58)+' '+(y+h*0.62)+'h'+(w*0.14)+'" stroke="#fff" stroke-width="1.4" opacity=".8"/>';
    }
    if(id==='release'){
      return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
        '<rect x="'+(x+w*0.09)+'" y="'+(y+h*0.13)+'" width="'+(w*0.78)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint+'"/>'+
        '<rect x="'+(x+w*0.09)+'" y="'+(y+h*0.36)+'" width="'+(w*0.5)+'" height="'+(h*0.08)+'" rx="2" fill="var(--cr-screen-hi)"/>'+
        '<rect x="'+(x+w*0.09)+'" y="'+(y+h*0.52)+'" width="'+(w*0.68)+'" height="'+(h*0.08)+'" rx="2" fill="var(--cr-screen-hi)"/>'+
        '<path d="M'+(x+w*0.7)+' '+(y+h*0.72)+'l'+(w*0.12)+' '+(-h*0.16)+'l'+(w*0.08)+' '+(h*0.08)+'" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4" fill="var(--cr-screen)"/>'+
      '<rect x="'+(x+w*0.1)+'" y="'+(y+h*0.2)+'" width="'+(w*0.8)+'" height="'+(h*0.12)+'" rx="2" fill="'+tint+'"/>';
  }

  var sceneBounds={left:28,top:22,right:872,bottom:388,personSize:112,personY:418,VW:900,VH:560};

  function syncSceneBounds(){
    var mobile=isMobileLayout();
    var VW=900,VH=560;
    var personSize=mobile?92:112;
    var rr=room&&room.getBoundingClientRect();
    if(!rr||rr.width<2||rr.height<2){
      sceneBounds={left:32,top:24,right:868,bottom:382,personSize:personSize,personY:412,VW:VW,VH:VH};
      return;
    }
    var portrait=isPortraitMobile();
    var topPx=mobile?(portrait?30:42):54;
    var sidePx=12;
    var bottomPx=mobile?(portrait?6+personSize*0.72:6+personSize*0.94):6+personSize*0.94;
    var personY=(rr.height-personSize-4)/rr.height*VH;
    var personYOffset=portrait?34:6;
    sceneBounds={
      left:sidePx/rr.width*VW,
      top:topPx/rr.height*VH,
      right:(rr.width-sidePx)/rr.width*VW,
      bottom:(rr.height-bottomPx)/rr.height*VH,
      personSize:personSize,
      personY:Math.min(VH-personSize-2,personY+personYOffset),
      VW:VW,
      VH:VH
    };
  }

  function monitorSlots(portraitGrid){
    var b=sceneBounds;
    var bl=6,bt=portraitGrid?6:8,bb=portraitGrid?22:30,br=6;
    var safeL=b.left+bl;
    var safeR=b.right-br;
    var safeT=b.top+bt;
    var safeB=b.bottom-bb;
    var availW=safeR-safeL;
    var availH=Math.max(64,safeB-safeT);
    var bezelX=6;
    var bezelTop=8;
    var outerExtraW=bezelX*2;
    var outerExtraH=bezelTop+12;
    var minMw=portraitGrid?36:32;
    var minMh=portraitGrid?44:36;

    if(portraitGrid){
      var gapX=14,gapY=10;
      var rowOuterH=Math.floor((availH-gapY)/2);
      var maxInnerH=Math.max(minMh,rowOuterH-outerExtraH);
      var maxSlotW=Math.floor((availW-gapX-outerExtraW*2)/2);
      var maxInnerW=Math.max(minMw,maxSlotW);
      var aspect=0.78;
      var mh=maxInnerH;
      var mw=Math.min(maxInnerW,Math.floor(mh/aspect));
      if(mw<minMw){
        mw=minMw;
        mh=Math.min(maxInnerH,Math.max(minMh,Math.floor(mw*aspect)));
      }
      var outerW=mw+outerExtraW;
      var gridOuterW=outerW*2+gapX;
      var x0=safeL+(availW-gridOuterW)/2+bezelX;
      var x1=x0+outerW+gapX;
      var yPad=Math.max(0,(rowOuterH-outerExtraH-mh)/2);
      var y0=safeT+bezelTop+yPad;
      var y1=y0+outerExtraH+mh+gapY;
      return [
        {mx:x0,my:y0,mw:mw,mh:mh},
        {mx:x1,my:y0,mw:mw,mh:mh},
        {mx:x0,my:y1,mw:mw,mh:mh},
        {mx:x1,my:y1,mw:mw,mh:mh}
      ];
    }

    var gap=12;
    var colOuterW=Math.floor((availW-gap*3)/4);
    var mw=Math.max(minMw,colOuterW-outerExtraW);
    var mh=Math.max(minMh,availH-outerExtraH);
    return [0,1,2,3].map(function(i){
      return {mx:safeL+bezelX+i*(colOuterW+gap),my:safeT+bezelTop,mw:mw,mh:mh};
    });
  }

  function computeLayout(){
    syncSceneBounds();
    return {
      slots:monitorSlots(usePortraitMonitorGrid()),
      personSize:sceneBounds.personSize,
      personY:sceneBounds.personY
    };
  }

  function personSvg(layout){
    var size=layout.personSize;
    var py=layout.personY;
    var cx=450;
    return '<g class="career-person">'+
      '<ellipse cx="'+cx+'" cy="'+(py+size*0.88)+'" rx="'+(size*0.34)+'" ry="'+(size*0.07)+'" fill="rgba(0,0,0,.16)"/>'+
      '<text x="'+cx+'" y="'+(py+size*0.56)+'" text-anchor="middle" dominant-baseline="middle" font-size="'+(size*0.54)+'">🧑‍💻</text>'+
    '</g>';
  }

  function workspaceSvg(accent,objIds){
    var layout=computeLayout();
    var clipDefs=objIds.map(function(id,i){
      var s=layout.slots[i]||layout.slots[0];
      return '<clipPath id="career-clip-'+id+'"><rect x="'+s.mx+'" y="'+s.my+'" width="'+s.mw+'" height="'+s.mh+'" rx="5"/></clipPath>';
    }).join('');
    var monitors=objIds.map(function(id,i){
      var s=layout.slots[i]||layout.slots[0];
      var mx=s.mx,my=s.my,mw=s.mw,mh=s.mh;
      return '<g class="career-obj" data-obj="'+id+'">'+
        '<rect class="career-bezel" x="'+(mx-6)+'" y="'+(my-8)+'" width="'+(mw+12)+'" height="'+(mh+20)+'" rx="7" fill="var(--cr-panel)" stroke="var(--cr-stroke)" stroke-width="1"/>'+
        '<rect class="career-screen" x="'+mx+'" y="'+my+'" width="'+mw+'" height="'+mh+'" rx="5" fill="var(--cr-screen-hi)" stroke="var(--cr-stroke)"/>'+
        '<g clip-path="url(#career-clip-'+id+')">'+monitorArt(id,accent,mx,my,mw,mh)+'</g>'+
        '<rect x="'+(mx+mw/2-16)+'" y="'+(my+mh+2)+'" width="32" height="6" rx="2" fill="var(--cr-panel)" stroke="var(--cr-stroke)"/>'+
      '</g>';
    }).join('');

    return '<svg viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">'+
      '<defs>'+clipDefs+'</defs>'+
      monitors+
      personSvg(layout)+
      '</svg>';
  }

  function roomSvg(id){
    var item=DATA.find(function(x){return x.id===id;})||DATA[0];
    var accent=item.accent||'#38bdf8';
    if(id==='red') return workspaceSvg(accent,['campaign','traffic','community','biz']);
    if(id==='finance') return workspaceSvg(accent,['report','screen','deal','terminal']);
    return workspaceSvg(accent,['lab','rhino','annotation','release']);
  }

  function setObjHighlight(id){
    scene.querySelectorAll('.career-obj').forEach(function(g){
      g.classList.toggle('is-active',g.dataset.obj===id);
    });
  }

  function clearObjHighlight(){
    scene.querySelectorAll('.career-obj').forEach(function(g){g.classList.remove('is-active');});
  }

  function clearDestinationPending(){
    floorsEl.querySelectorAll('.career-floor').forEach(function(el){
      el.classList.remove('is-destination-pending');
    });
  }

  function syncFloorReveal(){
    floorsEl.querySelectorAll('.career-floor').forEach(function(el,idx){
      var isCar=idx===floorIndex;
      el.classList.toggle('at-car',isCar);
      el.classList.toggle('is-revealed',isCar&&doorsOpen);
      el.classList.toggle('active',isCar);
    });
  }

  function setDoors(open){
    if(!elevatorCar) return;
    doorsOpen=!!open;
    elevatorCar.classList.toggle('doors-open',doorsOpen);
    if(doorsOpen) clearDestinationPending();
    syncFloorReveal();
  }

  function closeDoors(cb){
    clearTimeout(doorTimer);
    if(!doorsOpen){if(cb) cb();return;}
    setDoors(false);
    setTimeout(function(){if(cb) cb();},DOOR_MS);
  }

  function openDoors(cb){
    clearTimeout(doorTimer);
    setDoors(true);
    elevatorBusy=false;
    setFloorBusy(false);
    if(cb) cb();
  }

  function hideTip(){
    if(floatTip){
      floatTip.classList.remove('show','has-link','flip-below');
      floatTip.hidden=true;
      floatTip.style.left='';
      floatTip.style.top='';
    }
    if(tipLink){
      tipLink.hidden=true;
      tipLink.setAttribute('hidden','');
      tipLink.textContent='';
      tipLink.removeAttribute('href');
    }
    if(tipTitle){
      tipTitle.hidden=true;
      tipTitle.textContent='';
    }
    clearObjHighlight();
    hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.remove('active');});
  }

  function positionTip(anchorBtn){
    if(!floatTip||!room||!anchorBtn) return;
    var pad=8;
    var roomRect=room.getBoundingClientRect();
    var btnRect=anchorBtn.getBoundingClientRect();
    var tipRect=floatTip.getBoundingClientRect();
    var cx=btnRect.left+btnRect.width/2-roomRect.left;
    var top=btnRect.bottom-roomRect.top+pad;
    var left=cx-tipRect.width/2;
    left=Math.max(pad,Math.min(roomRect.width-tipRect.width-pad,left));
    top=Math.max(pad,Math.min(roomRect.height-tipRect.height-pad,top));
    floatTip.style.left=left+'px';
    floatTip.style.top=top+'px';
    floatTip.classList.add('flip-below');
  }

  function showTip(hotspot,anchorBtn){
    hotspotFloors.add(currentId);
    checkCareerStar();
    setObjHighlight(hotspot.id);
    if(!floatTip||!tipDesc) return;
    if(tipTitle){
      tipTitle.hidden=true;
      tipTitle.textContent='';
    }
    tipDesc.textContent=pick(hotspot.desc);
    var hasLink=hotspot.id==='lab'&&!!hotspot.url;
    if(tipLink){
      if(hasLink){
        tipLink.href=hotspot.url;
        tipLink.textContent=pick(hotspot.linkText)||(lang()==='en'
          ?'This is a really interesting company — tap the link to explore.'
          :'这也是一家很有趣的公司，点击链接来了解一下吧。');
        tipLink.hidden=false;
        tipLink.removeAttribute('hidden');
      }else{
        tipLink.hidden=true;
        tipLink.setAttribute('hidden','');
        tipLink.textContent='';
        tipLink.removeAttribute('href');
      }
    }
    floatTip.hidden=false;
    floatTip.classList.toggle('has-link',hasLink);
    floatTip.classList.add('show');
    requestAnimationFrame(function(){
      positionTip(anchorBtn);
    });
  }

  function bindHotspot(btn,hotspot){
    function activate(){
      if(elevatorBusy) return;
      hotspotsEl.querySelectorAll('.career-hotspot').forEach(function(el){el.classList.toggle('active',el===btn);});
      showTip(hotspot,btn);
    }
    btn.addEventListener('mouseenter',activate);
    btn.addEventListener('focus',function(){if(!elevatorBusy) showTip(hotspot,btn);});
    btn.addEventListener('mouseleave',function(e){
      btn.classList.remove('active');
      if(floatTip&&floatTip.contains(e.relatedTarget)) return;
      hideTip();
    });
    btn.addEventListener('blur',hideTip);
    btn.addEventListener('click',function(e){
      e.stopPropagation();
      activate();
    });
  }

  function syncHotspots(hotspots){
    var svg=scene.querySelector('svg');
    if(!svg) return;
    var roomRect=room.getBoundingClientRect();
    if(roomRect.width<1||roomRect.height<1) return;
    hotspotsEl.innerHTML='';
    hotspots.forEach(function(hotspot){
      var g=svg.querySelector('.career-obj[data-obj="'+hotspot.id+'"]');
      var screen=g&&g.querySelector('.career-screen');
      if(!screen) return;
      var sr=screen.getBoundingClientRect();
      var cx=((sr.left+sr.right)/2-roomRect.left)/roomRect.width*100;
      var cy=((sr.top+sr.bottom)/2-roomRect.top)/roomRect.height*100;
      var w=Math.max(8,(sr.width/roomRect.width)*100);
      var h=Math.max(8,(sr.height/roomRect.height)*100);
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='career-hotspot';
      btn.dataset.id=hotspot.id;
      btn.style.setProperty('--x',cx+'%');
      btn.style.setProperty('--y',cy+'%');
      btn.style.setProperty('--w',w+'%');
      btn.style.setProperty('--h',h+'%');
      btn.setAttribute('aria-label',pick(hotspot.desc));
      bindHotspot(btn,hotspot);
      hotspotsEl.appendChild(btn);
    });
  }

  function applyRoomContent(item){
    currentId=item.id;
    floorsSeen.add(item.id);
    hideTip();
    room.style.setProperty('--floor-accent',item.accent);
    room.style.color=item.accent;
    if(roomLabel) roomLabel.textContent=pick(item.roomLabel);
    scene.innerHTML=roomSvg(item.id);
    requestAnimationFrame(function(){
      syncHotspots(item.hotspots);
    });
    syncFloorReveal();
  }

  function updateElevatorCar(pos,item){
    if(!elevatorCar) return;
    elevatorCar.dataset.pos=String(pos);
    elevatorCar.style.setProperty('--floor-accent',item.accent);
  }

  function travelToFloor(id,idx){
    if(elevatorBusy) return;
    var item=DATA.find(function(x){return x.id===id;})||DATA[0];
    var pos=typeof idx==='number'?idx:DATA.findIndex(function(x){return x.id===item.id;});
    if(pos<0) pos=0;

    if(id===currentId&&!doorsOpen){
      elevatorBusy=true;
      setFloorBusy(true);
      applyRoomContent(item);
      openDoors();
      return;
    }
    if(id===currentId) return;

    elevatorBusy=true;
    setFloorBusy(true);
    hideTip();
    floorsEl.querySelectorAll('.career-floor').forEach(function(el,i){
      el.classList.toggle('is-destination-pending',i===pos);
    });

    closeDoors(function(){
      updateElevatorCar(pos,item);
      floorIndex=pos;
      syncFloorReveal();
      clearTimeout(moveTimer);
      moveTimer=setTimeout(function(){
        applyRoomContent(item);
        openDoors();
      },MOVE_MS);
    });
  }

  function renderFloors(){
    floorsEl.innerHTML='';
    DATA.forEach(function(item,idx){
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='career-floor';
      btn.dataset.id=item.id;
      btn.style.setProperty('--floor-accent',item.accent);
      btn.setAttribute('aria-label',pick(item.label));
      btn.innerHTML='<span class="floor-face"><span class="floor-num">'+item.floor+'</span><span class="floor-mark">'+brandMark(item.id)+'</span></span>';
      btn.addEventListener('click',function(){
        travelToFloor(item.id,idx);
      });
      floorsEl.appendChild(btn);
    });
  }

  window._renderCareer=function(){
    floorsSeen=new Set();
    hotspotFloors=new Set();
    elevatorBusy=false;
    doorsOpen=false;
    clearTimeout(doorTimer);
    clearTimeout(moveTimer);
    setDoors(false);
    setFloorBusy(false);
    renderFloors();
    var item=DATA[floorIndex]||DATA[0];
    applyRoomContent(item);
    updateElevatorCar(floorIndex,item);
    syncFloorReveal();
    setDoors(true);
  };

  room.addEventListener('mouseleave',function(e){
    if(floatTip&&floatTip.contains(e.relatedTarget)) return;
    hideTip();
  });
  if(floatTip){
    floatTip.addEventListener('mouseleave',function(e){
      if(e.relatedTarget&&room.contains(e.relatedTarget)) return;
      hideTip();
    });
  }
  if(tipLink){
    tipLink.addEventListener('click',function(e){e.stopPropagation();});
  }

  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(function(){
      var item=DATA.find(function(x){return x.id===currentId;});
      if(item){
        scene.innerHTML=roomSvg(item.id);
        requestAnimationFrame(function(){syncHotspots(item.hotspots);});
      }
    },80);
  });

  if(room&&typeof ResizeObserver!=='undefined'){
    new ResizeObserver(function(){
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(function(){
        var item=DATA.find(function(x){return x.id===currentId;});
        if(item){
          scene.innerHTML=roomSvg(item.id);
          requestAnimationFrame(function(){syncHotspots(item.hotspots);});
        }
      },40);
    }).observe(room);
  }

  renderFloors();
  applyRoomContent(DATA[0]);
  updateElevatorCar(0,DATA[0]);
  syncFloorReveal();
  setTimeout(function(){travelToFloor(DATA[0].id,0);},600);
})();
