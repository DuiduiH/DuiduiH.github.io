// Floating section-aware chat assistant.
(function(){
  var CONFIG = window.DUIDUI_CHATBOT || {};
  var STORAGE_POS = 'duidui-chatbot-position-v1';
  var STORAGE_OPEN = 'duidui-chatbot-open-v1';
  var MAP_IDLE_MS = 3500;
  var currentSection = CONFIG.defaultSection || 'hero';
  var conversation = [];
  var root, bubble, panel, messagesEl, chipsEl, inputEl, titleEl, sendBtn;
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
        '<defs>'+
          '<linearGradient id="duiHair" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#5c4033"/><stop offset="100%" stop-color="#3d2817"/></linearGradient>'+
          '<linearGradient id="duiFace" x1="0.3" y1="0" x2="0.7" y2="1"><stop offset="0%" stop-color="#fff5f0"/><stop offset="100%" stop-color="#ffe8dc"/></linearGradient>'+
          '<radialGradient id="duiEyeL" cx="35%" cy="35%"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#2563eb"/></radialGradient>'+
          '<radialGradient id="duiEyeR" cx="35%" cy="35%"><stop offset="0%" stop-color="#7dd3fc"/><stop offset="100%" stop-color="#2563eb"/></radialGradient>'+
        '</defs>'+
        '<ellipse cx="50" cy="92" rx="24" ry="4" fill="#ffb6c1" opacity=".16"/>'+
        '<path d="M18 58 C18 34 34 18 50 18 C66 18 82 34 82 58 L82 88 C82 92 78 96 74 96 L26 96 C22 96 18 92 18 88 Z" fill="url(#duiFace)" stroke="#e8b4a8" stroke-width="1.2"/>'+
        '<path d="M18 42 C20 28 34 14 50 14 C66 14 80 28 82 42 C78 30 66 22 50 22 C34 22 22 30 18 42 Z" fill="url(#duiHair)"/>'+
        '<path d="M14 48 C10 58 12 72 18 82 L22 76 C18 66 17 56 20 46 Z" fill="url(#duiHair)"/>'+
        '<path d="M86 48 C90 58 88 72 82 82 L78 76 C82 66 83 56 80 46 Z" fill="url(#duiHair)"/>'+
        '<path d="M34 24 C38 18 46 16 50 16 C54 16 62 18 66 24 C60 20 54 18 50 18 C46 18 40 20 34 24 Z" fill="#6b4c3b" opacity=".55"/>'+
        '<ellipse cx="36" cy="54" rx="11" ry="13" fill="#fff" stroke="#4a3728" stroke-width="1.6"/>'+
        '<ellipse cx="64" cy="54" rx="11" ry="13" fill="#fff" stroke="#4a3728" stroke-width="1.6"/>'+
        '<ellipse cx="36" cy="56" rx="7" ry="8.5" fill="url(#duiEyeL)"/>'+
        '<ellipse cx="64" cy="56" rx="7" ry="8.5" fill="url(#duiEyeR)"/>'+
        '<circle cx="33" cy="52" r="2.8" fill="#fff" opacity=".95"/>'+
        '<circle cx="61" cy="52" r="2.8" fill="#fff" opacity=".95"/>'+
        '<circle cx="38" cy="58" r="1.4" fill="#fff" opacity=".7"/>'+
        '<circle cx="66" cy="58" r="1.4" fill="#fff" opacity=".7"/>'+
        '<path d="M34 48 Q36 46 38 48" stroke="#4a3728" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        '<path d="M62 48 Q64 46 66 48" stroke="#4a3728" stroke-width="1.4" fill="none" stroke-linecap="round"/>'+
        '<ellipse cx="28" cy="64" rx="5.5" ry="3.2" fill="#ffb8ca" opacity=".62"/>'+
        '<ellipse cx="72" cy="64" rx="5.5" ry="3.2" fill="#ffb8ca" opacity=".62"/>'+
        '<path d="M47 68 Q50 71 53 68" stroke="#e08a9a" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
        '<path d="M44 74 Q50 78 56 74" stroke="#f08ba8" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>'+
        '<path d="M48 32 L50 26 L52 32" fill="#ff9ec4" stroke="#ff7eb0" stroke-width=".8" stroke-linejoin="round"/>'+
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
    root.classList.remove('is-dragging');
    try{localStorage.setItem(STORAGE_OPEN, '1');}catch(e){}
  }

  function closePanel(){
    pendingReply++;
    setTyping(false);
    root.classList.remove('is-open');
    try{localStorage.setItem(STORAGE_OPEN, '0');}catch(e){}
  }

  function handleOutsidePointer(e){
    if(!root || !root.classList.contains('is-open')) return;
    if(root.contains(e.target)) return;
    closePanel();
  }

  function applySavedPosition(){
    try{
      var pos = JSON.parse(localStorage.getItem(STORAGE_POS) || 'null');
      if(!pos) return;
      var size = root.offsetWidth || 80;
      root.style.left = Math.max(0, Math.min(window.innerWidth - size, pos.left)) + 'px';
      root.style.top = Math.max(58, Math.min(window.innerHeight - size, pos.top)) + 'px';
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
    root.classList.add('is-dragging');
    var size = root.offsetWidth || 80;
    root.style.left = Math.max(0, Math.min(window.innerWidth - size, dragState.rootX + dx)) + 'px';
    root.style.top = Math.max(58, Math.min(window.innerHeight - size, dragState.rootY + dy)) + 'px';
    root.style.bottom = 'auto';
  }

  function onPointerUp(){
    if(!dragState) return;
    var wasMoved = dragState.moved;
    dragState = null;
    root.classList.remove('is-dragging');
    savePosition(root.offsetLeft, root.offsetTop);
    if(!wasMoved){
      root.classList.contains('is-open') ? closePanel() : openPanel();
    }
  }

  function savePosition(left, top){
    try{localStorage.setItem(STORAGE_POS, JSON.stringify({left:left, top:top}));}catch(e){}
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
    bubble.addEventListener('pointercancel', function(){dragState = null; root.classList.remove('is-dragging');});
    $('.dui-chat-close', root).addEventListener('click', closePanel);
    $('.dui-chat-form', root).addEventListener('submit', function(e){
      e.preventDefault();
      askCustom();
    });
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
    if(localStorage.getItem(STORAGE_OPEN) === '1') openPanel();
    observeSections();
    enhanceMapDock();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  }else{
    init();
  }
})();
