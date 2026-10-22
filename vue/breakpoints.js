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
    'adminTool', 'usersManagement', 'tagsManagement', 'mediasManagement',
    'pagesManagement', 'experiencesManagement', 'commentsManagement',
    'analytics', 'sceneEditor', 'messagesManagement',
  ]);
  window.isAdminAllowed = function () { return window.isDesktopMode(); };
})();
