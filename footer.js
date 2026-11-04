/* ============================================================
   ONT Studios — 공통 푸터
   여기만 고치면 전 페이지(메인·케이스) 반영
   사용법: 각 페이지에서 기존 <footer> 자리에 아래 두 줄
       <div id="site-footer"></div>
       <script src="/footer.js"></script>
   ============================================================ */
(function () {
  var slot = document.getElementById('site-footer');
  if (!slot) return;
  slot.outerHTML =
    '<footer class="footer">' +
      '<div class="footer__inner">' +
        '<p class="footer__copy">© 2022–' + new Date().getFullYear() + ' ONT. All rights reserved.</p>' +
        '<nav class="footer__links" aria-label="하단 메뉴">' +
          '<a href="https://ont.co.kr/" target="_blank" rel="noopener">ONT</a>' +
          '<a href="/about.html">About</a>' +
          '<a href="/contact.html">Contact</a>' +
        '</nav>' +
      '</div>' +
    '</footer>';
})();