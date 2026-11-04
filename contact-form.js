/* ============================================================
   ONT — Contact form (Formspree AJAX)
   페이지 이동 없이, 그 자리에서 "접수 완료" 메시지를 띄움.
       <script src="contact-form.js"></script>
   ============================================================ */
(function () {
  var form = document.querySelector('.form');
  if (!form) return;

  var action = form.getAttribute('action') || '';
  // Formspree 주소가 들어간 폼만 처리 (그 외엔 기본 동작 유지)
  if (!/formspree\.io/.test(action)) return;

  /* --- 이 기능 전용 스타일 주입 (styles.css 안 건드림) --- */
  var css =
    '.form__status{font-size:15px;line-height:1.7;color:#333;margin:6px 0 0;}' +
    '.form__status:empty{display:none;}' +
    '.form__status.is-err{color:#c0392b;}' +
    '.form.is-sent > *{display:none;}' +
    '.form.is-sent .form__status{display:block;text-align:center;padding:48px 0;}' +
    '.form.is-sent .form__status .t{display:block;font-size:clamp(20px,2.4vw,26px);' +
      'font-weight:600;color:#111;letter-spacing:-.02em;margin-bottom:10px;}' +
    '.form.is-sent .form__status .s{display:block;font-size:15px;color:#333;}';
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* --- 상태 메시지 요소 --- */
  var status = document.createElement('p');
  status.className = 'form__status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.appendChild(status);

  var btn = form.querySelector('button[type="submit"]');
  var btnTxt = btn ? (btn.querySelector('.btn-hl__txt') || btn) : null;  // 버튼 안 글자 span만 바꿈 (밑줄 장식 유지)
  var btnLabel = btnTxt ? btnTxt.textContent : '문의 보내기';

  /* --- 링크 입력란: https:// 자동 보정 ---
     공백 없는 한 덩어리 주소일 때만 (여러 개·설명 섞인 입력은 그대로 둠) */
  function fixUrl(el) {
    var v = el.value.trim();
    if (v && !/\s/.test(v) && v.indexOf('.') > -1 && !/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) {
      el.value = 'https://' + v;
    }
  }
  var urlFields = form.querySelectorAll('input[inputmode="url"]');
  urlFields.forEach(function (el) {
    el.addEventListener('blur', function () { fixUrl(el); });
  });

  /* --- 메일 제목용 유형 이름 (긴 선택지는 짧게) --- */
  var TYPE_LABEL = {
    '아직 잘 모르겠어요 · 상담 원해요': '상담'
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    urlFields.forEach(fixUrl);   // 엔터로 바로 제출한 경우 대비
    status.className = 'form__status';
    status.textContent = '';
    if (btn) { btn.disabled = true; btnTxt.textContent = '보내는 중…'; }

    /* --- 메일 제목: [ONT Studios] 유형 문의 · 이름 --- */
    var fd = new FormData(form);
    if (!fd.get('_subject')) {
      var type = (fd.get('type') || '').toString().trim();
      type = TYPE_LABEL[type] || type;
      var who  = (fd.get('name') || '').toString().trim();
      var subj = '[ONT Studios] ' + (type ? type + ' 문의' : '프로젝트 문의');
      if (who) subj += ' · ' + who;
      fd.set('_subject', subj);
    }

    fetch(action, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        form.reset();
        status.innerHTML =
          '<span class="t">문의가 접수되었습니다 ✓</span>' +
          '<span class="s">감사합니다. 영업일 기준 순차적으로 회신드립니다.</span>';
        form.classList.add('is-sent');
      } else {
        return res.json().then(function (d) {
          var msg = (d && d.errors)
            ? d.errors.map(function (x) { return x.message; }).join(' / ')
            : '전송에 실패했어요.';
          throw new Error(msg);
        });
      }
    })
    .catch(function () {
      status.classList.add('is-err');
      status.innerHTML = '전송에 실패했어요. 잠시 후 다시 시도하거나 ' +
        '<a href="mailto:studios@ont.co.kr" style="text-decoration:underline">studios@ont.co.kr</a> 로 연락 주세요.';
    })
    .finally(function () {
      if (btn) { btn.disabled = false; btnTxt.textContent = btnLabel; }
    });
  });
})();