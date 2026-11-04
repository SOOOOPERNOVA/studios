/* ============================================================
   ONT Studios — 샘플 사이트 공통 안내 배너
   ============================================================ */
(function () {
  var BADGE = 'SAMPLE';
  var TITLE = '본 페이지는 포트폴리오용 샘플 페이지입니다.';
  var SUB   = '전체 화면은 상담 시 보여드립니다.';

  if (document.getElementById('ont-sample-notice')) return; // 중복 삽입 방지

  var css =
    '#ont-sample-notice{position:relative;z-index:50;background:#FCEBE3;border-bottom:1px solid #F5CDBB;color:#3A2A24;font-family:inherit;}' +
    '#ont-sample-notice .sn-in{max-width:1440px;margin:0 auto;padding:12px 48px 12px 16px;display:flex;align-items:center;justify-content:center;gap:12px;text-align:center;box-sizing:border-box;}' +
    '#ont-sample-notice .sn-badge{display:none;flex-shrink:0;align-items:center;gap:6px;border-radius:999px;background:#E5511E;color:#fff;font-size:12px;font-weight:800;letter-spacing:.05em;padding:4px 12px;line-height:1.5;}' +
    '#ont-sample-notice .sn-dot{position:relative;display:inline-flex;width:8px;height:8px;}' +
    '#ont-sample-notice .sn-dot::before,#ont-sample-notice .sn-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:#fff;}' +
    '#ont-sample-notice .sn-dot::before{opacity:.6;animation:ont-sn-ping 1s cubic-bezier(0,0,.2,1) infinite;}' +
    '@keyframes ont-sn-ping{75%,100%{transform:scale(2);opacity:0;}}' +
    '#ont-sample-notice p{margin:0;font-size:13px;line-height:1.6;letter-spacing:-0.01em;}' +
    '#ont-sample-notice b{font-weight:600;}' +
    '#ont-sample-notice .sn-sub{display:block;}' +
    '#ont-sample-notice .sn-close{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:rgba(58,42,36,.7);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background .2s,color .2s;}' +
    '#ont-sample-notice .sn-close:hover{color:#3A2A24;background:rgba(229,81,30,.1);}' +
    '#ont-sample-notice .sn-close svg{width:14px;height:14px;display:block;}' +
    '@media(min-width:640px){' +
      '#ont-sample-notice .sn-in{padding:12px 48px 12px 24px;gap:16px;}' +
      '#ont-sample-notice .sn-badge{display:inline-flex;}' +
      '#ont-sample-notice p{font-size:14px;}' +
      '#ont-sample-notice .sn-sub{display:inline;margin-left:.3em;}' +
      '#ont-sample-notice .sn-close{right:20px;}' +
    '}' +
    '@media(min-width:1024px){#ont-sample-notice .sn-in{padding-left:32px;}}' +
    '@media(prefers-reduced-motion:reduce){#ont-sample-notice .sn-dot::before{animation:none;}}';

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'ont-sample-notice';
    bar.setAttribute('role', 'note');
    bar.innerHTML =
      '<div class="sn-in">' +
        '<span class="sn-badge"><span class="sn-dot" aria-hidden="true"></span>' + BADGE + '</span>' +
        '<p><b>' + TITLE + '</b><span class="sn-sub">' + SUB + '</span></p>' +
      '</div>' +
      '<button type="button" class="sn-close" aria-label="안내 닫기">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>';

    bar.querySelector('.sn-close').addEventListener('click', function () { bar.remove(); });
    document.body.insertBefore(bar, document.body.firstChild);
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
