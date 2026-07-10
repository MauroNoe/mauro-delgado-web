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
});
