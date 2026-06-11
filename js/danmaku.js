// Ending danmaku: cloud-backed when /api/danmaku is available; user text is always rendered with textContent.
(function(){
  var STORAGE_KEY = 'duidui-danmaku-local-v2';
  var API_ENDPOINT = '/api/danmaku';
  var MESSAGE_MAX = 80;
  var NAME_MAX = 10;
  var SPEEDS = {slow: 15000, normal: 11000, fast: 7600};
  var layer, panel, settings, settingsBtn, settingsPop, form, nameInput, messageInput, sendBtn, nameCount, messageCount, errorEl;
  var rangeInput, speedInput, opacityInput, opacityVal;
  var placeholderMq = null;
  var hasOpenedEndingQuote = false;
  var revealed = false;
  var laneCursor = 0;
  var loopCursor = 0;
  var loopTimer = null;
  var loadingRemote = false;
  var items = [];
  var BAD_WORDS = [
    '傻逼','傻b','煞笔','sb','cnm','nmsl','草你','操你','艹你','妈的','你妈','他妈','去死','死全家',
    'fuck','shit','bitch','asshole','dick','cunt','fucker','motherfucker','idiot'
  ];

  function $(id){return document.getElementById(id);}

  function isEn(){return document.documentElement.lang === 'en';}

  function text(key){
    var pack = window.SITE_TEXT && window.SITE_TEXT.translations && window.SITE_TEXT.translations[key];
    if(!pack) return '';
    return (isEn() ? pack.en : pack.cn) || pack.cn || pack.en || '';
  }

  function save(){
    try{localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-120)));}catch(e){}
  }

  function load(){
    try{
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if(Array.isArray(parsed)) items = mergeItems(items, parsed.filter(function(item){return item && item.message;})).slice(-120);
    }catch(e){items = [];}
  }

  function normalizedForFilter(value){
    return String(value || '').toLowerCase().replace(/[\s._\-*~!！?？。,.，、]/g, '');
  }

  function hasBadWords(){
    var merged = normalizedForFilter(Array.prototype.join.call(arguments, ' '));
    return BAD_WORDS.some(function(word){return merged.indexOf(normalizedForFilter(word)) !== -1;});
  }

  function itemKey(item){
    return item && (item.id || ((item.name || '') + '|' + (item.message || '') + '|' + (item.ts || '')));
  }

  function mergeItems(base, incoming){
    var seen = {};
    var merged = [];
    base.concat(incoming || []).forEach(function(item){
      if(!item || !item.message) return;
      var key = itemKey(item);
      if(seen[key]) return;
      seen[key] = true;
      merged.push({
        id: item.id || key,
        name: String(item.name || '').slice(0, NAME_MAX),
        message: String(item.message || '').slice(0, MESSAGE_MAX),
        ts: item.ts || Date.now()
      });
    });
    return merged.sort(function(a,b){return (a.ts || 0) - (b.ts || 0);}).slice(-120);
  }

  function settingsValue(){
    return {
      range: Math.max(1, Math.min(4, parseInt(rangeInput && rangeInput.value, 10) || 1)),
      speed: (speedInput && SPEEDS[speedInput.value]) ? speedInput.value : 'normal',
      opacity: Math.max(0, Math.min(100, parseInt(opacityInput && opacityInput.value, 10) || 25)) / 100
    };
  }

  function isPortraitNarrow(){
    return window.matchMedia('(max-width:600px) and (orientation:portrait)').matches;
  }

  function updateOpacityLabel(){
    if(!opacityInput || !opacityVal) return;
    var val = parseInt(opacityInput.value, 10) || 0;
    opacityVal.textContent = val + '%';
    var field = opacityInput.closest('.danmaku-range-field');
    if(field) field.style.setProperty('--range-fill', val + '%');
  }

  function updateMessagePlaceholder(){
    if(!messageInput) return;
    var longText = text('danmaku-message-placeholder') || (isEn() ? 'Want to say hi to XD? Leave your danmaku here.' : '你也想和小对互动吗？请在这里留下你的弹幕吧');
    var shortText = text('danmaku-message-placeholder-short') || (isEn() ? 'Leave a danmaku here' : '在这里留下你的弹幕吧');
    messageInput.placeholder = isPortraitNarrow() ? shortText : longText;
  }

  function closeSettingsPop(){
    if(!settingsPop || !settingsBtn) return;
    settingsPop.classList.remove('is-open');
    settingsBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleSettingsPop(){
    if(!settingsPop || !settingsBtn) return;
    var open = !settingsPop.classList.contains('is-open');
    settingsPop.classList.toggle('is-open', open);
    settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function updateText(){
    if(nameInput) nameInput.placeholder = text('danmaku-name-placeholder') || (isEn() ? 'Name' : '昵称');
    updateMessagePlaceholder();
    if(sendBtn){
      var sendLabel = text('danmaku-send') || (isEn() ? 'Send' : '发送');
      sendBtn.setAttribute('aria-label', sendLabel);
    }
    if(settingsBtn){
      var settingsLabel = text('danmaku-settings') || (isEn() ? 'Danmaku settings' : '弹幕设置');
      settingsBtn.setAttribute('aria-label', settingsLabel);
      if(settingsPop) settingsPop.setAttribute('aria-label', settingsLabel);
    }
  }

  function updateCounts(){
    var n = (nameInput && nameInput.value || '').length;
    var m = (messageInput && messageInput.value || '').length;
    if(nameCount) nameCount.textContent = n + '/' + NAME_MAX;
    if(messageCount) messageCount.textContent = m + '/' + MESSAGE_MAX;
    if(sendBtn) sendBtn.disabled = m < 1 || m > MESSAGE_MAX;
  }

  var CORNER_DOCK_GAP = 14;

  function syncCornerLift(){
    var root = document.documentElement;
    if(!root.classList.contains('danmaku-active') || !panel || !panel.classList.contains('is-visible')){
      root.style.removeProperty('--danmaku-corner-lift');
      return;
    }
    requestAnimationFrame(function(){
      if(!panel || !panel.classList.contains('is-visible')) return;
      var rect = panel.getBoundingClientRect();
      var panelBottom = Math.max(0, window.innerHeight - rect.bottom);
      var lift = Math.ceil(panelBottom + rect.height + CORNER_DOCK_GAP);
      root.style.setProperty('--danmaku-corner-lift', lift + 'px');
    });
  }

  function autoGrow(){
    if(!messageInput) return;
    messageInput.style.height = 'auto';
    var h = Math.min(messageInput.scrollHeight, 112);
    messageInput.style.height = h + 'px';
    messageInput.classList.toggle('is-multiline', h > 36);
    syncCornerLift();
  }

  function clearError(){
    if(errorEl) errorEl.textContent = '';
  }

  function showError(key){
    if(errorEl) errorEl.textContent = text(key) || '';
  }

  function isOnEndingPage(){
    if(window.getCurrentSectionId) return window.getCurrentSectionId() === 'ending';
    var ending = $('ending');
    if(!ending) return false;
    var rect = ending.getBoundingClientRect();
    var center = window.innerHeight * 0.5;
    return Math.abs(rect.top + rect.height * 0.5 - center) < window.innerHeight * 0.38;
  }

  function hideUI(){
    if(panel) panel.classList.remove('is-visible');
    if(settings) settings.classList.remove('is-visible');
    closeSettingsPop();
    document.documentElement.classList.remove('danmaku-active');
    document.documentElement.style.removeProperty('--danmaku-corner-lift');
    stopLoop();
  }

  function showUI(withReplay){
    if(panel) panel.classList.add('is-visible');
    if(settings) settings.classList.add('is-visible');
    document.documentElement.classList.add('danmaku-active');
    syncCornerLift();
    requestAnimationFrame(syncCornerLift);
    startLoop(!!withReplay);
  }

  var syncTimer = null;
  var uiVisible = false;
  function syncVisibility(){
    if(!revealed){
      if(uiVisible) hideUI();
      uiVisible = false;
      return;
    }
    if(isOnEndingPage()){
      if(!uiVisible){
        showUI(true);
        uiVisible = true;
      }
    }else if(uiVisible){
      hideUI();
      uiVisible = false;
      if(layer) layer.innerHTML = '';
    }
  }

  function scheduleSyncVisibility(){
    if(syncTimer) return;
    syncTimer = requestAnimationFrame(function(){
      syncTimer = null;
      syncVisibility();
    });
  }

  function reveal(){
    if(revealed) return;
    revealed = true;
    loadRemote();
    syncVisibility();
  }

  function spawn(item){
    if(!layer || !item || !item.message) return;
    var cfg = settingsValue();
    var el = document.createElement('div');
    var displayName = (item.name || (isEn() ? 'Guest' : '匿名')).slice(0, NAME_MAX);
    el.className = 'danmaku-item';
    el.textContent = displayName + (isEn() ? ': ' : '：') + item.message.slice(0, MESSAGE_MAX);
    el.style.opacity = String(cfg.opacity);
    layer.appendChild(el);

    var rect = layer.getBoundingClientRect();
    var laneHeight = Math.max(30, rect.height / 4);
    var laneCount = cfg.range;
    var lane = laneCursor % laneCount;
    laneCursor += 1;
    var jitter = Math.max(0, laneHeight - 30) * Math.random();
    el.style.top = Math.max(12, lane * laneHeight + jitter) + 'px';

    var duration = SPEEDS[cfg.speed] || SPEEDS.normal;
    var distance = rect.width + el.offsetWidth + 48;
    var start = performance.now();
    function step(now){
      var p = Math.min(1, (now - start) / duration);
      el.style.transform = 'translateX(' + (-distance * p) + 'px)';
      if(p < 1) requestAnimationFrame(step);
      else el.remove();
    }
    requestAnimationFrame(step);
  }

  function replayStored(){
    items.slice(-8).forEach(function(item, index){
      setTimeout(function(){spawn(item);}, index * 520);
    });
  }

  function startLoop(withReplay){
    stopLoop();
    if(withReplay) replayStored();
    loopTimer = setInterval(function(){
      if(!revealed || !items.length) return;
      spawn(items[loopCursor % items.length]);
      loopCursor += 1;
    }, 1650);
  }

  function stopLoop(){
    if(loopTimer) clearInterval(loopTimer);
    loopTimer = null;
  }

  async function loadRemote(){
    if(loadingRemote) return;
    loadingRemote = true;
    try{
      var resp = await fetch(API_ENDPOINT, {method: 'GET', headers: {'Accept': 'application/json'}});
      if(resp.ok){
        var json = await resp.json();
        if(Array.isArray(json.items)){
          items = mergeItems(items, json.items);
          save();
        }
      }
    }catch(e){
      // Static hosting fallback: localStorage keeps this visitor's own danmaku.
    }finally{
      loadingRemote = false;
    }
  }

  async function postRemote(item){
    var resp = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: item.name, message: item.message})
    });
    if(!resp.ok){
      var err = {};
      try{err = await resp.json();}catch(e){}
      var error = new Error(err.error || 'network');
      error.code = err.error;
      throw error;
    }
    return resp.json();
  }

  async function submit(e){
    e.preventDefault();
    clearError();
    var name = (nameInput.value || '').trim().slice(0, NAME_MAX);
    var message = (messageInput.value || '').trim();
    if(!message){showError('danmaku-error-empty');return;}
    if(message.length > MESSAGE_MAX){showError('danmaku-error-long');return;}
    if(hasBadWords(name, message)){showError('danmaku-error-civil');return;}
    var item = {id: 'local-' + Date.now(), name: name, message: message, ts: Date.now()};
    try{
      var json = await postRemote(item);
      if(json && json.item) item = json.item;
    }catch(err){
      if(err && err.code === 'CIVILITY_REQUIRED'){
        showError('danmaku-error-civil');
        return;
      }
      showError('danmaku-error-network');
    }
    items.push(item);
    items = mergeItems([], items);
    save();
    spawn(item);
    messageInput.value = '';
    autoGrow();
    updateCounts();
  }

  function init(){
    layer = $('danmakuLayer');
    panel = $('danmakuPanel');
    settings = $('danmakuSettings');
    settingsBtn = $('danmakuSettingsBtn');
    settingsPop = $('danmakuSettingsPop');
    form = panel;
    nameInput = $('danmakuName');
    messageInput = $('danmakuMessage');
    sendBtn = $('danmakuSend');
    nameCount = $('danmakuNameCount');
    messageCount = $('danmakuMessageCount');
    errorEl = $('danmakuError');
    rangeInput = $('danmakuRange');
    speedInput = $('danmakuSpeed');
    opacityInput = $('danmakuOpacity');
    opacityVal = $('danmakuOpacityVal');
    if(!layer || !panel || !form) return;

    load();
    updateText();
    updateOpacityLabel();
    updateCounts();
    autoGrow();
    form.addEventListener('submit', submit);
    if(messageInput){
      messageInput.addEventListener('keydown', function(e){
        if(e.key !== 'Enter') return;
        if(e.shiftKey) return;
        e.preventDefault();
        if(typeof form.requestSubmit === 'function') form.requestSubmit();
        else form.dispatchEvent(new Event('submit', {cancelable: true}));
      });
    }
    [nameInput, messageInput].forEach(function(input){
      if(!input) return;
      input.addEventListener('input', function(){
        clearError();
        updateCounts();
        autoGrow();
      });
    });

    if(settingsBtn && settingsPop){
      settingsBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        toggleSettingsPop();
      });
      document.addEventListener('click', function(e){
        if(!settingsPop.classList.contains('is-open')) return;
        if(settings.contains(e.target)) return;
        closeSettingsPop();
      });
      settingsPop.addEventListener('click', function(e){e.stopPropagation();});
    }

    if(opacityInput){
      opacityInput.addEventListener('input', updateOpacityLabel);
      opacityInput.addEventListener('change', updateOpacityLabel);
    }

    placeholderMq = window.matchMedia('(max-width:600px) and (orientation:portrait)');
    function onPlaceholderMq(){updateMessagePlaceholder();}
    if(placeholderMq.addEventListener) placeholderMq.addEventListener('change', onPlaceholderMq);
    else if(placeholderMq.addListener) placeholderMq.addListener(onPlaceholderMq);
    window.addEventListener('resize', onPlaceholderMq);
    window.addEventListener('resize', syncCornerLift);

    window.addEventListener('scroll', scheduleSyncVisibility, {passive: true});
    window.addEventListener('resize', scheduleSyncVisibility);

    var endingEl = $('ending');
    if(endingEl && window.IntersectionObserver){
      new IntersectionObserver(function(){scheduleSyncVisibility();}, {threshold: [0, 0.25, 0.5, 0.75, 1]}).observe(endingEl);
    }

    window.DuiduiDanmaku = {
      markEndingQuoteOpened: function(){hasOpenedEndingQuote = true;},
      revealAfterQuote: function(){if(hasOpenedEndingQuote) reveal();},
      syncVisibility: syncVisibility,
      reset: function(){
        revealed = false;
        hasOpenedEndingQuote = false;
        uiVisible = false;
        if(layer) layer.innerHTML = '';
        hideUI();
      }
    };

    var langBtn = $('langToggle');
    if(langBtn) langBtn.addEventListener('click', function(){setTimeout(updateText, 60);});

    var quoteOverlay = $('quoteOverlay');
    if(quoteOverlay && window.MutationObserver){
      var wasOpen = quoteOverlay.classList.contains('show');
      new MutationObserver(function(){
        var isOpen = quoteOverlay.classList.contains('show');
        if(wasOpen && !isOpen && hasOpenedEndingQuote) reveal();
        wasOpen = isOpen;
      }).observe(quoteOverlay, {attributes: true, attributeFilter: ['class']});
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
