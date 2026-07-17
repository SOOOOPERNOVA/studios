/* ============================================================
   ONT — Works (작업 상세) 전용 스크립트
   슬라이드 갤러리 화살표(넘칠 때만) + 라이트박스(좌우 이동)
   ※ works/*.html 에서만 불러옵니다:
       <script src="../works-script.js"></script>
   ============================================================ */
(function(){
  /* --- 슬라이드 화살표 --- */
  document.querySelectorAll('.gallery').forEach(function(g){
    var track = g.querySelector('.gallery__track');
    var prev  = g.querySelector('.gallery__btn--prev');
    var next  = g.querySelector('.gallery__btn--next');
    if(!track) return;
    function step(){ var s=track.querySelector('.gallery__slide'); return s? s.getBoundingClientRect().width+16 : 320; }
    if(prev) prev.addEventListener('click',function(){ track.scrollBy({left:-step(),behavior:'smooth'}); });
    if(next) next.addEventListener('click',function(){ track.scrollBy({left: step(),behavior:'smooth'}); });
    function syncArrows(){
      var overflow = track.scrollWidth > track.clientWidth + 4;
      [prev,next].forEach(function(b){ if(b) b.style.display = overflow ? 'flex' : 'none'; });
    }
    syncArrows();
    window.addEventListener('resize', syncArrows);
    track.querySelectorAll('img').forEach(function(img){
      if(!img.complete) img.addEventListener('load', syncArrows);
    });
  });

  /* --- 라이트박스 (갤러리 이미지 좌우 이동) --- */
  var allImgs = document.querySelectorAll('.gallery__slide img, .case__hero img');
  if(!allImgs.length) return;

  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="lightbox__close" aria-label="닫기">×</button>' +
    '<button class="lightbox__nav lightbox__nav--prev" aria-label="이전 이미지"></button>' +
    '<img alt="">' +
    '<button class="lightbox__nav lightbox__nav--next" aria-label="다음 이미지"></button>';
  document.body.appendChild(lb);
  var lbImg=lb.querySelector('img'), closeBtn=lb.querySelector('.lightbox__close'),
      prevNav=lb.querySelector('.lightbox__nav--prev'), nextNav=lb.querySelector('.lightbox__nav--next');
  var group=[], idx=0;

  function show(){ var im=group[idx]; lbImg.src=im.currentSrc||im.src; lbImg.alt=im.alt||''; }
  function open(list,i){ group=list; idx=i; show(); lb.classList.add('is-open');
    document.body.style.overflow='hidden';
    var multi=group.length>1;
    prevNav.style.display=multi?'flex':'none'; nextNav.style.display=multi?'flex':'none'; }
  function close(){ lb.classList.remove('is-open'); document.body.style.overflow=''; }
  function go(d){ if(group.length<2) return; idx=(idx+d+group.length)%group.length; show(); }

  document.querySelectorAll('.gallery').forEach(function(g){
    var list=Array.prototype.slice.call(g.querySelectorAll('.gallery__slide img'));
    list.forEach(function(img,i){ img.style.cursor='zoom-in';
      img.addEventListener('click',function(){ open(list,i); }); });
  });
  document.querySelectorAll('.case__hero img').forEach(function(img){
    img.style.cursor='zoom-in';
    img.addEventListener('click',function(){ open([img],0); });
  });

  closeBtn.addEventListener('click', close);
  prevNav.addEventListener('click', function(e){ e.stopPropagation(); go(-1); });
  nextNav.addEventListener('click', function(e){ e.stopPropagation(); go(1); });
  lb.addEventListener('click', function(e){ if(e.target===lb || e.target===lbImg) close(); });
  document.addEventListener('keydown', function(e){
    if(!lb.classList.contains('is-open')) return;
    if(e.key==='Escape') close();
    else if(e.key==='ArrowLeft') go(-1);
    else if(e.key==='ArrowRight') go(1);
  });
})();
/* ============================================================
   Scroll to top — 버튼을 JS가 생성하므로 HTML 수정 불필요
   한 화면 이상 내려가면 표시, 클릭 시 부드럽게 최상단으로
   ============================================================ */
(function(){
  var btn = document.createElement('button');
  btn.className = 'to-top';
  btn.setAttribute('aria-label', '맨 위로');
  btn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 30" fill="none" ' +
    'stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<line x1="12" y1="25" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  document.body.appendChild(btn);

  function sync(){
    btn.classList.toggle('is-show', window.scrollY > window.innerHeight);
  }
  sync();
  window.addEventListener('scroll', sync, { passive:true });

  btn.addEventListener('click', function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top:0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();

 
/* ============================================================
   Shorts — 세로 숏폼 클릭 재생
   · 재생 버튼 클릭 → 재생 (소리 켬), 다시 클릭 → 일시정지
   · 한 번에 하나만 재생 (다른 영상 재생 시 기존 것 정지)
   ============================================================ */
(function(){
  var items = document.querySelectorAll('.shorts .shorts__item');
  if(!items.length) return;
  var playing = null;
 
  items.forEach(function(v){
    // 래퍼 + 재생 버튼 생성
    var wrap = document.createElement('div');
    wrap.className = 'shorts__wrap';
    v.parentNode.insertBefore(wrap, v);
    wrap.appendChild(v);
    var btn = document.createElement('button');
    btn.className = 'shorts__play';
    btn.setAttribute('aria-label', '재생');
    wrap.appendChild(btn);
 
    function stop(){ v.pause(); wrap.classList.remove('is-playing'); if(playing===v) playing=null; }
    function start(){
      if(playing && playing!==v){                      // 다른 영상 정지
        playing.pause();
        playing.closest('.shorts__wrap').classList.remove('is-playing');
      }
      v.muted = false;                                  // 클릭 재생은 소리 켬
      v.play().catch(function(){ v.muted = true; v.play().catch(function(){}); });
      wrap.classList.add('is-playing');
      playing = v;
    }
 
    btn.addEventListener('click', start);
    v.addEventListener('click', function(){ wrap.classList.contains('is-playing') ? stop() : start(); });
    v.addEventListener('ended', stop);
  });
})();
 