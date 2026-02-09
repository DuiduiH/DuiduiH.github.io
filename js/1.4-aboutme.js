// ===== 1.4 World Map — Separate visit/lang modes with distinct popups =====
(function(){
  if(typeof L==='undefined') return;
  var mapEl=document.getElementById('leafletMap');
  if(!mapEl) return;

  var isEn=function(){return document.documentElement.lang==='en';};
  var isDark=function(){return document.documentElement.getAttribute('data-theme')!=='light';};

  var map=L.map('leafletMap',{scrollWheelZoom:true,zoomSnap:.5,zoomDelta:.5}).setView([30,20],2.5);

  var darkUrl='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  var lightUrl='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  var tileOpts={attribution:'&copy; OSM &copy; CARTO',maxZoom:18,subdomains:'abcd'};
  var currentTile=L.tileLayer(isDark()?darkUrl:lightUrl,tileOpts).addTo(map);

  var DATA=(window.MODULE_DATA&&window.MODULE_DATA.mapPlaces)||[];
  var LANG_ONLY=(window.MODULE_DATA&&window.MODULE_DATA.langOnlyPlaces)||[];

  var VISIT_COLORS={transit:'#bfdbfe',travel:'#93c5fd',short:'#3b82f6',long:'#1d4ed8'};
  var LANG_COLORS={beginner:'#d8b4fe',proficient:'#a78bfa',fluent:'#7c3aed',native:'#4c1d95'};
  var VISIT_L={transit:{cn:'途经',en:'Transit'},travel:{cn:'旅行',en:'Travel'},short:{cn:'短居',en:'Short Stay'},long:{cn:'长住',en:'Long Stay'}};
  var LANG_L={beginner:{cn:'入门',en:'Beginner'},proficient:{cn:'熟练',en:'Proficient'},fluent:{cn:'精通',en:'Fluent'},native:{cn:'母语',en:'Native'}};

  var visitGroup=L.layerGroup();
  var langGroup=L.layerGroup();
  var currentMode='visit';

  function getRadius(type){
    if(type==='long'||type==='native') return 7;
    if(type==='short'||type==='fluent') return 6;
    if(type==='transit') return 4;
    return 5;
  }

  // Visit mode popup: travel experience
  function makeVisitPopup(place){
    var en=isEn();
    var name=en?(place.en||place.name):place.name;
    var desc=en?(place.descEn||place.desc):place.desc;
    var lbl=en?(VISIT_L[place.visit]?VISIT_L[place.visit].en:''):(VISIT_L[place.visit]?VISIT_L[place.visit].cn:'');
    var imgPath=place.img?'images/map-places/'+place.img:'';
    var html='<div style="text-align:center;min-width:160px;max-width:220px;font-family:Inter,Noto Sans SC,sans-serif">';
    html+='<div style="font-weight:700;font-size:14px;margin-bottom:2px;color:#1e293b">'+name+'</div>';
    if(lbl) html+='<div style="font-size:11px;color:#6366f1;margin-bottom:4px">'+lbl+'</div>';
    if(imgPath) html+='<img src="'+imgPath+'" alt="'+name+'" style="width:100%;max-height:120px;object-fit:cover;border-radius:8px;margin:6px 0" onerror="this.style.display=\'none\'">';
    html+='<div style="font-size:12px;color:#64748b;line-height:1.6">'+desc+'</div>';
    html+='</div>';
    return html;
  }

  // Lang mode popup: language info
  function makeLangPopup(place){
    var en=isEn();
    var name=en?(place.en||place.name):place.name;
    var desc=en?(place.descEn||place.desc):place.desc;
    var lbl=en?(LANG_L[place.lang]?LANG_L[place.lang].en:''):(LANG_L[place.lang]?LANG_L[place.lang].cn:'');
    var html='<div style="text-align:center;min-width:160px;max-width:220px;font-family:Inter,Noto Sans SC,sans-serif">';
    html+='<div style="font-weight:700;font-size:14px;margin-bottom:2px;color:#1e293b">'+name+'</div>';
    if(lbl) html+='<div style="font-size:11px;color:#7c3aed;margin-bottom:4px">'+lbl+'</div>';
    html+='<div style="font-size:12px;color:#64748b;line-height:1.6">'+desc+'</div>';
    html+='</div>';
    return html;
  }

  function buildVisitMarkers(){
    visitGroup.clearLayers();
    DATA.forEach(function(p){
      if(!p.visit) return;
      var color=VISIT_COLORS[p.visit]||'#93c5fd';
      var r=getRadius(p.visit);
      var marker=L.circleMarker([p.lat,p.lng],{
        radius:r,fillColor:color,fillOpacity:.8,
        color:isDark()?'rgba(255,255,255,.4)':'rgba(0,0,0,.15)',weight:1.5
      });
      marker.bindTooltip(function(){
        var en=isEn();
        var n2=en?(p.en||p.name):p.name;
        var lbl=en?(VISIT_L[p.visit]?VISIT_L[p.visit].en:''):(VISIT_L[p.visit]?VISIT_L[p.visit].cn:'');
        return n2+' · '+lbl;
      },{sticky:true});
      marker.bindPopup(function(){return makeVisitPopup(p);},{maxWidth:240});
      visitGroup.addLayer(marker);
    });
  }

  function buildLangMarkers(){
    langGroup.clearLayers();
    var allLang=[];
    // Places from DATA that have lang property (e.g. Oslo, Berlin, Paris)
    DATA.forEach(function(p){if(p.lang) allLang.push(p);});
    // Language-only places (capitals etc.)
    LANG_ONLY.forEach(function(p){allLang.push(p);});

    allLang.forEach(function(p){
      var color=LANG_COLORS[p.lang]||'#d8b4fe';
      var r=getRadius(p.lang);
      var marker=L.circleMarker([p.lat,p.lng],{
        radius:r,fillColor:color,fillOpacity:.8,
        color:isDark()?'rgba(255,255,255,.4)':'rgba(0,0,0,.15)',weight:1.5
      });
      marker.bindTooltip(function(){
        var en=isEn();
        var n2=en?(p.en||p.name):p.name;
        var lbl=en?(LANG_L[p.lang]?LANG_L[p.lang].en:''):(LANG_L[p.lang]?LANG_L[p.lang].cn:'');
        return n2+' · '+lbl;
      },{sticky:true});
      marker.bindPopup(function(){return makeLangPopup(p);},{maxWidth:240});
      langGroup.addLayer(marker);
    });
  }

  function showMode(mode){
    currentMode=mode;
    map.removeLayer(visitGroup);
    map.removeLayer(langGroup);
    if(mode==='visit'){
      buildVisitMarkers();
      visitGroup.addTo(map);
    } else {
      buildLangMarkers();
      langGroup.addTo(map);
    }
  }

  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.attributeName==='data-theme'){
        map.removeLayer(currentTile);
        currentTile=L.tileLayer(isDark()?darkUrl:lightUrl,tileOpts).addTo(map);
        showMode(currentMode);
      }
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  showMode('visit');

  document.querySelectorAll('.map-legend-btn').forEach(function(el){
    el.addEventListener('click',function(){
      document.querySelectorAll('.map-legend-btn').forEach(function(e){e.classList.remove('active');});
      el.classList.add('active');
      showMode(el.dataset.mode);
    });
  });
})();
