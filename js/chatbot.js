// Floating section-aware chat assistant.
(function(){
  var CONFIG = window.DUIDUI_CHATBOT || {};
  var STORAGE_POS = 'duidui-chatbot-position-v1';
  var STORAGE_OPEN = 'duidui-chatbot-open-v1';
  var MAP_IDLE_MS = 3500;
  var BOT_IDLE_MS = 4200;
  var currentSection = CONFIG.defaultSection || 'hero';
  var conversation = [];
  var root, bubble, panel, messagesEl, chipsEl, inputEl, titleEl, sendBtn;
  var idleTimer = null;
  var dragState = null;
  var typingTimer = null;
  var pendingReply = 0;

  function $(sel, parent){return (parent || document).querySelector(sel);}

  function isEn(){return document.documentElement.lang === 'en';}

  function ui(key){
    var pack=(CONFIG.ui||{})[isEn()?'en':'cn']||{};
    return pack[key] || '';
  }

  function getSectionData(id){
    return (CONFIG.sections && CONFIG.sections[id]) || CONFIG.fallback || {};
  }

  function rand(min, max){return min + Math.floor(Math.random() * (max - min + 1));}

  function wait(ms){return new Promise(function(resolve){setTimeout(resolve, ms);});}

  function avatarSvg(){
    return ''+
      '<svg class="dui-bot-avatar" viewBox="0 0 100 100" aria-hidden="true">'+
        '<defs><radialGradient id="duiBlob" cx="38%" cy="30%" r="72%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#ffe8f0"/></radialGradient></defs>'+
        '<ellipse cx="50" cy="92" rx="26" ry="4.5" fill="#ffb6c1" opacity=".18"/>'+
        '<circle cx="50" cy="52" r="40" fill="url(#duiBlob)"/>'+
        '<ellipse cx="50" cy="58" rx="34" ry="30" fill="#fff5f8"/>'+
        '<path d="M28 36 C32 18 68 18 72 36 C66 30 34 30 28 36 Z" fill="#ffd6e8"/>'+
        '<circle cx="36" cy="50" r="4.5" fill="#5c4f55"/>'+
        '<circle cx="64" cy="50" r="4.5" fill="#5c4f55"/>'+
        '<circle cx="37.5" cy="48.5" r="1.6" fill="#fff"/>'+
        '<circle cx="65.5" cy="48.5" r="1.6" fill="#fff"/>'+
        '<ellipse cx="28" cy="58" rx="7" ry="4" fill="#ffb8ca" opacity=".55"/>'+
        '<ellipse cx="72" cy="58" rx="7" ry="4" fill="#ffb8ca" opacity=".55"/>'+
        '<path d="M43 62 Q50 67 57 62" stroke="#f08ba8" stroke-width="2.2" fill="none" stroke-linecap="round"/>'+
        '<path d="M44 28 Q50 22 56 28" stroke="#ffc2d8" stroke-width="2" fill="none" stroke-linecap="round"/>'+
      '</svg>';
  }

  function applyUiStrings(){
    if(titleEl) titleEl.textContent = ui('title') || (isEn() ? 'XXD' : '小小对');
    if(inputEl) inputEl.placeholder = ui('placeholder') || '';
    if(sendBtn) sendBtn.textContent = ui('send') || '';
    var closeBtn = $('.dui-chat-close', root);
    if(closeBtn) closeBtn.setAttribute('aria-label', ui('close') || '');
  }

  function botMessage(text){
    appendMessage('bot', text);
  }

  function userMessage(text){
    appendMessage('user', text);
  }

  function appendMessage(role, text){
    if(!messagesEl) return;
    var item = document.createElement('div');
    item.className = 'dui-chat-msg ' + (role === 'user' ? 'is-user' : 'is-bot');
    item.textContent = text;
    messagesEl.appendChild(item);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    conversation.push({role: role, content: text});
    if(conversation.length > 12) conversation = conversation.slice(-12);
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

  async function replyWithPause(text){
    var token = ++pendingReply;
    await wait(rand(700, 1300));
    if(token !== pendingReply) return;
    setTyping(true);
    await wait(rand(1200, 2400));
    if(token !== pendingReply) return;
    setTyping(false);
    botMessage(text);
  }

  function renderChips(data){
    chipsEl.innerHTML = '';
    (data.questions || []).slice(0, 3).forEach(function(q, idx){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dui-chat-chip';
      btn.textContent = q;
      btn.addEventListener('click', function(){
        openPanel();
        askPreset(idx, q);
      });
      chipsEl.appendChild(btn);
    });
  }

  function sectionChanged(id, silent){
    currentSection = id || currentSection;
    var data = getSectionData(currentSection);
    renderChips(data);
    if(!silent){
      botMessage(data.greeting || (CONFIG.fallback && CONFIG.fallback.greeting) || (isEn() ? 'Hey, new section!' : '哇，到新板块啦。'));
    }
  }

  function askPreset(idx, question){
    var data = getSectionData(currentSection);
    userMessage(question);
    var answer = data.answers && data.answers[idx];
    replyWithPause(answer || (isEn()
      ? 'Good question for this page — the short answer is: follow the logic behind each choice here.'
      : '这个问题很适合这一页。我的短答案是：先看这一页的选择逻辑，再看它证明了什么。'));
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
    userMessage(question);
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
          styleGuide: CONFIG.styleGuide || [],
          history: conversation.slice(-8)
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

  function openPanel(){
    root.classList.add('is-open');
    root.classList.remove('is-docked');
    try{localStorage.setItem(STORAGE_OPEN, '1');}catch(e){}
    resetIdle();
  }

  function closePanel(){
    pendingReply++;
    setTyping(false);
    root.classList.remove('is-open');
    try{localStorage.setItem(STORAGE_OPEN, '0');}catch(e){}
    dockBot();
  }

  function handleOutsidePointer(e){
    if(!root || !root.classList.contains('is-open')) return;
    if(root.contains(e.target)) return;
    closePanel();
  }

  function dockBot(){
    if(root.classList.contains('is-open')) return;
    root.classList.add('is-docked');
  }

  function resetIdle(){
    clearTimeout(idleTimer);
    if(root.classList.contains('is-open')) return;
    root.classList.remove('is-docked');
    idleTimer = setTimeout(dockBot, BOT_IDLE_MS);
  }

  function savePosition(left, top){
    try{localStorage.setItem(STORAGE_POS, JSON.stringify({left:left, top:top}));}catch(e){}
  }

  function applySavedPosition(){
    try{
      var pos = JSON.parse(localStorage.getItem(STORAGE_POS) || 'null');
      if(!pos) return;
      root.style.left = Math.max(0, Math.min(window.innerWidth - 72, pos.left)) + 'px';
      root.style.top = Math.max(58, Math.min(window.innerHeight - 80, pos.top)) + 'px';
      root.style.bottom = 'auto';
    }catch(e){}
  }

  function onPointerDown(e){
    if(e.button !== undefined && e.button !== 0) return;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      rootX: root.offsetLeft,
      rootY: root.offsetTop,
      moved: false
    };
    bubble.setPointerCapture && bubble.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e){
    if(!dragState) return;
    var dx = e.clientX - dragState.startX;
    var dy = e.clientY - dragState.startY;
    if(Math.abs(dx) + Math.abs(dy) > 5) dragState.moved = true;
    if(!dragState.moved) return;
    root.classList.remove('is-docked');
    root.style.left = Math.max(0, Math.min(window.innerWidth - 72, dragState.rootX + dx)) + 'px';
    root.style.top = Math.max(58, Math.min(window.innerHeight - 80, dragState.rootY + dy)) + 'px';
    root.style.bottom = 'auto';
  }

  function onPointerUp(){
    if(!dragState) return;
    var wasMoved = dragState.moved;
    dragState = null;
    savePosition(root.offsetLeft, root.offsetTop);
    if(!wasMoved){
      root.classList.contains('is-open') ? closePanel() : openPanel();
    }else{
      resetIdle();
    }
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
        sectionChanged(best, !root.classList.contains('is-open'));
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
      cornerDock.classList.toggle('corner-expanded', isOpen);
      if(isOpen){
        clearTimeout(timer);
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
    root = document.createElement('div');
    root.id = 'dui-chatbot';
    root.className = 'dui-chatbot';
    root.innerHTML = ''+
      '<button type="button" class="dui-bot-bubble" aria-label="Open chat">' + avatarSvg() + '<span class="dui-bot-pulse"></span></button>'+
      '<section class="dui-chat-panel" aria-label="Chat">'+
        '<div class="dui-chat-head"><div><strong class="dui-chat-title"></strong></div><button type="button" class="dui-chat-close" aria-label="Close">×</button></div>'+
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
    bubble.addEventListener('pointerdown', onPointerDown);
    bubble.addEventListener('pointermove', onPointerMove);
    bubble.addEventListener('pointerup', onPointerUp);
    bubble.addEventListener('pointercancel', function(){dragState = null;});
    $('.dui-chat-close', root).addEventListener('click', closePanel);
    $('.dui-chat-form', root).addEventListener('submit', function(e){
      e.preventDefault();
      askCustom();
    });
    root.addEventListener('pointerenter', resetIdle);
    root.addEventListener('focusin', resetIdle);
    window.addEventListener('resize', applySavedPosition);
    document.addEventListener('pointerdown', handleOutsidePointer, true);

    var langBtn = document.getElementById('langToggle');
    if(langBtn){
      langBtn.addEventListener('click', function(){
        setTimeout(function(){
          applyUiStrings();
          renderChips(getSectionData(currentSection));
        }, 60);
      });
    }

    sectionChanged(currentSection, true);
    botMessage(getSectionData(currentSection).greeting || (isEn() ? 'Hey! I follow whichever section you\'re on.' : '哇你来啦！我会跟着你正在看的板块聊天。'));
    applySavedPosition();
    if(localStorage.getItem(STORAGE_OPEN) === '1') openPanel(); else resetIdle();
    observeSections();
    enhanceMapDock();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
