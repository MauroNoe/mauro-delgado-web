// MAURO DELGADO — comportamiento base del sitio
document.addEventListener('DOMContentLoaded', function () {
  // Menú móvil
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // Selector de idioma EN/ES (inglés por defecto, persistente vía localStorage)
  var langBtn = document.querySelector('.lang-switch');
  var html = document.documentElement;
  var saved = localStorage.getItem('md_lang');
  if (saved) { html.setAttribute('lang', saved); }
  updateLangLabel();
  updateTitle();

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var current = html.getAttribute('lang') === 'en' ? 'en' : 'es';
      var next = current === 'es' ? 'en' : 'es';
      html.setAttribute('lang', next);
      localStorage.setItem('md_lang', next);
      updateLangLabel();
      updateTitle();
    });
  }

  function updateLangLabel() {
    if (!langBtn) return;
    var current = html.getAttribute('lang') === 'en' ? 'en' : 'es';
    langBtn.textContent = current === 'es' ? 'EN' : 'ES';
  }

  function updateTitle() {
    var current = html.getAttribute('lang') === 'en' ? 'en' : 'es';
    var title = html.getAttribute('data-title-' + current);
    if (title) { document.title = title; }
  }

  // Año en el footer
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // Banner de cookies
  initCookieBanner();

  function initCookieBanner() {
    if (localStorage.getItem('md_cookie_consent')) return;
    var isEn = html.getAttribute('lang') === 'en';
    var banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.setAttribute('style', 'position:fixed; left:0; right:0; bottom:0; z-index:999; background:var(--navy); color:#e6e9f0; padding:18px 20px; font-family:var(--sans); font-size:0.85rem; box-shadow:0 -2px 14px rgba(0,0,0,0.15);');
    banner.innerHTML =
      '<div style="max-width:1100px; margin:0 auto; display:flex; align-items:center; gap:20px; flex-wrap:wrap; justify-content:space-between;">' +
        '<p style="margin:0; flex:1; min-width:240px; line-height:1.5;">' +
          (isEn
            ? 'This site uses essential technical cookies (language preference, form submission) and no third-party advertising trackers. <a href="cookies.html" style="color:#fff; text-decoration:underline;">Learn more</a>.'
            : 'Esta web utiliza cookies técnicas esenciales (preferencia de idioma, envío de formularios) y no usa cookies de publicidad de terceros. <a href="cookies.html" style="color:#fff; text-decoration:underline;">Más información</a>.') +
        '</p>' +
        '<div style="display:flex; gap:10px; flex-shrink:0;">' +
          '<button id="cookieAccept" style="background:var(--gold); color:var(--navy); border:none; padding:10px 18px; border-radius:4px; font-weight:700; font-family:var(--sans); font-size:0.85rem; cursor:pointer;">' + (isEn ? 'Accept' : 'Aceptar') + '</button>' +
          '<button id="cookieReject" style="background:transparent; color:#e6e9f0; border:1px solid rgba(255,255,255,0.4); padding:10px 18px; border-radius:4px; font-weight:700; font-family:var(--sans); font-size:0.85rem; cursor:pointer;">' + (isEn ? 'Essential only' : 'Solo esenciales') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);
    document.getElementById('cookieAccept').addEventListener('click', function () {
      localStorage.setItem('md_cookie_consent', 'accepted');
      banner.remove();
    });
    document.getElementById('cookieReject').addEventListener('click', function () {
      localStorage.setItem('md_cookie_consent', 'essential-only');
      banner.remove();
    });
  }
});
