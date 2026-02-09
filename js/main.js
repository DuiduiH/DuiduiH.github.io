// ========== 1.1 Interest Game - Flip & Match ==========
function initGameBoard() {
  const categoryStyles = {
    music: {
      label: '音乐类',
      color: '#9B59B6',
      logo: '<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
    },
    sports: {
      label: '运动类',
      color: '#2ECC71',
      logo: '<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.2-2L14.8 12C15.5 12 16.1 12 16.5 12V6h-1.4v6l-2-2.1-1.3 1.3L12 9l-1 1-1.2-1.1zM5 13l-1.6-1.5 2.1-3 1.5 1.4L5 13z"/></svg>'
    },
    experience: {
      label: '体验类',
      color: '#3498DB',
      logo: '<svg viewBox="0 0 24 24"><path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 3.5h6V6H9V3.5zM19 19H5V8h14v11z"/></svg>'
    },
    arts: {
      label: '文艺类',
      color: '#E67E22',
      logo: '<svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>'
    }
  };

  const items = [
    { name: '合唱', category: 'music' },
    { name: '钢琴', category: 'music' },
    { name: '小提琴', category: 'music' },
    { name: '音乐剧', category: 'music' },
    { name: '铁三', category: 'sports' },
    { name: '骑行', category: 'sports' },
    { name: '长跑', category: 'sports' },
    { name: '游泳', category: 'sports' },
    { name: '徒步', category: 'sports' },
    { name: '健身', category: 'sports' },
    { name: '旅行', category: 'experience' },
    { name: '摄影', category: 'experience' },
    { name: '美食探店', category: 'experience' },
    { name: '做小手工', category: 'experience' },
    { name: '轰趴', category: 'experience' },
    { name: 'KTV', category: 'experience' },
    { name: '阅读', category: 'arts' },
    { name: '电影', category: 'arts' },
    { name: '国际象棋', category: 'arts' },
    { name: '写作', category: 'arts' }
  ];

  // Duplicate items to create matching pairs
  let cards = [...items, ...items];

  // Shuffle cards
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffle(cards);

  const gameBoard = document.getElementById('gameBoard');
  const statusEl = document.getElementById('status');

  if (!gameBoard) return;

  let flippedCards = [];
  let matchedCount = 0;
  let canFlip = true;

  cards.forEach((item) => {
    const style = categoryStyles[item.category];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.category = item.category;
    card.dataset.name = item.name;

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front" style="background-color: ${style.color}">
          <span class="category-name">${style.label}</span>
          <div class="category-logo">${style.logo}</div>
          <span class="item-name">${item.name}</span>
        </div>
        <div class="card-back">?</div>
      </div>
    `;

    card.addEventListener('click', () => flipCard(card));
    gameBoard.appendChild(card);
  });

  function flipCard(card) {
    if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      canFlip = false;
      const [card1, card2] = flippedCards;

      if (card1.dataset.category === card2.dataset.category) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        flippedCards = [];
        matchedCount += 2;
        statusEl.textContent = '配对成功！🎉';
        canFlip = true;

        if (matchedCount === cards.length) {
          statusEl.textContent = '恭喜你完成全部配对！🏆';
        }
      } else {
        statusEl.textContent = '不匹配，再试一次！';
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          flippedCards = [];
          canFlip = true;
          statusEl.textContent = '继续翻开两张卡片吧！';
        }, 1000);
      }
    }
  }
}

// Setup game controls (shuffle)
function setupGameControls() {
  const sb = document.getElementById('shuffleBtn');
  if (!sb) return;
  sb.addEventListener('click', () => {
    const gameBoard = document.getElementById('gameBoard');
    const statusEl = document.getElementById('status');
    if (!gameBoard) return;
    // clear and re-init
    gameBoard.innerHTML = '';
    if (statusEl) statusEl.textContent = '已打乱，继续翻牌吧！';
    initGameBoard();
  });
}

// ========== 1.2 Career Section ==========
function initCareerSection() {
  const dynamicTooltip = document.getElementById('dynamic-tooltip');
  let pinnedElement = null;

  function setupInteraction(element, text, localTooltipEl) {
    const tl = localTooltipEl || dynamicTooltip;

    const updatePosition = (e) => {
      tl.style.left = (e.clientX + 15) + 'px';
      tl.style.top = (e.clientY + 15) + 'px';
    };

    element.addEventListener('mouseenter', (e) => {
      if (!pinnedElement || pinnedElement === element) {
        tl.textContent = text;
        tl.classList.add('visible');
        updatePosition(e);
      }
    });

    element.addEventListener('mousemove', (e) => {
      if (!pinnedElement || pinnedElement === element) updatePosition(e);
    });

    element.addEventListener('mouseleave', () => {
      if (pinnedElement !== element) tl.classList.remove('visible');
    });

    element.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pinnedElement === element) {
        pinnedElement = null;
      } else {
        pinnedElement = element;
        tl.textContent = text;
        tl.classList.add('visible');
        updatePosition(e);
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (pinnedElement && !pinnedElement.contains(e.target)) {
      pinnedElement = null;
      dynamicTooltip.classList.remove('visible');
    }
  });

  // Finance (Money Bag)
  const financeTrigger = document.getElementById('finance-trigger');
  if (financeTrigger) {
    const moneyBag = financeTrigger.querySelector('.money-bag');
    const coins = financeTrigger.querySelectorAll('.coin');
    const financeTooltip = document.getElementById('finance-tooltip');
    const careerOverlay = document.getElementById('careerOverlay');
    const companyDisplay = document.getElementById('companyDisplay');

    financeTrigger.addEventListener('mouseenter', () => {
      if (!financeTrigger.classList.contains('active')) {
        financeTooltip.style.opacity = '1';
      }
    });

    financeTrigger.addEventListener('mouseleave', () => {
      financeTooltip.style.opacity = '0';
    });

    financeTrigger.addEventListener('click', (e) => {
      if (e.target.closest('.coin')) return;
      financeTrigger.classList.toggle('active');
      if (financeTrigger.classList.contains('active')) {
        financeTooltip.style.opacity = '0';
      }
    });

    coins.forEach(coin => {
      setupInteraction(coin, coin.getAttribute('data-text'));
      coin.addEventListener('click', () => {
        const companyName = coin.getAttribute('data-text');
        careerOverlay.classList.add('active');
        companyDisplay.textContent = companyName;
        companyDisplay.classList.add('active');

        setTimeout(() => {
          careerOverlay.classList.remove('active');
          companyDisplay.classList.remove('active');
        }, 1500);
      });
    });
  }

  // Startup (Egg)
  const startupTrigger = document.getElementById('startup-trigger');
  if (startupTrigger) {
    const startupTooltip = document.getElementById('startup-tooltip');
    const cloud = startupTrigger.querySelector('.cloud');
    const careerOverlay = document.getElementById('careerOverlay');
    const companyDisplay = document.getElementById('companyDisplay');

    startupTrigger.addEventListener('mouseenter', () => {
      if (!startupTrigger.classList.contains('active')) {
        startupTooltip.style.opacity = '1';
      }
    });

    startupTrigger.addEventListener('mouseleave', () => {
      startupTooltip.style.opacity = '0';
    });

    startupTrigger.addEventListener('click', () => {
      if (!startupTrigger.classList.contains('active')) {
        startupTrigger.classList.add('active');
        startupTooltip.style.opacity = '0';

        if (cloud) cloud.style.display = 'flex';

        careerOverlay.classList.add('active');
        companyDisplay.textContent = cloud.getAttribute('data-text') || '公司名称';
        companyDisplay.classList.add('active');

        setTimeout(() => {
          careerOverlay.classList.remove('active');
          companyDisplay.classList.remove('active');
        }, 1500);
      }
    });

    if (cloud) setupInteraction(cloud, cloud.getAttribute('data-text'));
  }
}

// ========== Initialize on DOM ready ==========
document.addEventListener('DOMContentLoaded', () => {
  initGameBoard();
  initCareerSection();
  initSpores();
  initWorldMap();
  initSkillTree();
  initMapNavigation();
  setupGameControls();
});

window.addEventListener('load', () => {
  // Load Leaflet if available for world map
  if (window.L) {
    console.log('Leaflet is available for advanced mapping');
  }
});
