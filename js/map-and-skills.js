// ========== 1.4 World Map ==========
function initWorldMap() {
  const toggleVisited = document.getElementById('toggleVisited');
  const toggleSpeak = document.getElementById('toggleSpeak');
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');

  const PLACES = [
    { id: 'beijing', name: '北京', lat: 39.9042, lon: 116.4074, visited: true, langs: ['中文'] },
    { id: 'london', name: '伦敦', lat: 51.5074, lon: -0.1276, visited: true, langs: ['English'] },
    { id: 'paris', name: '巴黎', lat: 48.8566, lon: 2.3522, visited: false, langs: ['Français'] },
    { id: 'ny', name: '纽约', lat: 40.7128, lon: -74.0060, visited: true, langs: ['English'] },
    { id: 'sf', name: '旧金山', lat: 37.7749, lon: -122.4194, visited: false, langs: ['English'] },
    { id: 'tokyo', name: '东京', lat: 35.6895, lon: 139.6917, visited: true, langs: ['日本語'] },
    { id: 'sydney', name: '悉尼', lat: -33.8688, lon: 151.2093, visited: false, langs: ['English'] },
    { id: 'singapore', name: '新加坡', lat: 1.3521, lon: 103.8198, visited: true, langs: ['English', '中文'] }
  ];

  // Try to use Leaflet if loaded
  if (window.L) {
    const map = L.map('leafletMap', { worldCopyJump: true, zoomControl: false }).setView([20, 10], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const allMarkers = [];
    PLACES.forEach(p => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: p.visited ? 8 : 6,
        color: p.visited ? getComputedStyle(document.documentElement).getPropertyValue('--tencent-blue').trim() : '#888',
        fillColor: p.visited ? getComputedStyle(document.documentElement).getPropertyValue('--tencent-blue').trim() : '#fff',
        fillOpacity: 0.95,
        weight: 2
      }).addTo(map);

      marker.bindPopup(`<strong>${p.name}</strong><br>语言：${p.langs.join('、')}<br>${p.visited ? '<em>已到访</em>' : ''}`);
      marker.options.meta = p;
      allMarkers.push(marker);
    });

    function updateLegend() {
      const showVisited = toggleVisited.checked;
      const showSpeak = toggleSpeak.checked;
      allMarkers.forEach(m => {
        const p = m.options.meta;
        const should = (p.visited && showVisited) || (p.langs && p.langs.length && showSpeak);
        if (should) map.addLayer(m);
        else map.removeLayer(m);
      });
    }

    if (toggleVisited) toggleVisited.addEventListener('change', updateLegend);
    if (toggleSpeak) toggleSpeak.addEventListener('change', updateLegend);
    document.getElementById('mapResetView').addEventListener('click', () => map.setView([20, 10], 2));
    if (zoomIn) zoomIn.addEventListener('click', () => map.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => map.zoomOut());

    updateLegend();
  } else {
    // Fallback: simple marker system
    const mapInner = document.getElementById('mapInner');
    const mapBase = document.getElementById('mapBase');

    if (!mapInner || !mapBase) return;

    const MAP_W = 1600;
    const MAP_H = 900;

    function latLonToXY(lon, lat) {
      const x = (lon + 180) / 360 * MAP_W;
      const y = (90 - lat) / 180 * MAP_H;
      return { x: Math.round(x), y: Math.round(y) };
    }

    PLACES.forEach(p => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.dataset.id = p.id;
      el.dataset.name = p.name;
      el.dataset.langs = p.langs.join(',');

      if (p.visited) el.classList.add('marker-visited');
      if (p.langs && p.langs.length) el.classList.add('marker-speak');

      const pos = latLonToXY(p.lon, p.lat);
      el.style.left = pos.x + 'px';
      el.style.top = pos.y + 'px';
      el.title = p.name;
      el.innerText = p.name.slice(0, 1);

      mapBase.appendChild(el);
    });

    function updateToggles() {
      const showVisited = toggleVisited ? toggleVisited.checked : true;
      const showSpeak = toggleSpeak ? toggleSpeak.checked : true;

      document.querySelectorAll('.map-marker').forEach(m => {
        const isVisited = m.classList.contains('marker-visited');
        const isSpeak = m.classList.contains('marker-speak');
        m.style.display = (isVisited && !showVisited) || (isSpeak && !showSpeak && !isVisited) ? 'none' : 'flex';
      });
    }

    if (toggleVisited) toggleVisited.addEventListener('change', updateToggles);
    if (toggleSpeak) toggleSpeak.addEventListener('change', updateToggles);

    updateToggles();
  }
}

// ========== 2.6 Skill Tree ==========
function initSkillTree() {
  const nodes = document.querySelectorAll('.skill-node');
  if (!nodes || !nodes.length) return;

  const STORAGE_KEY = 'cvgame_skill_lit';
  let litSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(litSet)));
  }

  nodes.forEach(n => {
    const id = n.dataset.id;
    if (litSet.has(id)) n.classList.add('lit');

    n.addEventListener('click', (e) => {
      e.stopPropagation();

      // Simple parent rule: left*/right* require root to be lit
      if (id !== 'root') {
        if (!litSet.has('root')) return;
      }

      const willBe = !n.classList.contains('lit');

      if (willBe) {
        n.classList.add('lit');
        litSet.add(id);
      } else {
        n.classList.remove('lit');
        litSet.delete(id);
      }

      // Auto-light children when root is toggled
      if (id === 'root' && willBe) {
        document.querySelectorAll('[data-id^="left"]').forEach(x => {
          x.classList.add('lit');
          litSet.add(x.dataset.id);
        });
        document.querySelectorAll('[data-id^="right"]').forEach(x => {
          x.classList.add('lit');
          litSet.add(x.dataset.id);
        });
      }

      if (id === 'root' && !willBe) {
        document.querySelectorAll('[data-id^="left"]').forEach(x => {
          x.classList.remove('lit');
          litSet.delete(x.dataset.id);
        });
        document.querySelectorAll('[data-id^="right"]').forEach(x => {
          x.classList.remove('lit');
          litSet.delete(x.dataset.id);
        });
      }

      persist();
    });
  });

  // Add reset button
  const resetBtn = document.createElement('button');
  resetBtn.textContent = '重置技能树';
  resetBtn.className = 'map-zoom-btn';
  resetBtn.style.marginLeft = '12px';

  const skillsHeader = document.querySelector('#skills h3');
  if (skillsHeader) skillsHeader.appendChild(resetBtn);

  resetBtn.addEventListener('click', () => {
    litSet.clear();
    persist();
    nodes.forEach(n => n.classList.remove('lit'));
  });
}

// ========== Map Navigation (Bottom-Right) ==========
function initMapNavigation() {
  const mapToggle = document.getElementById('mapToggle');
  const mapPanel = document.getElementById('mapPanel');

  if (!mapToggle || !mapPanel) return;

  mapToggle.addEventListener('click', () => {
    mapPanel.classList.toggle('active');
  });

  const mapItems = mapPanel.querySelectorAll('.map-item');
  mapItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const target = e.target.getAttribute('data-target');
      if (target) {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          mapPanel.classList.remove('active');
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!mapToggle.contains(e.target) && !mapPanel.contains(e.target)) {
      mapPanel.classList.remove('active');
    }
  });
}
