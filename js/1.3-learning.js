// ===== 1.3 Colorful Knowledge Bubbles =====
(function(){
  var TOPICS=(window.MODULE_DATA&&window.MODULE_DATA.bubbleTopics)||[];

  var isEn = function(){ return document.documentElement.lang === 'en'; };
  var container=document.getElementById('kSpores');if(!container)return;
  var canvas=document.getElementById('spCanvas'),area=document.getElementById('spArea'),hint=document.getElementById('spHint');
  var ov=document.getElementById('spOv'),oT=document.getElementById('spOvTerm'),oD=document.getElementById('spOvDesc'),ovBox=ov?ov.querySelector('.sp-ov-box'):null;
  var MIN_B=6,AMP=22,FBASE=5;
  var bubs=[],parts=[],t0=0,raf=0,focused=false;

  function resize(){var r=container.getBoundingClientRect(),d=devicePixelRatio||1;canvas.width=r.width*d;canvas.height=r.height*d;canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';var ctx=canvas.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.scale(d,d);}
  function hex(h){var n=parseInt(h.slice(1),16);return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function explode(cx,cy,h){var c=hex(h);for(var i=0;i<14;i++){var a=Math.PI*2*i/14+Math.random()*.4,s=2+Math.random()*4;parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:.018+Math.random()*.015,r:c.r,g:c.g,b:c.b});}}

  function makeBub(){
    var topic=TOPICS[Math.floor(Math.random()*TOPICS.length)];
    var r=container.getBoundingClientRect(),sz=55+Math.random()*38;
    var bx=sz+Math.random()*(r.width-sz*2),y=r.height+sz;
    var el=document.createElement('div');el.className='sp-bub';
    el.style.width=el.style.height=sz+'px';
    el.style.left=(bx-sz/2)+'px';el.style.top=(y-sz/2)+'px';
    // Colored bubble matching topic
    var c=hex(topic.color);
    el.style.background='radial-gradient(circle at 30% 25%, rgba(255,255,255,.6) 0%, rgba(255,255,255,.15) 30%, transparent 55%),radial-gradient(circle at 70% 75%, rgba(255,255,255,.12) 0%, transparent 40%),radial-gradient(circle at 50% 50%, rgba('+c.r+','+c.g+','+c.b+',.35) 0%, rgba('+c.r+','+c.g+','+c.b+',.15) 50%, rgba('+c.r+','+c.g+','+c.b+',.05) 100%)';
    el.style.border='1.5px solid rgba('+c.r+','+c.g+','+c.b+',.35)';
    el.style.boxShadow='inset 0 0 20px rgba(255,255,255,.08), 0 4px 20px rgba('+c.r+','+c.g+','+c.b+',.12)';
    el.textContent=isEn()?(topic.en||topic.name):topic.name;
    var state={el:el,y:y-sz/2,bx:bx,phase:Math.random()*Math.PI*2,spd:(r.height+100)/(FBASE*60),topic:topic,sz:sz};
    bubs.push(state);area.appendChild(el);
    el.addEventListener('click',function(e){
      e.stopPropagation();var rr=container.getBoundingClientRect();
      explode(e.clientX-rr.left,e.clientY-rr.top,state.topic.color);
      var entries=state.topic.entries||[];
      if(entries.length){
        var en=entries[Math.floor(Math.random()*entries.length)];
        oT.textContent=isEn()?(en.en||en.term):en.term;
        oD.textContent=isEn()?(en.descEn||en.desc):en.desc;
        // Color the overlay box border
        if(ovBox) ovBox.style.borderColor='rgba('+c.r+','+c.g+','+c.b+',.35)';
        if(ovBox) ovBox.style.boxShadow='0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba('+c.r+','+c.g+','+c.b+',.08)';
        oT.style.color=state.topic.color;
        ov.classList.add('vis');focused=true;
      }
      state.el.remove();bubs=bubs.filter(function(b){return b!==state;});
    });
    return state;
  }

  function tick(t){
    if(!container.isConnected){cancelAnimationFrame(raf);return;}
    var r=container.getBoundingClientRect(),dt=(t-t0)/1000;t0=t;
    var ctx=canvas.getContext('2d');ctx.clearRect(0,0,r.width,r.height);
    parts=parts.filter(function(p){p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;p.life-=p.decay;if(p.life<=0)return false;ctx.globalAlpha=p.life;ctx.fillStyle='rgb('+p.r+','+p.g+','+p.b+')';ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return true;});
    var sf=focused?.15:1;
    bubs.forEach(function(b){b.y-=b.spd*60*dt*sf;var nx=b.bx+AMP*Math.sin(t*.002+b.phase);b.el.style.left=(nx-b.sz/2)+'px';b.el.style.top=b.y+'px';});
    bubs=bubs.filter(function(b){if(b.y<-b.sz){b.el.remove();return false;}return true;});
    if(bubs.length<MIN_B)makeBub();
    raf=requestAnimationFrame(tick);
  }

  resize();window.addEventListener('resize',resize);
  hint.classList.add('vis');setTimeout(function(){hint.classList.add('fade');},2500);
  for(var i=0;i<MIN_B;i++){(function(idx){setTimeout(function(){makeBub();},idx*350);})(i);}
  t0=performance.now();raf=requestAnimationFrame(tick);
  ov.addEventListener('click',function(){ov.classList.remove('vis');focused=false;oT.style.color='';});
})();
