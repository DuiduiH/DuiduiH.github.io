// ===== 1.4 World Map — Real data, theme-aware tiles, bilingual =====
(function(){
  if(typeof L==='undefined') return;
  var mapEl=document.getElementById('leafletMap');
  if(!mapEl) return;

  var isEn=function(){return document.documentElement.lang==='en';};

  var map=L.map('leafletMap',{scrollWheelZoom:true,zoomSnap:.5,zoomDelta:.5}).setView([30,80],2.5);

  // Theme-aware tiles
  var isDark=function(){return document.documentElement.getAttribute('data-theme')!=='light';};
  var darkUrl='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  var lightUrl='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  var tileOpts={attribution:'&copy; OSM &copy; CARTO',maxZoom:18,subdomains:'abcd'};
  var currentTile=L.tileLayer(isDark()?darkUrl:lightUrl,tileOpts).addTo(map);

  // Swap tiles on theme change
  var obs=new MutationObserver(function(muts){
    muts.forEach(function(m){
      if(m.attributeName==='data-theme'){
        map.removeLayer(currentTile);
        currentTile=L.tileLayer(isDark()?darkUrl:lightUrl,tileOpts).addTo(map);
        updateDefaultStyles();
      }
    });
  });
  obs.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  // Color scales
  var VISIT_COLORS={travel:'#93c5fd',short:'#3b82f6',long:'#1d4ed8'};
  var LANG_COLORS={beginner:'#d8b4fe',proficient:'#a78bfa',fluent:'#7c3aed',native:'#4c1d95'};

  // Bilingual labels
  var VISIT_L={travel:{cn:'旅行',en:'Travel'},short:{cn:'短居',en:'Short Stay'},long:{cn:'长住',en:'Long Stay'}};
  var LANG_L={beginner:{cn:'入门',en:'Beginner'},proficient:{cn:'熟练',en:'Proficient'},fluent:{cn:'精通',en:'Fluent'},native:{cn:'母语',en:'Native'}};

  // Province name translations
  var PROV_EN={
    '陕西省':'Shaanxi','上海市':'Shanghai','北京市':'Beijing','浙江省':'Zhejiang',
    '江苏省':'Jiangsu','广东省':'Guangdong','四川省':'Sichuan','湖北省':'Hubei',
    '香港特别行政区':'Hong Kong'
  };

  // ===== REAL DATA =====
  var VISIT_DATA={
    '陕西省':'long','上海市':'long',
    '北京市':'travel','浙江省':'travel','江苏省':'travel','广东省':'travel','四川省':'travel','湖北省':'travel',
    '香港特别行政区':'travel',
    'United States of America':'short',
    'Norway':'short',
    'Germany':'travel','Austria':'travel','Switzerland':'travel',
    'France':'travel','Italy':'travel','Spain':'travel',
    'United Kingdom':'travel','Denmark':'travel','Sweden':'travel',
    'Netherlands':'travel','Belgium':'travel','Japan':'travel',
    'Thailand':'travel'
  };
  var LANG_DATA={
    '陕西省':'native','上海市':'native','北京市':'native','广东省':'native',
    '四川省':'native','浙江省':'native','江苏省':'native','湖北省':'native',
    '香港特别行政区':'native',
    'United States of America':'fluent','United Kingdom':'fluent','Australia':'fluent',
    'Germany':'proficient','Austria':'proficient','Switzerland':'proficient','Norway':'proficient',
    'France':'beginner','Italy':'beginner','Spain':'beginner',
    'Japan':'beginner','Russia':'beginner'
  };

  var visitWorldLayer=null,visitChinaLayer=null;
  var langWorldLayer=null,langChinaLayer=null;
  var currentMode='visit';

  function getDefaultStyle(){
    var dark=isDark();
    return {fillColor:'transparent',fillOpacity:0,color:dark?'rgba(255,255,255,.08)':'rgba(0,0,0,.06)',weight:.5};
  }

  function visitStyle(name){
    var lv=VISIT_DATA[name];
    if(!lv) return getDefaultStyle();
    return {fillColor:VISIT_COLORS[lv],fillOpacity:.45,color:isDark()?'rgba(255,255,255,.2)':'rgba(0,0,0,.12)',weight:1};
  }
  function langStyle(name){
    var lv=LANG_DATA[name];
    if(!lv) return getDefaultStyle();
    return {fillColor:LANG_COLORS[lv],fillOpacity:.45,color:isDark()?'rgba(255,255,255,.2)':'rgba(0,0,0,.12)',weight:1};
  }

  function dispName(name){
    var en=isEn();
    return en?(PROV_EN[name]||name):name;
  }

  function makeVisitTooltip(name){
    return function(){
      var lv=VISIT_DATA[name];if(!lv)return '';
      var en=isEn();
      return dispName(name)+' · '+(en?VISIT_L[lv].en:VISIT_L[lv].cn);
    };
  }
  function makeLangTooltip(name){
    return function(){
      var lv=LANG_DATA[name];if(!lv)return '';
      var en=isEn();
      return dispName(name)+' · '+(en?LANG_L[lv].en:LANG_L[lv].cn);
    };
  }

  var WORLD_URL='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  var CHINA_URL='https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

  function getName(f){var p=f.properties;return p.name||p.NAME||p.ADMIN||p.NAME_EN||'';}

  function updateDefaultStyles(){
    [visitWorldLayer,visitChinaLayer,langWorldLayer,langChinaLayer].forEach(function(layer){
      if(layer){
        layer.eachLayer(function(l){
          var name=getName(l.feature);
          if(currentMode==='visit') l.setStyle(visitStyle(name));
          else l.setStyle(langStyle(name));
        });
      }
    });
  }

  Promise.all([
    fetch(WORLD_URL).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
    fetch(CHINA_URL).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;})
  ]).then(function(results){
    var worldGeo=results[0],chinaGeo=results[1];

    if(worldGeo){
      var features=worldGeo.features.filter(function(f){
        var n=getName(f);return n!=='China'&&n!=="People's Republic of China";
      });

      visitWorldLayer=L.geoJSON({type:'FeatureCollection',features:features},{
        style:function(f){return visitStyle(getName(f));},
        onEachFeature:function(f,layer){
          var n=getName(f);
          if(VISIT_DATA[n]) layer.bindTooltip(makeVisitTooltip(n),{sticky:true});
        }
      });
      langWorldLayer=L.geoJSON({type:'FeatureCollection',features:features},{
        style:function(f){return langStyle(getName(f));},
        onEachFeature:function(f,layer){
          var n=getName(f);
          if(LANG_DATA[n]) layer.bindTooltip(makeLangTooltip(n),{sticky:true});
        }
      });
    }

    if(chinaGeo){
      var chinaFeatures=chinaGeo.features||(chinaGeo.type==='FeatureCollection'?chinaGeo.features:[]);

      visitChinaLayer=L.geoJSON({type:'FeatureCollection',features:chinaFeatures},{
        style:function(f){return visitStyle(f.properties.name);},
        onEachFeature:function(f,layer){
          var n=f.properties.name;
          if(VISIT_DATA[n]) layer.bindTooltip(makeVisitTooltip(n),{sticky:true});
        }
      });
      langChinaLayer=L.geoJSON({type:'FeatureCollection',features:chinaFeatures},{
        style:function(f){return langStyle(f.properties.name);},
        onEachFeature:function(f,layer){
          var n=f.properties.name;
          if(LANG_DATA[n]) layer.bindTooltip(makeLangTooltip(n),{sticky:true});
        }
      });
    }
    showMode('visit');
  });

  function showMode(mode){
    currentMode=mode;
    [visitWorldLayer,visitChinaLayer,langWorldLayer,langChinaLayer].forEach(function(l){if(l)map.removeLayer(l);});
    if(mode==='visit'){
      if(visitWorldLayer) visitWorldLayer.addTo(map);
      if(visitChinaLayer) visitChinaLayer.addTo(map);
    } else {
      if(langWorldLayer) langWorldLayer.addTo(map);
      if(langChinaLayer) langChinaLayer.addTo(map);
    }
  }

  document.querySelectorAll('.map-legend-btn').forEach(function(el){
    el.addEventListener('click',function(){
      document.querySelectorAll('.map-legend-btn').forEach(function(e){e.classList.remove('active');});
      el.classList.add('active');
      showMode(el.dataset.mode);
    });
  });
})();
