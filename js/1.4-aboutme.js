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
  var VISIT_L={transit:{cn:'途经',en:'Transit'},travel:{cn:'旅行',en:'Travel'},short:{cn:'短居',en:'Stay'},long:{cn:'长住',en:'Live'}};
  var COUNTRY_MAP={'西安':'中国','上海':'中国','汉中':'中国','衢州':'中国','三亚':'中国','北京':'中国','武汉':'中国','西宁':'中国','南京':'中国','苏州':'中国','青岛':'中国','烟台':'中国','济南':'中国','天津':'中国','郑州':'中国','昆明':'中国','大理':'中国','丽江':'中国','广州':'中国','深圳':'中国','宁波':'中国','台州':'中国','金华':'中国','丽水':'中国','黄山':'中国','日照':'中国','大连':'中国','重庆':'中国','成都':'中国','奥斯陆':'挪威','维也纳':'奥地利','慕尼黑':'德国','柏林':'德国','萨尔茨堡':'奥地利','布拉格':'捷克','布达佩斯':'匈牙利','巴黎':'法国','哥本哈根':'丹麦','斯德哥尔摩':'瑞典','塔林':'爱沙尼亚','卑尔根':'挪威','赫尔辛基':'芬兰','里加':'拉脱维亚','日内瓦':'瑞士','洛桑':'瑞士','苏黎世':'瑞士','格林德瓦':'瑞士','里昂':'法国','阿姆斯特丹':'荷兰','法兰克福':'德国','奥斯汀':'美国','圣安东尼奥':'美国','休斯顿':'美国','曼谷':'泰国','芭提雅':'泰国','济州岛':'韩国'};
  var COUNTRY_MAP_EN={'Xi\'an':'China','Shanghai':'China','Hanzhong':'China','Quzhou':'China','Sanya':'China','Beijing':'China','Wuhan':'China','Xining':'China','Nanjing':'China','Suzhou':'China','Qingdao':'China','Yantai':'China','Jinan':'China','Tianjin':'China','Zhengzhou':'China','Kunming':'China','Dali':'China','Lijiang':'China','Guangzhou':'China','Shenzhen':'China','Ningbo':'China','Taizhou':'China','Jinhua':'China','Lishui':'China','Huangshan':'China','Rizhao':'China','Dalian':'China','Chongqing':'China','Chengdu':'China','Oslo':'Norway','Vienna':'Austria','Munich':'Germany','Berlin':'Germany','Salzburg':'Austria','Prague':'Czech','Budapest':'Hungary','Paris':'France','Copenhagen':'Denmark','Stockholm':'Sweden','Tallinn':'Estonia','Bergen':'Norway','Helsinki':'Finland','Riga':'Latvia','Geneva':'Switzerland','Lausanne':'Switzerland','Zurich':'Switzerland','Grindelwald':'Switzerland','Lyon':'France','Amsterdam':'Netherlands','Frankfurt':'Germany','Austin':'USA','San Antonio':'USA','Houston':'USA','Bangkok':'Thailand','Pattaya':'Thailand','Jeju Island':'South Korea'};
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

  // Derive image path from img field: "xian.jpg" -> "img/cities/xian/cover.svg"
  function getCityImgPath(imgField){
    if(!imgField) return '';
    var folder=imgField.replace(/\.[^.]+$/,''); // strip extension
    return 'img/cities/'+folder+'/cover.svg';
  }

  // Visit mode popup: Country · City / Visit type / Image / Description
  function makeVisitPopup(place){
    var en=isEn();
    var city=en?(place.en||place.name):place.name;
    var country=en?(COUNTRY_MAP_EN[place.en||'']||''):(COUNTRY_MAP[place.name]||'');
    var title=country?(country+' · '+city):city;
    var desc=en?(place.descEn||place.desc):place.desc;
    var lbl=en?(VISIT_L[place.visit]?VISIT_L[place.visit].en:''):(VISIT_L[place.visit]?VISIT_L[place.visit].cn:'');
    var imgPath=getCityImgPath(place.img);
    var html='<div style="text-align:center;min-width:180px;max-width:240px;font-family:Inter,Noto Sans SC,sans-serif;padding:6px 2px">';
    html+='<div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:8px">'+title+'</div>';
    if(lbl) html+='<div style="font-size:11.5px;color:#6366f1;font-weight:600;margin-bottom:10px;letter-spacing:.3px">'+lbl+'</div>';
    if(imgPath) html+='<img src="'+imgPath+'" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px" onerror="this.style.display=\'none\'" />';
    html+='<div style="font-size:12px;color:#64748b;line-height:1.65">'+desc+'</div>';
    html+='</div>';
    return html;
  }

  // Lang mode popup: Country · Language / Proficiency / Learning method
  function makeLangPopup(place){
    var en=isEn();
    var name=en?(place.langLabelEn||place.en||place.name):(place.langLabel||place.name);
    var desc=en?(place.langDescEn||place.descEn||place.desc):(place.langDesc||place.desc);
    var lbl=en?(LANG_L[place.lang]?LANG_L[place.lang].en:''):(LANG_L[place.lang]?LANG_L[place.lang].cn:'');
    var html='<div style="text-align:center;min-width:160px;max-width:220px;font-family:Inter,Noto Sans SC,sans-serif;padding:6px 2px">';
    html+='<div style="font-weight:700;font-size:14px;color:#1e293b;margin-bottom:8px">'+name+'</div>';
    if(lbl) html+='<div style="font-size:11.5px;color:#7c3aed;font-weight:600;margin-bottom:10px;letter-spacing:.3px">'+lbl+'</div>';
    html+='<div style="font-size:12px;color:#64748b;line-height:1.65">'+desc+'</div>';
    html+='</div>';
    return html;
  }

  // Keep refs to all markers so we can update open popups in-place
  var visitMarkers=[];
  var langMarkers=[];

  function buildVisitMarkers(){
    visitGroup.clearLayers();
    visitMarkers=[];
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
        var city=en?(p.en||p.name):p.name;
        var country=en?(COUNTRY_MAP_EN[p.en||'']||''):(COUNTRY_MAP[p.name]||'');
        return country?(country+' · '+city):city;
      },{sticky:true});
      marker.bindPopup(function(){return makeVisitPopup(p);},{maxWidth:260,closeButton:false,autoPan:true,autoPanPaddingTopLeft:[10,50],autoPanPaddingBottomRight:[10,10],autoPanSpeed:8});
      marker._placeData=p;
      visitGroup.addLayer(marker);
      visitMarkers.push(marker);
    });
  }

  function buildLangMarkers(){
    langGroup.clearLayers();
    langMarkers=[];
    var allLang=[];
    DATA.forEach(function(p){if(p.lang) allLang.push(p);});
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
        var n2=en?(p.langLabelEn||p.en||p.name):(p.langLabel||p.name);
        var lbl=en?(LANG_L[p.lang]?LANG_L[p.lang].en:''):(LANG_L[p.lang]?LANG_L[p.lang].cn:'');
        return n2+' · '+lbl;
      },{sticky:true});
      marker.bindPopup(function(){return makeLangPopup(p);},{maxWidth:240,closeButton:false,autoPan:true,autoPanPaddingTopLeft:[10,50],autoPanPaddingBottomRight:[10,10],autoPanSpeed:8});
      marker._placeData=p;
      langGroup.addLayer(marker);
      langMarkers.push(marker);
    });
  }

  // Update content of any currently-open popup without closing it
  function refreshOpenPopups(){
    var markers=currentMode==='visit'?visitMarkers:langMarkers;
    var makeFn=currentMode==='visit'?makeVisitPopup:makeLangPopup;
    markers.forEach(function(m){
      if(m.isPopupOpen()){
        m.getPopup().setContent(makeFn(m._placeData));
      }
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
      if(m.attributeName==='lang'){
        // Update any open popup content in-place, then rebuild for future clicks
        refreshOpenPopups();
      }
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','lang']});

  // After a popup opens, ensure it's fully visible (re-pan after images load)
  function ensurePopupVisible(popup){
    if(!popup||!popup._container) return;
    var container=map.getContainer();
    var popupEl=popup._container;
    var mapRect=container.getBoundingClientRect();
    var popRect=popupEl.getBoundingClientRect();
    var dx=0,dy=0;
    var pad=12;
    // Check if popup extends beyond map container edges
    if(popRect.top<mapRect.top+pad) dy=popRect.top-mapRect.top-pad;
    if(popRect.bottom>mapRect.bottom-pad) dy=popRect.bottom-mapRect.bottom+pad;
    if(popRect.left<mapRect.left+pad) dx=popRect.left-mapRect.left-pad;
    if(popRect.right>mapRect.right-pad) dx=popRect.right-mapRect.right+pad;
    if(dx!==0||dy!==0) map.panBy([dx,dy],{animate:true,duration:.3});
  }

  map.on('popupopen',function(e){
    var popup=e.popup;
    // First pan attempt (for text-only content)
    setTimeout(function(){ensurePopupVisible(popup);},80);
    // Second pan attempt after images load
    var imgs=popup._container?popup._container.querySelectorAll('img'):[];
    if(imgs.length){
      var loaded=0;
      imgs.forEach(function(img){
        if(img.complete){loaded++;return;}
        img.addEventListener('load',function(){
          loaded++;
          if(loaded>=imgs.length){
            popup.update();
            setTimeout(function(){ensurePopupVisible(popup);},50);
          }
        });
        img.addEventListener('error',function(){
          loaded++;
          if(loaded>=imgs.length){
            popup.update();
            setTimeout(function(){ensurePopupVisible(popup);},50);
          }
        });
      });
      // If all already loaded
      if(loaded>=imgs.length){
        popup.update();
        setTimeout(function(){ensurePopupVisible(popup);},100);
      }
    }
  });

  showMode('visit');

  document.querySelectorAll('.map-legend-btn').forEach(function(el){
    el.addEventListener('click',function(){
      document.querySelectorAll('.map-legend-btn').forEach(function(e){e.classList.remove('active');});
      el.classList.add('active');
      showMode(el.dataset.mode);
    });
  });
})();
