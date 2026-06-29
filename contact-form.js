/* ============================================================
   ONT — Contact form (Formspree AJAX)
   페이지 이동 없이, 그 자리에서 "접수 완료" 메시지를 띄움.

   사용법: contact.html 의 </body> 바로 위에 아래 한 줄 추가
       <script src="contact-form.js"></script>
   (기존 styles.css / script.js 는 수정할 필요 없음)
   ============================================================ */
(function () {
  var form = document.querySelector('.form');
  if (!form) return;

  var action = form.getAttribute('action') || '';
  // Formspree 주소가 들어간 폼만 처리 (그 외엔 기본 동작 유지)
  if (!/formspree\.io/.test(action)) return;

  /* --- 이 기능 전용 스타일 주입 (styles.css 안 건드림) --- */
  var css =
    '.form__status{font-size:15px;line-height:1.7;color:#555;margin:6px 0 0;}' +
    '.form__status:empty{display:none;}' +
    '.form__status.is-err{color:#c0392b;}' +
    '.form.is-sent > *{display:none;}' +
    '.form.is-sent .form__status{display:block;text-align:center;padding:48px 0;}' +
    '.form.is-sent .form__status .t{display:block;font-size:clamp(20px,2.4vw,26px);' +
      'font-weight:600;color:#111;letter-spacing:-.02em;margin-bottom:10px;}' +
    '.form.is-sent .form__status .s{display:block;font-size:15px;color:#555;}';
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
  var btnLabel = btn ? btn.textContent : '문의 보내기 →';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    if (btn) { btn.disabled = true; btn.textContent = '보내는 중…'; }

    fetch(action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    })
    .then(function (res) {
      if (res.ok) {
        form.reset();
        status.innerHTML =
          '<span class="t">문의가 접수되었습니다 ✓</span>' +
          '<span class="s">감사합니다.</span>';
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
      status.textContent = '전송에 실패했어요. 잠시 후 다시 시도하거나 이메일로 연락 주세요.';
    })
    .finally(function () {
      if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
    });
  });
})();