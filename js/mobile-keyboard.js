// Mobile keyboard: keep inputs above the keyboard and scroll the page when needed.
(function(){
  var MOBILE_MQ = window.matchMedia('(max-width:768px)');
  var activeInput = null;
  var scrollTimer = null;

  function isMobile(){
    return MOBILE_MQ.matches;
  }

  function isTextField(el){
    if(!el || !el.tagName) return false;
    var tag = el.tagName;
    if(tag !== 'INPUT' && tag !== 'TEXTAREA') return false;
    var type = (el.getAttribute('type') || 'text').toLowerCase();
    return type !== 'range' && type !== 'hidden' && type !== 'checkbox' && type !== 'radio' && type !== 'file';
  }

  function updateKeyboardViewport(){
    var vv = window.visualViewport;
    var height = vv ? vv.height : window.innerHeight;
    var offsetTop = vv ? vv.offsetTop : 0;
    var keyboard = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    var root = document.documentElement;
    root.style.setProperty('--vv-height', Math.round(height) + 'px');
    root.style.setProperty('--vv-offset-top', Math.round(offsetTop) + 'px');
    root.style.setProperty('--keyboard-height', Math.round(keyboard) + 'px');
    root.style.setProperty('--dui-vv-height', Math.round(height) + 'px');
    root.style.setProperty('--dui-keyboard-inset', Math.round(keyboard) + 'px');
    window.dispatchEvent(new CustomEvent('duidui:keyboardchange', {
      detail: {height: keyboard, vvHeight: height, offsetTop: offsetTop}
    }));
  }

  function scrollPageForField(el){
    if(!isMobile() || !el || !window.visualViewport) return;
    updateKeyboardViewport();
    var vv = window.visualViewport;
    var gap = 16;
    var panel = el.closest('.danmaku-panel') || el.closest('.dui-chat-panel');
    var ending = document.getElementById('ending');

    if(panel && panel.classList.contains('danmaku-panel') && ending){
      var scrollTarget = Math.max(0, ending.offsetTop + ending.offsetHeight - vv.height);
      window.scrollTo({top: scrollTarget, left: 0, behavior: 'auto'});
      updateKeyboardViewport();
    }

    var visibleBottom = vv.offsetTop + vv.height - gap;
    var target = panel || el;
    var rect = target.getBoundingClientRect();
    if(rect.bottom > visibleBottom){
      window.scrollBy({top: rect.bottom - visibleBottom + 8, left: 0, behavior: 'auto'});
    }else if(!panel && rect.top < vv.offsetTop + gap){
      window.scrollBy({top: rect.top - (vv.offsetTop + gap), left: 0, behavior: 'auto'});
    }
  }

  function scheduleScroll(el){
    if(scrollTimer) clearTimeout(scrollTimer);
    scrollPageForField(el);
    scrollTimer = setTimeout(function(){
      scrollPageForField(el);
      scrollTimer = null;
    }, 280);
  }

  function onFocusIn(e){
    if(!isTextField(e.target) || !isMobile()) return;
    activeInput = e.target;
    document.documentElement.classList.add('is-keyboard-open');
    updateKeyboardViewport();
    scheduleScroll(e.target);
  }

  function onFocusOut(e){
    if(!isTextField(e.target)) return;
    setTimeout(function(){
      var active = document.activeElement;
      if(isTextField(active)) return;
      activeInput = null;
      document.documentElement.classList.remove('is-keyboard-open');
      updateKeyboardViewport();
    }, 100);
  }

  function bindViewport(){
    updateKeyboardViewport();
    window.addEventListener('resize', updateKeyboardViewport);
    window.addEventListener('orientationchange', function(){setTimeout(updateKeyboardViewport, 140);});
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', function(){
        updateKeyboardViewport();
        if(activeInput) scheduleScroll(activeInput);
      });
      window.visualViewport.addEventListener('scroll', updateKeyboardViewport);
    }
    if(MOBILE_MQ.addEventListener) MOBILE_MQ.addEventListener('change', updateKeyboardViewport);
  }

  function init(){
    bindViewport();
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
  }

  window.DuiduiMobileKeyboard = {
    isMobile: isMobile,
    update: updateKeyboardViewport,
    scrollForInput: scrollPageForField
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
