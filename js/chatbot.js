// Floating section-aware chat assistant.
(function(){
  var CONFIG = window.DUIDUI_CHATBOT || {};
  var STORAGE_OPEN = 'duidui-chatbot-open-v1';
  var STORAGE_HISTORY = 'duidui-chatbot-history-v1';
  var MAP_IDLE_MS = 3500;
  var MAX_HISTORY = 48;
  var currentSection = CONFIG.defaultSection || 'hero';
  var conversation = [];
  var root, bubble, panel, messagesEl, chipsEl, inputEl, titleEl, sendBtn;
  var typingTimer = null;
  var pendingReply = 0;
  var inputFocused = false;
  var chipState = {section: null, visible: [], remaining: []};
  var greetedSections = new Set();

  function $(sel, parent){return (parent || document).querySelector(sel);}

  function isEn(){return document.documentElement.lang === 'en';}

  function ui(key){
    var pack=(CONFIG.ui||{})[isEn()?'en':'cn']||{};
    return pack[key] || '';
  }

  function pickLocalized(val){
    if(val == null) return '';
    if(typeof val === 'object' && ('cn' in val || 'en' in val)){
      return isEn() ? (val.en || val.cn || '') : (val.cn || val.en || '');
    }
    return val;
  }

  function localizeSection(raw){
    if(!raw) return {};
    return {
      title: pickLocalized(raw.title),
      sectionLabel: pickLocalized(raw.sectionLabel),
      greeting: pickLocalized(raw.greeting),
      context: pickLocalized(raw.context),
      questions: (raw.questions || []).map(pickLocalized),
      answers: (raw.answers || []).map(pickLocalized)
    };
  }

  function getSectionData(id){
    var raw = (CONFIG.sections && CONFIG.sections[id]) || CONFIG.fallback || {};
    return localizeSection(raw);
  }

  function fixedIntro(){
    var pack=CONFIG.introGreeting||{};
    return isEn()?(pack.en||''):(pack.cn||'');
  }

  function sectionWelcome(data){
    return (data&&data.greeting)||(CONFIG.fallback&&CONFIG.fallback.greeting)||'';
  }

  function rand(min, max){return min + Math.floor(Math.random() * (max - min + 1));}

  function shuffleIndexes(count){
    var indexes=[];
    for(var i=0;i<count;i++) indexes.push(i);
    for(var j=indexes.length-1;j>0;j--){
      var k=Math.floor(Math.random()*(j+1));
      var t=indexes[j];indexes[j]=indexes[k];indexes[k]=t;
    }
    return indexes;
  }

  function wait(ms){return new Promise(function(resolve){setTimeout(resolve, ms);});}

  function avatarSvg(){
    return ''+
      '<svg class="dui-bot-avatar" viewBox="0 0 80 80" aria-hidden="true">'+
        '<defs>'+
          '<linearGradient id="duiHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7a472f"/><stop offset="100%" stop-color="#30190f"/></linearGradient>'+
          '<radialGradient id="duiFace" cx="38%" cy="30%" r="70%"><stop offset="0%" stop-color="#fff7ed"/><stop offset="100%" stop-color="#fed7aa"/></radialGradient>'+
          '<linearGradient id="duiDress" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f9a8d4"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient>'+
        '</defs>'+
        '<path d="M18 38c0-17 10-29 22-29s22 12 22 29v17c0 9-7 15-17 15H35c-10 0-17-6-17-15z" fill="url(#duiHair)"/>'+
        '<path d="M30 58c2-3.5 6.5-5.5 10-5.5s8 2 10 5.5l3.5 9H26.5z" fill="url(#duiDress)"/>'+
        '<ellipse cx="40" cy="37.5" rx="16.5" ry="17.5" fill="url(#duiFace)" stroke="#e7a47d" stroke-width="1.1"/>'+
        '<path d="M23 34c1-11 9-18 17-18s16 5 18 17c-4-5-9-8-17-8s-12 3-16 8z" fill="url(#duiHair)"/>'+
        '<path d="M22 27c2-9 10-15 18-15s16 6 18 15c-4-6-10-9-18-9s-14 3-18 9z" fill="#8a5235"/>'+
        '<path d="M24 23c5-2 11-3 16-3s11 1 16 3c-3 6-7 9-16 9s-13-3-16-9z" fill="#7a472f"/>'+
        '<circle cx="33.5" cy="38" r="3.5" fill="#2f1b12"/><circle cx="46.5" cy="38" r="3.5" fill="#2f1b12"/>'+
        '<circle cx="32.4" cy="36.8" r="1.2" fill="#fff" opacity=".95"/><circle cx="45.4" cy="36.8" r="1.2" fill="#fff" opacity=".95"/>'+
        '<ellipse cx="28" cy="43.5" rx="3.6" ry="2.2" fill="#fb7185" opacity=".36"/><ellipse cx="52" cy="43.5" rx="3.6" ry="2.2" fill="#fb7185" opacity=".36"/>'+
        '<path d="M33.5 47.8 Q40 51.8 46.5 47.8" fill="none" stroke="#9f4f4f" stroke-width="1.8" stroke-linecap="round"/>'+
      '</svg>';
  }

  function avatarMarkup(){
    return avatarSvg() + '<span class="dui-bot-badge" aria-hidden="true">1</span>';
  }

  function headAvatarSvg(){
    return avatarSvg().replace('class="dui-bot-avatar"', 'class="dui-chat-head-avatar"');
  }

  function updateInputPlaceholder(){
    if(!inputEl) return;
    inputEl.placeholder = inputFocused ? (ui('focusPlaceholder') || ui('placeholder') || '') : (ui('placeholder') || '');
  }

  function applyUiStrings(){
    if(titleEl) titleEl.textContent = ui('title') || (isEn() ? 'Little XD' : '小小对');
    updateInputPlaceholder();
    if(sendBtn) sendBtn.textContent = ui('send') || '';
    if(bubble) bubble.setAttribute('aria-label', ui('open') || (isEn() ? 'Open chat' : '打开聊天'));
    if(panel) panel.setAttribute('aria-label', ui('chatPanel') || (isEn() ? 'Chat' : '聊天'));
    var closeBtn = root ? $('.dui-chat-close', root) : null;
    if(closeBtn) closeBtn.setAttribute('aria-label', ui('close') || '');
  }

  function normalizeRecord(raw){
    if(!raw || !raw.role) return null;
    var rec = {
      role: raw.role === 'user' ? 'user' : 'bot',
      kind: raw.kind || 'custom',
      sectionId: raw.sectionId || currentSection,
      presetIdx: typeof raw.presetIdx === 'number' ? raw.presetIdx : null,
      cn: String(raw.cn || ''),
      en: String(raw.en || '')
    };
    if(rec.kind === 'custom' && !rec.cn && !rec.en && raw.content){
      if(isEn()) rec.en = String(raw.content);
      else rec.cn = String(raw.content);
    }
    return rec;
  }

  function recordText(rec){
    if(!rec) return '';
    if(rec.kind === 'intro') return fixedIntro();
    if(rec.kind === 'section-greeting') return sectionWelcome(getSectionData(rec.sectionId));
    if(rec.kind === 'preset-user'){
      var questions = getSectionData(rec.sectionId).questions || [];
      return questions[rec.presetIdx] || (isEn() ? rec.en : rec.cn) || rec.cn || rec.en || '';
    }
    if(rec.kind === 'preset-bot'){
      var answers = getSectionData(rec.sectionId).answers || [];
      return answers[rec.presetIdx] || (isEn() ? rec.en : rec.cn) || rec.cn || rec.en || '';
    }
    return isEn() ? (rec.en || rec.cn) : (rec.cn || rec.en);
  }

  function historyForApi(){
    return conversation.map(function(rec){
      return {role: rec.role, content: recordText(rec)};
    }).slice(-8);
  }

  function saveHistory(){
    try{localStorage.setItem(STORAGE_HISTORY, JSON.stringify(conversation.slice(-MAX_HISTORY)));}catch(e){}
  }

  function loadHistory(){
    try{
      var parsed = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
      if(!Array.isArray(parsed) || !parsed.length) return null;
      var list = parsed.map(normalizeRecord).filter(Boolean);
      return list.length ? list : null;
    }catch(e){
      return null;
    }
  }

  function renderAllMessages(){
    if(!messagesEl) return;
    messagesEl.innerHTML = '';
    conversation.forEach(function(rec){
      var item = document.createElement('div');
      item.className = 'dui-chat-msg ' + (rec.role === 'user' ? 'is-user' : 'is-bot');
      item.textContent = recordText(rec);
      messagesEl.appendChild(item);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function pushRecord(rec){
    conversation.push(rec);
    if(conversation.length > MAX_HISTORY) conversation = conversation.slice(-MAX_HISTORY);
    if(!messagesEl) return;
    var item = document.createElement('div');
    item.className = 'dui-chat-msg ' + (rec.role === 'user' ? 'is-user' : 'is-bot');
    item.textContent = recordText(rec);
    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    saveHistory();
  }

  function customRecord(role, text){
    return {
      role: role,
      kind: 'custom',
      sectionId: currentSection,
      cn: isEn() ? '' : text,
      en: isEn() ? text : ''
    };
  }

  function seedInitialMessages(){
    pushRecord({role: 'bot', kind: 'intro', sectionId: currentSection, cn: '', en: ''});
  }

  function rebuildGreetedFromHistory(){
    greetedSections = new Set();
  }

  function syncCurrentSection(){
    if(!window.getCurrentSectionId) return;
    var id = window.getCurrentSectionId();
    if(!id || id === currentSection) return;
    sectionChanged(id);
  }

  function sectionChanged(id){
    if(!id || id === currentSection) return;
    currentSection = id;
    if(!root || !root.classList.contains('is-open')) return;
    var data = getSectionData(currentSection);
    resetChipState(data, true);
    renderChips(data);
  }

  function maybeWelcomeSection(id){
    if(!id || !root || !root.classList.contains('is-open')) return;
    if(greetedSections.has(id)) return;
    greetedSections.add(id);
    pushRecord({role: 'bot', kind: 'section-greeting', sectionId: id, cn: '', en: ''});
  }

  async function translateText(text, targetLang){
    if(!text) return '';
    try{
      var prompt = targetLang === 'en'
        ? 'Translate the following Chinese into natural English. Output ONLY the translation, no quotes or explanation:\n\n' + text
        : '将以下英文翻译为自然的中文。只输出译文，不要引号或解释：\n\n' + text;
      var resp = await fetch(CONFIG.apiEndpoint || '/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sectionId: currentSection,
          question: prompt,
          lang: targetLang,
          section: {title: '', label: '', context: ''},
          styleGuide: [],
          history: []
        })
      });
      if(resp.ok){
        var json = await resp.json();
        return String(json.answer || '').trim() || text;
      }
    }catch(err){}
    return text;
  }

  async function translateMissingCustomMessages(){
    var jobs = [];
    conversation.forEach(function(rec, idx){
      if(rec.kind !== 'custom') return;
      if(isEn() && rec.cn && !rec.en){
        jobs.push(translateText(rec.cn, 'en').then(function(text){rec.en = text;}));
      }else if(!isEn() && rec.en && !rec.cn){
        jobs.push(translateText(rec.en, 'cn').then(function(text){rec.cn = text;}));
      }
    });
    if(jobs.length) await Promise.all(jobs);
    saveHistory();
  }

  async function refreshForLanguage(){
    applyUiStrings();
    var data = getSectionData(currentSection);
    resetChipState(data, false);
    renderChips(data);
    if(!messagesEl) return;
    pendingReply++;
    setTyping(false);
    await translateMissingCustomMessages();
    renderAllMessages();
  }

  function botMessage(text){
    pushRecord(customRecord('bot', text));
  }

  function userMessage(text){
    pushRecord(customRecord('user', text));
  }

  function setTyping(on){
    var old = $('.dui-chat-typing', messagesEl);
    if(old) old.remove();
    clearTimeout(typingTimer);
    if(!on) return;
    var typing = document.createElement('div');
    typing.className = 'dui-chat-msg is-bot dui-chat-typing';
    typing.innerHTML = (ui('typing') || (isEn() ? 'Typing' : '正在输入')) +
      '<span class="dui-typing-dots"><span></span><span></span><span></span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function resetChipState(data, randomize){
    var list = data.questions || [];
    if(!randomize && chipState.section === currentSection && chipState.visible.length){
      return;
    }
    var indexes = shuffleIndexes(list.length);
    chipState = {
      section: currentSection,
      visible: indexes.slice(0, 3),
      remaining: indexes.slice(3)
    };
  }

  function ensureChipState(data){
    if(chipState.section === currentSection) return;
    resetChipState(data, !!(root && root.classList.contains('is-open')));
  }

  function advanceChip(idx){
    chipState.visible = chipState.visible.filter(function(itemIdx){return itemIdx !== idx;});
    if(chipState.remaining.length) chipState.visible.push(chipState.remaining.shift());
  }

  function renderChips(data){
    ensureChipState(data);
    chipsEl.innerHTML = '';
    chipState.visible.forEach(function(questionIdx){
      var q = (data.questions || [])[questionIdx];
      if(!q) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dui-chat-chip';
      btn.textContent = q;
      btn.addEventListener('click', function(){
        var wasClosed = !root.classList.contains('is-open');
        if(wasClosed) openPanel(true);
        advanceChip(questionIdx);
        renderChips(getSectionData(currentSection));
        askPreset(questionIdx);
      });
      chipsEl.appendChild(btn);
    });
  }

  function askPreset(idx){
    var data = getSectionData(currentSection);
    pushRecord({role: 'user', kind: 'preset-user', sectionId: currentSection, presetIdx: idx, cn: '', en: ''});
    var answer = data.answers && data.answers[idx];
    var fallback = isEn()
      ? 'Good question for this page — the short answer is: follow the logic behind each choice here.'
      : '这个问题很适合这一页。我的短答案是：先看这一页的选择逻辑，再看它证明了什么。';
    replyWithPresetPause(idx, !!answer, fallback);
  }

  async function replyWithPresetPause(idx, usePresetBot, fallbackText){
    var token = ++pendingReply;
    await wait(rand(700, 1300));
    if(token !== pendingReply) return;
    setTyping(true);
    await wait(rand(1200, 2400));
    if(token !== pendingReply) return;
    setTyping(false);
    if(usePresetBot){
      pushRecord({role: 'bot', kind: 'preset-bot', sectionId: currentSection, presetIdx: idx, cn: '', en: ''});
    }else{
      pushRecord(customRecord('bot', fallbackText));
    }
  }

  function buildLocalAnswer(question){
    var data = getSectionData(currentSection);
    var context = (data.context || '').replace(/[。.!！]+$/,'');
    if(isEn()){
      return 'Let me answer in my own way for this section: ' + context + '. On "' + question + '", I\'d start from why this page is structured this way, then connect it to what it shows about how I think and choose.';
    }
    return '我先按这一页用小小对的方式答：' + context + '。你问「' + question + '」，我会先看它和这一页的选择逻辑有什么关系，再回答它能说明我什么特点。';
  }

  async function askCustom(){
    var question = (inputEl.value || '').trim();
    if(!question) return;
    inputEl.value = '';
    pushRecord(customRecord('user', question));
    var data = getSectionData(currentSection);
    var token = ++pendingReply;
    await wait(rand(700, 1300));
    if(token !== pendingReply) return;
    setTyping(true);
    var minThink = wait(rand(1400, 2600));
    var answerText = null;
    try{
      var resp = await fetch(CONFIG.apiEndpoint || '/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          sectionId: currentSection,
          question: question,
          lang: isEn() ? 'en' : 'cn',
          section: {
            title: data.title,
            label: data.sectionLabel,
            context: data.context
          },
          styleGuide: isEn() ? (CONFIG.styleGuideEn || CONFIG.styleGuide || []) : (CONFIG.styleGuide || []),
          history: historyForApi().slice(0, -1)
        })
      });
      if(resp.ok){
        var json = await resp.json();
        answerText = json.answer;
      }
    }catch(err){}
    await minThink;
    if(token !== pendingReply) return;
    setTyping(false);
    botMessage(answerText || buildLocalAnswer(question));
  }

  function bumpCornerLift(){
    if(window.DuiduiDanmaku && typeof window.DuiduiDanmaku.syncCornerLift === 'function'){
      window.DuiduiDanmaku.syncCornerLift();
      requestAnimationFrame(window.DuiduiDanmaku.syncCornerLift);
    }
  }

  function openPanel(userInitiated){
    var wasOpen = root.classList.contains('is-open');
    syncCurrentSection();
    root.classList.add('is-open');
    try{localStorage.setItem(STORAGE_OPEN, '1');}catch(e){}
    var data = getSectionData(currentSection);
    if(!wasOpen){
      resetChipState(data, true);
      renderChips(data);
    }
    if(userInitiated) maybeWelcomeSection(currentSection);
    bumpCornerLift();
  }

  function closePanel(){
    pendingReply++;
    setTyping(false);
    root.classList.remove('is-open');
    try{localStorage.setItem(STORAGE_OPEN, '0');}catch(e){}
    bumpCornerLift();
  }

  function togglePanel(){
    root.classList.contains('is-open') ? closePanel() : openPanel(true);
  }

  function handleOutsidePointer(e){
    if(!root || !root.classList.contains('is-open')) return;
    if(root.contains(e.target)) return;
    closePanel();
  }

  function resetChatHistory(){
    pendingReply++;
    setTyping(false);
    conversation = [];
    greetedSections = new Set();
    try{localStorage.removeItem(STORAGE_HISTORY);}catch(e){}
    if(messagesEl) messagesEl.innerHTML = '';
    seedInitialMessages();
    var data = getSectionData(currentSection);
    resetChipState(data, true);
    renderChips(data);
  }

  function observeSections(){
    var ratios = {};
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var id = entry.target.dataset.mapId || entry.target.id;
        if(id) ratios[id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var best = currentSection;
      var bestRatio = ratios[best] || 0;
      Object.keys(ratios).forEach(function(id){
        if(ratios[id] > bestRatio){
          best = id;
          bestRatio = ratios[id];
        }
      });
      if(best && best !== currentSection && bestRatio > 0.12){
        sectionChanged(best);
      }
    }, {threshold: [0.12, 0.25, 0.45, 0.65]});
    document.querySelectorAll('[data-map-id], #hero, #takeaway, #ending').forEach(function(el){
      observer.observe(el);
    });
  }

  function enhanceMapDock(){
    var cornerDock = document.getElementById('cornerDock');
    var starMapOverlay = document.getElementById('star-map-overlay');
    if(!cornerDock) return;
    var timer = null;
    function sync(){
      var isOpen = starMapOverlay && starMapOverlay.classList.contains('open');
      if(isOpen){
        clearTimeout(timer);
        cornerDock.classList.remove('corner-expanded');
      }else{
        clearTimeout(timer);
        timer = setTimeout(function(){cornerDock.classList.remove('corner-expanded');}, MAP_IDLE_MS);
      }
    }
    ['pointerenter','focusin'].forEach(function(evt){
      cornerDock.addEventListener(evt, function(){clearTimeout(timer);});
    });
    cornerDock.addEventListener('pointerleave', function(){
      if(!starMapOverlay || !starMapOverlay.classList.contains('open')) sync();
    });
    if(starMapOverlay){
      starMapOverlay.addEventListener('click', function(){setTimeout(sync, 0);});
    }
    var starPocket = document.getElementById('star-pocket');
    if(starPocket) starPocket.addEventListener('click', function(){setTimeout(sync, 0);});
    setTimeout(sync, MAP_IDLE_MS);
  }

  function init(){
    if(document.getElementById('dui-chatbot')) return;
    try{localStorage.removeItem('duidui-chatbot-position-v1');}catch(e){}

    root = document.createElement('div');
    root.id = 'dui-chatbot';
    root.className = 'corner-dock corner-dock--left';
    root.innerHTML = ''+
      '<button type="button" class="dui-bot-bubble corner-bubble" aria-label="Open chat">' + avatarMarkup() + '</button>'+
      '<section class="dui-chat-panel" aria-label="Chat">'+
        '<div class="dui-chat-head"><div class="dui-chat-head-main">' + headAvatarSvg() + '<div><strong class="dui-chat-title"></strong></div></div><button type="button" class="dui-chat-close" aria-label="Close">×</button></div>'+
        '<div class="dui-chat-messages"></div>'+
        '<div class="dui-chat-chips"></div>'+
        '<form class="dui-chat-form"><input class="dui-chat-input" type="text" maxlength="160" autocomplete="off"><button class="dui-chat-send" type="submit"></button></form>'+
      '</section>';
    document.body.appendChild(root);
    bubble = $('.dui-bot-bubble', root);
    panel = $('.dui-chat-panel', root);
    messagesEl = $('.dui-chat-messages', root);
    chipsEl = $('.dui-chat-chips', root);
    inputEl = $('.dui-chat-input', root);
    titleEl = $('.dui-chat-title', root);
    sendBtn = $('.dui-chat-send', root);

    applyUiStrings();
    bubble.addEventListener('click', function(e){
      e.stopPropagation();
      togglePanel();
    });
    $('.dui-chat-close', root).addEventListener('click', closePanel);
    $('.dui-chat-form', root).addEventListener('submit', function(e){
      e.preventDefault();
      askCustom();
    });
    inputEl.addEventListener('focus', function(){
      inputFocused = true;
      root.classList.add('is-input-focused');
      updateInputPlaceholder();
      if(window.DuiduiMobileKeyboard){
        window.DuiduiMobileKeyboard.update();
        window.DuiduiMobileKeyboard.scrollForInput(inputEl);
      }else{
        updateViewportVars();
      }
      if(messagesEl){
        setTimeout(function(){messagesEl.scrollTop = messagesEl.scrollHeight;}, 120);
      }
    });
    inputEl.addEventListener('blur', function(){
      inputFocused = false;
      root.classList.remove('is-input-focused');
      updateInputPlaceholder();
      setTimeout(function(){
        if(window.DuiduiMobileKeyboard) window.DuiduiMobileKeyboard.update();
        else updateViewportVars();
      }, 100);
    });
    if(window.DuiduiMobileKeyboard){
      window.addEventListener('duidui:keyboardchange', function(){
        if(inputFocused && messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
      });
    }else{
      updateViewportVars();
      window.addEventListener('resize', updateViewportVars);
      window.addEventListener('orientationchange', function(){setTimeout(updateViewportVars, 120);});
      if(window.visualViewport){
        window.visualViewport.addEventListener('resize', updateViewportVars);
        window.visualViewport.addEventListener('scroll', updateViewportVars);
      }
    }
    document.addEventListener('pointerdown', handleOutsidePointer, true);

    var observedLang = document.documentElement.lang;
    var langObs = new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        if(m.attributeName !== 'lang') return;
        if(document.documentElement.lang === observedLang) return;
        observedLang = document.documentElement.lang;
        refreshForLanguage();
      });
    });
    langObs.observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});

    var saved = loadHistory();
    if(saved){
      conversation = saved;
      rebuildGreetedFromHistory();
      renderAllMessages();
    }else{
      seedInitialMessages();
    }

    var data = getSectionData(currentSection);
    resetChipState(data, false);
    renderChips(data);
    observeSections();
    enhanceMapDock();

    try{
      if(localStorage.getItem(STORAGE_OPEN) === '1') openPanel(false);
    }catch(e){}

    window.DuiduiChatbot = {reset: resetChatHistory};
  }

  function updateViewportVars(){
    var vv = window.visualViewport;
    var height = vv ? vv.height : window.innerHeight;
    var keyboardInset = 0;
    if(vv){
      keyboardInset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    }
    document.documentElement.style.setProperty('--dui-vv-height', Math.round(height) + 'px');
    document.documentElement.style.setProperty('--dui-keyboard-inset', Math.round(keyboardInset) + 'px');
    bumpCornerLift();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
