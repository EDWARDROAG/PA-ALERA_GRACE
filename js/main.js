/**
 * Orquestador principal del index con parciales.
 */
(function () {
  'use strict';

  function initHeaderNavToggle() {
    var btn = document.getElementById('nav-toggle');
    var nav = document.getElementById('nav-main');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setYear() {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  async function init() {
    try {
      if (window.PanaleraLoader && typeof window.PanaleraLoader.loadPanels === 'function') {
        await window.PanaleraLoader.loadPanels();
      }
      if (window.PanaleraWhatsApp && typeof window.PanaleraWhatsApp.init === 'function') {
        window.PanaleraWhatsApp.init();
      }
      if (window.PanaleraTheme && typeof window.PanaleraTheme.init === 'function') {
        window.PanaleraTheme.init();
      }
      if (window.PanaleraHomePanels && typeof window.PanaleraHomePanels.init === 'function') {
        window.PanaleraHomePanels.init();
      }
      initHeaderNavToggle();
      setYear();
    } catch (err) {
      console.error('[main.js] Error cargando paneles:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
