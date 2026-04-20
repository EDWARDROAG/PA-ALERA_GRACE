/**
 * Pañalera Grace — WhatsApp, formulario y modo niño / niña.
 * CONFIG debe cargarse antes (config.js).
 */
(function () {
  'use strict';

  var MODE_KEY = 'pañalera-theme';
  var initialized = false;

  /** @type {{ empresa?: { whatsapp?: string }; textos?: { whatsappMensaje?: string } }} */
  var cfg = typeof window.CONFIG !== 'undefined' ? window.CONFIG : {};
  var waDigits = String(cfg.empresa && cfg.empresa.whatsapp ? cfg.empresa.whatsapp : '0000000000000').replace(/\D/g, '');

  function encodeText(s) {
    return encodeURIComponent(s);
  }

  function buildWaUrl(message) {
    return 'https://wa.me/' + waDigits + '?text=' + encodeText(message);
  }

  function bindProductLinks() {
    var nodes = document.querySelectorAll('[data-wa-product]');
    nodes.forEach(function (el) {
      var name = el.getAttribute('data-wa-product') || '';
      var msg = 'Hola, quiero comprar ' + name;
      el.setAttribute('href', buildWaUrl(msg));
      el.setAttribute('rel', 'noopener noreferrer');
      el.setAttribute('target', '_blank');
    });
  }

  function bindGeneralLinks() {
    var defaultMsg =
      (cfg.textos && cfg.textos.whatsappMensaje) ||
      'Hola, quiero conocer sus productos para bebé';
    document.querySelectorAll('[data-wa-general]').forEach(function (el) {
      el.setAttribute('href', buildWaUrl(defaultMsg));
      el.setAttribute('rel', 'noopener noreferrer');
      el.setAttribute('target', '_blank');
    });
  }

  /** Refuerzo por si el href aún no está listo: abre WhatsApp con el mensaje correcto */
  function bindWaClickFallback() {
    if (!waDigits || waDigits.replace(/0/g, '') === '') return;
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest('[data-wa-product], [data-wa-general]');
        if (!el) return;
        var href = el.getAttribute('href') || '';
        if (href.indexOf('wa.me') !== -1) return;
        e.preventDefault();
        var msg;
        if (el.hasAttribute('data-wa-product')) {
          msg = 'Hola, quiero comprar ' + (el.getAttribute('data-wa-product') || 'un producto');
        } else {
          msg =
            (cfg.textos && cfg.textos.whatsappMensaje) ||
            'Hola, quiero conocer sus productos para bebé';
        }
        window.open(buildWaUrl(msg), '_blank', 'noopener,noreferrer');
      },
      true
    );
  }

  function bindSocialLinks() {
    var e = cfg.empresa;
    if (!e) return;
    var links = [
      ['social-instagram', e.instagram],
      ['social-facebook', e.facebook],
      ['social-tiktok', e.tiktok],
      ['social-youtube', e.youtube]
    ];
    links.forEach(function (row) {
      var el = document.getElementById(row[0]);
      if (!el) return;
      var u = String(row[1] == null ? '' : row[1]).trim();
      if (u) {
        el.setAttribute('href', u);
        el.classList.add('is-configured');
      }
    });
  }

  function bindContactFields() {
    var e = cfg.empresa;
    if (!e) return;
    document.querySelectorAll('[data-contact-field]').forEach(function (node) {
      var key = node.getAttribute('data-contact-field');
      if (!key || e[key] == null) return;
      var val = String(e[key]).trim();
      if (!val) return;
      var strong = node.querySelector('strong');
      if (strong) strong.textContent = val;
      else node.textContent = val;
    });
  }

  function bindForm() {
    var form = document.getElementById('formulario-contacto');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = (form.querySelector('[name="nombre"]') || {}).value || '';
      var tel = (form.querySelector('[name="telefono"]') || {}).value || '';
      var producto = (form.querySelector('[name="producto"]') || {}).value || '';
      var mensaje = (form.querySelector('[name="mensaje"]') || {}).value || '';
      var lines = [
        'Hola, solicito información:',
        'Nombre: ' + nombre,
        'Teléfono: ' + tel,
        'Producto de interés: ' + producto,
        'Mensaje: ' + mensaje
      ].join('\n');
      window.open(buildWaUrl(lines), '_blank', 'noopener,noreferrer');
    });
  }

  /** @param {'nino'|'nina'} mode */
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

  /** @param {'nino'|'nina'} mode */
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

  /** @param {'nino'|'nina'} mode */
  function applyBodyClass(mode) {
    var body = document.body;
    body.classList.remove('modo-nino', 'modo-nina');
    if (mode === 'nino') body.classList.add('modo-nino');
    else body.classList.add('modo-nina');
  }

  /** @param {'nino'|'nina'} mode */
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
    if (label) {
      label.textContent = mode === 'nino' ? 'niño' : 'niña';
    }

    document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
      var m = btn.getAttribute('data-theme-btn');
      var active = m === mode;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });

    bindProductLinks();
  }

  function normalizeMode(raw) {
    if (raw === 'home') return 'nino';
    if (raw === 'nino' || raw === 'nina') return raw;
    return 'nino';
  }

  function initBabyTheme() {
    var raw = document.documentElement.getAttribute('data-theme');
    applyTheme(normalizeMode(raw));

    document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var m = btn.getAttribute('data-theme-btn');
        if (m === 'nino' || m === 'nina') applyTheme(m);
      });
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    initBabyTheme();
    bindContactFields();
    bindProductLinks();
    bindGeneralLinks();
    bindWaClickFallback();
    bindSocialLinks();
    bindForm();
    updateCatalogProductCount();
  }

  window.addEventListener('pañalera:panel', function () {
    updateCatalogProductCount();
  });

  window.PanaleraLanding = {
    init: init
  };

  if (window.__PANALERA_DEFER_INIT__ === true) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
