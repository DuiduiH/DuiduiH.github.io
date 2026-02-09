// ===== 1.4 关于我 — World Map with Region Highlighting =====
(function(){
  if(typeof L==='undefined') return;
  const mapEl = document.getElementById('leafletMap');
  if(!mapEl) return;

  const map = L.map('leafletMap',{scrollWheelZoom:true,zoomSnap:.5,zoomDelta:.5}).setView([25,105],2.5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; OSM &copy; CARTO',maxZoom:18,subdomains:'abcd'
  }).addTo(map);

  // Color scales
  const VISIT_COLORS = {travel:'#93c5fd',short:'#3b82f6',long:'#1d4ed8'};
  const VISIT_LABELS = {travel:'旅行',short:'短居',long:'长住'};
  const LANG_COLORS  = {beginner:'#d8b4fe',proficient:'#a78bfa',fluent:'#7c3aed',native:'#4c1d95'};
  const LANG_LABELS  = {beginner:'入门',proficient:'熟练',fluent:'精通',native:'母语'};

  // Data keyed by country name (Natural Earth naming) or Chinese province name (DataV naming)
  const VISIT_DATA = {
    '北京市':'long','上海市':'short','广东省':'travel','四川省':'travel',
    '香港特别行政区':'travel','Japan':'travel','South Korea':'travel',
    'Singapore':'travel','Thailand':'travel','United Kingdom':'travel',
    'France':'travel','Australia':'travel'
  };
  const LANG_DATA = {
    '北京市':'native','上海市':'native','广东省':'native','四川省':'native',
    '香港特别行政区':'native','Japan':'beginner','South Korea':'beginner',
    'France':'beginner','United Kingdom':'proficient','United States':'proficient',
    'Australia':'proficient'
  };

  let visitWorldLayer=null, visitChinaLayer=null;
  let langWorldLayer=null, langChinaLayer=null;
  let currentMode='visit';

  const DEFAULT_STYLE = {fillColor:'transparent',fillOpacity:0,color:'rgba(255,255,255,.08)',weight:.5};

  function visitStyle(name){
    const lv=VISIT_DATA[name];
    if(!lv)return DEFAULT_STYLE;
    return {fillColor:VISIT_COLORS[lv],fillOpacity:.45,color:'rgba(255,255,255,.2)',weight:1};
  }
  function langStyle(name){
    const lv=LANG_DATA[name];
    if(!lv)return DEFAULT_STYLE;
    return {fillColor:LANG_COLORS[lv],fillOpacity:.45,color:'rgba(255,255,255,.2)',weight:1};
  }
  function makeTooltip(name, data, labels){
    const lv=data[name];
    if(!lv)return null;
    return name+' · '+labels[lv];
  }

  // ——— Load GeoJSON ———
  const WORLD_URL='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  const CHINA_URL='https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';

  function getName(f){
    const p=f.properties;
    return p.name||p.NAME||p.ADMIN||p.NAME_EN||'';
  }

  Promise.all([
    fetch(WORLD_URL).then(r=>r.ok?r.json():null).catch(()=>null),
    fetch(CHINA_URL).then(r=>r.ok?r.json():null).catch(()=>null)
  ]).then(([worldGeo, chinaGeo])=>{

    if(worldGeo){
      // Filter out China (we use province-level)
      const features = worldGeo.features.filter(f=>{
        const n=getName(f);
        return n!=='China' && n!=='People\'s Republic of China';
      });

      visitWorldLayer = L.geoJSON({type:'FeatureCollection',features},{
        style: f=>visitStyle(getName(f)),
        onEachFeature:(f,layer)=>{
          const tip=makeTooltip(getName(f),VISIT_DATA,VISIT_LABELS);
          if(tip) layer.bindTooltip(tip,{sticky:true});
        }
      });

      langWorldLayer = L.geoJSON({type:'FeatureCollection',features},{
        style: f=>langStyle(getName(f)),
        onEachFeature:(f,layer)=>{
          const tip=makeTooltip(getName(f),LANG_DATA,LANG_LABELS);
          if(tip) layer.bindTooltip(tip,{sticky:true});
        }
      });
    }

    if(chinaGeo){
      const chinaFeatures = chinaGeo.features || (chinaGeo.type==='FeatureCollection'?chinaGeo.features:[]);

      visitChinaLayer = L.geoJSON({type:'FeatureCollection',features:chinaFeatures},{
        style: f=>visitStyle(f.properties.name),
        onEachFeature:(f,layer)=>{
          const tip=makeTooltip(f.properties.name,VISIT_DATA,VISIT_LABELS);
          if(tip) layer.bindTooltip(tip,{sticky:true});
        }
      });

      langChinaLayer = L.geoJSON({type:'FeatureCollection',features:chinaFeatures},{
        style: f=>langStyle(f.properties.name),
        onEachFeature:(f,layer)=>{
          const tip=makeTooltip(f.properties.name,LANG_DATA,LANG_LABELS);
          if(tip) layer.bindTooltip(tip,{sticky:true});
        }
      });
    }

    showMode('visit');
  });

  function showMode(mode){
    currentMode=mode;
    // Remove all layers
    [visitWorldLayer,visitChinaLayer,langWorldLayer,langChinaLayer].forEach(l=>{
      if(l) map.removeLayer(l);
    });
    // Add active layers
    if(mode==='visit'){
      if(visitWorldLayer) visitWorldLayer.addTo(map);
      if(visitChinaLayer) visitChinaLayer.addTo(map);
    } else {
      if(langWorldLayer) langWorldLayer.addTo(map);
      if(langChinaLayer) langChinaLayer.addTo(map);
    }
  }

  // Legend interaction
  document.querySelectorAll('.map-legend-btn').forEach(el=>{
    el.addEventListener('click',()=>{
      document.querySelectorAll('.map-legend-btn').forEach(e=>e.classList.remove('active'));
      el.classList.add('active');
      showMode(el.dataset.mode);
    });
  });
})();
