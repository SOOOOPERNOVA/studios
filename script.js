/* ============================================================
   ONT — script  (배경은 HTML의 .ont-bg가 담당 / JS는 필터 + 물방울)
   ============================================================ */

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
    var SEL = '.intro h1, .about-do__title, .approach-line, .section__title, .cta h2, .service__name, .filters button';

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

/* ============================================================
   배경 오브제 — .ont-bg 안에 추상 도형 SVG를 깔아줌
   ============================================================ */
(function () {
  var bg = document.querySelector('.ont-bg');
  if (!bg) return;

  // 심볼 정의
  bg.insertAdjacentHTML('beforeend',
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<symbol id="o0" viewBox="0 0 100 100"><path d="M50,15 C65,15 75,25 70,40 C68,46 62,50 62,50 C62,50 68,54 70,60 C75,75 65,85 50,85 C35,85 25,75 30,60 C32,54 38,50 38,50 C38,50 32,46 30,40 C25,25 35,15 50,15 Z" fill="#F9B752"/></symbol>' +
    '<symbol id="o1" viewBox="0 0 100 100"><path d="M25,25 Q50,5 75,25 Q85,35 75,50 L55,50 L75,75 Q65,95 40,85 Q20,75 25,50 L45,50 Z" fill="#F24E31"/></symbol>' +
    '<symbol id="o2" viewBox="0 0 100 100"><g stroke="#C39BD3" stroke-width="12" stroke-linecap="round"><line x1="50" y1="20" x2="50" y2="80"/><line x1="20" y1="50" x2="80" y2="50"/><line x1="29" y1="29" x2="71" y2="71"/><line x1="29" y1="71" x2="71" y2="29"/></g></symbol>' +
    '<symbol id="o3" viewBox="0 0 100 100"><path d="M30,35 C30,15 75,20 75,45 C75,70 50,85 30,65 C15,50 30,45 30,35 Z" fill="#F9B752"/></symbol>' +
    '<symbol id="o4" viewBox="0 0 100 100"><path d="M50,20 C72,18 82,38 78,58 C74,78 52,82 32,72 C12,62 28,22 50,20 Z" fill="#B7D9EA"/></symbol>' +
    '<symbol id="o5" viewBox="0 0 100 100"><g fill="#FBC937"><circle cx="50" cy="20" r="14"/><circle cx="50" cy="40" r="14"/><circle cx="50" cy="60" r="14"/><circle cx="50" cy="80" r="14"/></g></symbol>' +
    '<symbol id="o6" viewBox="0 0 100 100"><g fill="#F16946"><circle cx="50" cy="25" r="16"/><circle cx="74" cy="42" r="16"/><circle cx="65" cy="70" r="16"/><circle cx="35" cy="70" r="16"/><circle cx="26" cy="42" r="16"/><circle cx="50" cy="50" r="18"/></g></symbol>' +
    '<symbol id="o7" viewBox="0 0 300 300"><path d="M 35,270 C 100,280 110,210 70,180 C 30,150 170,170 150,100 C 130,30 250,70 260,30" fill="none" stroke="#F39DC4" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/></symbol>' +
     '<symbol id="o8" viewBox="0 0 100 100"><path d="M 10 70 L 90 70 C 90 35, 63.3 35, 63.3 70 C 63.3 35, 36.6 35, 36.6 70 C 36.6 35, 10 35, 10 70 Z" fill="#59B96E"/></symbol>' +
    '</defs></svg>');

  // [심볼, left%, top%, 크기px, 회전°, 부유Y, 부유회전, 주기s, 딜레이s, 모바일숨김]
  var OBJ = [
    ['o7', -3,  -5, 290, 250,  -8,  3, 13,  0, false], // pink
    ['o2', 60, 21, 140,  0,  10,  8, 14, .3, true ], // aesterisk
    ['o0', 90,  6, 140,  0,  -8,  4, 13, .9, false], // yellow layer2
    ['o5', 32, 40, 260,  0,  -9,  3, 12, .7, true ], // yellow layer4
    ['o1', 19, 80, 130, -8,  -9,  5, 12, .4, true ], // red
    ['o4', -5, 82, 210,  0,  10, -4, 14, .4, false], // skyblue
    ['o8', 60, 62, 560,  0,  -8,  3, 13, .6, false]  // green
  ];
  OBJ.forEach(function (o) {
    var d = document.createElement('div');
    d.className = 'obj' + (o[9] ? ' m-hide' : '');
    d.style.cssText =
      'left:' + o[1] + '%;top:' + o[2] + '%;--w:' + o[3] + 'px;--r:' + o[4] +
      'deg;--dy:' + o[5] + 'px;--dr:' + o[6] + 'deg;--dur:' + o[7] + 's;--delay:' + o[8] + 's';
    d.innerHTML = '<svg><use href="#' + o[0] + '"/></svg>';
    bg.appendChild(d);
  });
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