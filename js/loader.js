/**
 * Carga parciales HTML de paneles y los inserta en .app-panels.
 */
(function () {
  'use strict';

  var PANELS = [
    { id: 'panel-inicio', panel: 'inicio', label: 'Inicio', file: 'partials/panel-inicio.html', active: true },
    { id: 'panel-catalogo', panel: 'catalogo', label: 'Catálogo de productos', file: 'partials/panel-catalogo.html' },
    { id: 'panel-baby', panel: 'baby', label: 'Baby shower', file: 'partials/panel-baby.html' },
    { id: 'panel-nosotros', panel: 'nosotros', label: 'Nosotros', file: 'partials/panel-nosotros.html' },
    { id: 'panel-porque', panel: 'porque', label: 'Por qué elegirnos', file: 'partials/panel-porque.html' },
    { id: 'panel-redes', panel: 'redes', label: 'Redes sociales', file: 'partials/panel-redes.html' },
    { id: 'panel-contacto', panel: 'contacto', label: 'Contacto', file: 'partials/panel-contacto.html' }
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function panelWrapper(meta, inner) {
    var classes = 'app-panel' + (meta.active ? ' is-active' : '');
    var hidden = meta.active ? '' : ' hidden';
    var ariaHidden = meta.active ? 'false' : 'true';
    return (
      '<div id="' +
      escapeHtml(meta.id) +
      '" class="' +
      classes +
      '" data-panel="' +
      escapeHtml(meta.panel) +
      '" role="region" aria-label="' +
      escapeHtml(meta.label) +
      '" aria-hidden="' +
      ariaHidden +
      '"' +
      hidden +
      '>\n' +
      inner +
      '\n</div>'
    );
  }

  async function loadPanels() {
    var host = document.querySelector('.app-panels');
    if (!host) return;

    var tasks = PANELS.map(async function (meta) {
      var res = await fetch(meta.file, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar ' + meta.file);
      var html = await res.text();
      return panelWrapper(meta, html.trim());
    });

    var all = await Promise.all(tasks);
    host.innerHTML = all.join('\n\n');
  }

  window.PanaleraLoader = {
    loadPanels: loadPanels
  };
})();
