// -------- Smooth scroll (Lenis) --------
(function(){
  if(typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.4,
  });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id = a.getAttribute('href');
      if(id && id.length > 1 && document.querySelector(id)){
        e.preventDefault();
        lenis.scrollTo(id, { offset: -40, duration: 1.6 });
      }
    });
  });
})();

// -------- Menu overlay: open/close --------
(function(){
  const overlay = document.getElementById('menuOverlay');
  const btn = document.getElementById('menuBtn');
  const close = document.getElementById('menuClose');
  if(!overlay || !btn) return;
  function setOpen(v){
    overlay.classList.toggle('is-open', v);
    btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    document.body.style.overflow = v ? 'hidden' : '';
  }
  btn.addEventListener('click', ()=> setOpen(true));
  close && close.addEventListener('click', ()=> setOpen(false));
  document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') setOpen(false); });
  overlay.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=> setTimeout(()=> setOpen(false), 40));
  });
})();

// -------- Curious card: auto-flip + click-to-open dropdown --------
(function(){
  const root = document.getElementById('curious');
  if(!root) return;
  const card = document.getElementById('curiousCard');
  const words = root.querySelectorAll('.curious-word');
  const opts = root.querySelectorAll('.curious-opt');
  let idx = 0, timer = null, paused = false;

  function setIdx(n){
    idx = ((n % words.length) + words.length) % words.length;
    words.forEach((w,i)=>{
      w.classList.remove('is-active','is-past');
      if(i === idx) w.classList.add('is-active');
      else if(i < idx) w.classList.add('is-past');
    });
    opts.forEach((o,i)=>o.classList.toggle('is-selected', i === idx));
  }
  function tick(){ if(!paused) setIdx(idx + 1); }
  function start(){ stop(); timer = setInterval(tick, 2400); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  function setOpen(v){
    root.setAttribute('data-open', v ? 'true' : 'false');
    card.setAttribute('aria-expanded', v ? 'true' : 'false');
    paused = v;
    if(!v) start();
  }

  card.addEventListener('click', (e)=>{
    if(e.target.closest('.curious-panel')) return;
    e.stopPropagation();
    setOpen(root.getAttribute('data-open') !== 'true');
  });
  card.addEventListener('keydown',(e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      setOpen(root.getAttribute('data-open') !== 'true');
    }
  });
  opts.forEach((o)=>{
    o.addEventListener('click',(e)=>{
      e.stopPropagation();
      setIdx(parseInt(o.dataset.i, 10));
      setOpen(false);
    });
  });
  document.addEventListener('click',(e)=>{
    if(root.getAttribute('data-open') === 'true' && !root.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') setOpen(false); });

  start();
})();

// -------- Reveal-on-scroll --------
(function(){
  const els = document.querySelectorAll('.reveal,.stagger,.fan');
  if(!els.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.12});
  els.forEach(el=>io.observe(el));
})();

// -------- Pin section: scroll-progress → state 0|1|2 --------
(function(){
  const pin = document.getElementById('pin');
  if(!pin) return;
  const track = document.getElementById('pinScroll');
  const card = document.getElementById('pinCard');
  const words = pin.querySelectorAll('.pin-word');
  const bars = pin.querySelectorAll('.pin-bar');
  if(!track || !card) return;
  const ACCENTS = ['#ff3a3a','#1f46ff','#ffffff'];
  let state = 0;
  let raf = null;
  const T = [0, 1/3, 2/3, 1];

  function setState(n){
    if(n === state) return;
    state = n;
    words.forEach((w,i)=>{
      w.classList.remove('is-active','is-past');
      if(i === n) w.classList.add('is-active');
      else if(i < n) w.classList.add('is-past');
    });
    pin.style.setProperty('--accent', ACCENTS[n]);
    card.setAttribute('data-state', n);
  }
  function clamp01(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }

  function onScroll(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{
      raf = null;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? scrolled / total : 0;

      let n = 0;
      if(p >= T[1]) n = 1;
      if(p >= T[2]) n = 2;
      setState(n);

      for(let i = 0; i < bars.length; i++){
        const f = clamp01((p - T[i]) / (T[i+1] - T[i]));
        bars[i].style.setProperty('--fill', f.toFixed(4));
      }
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();
})();
