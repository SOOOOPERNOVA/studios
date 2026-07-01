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