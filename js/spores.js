// ========== 1.3 Knowledge Spores (Learning Bubbles) ==========
function initSpores() {
  const sporesContainer = document.getElementById('knowledgeSpores');
  if (!sporesContainer) return;

  const sporesCanvas = document.getElementById('sporesCanvas');
  const sporesBubbles = document.getElementById('sporesBubbles');
  const sporesHint = document.getElementById('sporesHint');
  const sporesOverlay = document.getElementById('sporesOverlay');
  const sporesOverlayTerm = document.getElementById('sporesOverlayTerm');
  const sporesOverlayDesc = document.getElementById('sporesOverlayDesc');

  const SPORES_DATA = {
    topics: [
      {
        id: 'product-biz',
        name: '产品与商业',
        color: '#FF6B6B',
        entries: [
          { term: 'PMF', desc: '产品与市场的完美契合（Product-Market Fit），这是初创公司活下来的分水岭。' },
          { term: 'MVP', desc: '最小化可行产品，用最少资源验证想法，学学 SpaceX 就明白了——先开枪，再瞄准。' },
          { term: '日活用户（DAU）', desc: '每天都来用你产品的人数，是判断用户粘性最直接的指标。' },
          { term: '成交总额（GMV）', desc: '平台上所有交易的金额加总，电商人每天都在看这个数字。' }
        ]
      },
      {
        id: 'tech-basics',
        name: '技术入门',
        color: '#FFD93D',
        entries: [
          { term: '机器学习', desc: '让机器从数据中学习规律，而不是靠人手工写死的规则。' },
          { term: '深度学习', desc: '一种强大的机器学习方式，用多层神经网络去理解复杂的数据结构，ChatGPT 就是用它做的。' }
        ]
      },
      {
        id: 'social-econ',
        name: '社会经济',
        color: '#6BCB77',
        entries: [
          { term: '边际效用递减', desc: '第一块披萨最香，第十块就只是填肚子——经济学最直观的规律。' },
          { term: '信息不对称', desc: '买家和卖家掌握的信息不一样，导致交易中一方被坑——二手车市场是经典案例。' }
        ]
      },
      {
        id: 'culture-media',
        name: '文化与传播',
        color: '#4D96FF',
        entries: [
          { term: 'Meme（文化基因）', desc: '像基因一样在文化中传播的单位——一句话、一张图都能变成 meme。' },
          { term: '符号消费', desc: '买的不是产品本身，而是它代表的身份和品味——为什么人们花大价钱买奢侈品？' }
        ]
      },
      {
        id: 'creativity-art',
        name: '创意与艺术',
        color: '#A66CFF',
        entries: [
          { term: '艺术创意过程', desc: '创意往往不是凭空想象，而是已知元素的新组合——乔布斯说"创意就是连接"。' },
          { term: '设计思维', desc: '以人为中心，先理解问题再设计解决方案，这是硅谷设计师的工作方式。' }
        ]
      },
      {
        id: 'music-harmony',
        name: '音乐与协调',
        color: '#FF8ACF',
        entries: [
          { term: '和弦', desc: '多个音同时发出，每个音都不同但合在一起就产生了新的感受。' },
          { term: '节奏与节拍', desc: '节拍是时间框架（一二三四），节奏是音符在框架内的分布——就像生活的韵律。' }
        ]
      },
      {
        id: 'learning-growth',
        name: '学习与成长',
        color: '#4DD0E1',
        entries: [
          { term: '增长心态', desc: '相信能力可以通过努力改进的心态，而不是觉得天生聪明就够了。' },
          { term: '刻意练习', desc: '在舒适区外、有反馈、不断改进的练习，这才能真正提高水平。' }
        ]
      },
      {
        id: 'future-trends',
        name: '未来与趋势',
        color: '#FFA94D',
        entries: [
          { term: '元宇宙', desc: '虚拟与现实融合的数字世界，还在早期探索阶段，但可能改变社交和工作。' },
          { term: '生成式AI', desc: '能"生成"新内容的人工智能，不只是分类数据——ChatGPT 开启了这个时代。' }
        ]
      }
    ]
  };

  const SINE_AMPLITUDE = 25;
  const MIN_BUBBLES = 5;
  const FLOAT_DURATION_BASE = 4;

  let sporesBubbleList = [];
  let sporesParticles = [];
  let sporesT0 = 0;
  let sporesRaf = 0;
  let sporesFocused = false;

  function sporesResize() {
    const rect = sporesContainer.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    sporesCanvas.width = rect.width * dpr;
    sporesCanvas.height = rect.height * dpr;
    sporesCanvas.style.width = rect.width + 'px';
    sporesCanvas.style.height = rect.height + 'px';
    const ctx = sporesCanvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function parseColor(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function triggerParticleExplosion(cx, cy, colorHex) {
    const c = parseColor(colorHex);
    const count = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      sporesParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        r: c.r,
        g: c.g,
        b: c.b
      });
    }
  }

  function createBubble() {
    const topic = SPORES_DATA.topics[Math.floor(Math.random() * SPORES_DATA.topics.length)];
    const rect = sporesContainer.getBoundingClientRect();
    const size = 60 + Math.random() * 40;
    const baseX = size + Math.random() * (rect.width - size * 2);
    const x = baseX;
    const y = rect.height + size;
    const phase = Math.random() * Math.PI * 2;
    const speed = (rect.height + 100) / (FLOAT_DURATION_BASE * 60);

    const el = document.createElement('div');
    el.className = 'spore-bubble';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = (x - size / 2) + 'px';
    el.style.top = (y - size / 2) + 'px';

    const br = 48 + Math.random() * 8;
    el.style.borderRadius = br + '% ' + (100 - br) + '% ' + (50 + Math.random() * 10) + '% ' + (50 + Math.random() * 10) + '%';

    const r = parseInt(topic.color.slice(1, 3), 16);
    const g = parseInt(topic.color.slice(3, 5), 16);
    const b = parseInt(topic.color.slice(5, 7), 16);

    el.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7), transparent 45%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.28), transparent 50%), linear-gradient(135deg, rgba(' + r + ',' + g + ',' + b + ',0.28) 0%, rgba(' + Math.min(255, r + 40) + ',' + Math.min(255, g + 40) + ',' + Math.min(255, b + 40) + ',0.22) 60%, rgba(' + Math.min(255, r + 80) + ',' + Math.min(255, g + 80) + ',' + Math.min(255, b + 80) + ',0.18) 100%)';
    el.style.boxShadow = 'inset -6px -6px 18px rgba(0,0,0,0.12), inset 6px 6px 18px rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.08)';
    el.style.color = '#07203a';
    el.textContent = topic.name;
    el.dataset.topicId = topic.id;

    const state = { el, x: x - size / 2, y: y - size / 2, baseX, phase, speed, topic, size };
    sporesBubbleList.push(state);
    sporesBubbles.appendChild(el);

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = sporesContainer.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      triggerParticleExplosion(clickX, clickY, state.topic.color);

      const entries = state.topic.entries || [];
      if (entries.length) {
        const entry = entries[Math.floor(Math.random() * entries.length)];
        sporesOverlayTerm.textContent = entry.term;
        sporesOverlayDesc.textContent = entry.desc;
        const c = parseColor(state.topic.color);
        sporesOverlay.style.background = 'radial-gradient(circle at 40% 18%, rgba(255,255,255,0.6), transparent 55%), rgba(' + c.r + ',' + c.g + ',' + c.b + ',0.45)';
        sporesOverlay.style.boxShadow = '0 10px 30px rgba(' + Math.floor(c.r * 0.2) + ',' + Math.floor(c.g * 0.2) + ',' + Math.floor(c.b * 0.2) + ',0.25)';
        sporesOverlayTerm.style.color = state.topic.color;
        sporesOverlay.classList.add('visible');
        sporesFocused = true;
      }

      state.el.remove();
      sporesBubbleList = sporesBubbleList.filter(b => b !== state);
    });

    return state;
  }

  function sporesTick(t) {
    if (!sporesContainer.isConnected) {
      cancelAnimationFrame(sporesRaf);
      return;
    }

    const rect = sporesContainer.getBoundingClientRect();
    const dt = (t - sporesT0) / 1000;
    sporesT0 = t;

    const ctx = sporesCanvas.getContext('2d');
    ctx.clearRect(0, 0, rect.width, rect.height);

    sporesParticles = sporesParticles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;

      if (p.life <= 0) return false;

      ctx.globalAlpha = p.life;
      ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      return true;
    });

    const speedFactor = sporesFocused ? 0.15 : 1;
    sporesBubbleList.forEach(b => {
      b.y -= b.speed * 60 * dt * speedFactor;
      const newX = b.baseX + SINE_AMPLITUDE * Math.sin(t * 0.002 + b.phase);
      b.el.style.left = (newX - b.size / 2) + 'px';
      b.el.style.top = b.y + 'px';
    });

    sporesBubbleList = sporesBubbleList.filter(b => {
      if (b.y < -b.size) {
        b.el.remove();
        return false;
      }
      return true;
    });

    if (sporesBubbleList.length < MIN_BUBBLES) createBubble();

    sporesRaf = requestAnimationFrame(sporesTick);
  }

  function sporesInit() {
    sporesResize();
    window.addEventListener('resize', sporesResize);

    sporesHint.classList.add('visible');
    setTimeout(() => {
      sporesHint.classList.add('faded');
    }, 2000);

    for (let i = 0; i < MIN_BUBBLES; i++) {
      setTimeout(() => createBubble(), i * 400);
    }

    sporesT0 = performance.now();
    sporesRaf = requestAnimationFrame(sporesTick);

    sporesOverlay.addEventListener('click', () => {
      sporesOverlay.classList.remove('visible');
      sporesFocused = false;
    });
  }

  sporesInit();
}
