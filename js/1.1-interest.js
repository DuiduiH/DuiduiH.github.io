// ===== 1.1 Card Matching Game =====
(function(){
  var isEn=function(){return document.documentElement.lang==='en';};
  const CAT={
    music:{l:'音乐类',en:'Music',c:'#9333ea',i:'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z'},
    sports:{l:'运动类',en:'Sports',c:'#16a34a',i:'M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 1.1-5.2C15.3 12 16.1 12 16.5 12c.8 0 1.5-.1 2-.3V6c-.5.2-1.2.3-2 .3-.6 0-1.2-.1-1.7-.3l-2-1-1-1.1L9.8 8.9z'},
    experience:{l:'体验类',en:'Experience',c:'#0284c7',i:'M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4c-1.1 0-2 .9-2 2v3.8h1.5c1.4 0 2.5 1.1 2.5 2.5S4.9 15.8 3.5 15.8H2V19c0 1.1.9 2 2 2h3.8v-1.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5V21H17c1.1 0 2-.9 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z'},
    arts:{l:'文艺类',en:'Arts',c:'#ea580c',i:'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'}
  };
  const HOBBIES=[
    {n:'合唱',en:'Choir',c:'music'},{n:'钢琴',en:'Piano',c:'music'},{n:'小提琴',en:'Violin',c:'music'},{n:'音乐剧',en:'Musical',c:'music'},
    {n:'旅行',en:'Travel',c:'experience'},{n:'摄影',en:'Photo',c:'experience'},{n:'美食探店',en:'Foodie',c:'experience'},{n:'做小手工',en:'Crafts',c:'experience'},{n:'轰趴',en:'Party',c:'experience'},{n:'KTV',en:'KTV',c:'experience'},
    {n:'阅读',en:'Reading',c:'arts'},{n:'电影',en:'Film',c:'arts'},{n:'国际象棋',en:'Chess',c:'arts'},{n:'写作',en:'Writing',c:'arts'},
    {n:'铁三',en:'Triathlon',c:'sports'},{n:'骑行',en:'Cycling',c:'sports'},{n:'长跑',en:'Running',c:'sports'},{n:'游泳',en:'Swimming',c:'sports'},{n:'徒步',en:'Hiking',c:'sports'},{n:'健身',en:'Gym',c:'sports'}
  ];

  const board=document.getElementById('gameBoard'),status=document.getElementById('gStatus'),sBtn=document.getElementById('shuffleBtn');
  if(!board)return;
  let cards,flipped=[],matched=0,canFlip=true;

  function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

  function init(){
    board.innerHTML='';cards=[...HOBBIES];shuffle(cards);flipped=[];matched=0;canFlip=true;
    var en=isEn();
    status.textContent=en?'Try flipping two cards of the same type!':'翻开两张同类卡片试试看！';
    cards.forEach(it=>{
      const s=CAT[it.c],el=document.createElement('div');
      el.className='card';el.dataset.category=it.c;
      var catLabel=en?(s.en||s.l):s.l;
      var itemLabel=en?(it.en||it.n):it.n;
      el.innerHTML='<div class="card-inner"><div class="card-front" style="background:'+s.c+'"><span class="cname">'+catLabel+'</span><div class="clogo"><svg viewBox="0 0 24 24" fill="currentColor"><path d="'+s.i+'"/></svg></div><span class="iname">'+itemLabel+'</span></div><div class="card-back"></div></div>';
      el.addEventListener('click',function(){flip(el);});
      board.appendChild(el);
    });
  }

  function flip(card){
    if(!canFlip||card.classList.contains('flipped')||card.classList.contains('matched'))return;
    card.classList.add('flipped');flipped.push(card);
    var en=isEn();
    if(flipped.length===2){
      canFlip=false;var a=flipped[0],b=flipped[1];
      if(a.dataset.category===b.dataset.category){
        a.classList.add('matched');b.classList.add('matched');flipped=[];matched+=2;canFlip=true;
        status.textContent=en?'Match!':'配对成功！';
        if(matched===cards.length){
          status.textContent=en?'All matched! Well done!':'恭喜你完成全部配对！';
          window.dispatchEvent(new CustomEvent('section-complete',{detail:{id:'interest'}}));
        }
      } else {
        status.textContent=en?'No match, try again':'不匹配，再试一次';
        setTimeout(function(){a.classList.remove('flipped');b.classList.remove('flipped');flipped=[];canFlip=true;status.textContent=en?'Keep flipping!':'继续翻开两张卡片吧';},900);
      }
    }
  }

  sBtn.addEventListener('click',init);
  init();
})();
