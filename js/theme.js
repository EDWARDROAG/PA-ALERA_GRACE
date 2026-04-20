/**
 * Tema niño/niña + filtrado de catálogo en home.
 */
(function () {
  'use strict';

  var MODE_KEY = 'pañalera-theme';
  var initialized = false;

  function productMatchesMode(card, mode) {
    var g = (card.getAttribute('data-genero') || 'neutral').trim();
    if (g === 'neutral') return true;
    if (mode === 'nino') return g === 'nino';
    if (mode === 'nina') return g === 'nina';
    return true;
  }

  function syncCategoryVisibility() {
    document.querySelectorAll('.category-block').forEach(function (block) {
      var hasAny = false;
      block.querySelectorAll('.producto-card[data-genero]').forEach(function (card) {
        if (!card.hidden && card.getAttribute('aria-hidden') !== 'true') hasAny = true;
      });
      block.hidden = !hasAny;
      block.style.display = hasAny ? '' : 'none';
    });
  }

  function updateCatalogProductCount() {
    var bar = document.getElementById('catalog-count-bar');
    var root = document.getElementById('catalog-root');
    if (!bar || !root) return;
    var panel = root.closest('.app-panel');
    if (panel && panel.hasAttribute('hidden')) {
      bar.textContent = '';
      return;
    }
    var cards = root.querySelectorAll('.producto-card[data-genero]');
    var total = cards.length;
    var vis = 0;
    cards.forEach(function (c) {
      if (!c.hidden && c.getAttribute('aria-hidden') !== 'true') vis++;
    });
    bar.textContent = 'Mostrando ' + vis + ' de ' + total + ' productos';
  }

  function filterCatalog(mode) {
    var cards = document.querySelectorAll('main .producto-card[data-genero]');
    cards.forEach(function (card) {
      var show = productMatchesMode(card, mode);
      card.hidden = !show;
      card.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
    syncCategoryVisibility();
    updateCatalogProductCount();
  }

  function applyBodyClass(mode) {
    var body = document.body;
    body.classList.remove('modo-nino', 'modo-nina');
    if (mode === 'nino') body.classList.add('modo-nino');
    else body.classList.add('modo-nina');
  }

  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode !== 'nino' && mode !== 'nina') mode = 'nino';
    root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch (e) {}

    applyBodyClass(mode);
    filterCatalog(mode);

    var label = document.getElementById('theme-label');
    if (label) label.textContent = mode === 'nino' ? 'niño' : 'niña';

    document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
      var m = btn.getAttribute('data-theme-btn');
      var active = m === mode;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
  }

  function normalizeMode(raw) {
    if (raw === 'home') return 'nino';
    if (raw === 'nino' || raw === 'nina') return raw;
    return 'nino';
  }

  function init() {
    if (initialized) return;
    initialized = true;

    var raw = document.documentElement.getAttribute('data-theme');
    applyTheme(normalizeMode(raw));

    document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = btn.getAttribute('data-theme-btn');
        if (m === 'nino' || m === 'nina') applyTheme(m);
      });
    });
  }

  window.addEventListener('pañalera:panel', function () {
    updateCatalogProductCount();
  });

  window.PanaleraTheme = {
    init: init,
    applyTheme: applyTheme
  };
})();
