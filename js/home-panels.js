/**
 * Home: una sección visible a la vez + menú lateral izquierdo (data-open-panel).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'pañalera-panel';
  var initialized = false;

  var HASH_TO_PANEL = {
    inicio: 'panel-inicio',
    catalogo: 'panel-catalogo',
    productos: 'panel-catalogo',
    'catalogo-pagina': 'panel-catalogo',
    'pagina-catalogo': 'panel-catalogo',
    'baby-shower': 'panel-baby',
    baby: 'panel-baby',
    nosotros: 'panel-nosotros',
    'por-que': 'panel-porque',
    porque: 'panel-porque',
    redes: 'panel-redes',
    'redes-sociales': 'panel-redes',
    contacto: 'panel-contacto'
  };

  var PANEL_TO_HASH = {
    'panel-inicio': 'inicio',
    'panel-catalogo': 'catalogo',
    'panel-baby': 'baby-shower',
    'panel-nosotros': 'nosotros',
    'panel-porque': 'por-que',
    'panel-redes': 'redes',
    'panel-contacto': 'contacto'
  };

  function getShell() {
    return document.querySelector('.app-shell');
  }

  function getSectionsMenuEls() {
    var shell = getShell();
    if (!shell) return null;
    return {
      shell: shell,
      backdrop: document.getElementById('sections-backdrop'),
      sidebar: document.getElementById('app-sidebar')
    };
  }

  function getSectionsToggleButtons() {
    return document.querySelectorAll('[data-sections-toggle]');
  }

  function focusFirstVisibleSectionsToggle() {
    var toggles = getSectionsToggleButtons();
    for (var i = 0; i < toggles.length; i++) {
      if (toggles[i].offsetParent !== null) {
        toggles[i].focus();
        return;
      }
    }
  }

  function setSectionsMenuOpen(open) {
    var els = getSectionsMenuEls();
    var toggles = getSectionsToggleButtons();
    if (!els || !els.backdrop || !els.sidebar || toggles.length === 0) return;
    els.shell.classList.toggle('sections-menu-open', open);
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    els.sidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      els.backdrop.removeAttribute('hidden');
    } else {
      els.backdrop.setAttribute('hidden', '');
    }
  }

  function toggleSectionsMenu() {
    var els = getSectionsMenuEls();
    if (!els || !els.shell) return;
    setSectionsMenuOpen(!els.shell.classList.contains('sections-menu-open'));
  }

  function initSectionsDrawer() {
    var els = getSectionsMenuEls();
    var toggles = getSectionsToggleButtons();
    if (!els || !els.backdrop || toggles.length === 0) return;

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleSectionsMenu();
      });
    });

    els.backdrop.addEventListener('click', function () {
      setSectionsMenuOpen(false);
    });

    var sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', function (e) {
        if (e.target.closest('a.sidebar-btn[href]')) setSectionsMenuOpen(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!els.shell.classList.contains('sections-menu-open')) return;
      setSectionsMenuOpen(false);
      focusFirstVisibleSectionsToggle();
    });
  }

  function showPanel(panelId, opts) {
    var shell = getShell();
    if (!shell || !panelId) return;

    var panels = shell.querySelectorAll('.app-panel');
    var triggers = document.querySelectorAll('[data-open-panel]');

    panels.forEach(function (p) {
      var on = p.id === panelId;
      if (on) {
        p.removeAttribute('hidden');
        p.classList.add('is-active');
        p.setAttribute('aria-hidden', 'false');
      } else {
        p.setAttribute('hidden', '');
        p.classList.remove('is-active');
        p.setAttribute('aria-hidden', 'true');
      }
    });

    triggers.forEach(function (b) {
      var target = b.getAttribute('data-open-panel');
      if (!target) return;
      var active = target === panelId;
      b.classList.toggle('is-active', active);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var stage = shell.querySelector('.app-stage');
    if (stage) stage.scrollTop = 0;

    var activePanel = document.getElementById(panelId);
    if (activePanel) {
      var heading = activePanel.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        try {
          heading.focus({ preventScroll: true });
        } catch (e2) {
          heading.focus();
        }
      }
    }

    if (!opts || !opts.skipHash) {
      var hash = PANEL_TO_HASH[panelId] || 'inicio';
      try {
        history.replaceState(null, '', '#' + hash);
      } catch (e) {}
    }

    try {
      localStorage.setItem(STORAGE_KEY, panelId);
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('pañalera:panel', { detail: { id: panelId } }));
  }

  function panelFromHash() {
    var h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
    if (!h) return null;
    return HASH_TO_PANEL[h] || null;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    if (!getShell()) return;

    document.body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open-panel]');
      if (!t || !getShell()) return;
      var href = t.getAttribute('href');
      if (t.tagName === 'A' && href && href !== '#' && href.indexOf('#') !== 0) return;
      e.preventDefault();
      var id = t.getAttribute('data-open-panel');
      if (id) showPanel(id);
      if (t.closest('.app-sidebar')) setSectionsMenuOpen(false);
    });

    initSectionsDrawer();

    var fromHash = panelFromHash();
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    var chosen = fromHash || stored || 'panel-inicio';
    if (!document.getElementById(chosen)) chosen = 'panel-inicio';

    showPanel(chosen, { skipHash: true });

    if (!window.location.hash && chosen !== 'panel-inicio') {
      try {
        history.replaceState(null, '', '#' + (PANEL_TO_HASH[chosen] || 'inicio'));
      } catch (e2) {}
    }

    window.addEventListener('hashchange', function () {
      var id = panelFromHash();
      if (id) showPanel(id, { skipHash: true });
    });
  }

  window.PanaleraHomePanels = {
    init: init,
    showPanel: showPanel
  };

  if (window.__PANALERA_DEFER_INIT__ === true) return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
