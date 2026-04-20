/**
 * WhatsApp, contacto y redes (home con parciales).
 */
(function () {
  'use strict';

  var initialized = false;
  var cfg = typeof window.CONFIG !== 'undefined' ? window.CONFIG : {};
  var waDigits = String(cfg.empresa && cfg.empresa.whatsapp ? cfg.empresa.whatsapp : '0000000000000').replace(/\D/g, '');

  function encodeText(s) {
    return encodeURIComponent(s);
  }

  function buildWaUrl(message) {
    return 'https://wa.me/' + waDigits + '?text=' + encodeText(message);
  }

  function bindProductLinks() {
    document.querySelectorAll('[data-wa-product]').forEach(function (el) {
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

  function init() {
    if (initialized) return;
    initialized = true;
    bindContactFields();
    bindProductLinks();
    bindGeneralLinks();
    bindWaClickFallback();
    bindSocialLinks();
    bindForm();
  }

  window.PanaleraWhatsApp = {
    init: init,
    bindProductLinks: bindProductLinks
  };
})();
