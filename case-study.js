/* Case study motion layer: hero reveal, spotlight, parallax, tilt, magnetic buttons,
   before/after slider, counters and scroll progress. All effects respect reduced motion. */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(pointer: fine)').matches;
  var raf=window.requestAnimationFrame;

  // Split the hero title into masked lines (words grouped per line)
  var h1=document.querySelector('.c-hero h1[data-lines]');
  if(h1){var lines=h1.getAttribute('data-lines').split('|');h1.setAttribute('aria-label',lines.join(' '));
    h1.innerHTML=lines.map(function(l,i){return '<span class="ln" aria-hidden="true"><span style="--i:'+i+'">'+l+'</span></span>';}).join('');}
  document.querySelectorAll('.c-hero .facts div').forEach(function(d,i){d.style.setProperty('--i',i);});
  document.querySelectorAll('.built li').forEach(function(li,i){li.style.setProperty('--i',i%8);});

  // Scroll progress + hero parallax
  var bar=document.querySelector('.progress'),bg=document.querySelector('.c-bg img'),hero=document.querySelector('.c-hero'),tick=false;
  function onScroll(){tick=false;var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    if(bg&&!reduce&&y<innerHeight*1.2)bg.style.setProperty('--py',(y*.28).toFixed(1)+'px');}
  addEventListener('scroll',function(){if(!tick){tick=true;raf(onScroll);}},{passive:true});onScroll();

  // Pointer spotlight on the hero
  if(hero&&fine&&!reduce){hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();
    hero.style.setProperty('--mx',(e.clientX-r.left)+'px');hero.style.setProperty('--my',(e.clientY-r.top)+'px');});}

  // Magnetic buttons
  if(fine&&!reduce){document.querySelectorAll('.btn-cta,.btn-ghost').forEach(function(b){b.classList.add('mag');
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
      b.style.transform='translate('+(x*.18).toFixed(1)+'px,'+(y*.28).toFixed(1)+'px)';});
    b.addEventListener('pointerleave',function(){b.style.transform='';});});}

  // 3D tilt with glare
  if(fine&&!reduce){document.querySelectorAll('[data-tilt]').forEach(function(el){el.classList.add('tilt');
    var g=document.createElement('span');g.className='glare';el.appendChild(g);var max=+el.getAttribute('data-tilt')||8;
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      el.classList.add('is-live');el.style.setProperty('--ry',((px-.5)*max*2).toFixed(2)+'deg');el.style.setProperty('--rx',((.5-py)*max*2).toFixed(2)+'deg');
      el.style.setProperty('--gx',(px*100)+'%');el.style.setProperty('--gy',(py*100)+'%');});
    el.addEventListener('pointerleave',function(){el.classList.remove('is-live');el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});});}

  // Before / after slider (drag, click, keyboard via range input)
  document.querySelectorAll('[data-compare]').forEach(function(c){var input=c.querySelector('input');
    function set(v){c.style.setProperty('--pos',v+'%');input.value=v;}
    input.addEventListener('input',function(){set(input.value);});
    if(reduce||!('IntersectionObserver' in window))return;
    var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();
      var t0=null,keys=[[0,50],[.35,18],[.8,82],[1.2,50]];
      function step(t){if(!t0)t0=t;var s=(t-t0)/1000,v=50;for(var k=1;k<keys.length;k++){if(s<=keys[k][0]){var a=keys[k-1],b=keys[k],p=(s-a[0])/(b[0]-a[0]);p=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;v=a[1]+(b[1]-a[1])*p;break;}}
        if(s>=keys[keys.length-1][0])v=50;set(v.toFixed(1));if(s<keys[keys.length-1][0])raf(step);}
      setTimeout(function(){raf(step);},400);},{threshold:.6});io.observe(c);});


  // Pointer drag anywhere on the comparison (backup for browsers that ignore the hidden range input)
  document.querySelectorAll('[data-compare]').forEach(function(c){var input=c.querySelector('input'),down=false;
    function at(e){var r=c.getBoundingClientRect(),v=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));c.style.setProperty('--pos',v.toFixed(1)+'%');input.value=v;}
    c.addEventListener('pointerdown',function(e){down=true;c.setPointerCapture(e.pointerId);at(e);e.preventDefault();});
    c.addEventListener('pointermove',function(e){if(down)at(e);});
    c.addEventListener('pointerup',function(){down=false;});c.addEventListener('pointercancel',function(){down=false;});});
  // Count-up numbers
  document.querySelectorAll('[data-count]').forEach(function(el){var to=+el.getAttribute('data-count');if(reduce){el.textContent=to;return;}
    var t0=null;el.textContent='1';setTimeout(function(){raf(function s(t){if(!t0)t0=t;var p=Math.min(1,(t-t0)/1100);el.textContent=Math.round(1+(to-1)*(1-Math.pow(1-p,3)));if(p<1)raf(s);});},1500);});

  // Scroll reveals
  var els=document.querySelectorAll('.rv,.built');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){io.observe(e)});
})();
