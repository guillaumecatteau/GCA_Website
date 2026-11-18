// =============================================================================
// BREAKPOINTS — Source unique des seuils responsive côté JS
// =============================================================================
// Chargé AVANT navigation.js / router.js / page-view.js (cf. templates/partials/scripts.php).
// Ces valeurs DOIVENT rester synchronisées avec vue/assets/scss/abstracts/_variables.scss
// ($bp-mobile / $bp-tablet / $bp-header) — aucun moyen natif de partager une valeur entre
// fichiers SCSS compilés et JS, donc centralisées ICI côté JS pour éviter que chaque script
// redéclare ses propres constantes 800/1917 (piège déjà rencontré : plusieurs copies pouvant
// diverger silencieusement).
// =============================================================================
(function () {
  'use strict';

  window.BP_MOBILE = 800;   // = $bp-mobile
  window.BP_TABLET = 1024;  // = $bp-tablet (réservé, pas utilisé par la nav actuellement)
  window.BP_HEADER = 1917;  // = $bp-header — seuil réel du passage en menu burger

  // Mode "empilé" (tablette + mobile) : menu burger actif, panels publics (page-view) dans
  // le flux au lieu d'une grille 2 colonnes. Même seuil que le mixin SCSS `wide-header`.
  window.isStackedMode = function () { return window.innerWidth <= window.BP_HEADER; };

  // Plage "tablette pure" : empilé mais pas encore mobile (assez de largeur pour des mises en
  // page intermédiaires — listes simples, alignements côte à côte). Même plage que le mixin
  // SCSS `tablet-range`.
  window.isTabletRange = function () {
    const w = window.innerWidth;
    return w > window.BP_MOBILE && w <= window.BP_HEADER;
  };

  window.isMobileMode  = function () { return window.innerWidth <= window.BP_MOBILE; };
  window.isDesktopMode = function () { return window.innerWidth > window.BP_HEADER; };

  // ---------------------------------------------------------------------------
  // Admin tool — réservé au mode desktop (cf. controller/router.js, vue/navigation.js)
  // ---------------------------------------------------------------------------
  window.ADMIN_ROUTE_KEYS = new Set([
    'adminTool', 'settingsManagement', 'tagsManagement', 'mediasManagement',
    'pagesManagement', 'experiencesManagement', 'commentsManagement',
    'analytics', 'sceneEditor',
  ]);

  // Statut admin (mode dev/production + session connectée) — cf. controller/admin_status.php.
  // En mode Dev, l'accès est toujours autorisé (comportement historique, pratique en local).
  // En mode Production, il ne l'est qu'une fois l'admin connecté (cf. secret-login.js).
  window._devMode = false;
  window._isLoggedInAdmin = false;
  window.isAdminAllowed = function () {
    return window.isDesktopMode() && (window._devMode || window._isLoggedInAdmin);
  };

  function _updateAdminButtonVisibility() {
    const btn = document.getElementById('btnDirectAdmin');
    if (!btn) return;
    btn.style.display = window.isAdminAllowed() ? '' : 'none';
  }
  window._updateAdminButtonVisibility = _updateAdminButtonVisibility;

  window._setAdminLoggedIn = function (loggedIn) {
    window._isLoggedInAdmin = !!loggedIn;
    _updateAdminButtonVisibility();
  };

  // Réglages du scroll magnétique de la home (cf. Home page — navigation), réglables depuis
  // l'écran Settings de l'admin tool. Valeurs par défaut identiques à l'ancien comportement
  // codé en dur (cf. vue/scroll.js), utilisées tant que le fetch ci-dessous n'a pas répondu.
  window._scrollSettings = { edgeHoldDelay: 2000, wheelThreshold: 10, swipeThreshold: 50 };

  // Durée (ms) du rideau noir de lancement (cf. vue/launch-overlay.js) — valeur par défaut
  // tant que le fetch ci-dessous n'a pas répondu (le rideau lui-même fait sa propre requête
  // en parallèle, au plus tôt, pour ne pas dépendre de DOMContentLoaded).
  window._launchSettings = { launchDelay: 800 };

  document.addEventListener('DOMContentLoaded', () => {
    fetch('controller/controller.php?action=admin_status')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) { window.dispatchEvent(new CustomEvent('gca-admin-status-loaded')); return; }
        window._devMode = !!json.devMode;
        window._isLoggedInAdmin = !!json.loggedIn;
        if (json.scrollSettings) window._scrollSettings = json.scrollSettings;
        if (json.launchSettings) window._launchSettings = json.launchSettings;
        _updateAdminButtonVisibility();
        // Distribue "introTimeline" à vue/intro-timeline.js (cf. chronologie d'intro
        // configurable) via un évènement plutôt qu'un 2e fetch dupliqué du même endpoint.
        window.dispatchEvent(new CustomEvent('gca-admin-status-loaded', { detail: json }));
      })
      .catch(() => { window.dispatchEvent(new CustomEvent('gca-admin-status-loaded')); });
  });
  window.addEventListener('resize', _updateAdminButtonVisibility);
})();
