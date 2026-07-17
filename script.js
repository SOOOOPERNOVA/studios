/* ============================================================
   portfolio filter (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  var buttons = document.querySelectorAll('.filters button');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  if (!buttons.length || !cards.length) return;

  function apply(filter) {
    var i = 0;
    cards.forEach(function (card) {
      var match = (filter === 'all') || (card.getAttribute('data-cat') === filter);
      card.classList.toggle('is-hidden', !match);
      if (match) {
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
        card.style.animationDelay = (i * 0.035) + 's';
        i++;
      }
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      apply(btn.getAttribute('data-filter'));
    });
  });
})();

/* ============================================================
   카드 호버 시 영상 미리보기 — 최대 3초, 1회 재생 후 첫 프레임 복귀
   ============================================================ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  var PREVIEW_SEC = 5;

  document.querySelectorAll('.card').forEach(function (card) {
    var vid = card.querySelector('.card__vid');
    if (!vid) return;

    function stop() { vid.pause(); vid.currentTime = 0; }

    vid.addEventListener('timeupdate', function () {
      if (vid.currentTime >= PREVIEW_SEC) stop();
    });
    vid.addEventListener('ended', stop);

    card.addEventListener('mouseenter', function () {
      vid.currentTime = 0;
      vid.play().catch(function(){});
    });
    card.addEventListener('mouseleave', stop);
  });
})();

/* ============================================================
   Droplet lens — 마우스 따라다니는 물방울이 지나가면 글자가 확대·또렷
   모션 최소화 설정에서만 비활성. (터치기기는 mousemove가 없어 자연히 안 뜸)
   ============================================================ */
(function () {
  /* 물방울은 커서 따라다니는 장식이라 모션 설정과 무관하게 표시 */
  if (window.matchMedia('(hover: none)').matches) return;
  var cache = [];

  /* 1) 물방울부터 띄운다 — 글자 감싸기가 실패해도 물방울은 항상 동작 */
  var drop = document.createElement('div');
  drop.className = 'droplet';
  drop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(drop);

  var mx = window.innerWidth / 2, my = window.innerHeight / 2, dx = mx, dy = my, on = false;
  window.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!on) { on = true; drop.classList.add('is-on'); }
  }, { passive: true });
  window.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget) { on = false; drop.classList.remove('is-on'); }
  });

  var R = 80, MAX = 0.15;
  function frame() {
    dx += (mx - dx) * 0.18;
    dy += (my - dy) * 0.18;
    drop.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';

    if (cache.length) {
      var px = dx + (window.scrollX || window.pageXOffset);
      var py = dy + (window.scrollY || window.pageYOffset);
      for (var i = 0; i < cache.length; i++) {
        var c = cache[i];
        var d = Math.hypot(c.x - px, c.y - py);
        var s = d < R ? 1 + (1 - d / R) * MAX : 1;
        if (Math.abs(s - c.s) > 0.008) {
           c.s = s;
           if (s > 1.01) {
            c.ch.style.transform = 'scale(' + s.toFixed(3) + ')';
            c.ch.style.position = 'relative';
            c.ch.style.zIndex = '1';
            c.ch.classList.add('lens-on');     // ← 색은 클래스로
        } else {
            c.ch.style.transform = '';
            c.ch.style.zIndex = '';
            c.ch.classList.remove('lens-on');
          }
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* 2) 확대 대상 텍스트를 글자 단위로 감싸기 (실패해도 물방울은 계속 동작) */
  try {
    var SEL = '.intro h1, .about-do__title, .approach-line, .section__title, .cta h2';

    function buildFrag(text) {
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (tok) {
        if (tok === '') return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
        var word = document.createElement('span');
        word.className = 'lens-word';
        for (var i = 0; i < tok.length; i++) {
          var ch = document.createElement('span');
          ch.className = 'lens-ch';
          ch.textContent = tok[i];
          word.appendChild(ch);
        }
        frag.appendChild(word);
      });
      return frag;
    }
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.nodeValue.trim() !== '') {
          node.replaceChild(buildFrag(n.nodeValue), n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('lens-word')) {
          wrap(n);
        }
      });
    }
    document.querySelectorAll(SEL).forEach(wrap);

    var chars = Array.prototype.slice.call(document.querySelectorAll('.lens-ch'));
    function recache() {
      var sx = window.scrollX || window.pageXOffset;
      var sy = window.scrollY || window.pageYOffset;
      cache = chars.map(function (ch) {
        var r = ch.getBoundingClientRect();
        return { ch: ch, x: r.left + r.width / 2 + sx, y: r.top + r.height / 2 + sy, s: 1 };
      });
    }
    recache();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(recache);
    window.addEventListener('load', recache);
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(recache, 150); });
  } catch (err) { /* 글자 확대만 실패, 물방울은 정상 */ }
})();


(function(){
  var loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = '<img class="page-loader__flower" src="/images/flower-loader.svg" alt="" aria-hidden="true">';
  document.body.appendChild(loader);

  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')
        || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    if (href === window.location.pathname.split('/').pop()) return; // 같은 페이지면 스킵

    e.preventDefault();
    loader.classList.add('is-active');
    setTimeout(function(){ window.location.href = href; }, 380);
  });

  window.addEventListener('pageshow', function(){
    loader.classList.remove('is-active');
  });
})();
