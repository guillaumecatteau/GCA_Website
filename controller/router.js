// Routeur SPA — History API pushState
// Chaque page a un slug propre, le back/forward browser fonctionne,
// et un accès direct par URL saute l'intro et charge la page cible.
(function () {
  'use strict';

  // page-key (variable `page`) → slug URL
  const _SLUG = {
    'home':                  '/home',
    'connexion':             '/connexion',
    'register':              '/register',
    'userProfile':           '/me',
    'adminTool':             '/admin',
    'usersManagement':       '/admin/users',
    'tagsManagement':        '/admin/tags',
    'mediasManagement':      '/admin/medias',
    'pagesManagement':       '/admin/pages',
    'experiencesManagement': '/admin/experiences',
    'commentsManagement':    '/admin/comments',
    'analytics':             '/admin/analytics',
    'sceneEditor':           '/admin/scene',
    'messagesManagement':    '/admin/messages',
  };

  // slug URL → page-key
  const _ROUTES = {
    '':                  'home',
    'home':              'home',
    'connexion':         'connexion',
    'register':          'register',
    'me':                'userProfile',
    'admin':             'adminTool',
    'admin/users':       'usersManagement',
    'admin/tags':        'tagsManagement',
    'admin/medias':      'mediasManagement',
    'admin/pages':       'pagesManagement',
    'admin/experiences': 'experiencesManagement',
    'admin/comments':    'commentsManagement',
    'admin/analytics':   'analytics',
    'admin/scene':       'sceneEditor',
    'admin/messages':    'messagesManagement',
  };

  // Empêche la boucle pushState ↔ popstate
  let _suppressPush = false;

  // Le main logo (mobile only, cf. _main-nav.scss) ne doit s'afficher que pour la home —
  // seul point de vérité pour ce booléen, pas de logique dupliquée par page.
  function _syncBodyPage(key) {
    document.body.classList.toggle('page-home', key === 'home');
  }

  // Remplace toutes les assignations `page = "xxx"` dans navigation.js
  window._setPage = function (key) {
    page = key;
    _syncBodyPage(key);
    if (_suppressPush) return;
    const slug = _SLUG[key] || ('/' + key);
    if (window.location.pathname !== slug) {
      history.pushState({ page: key }, '', slug);
    }
  };

  // Met à jour le slug quand on scrolle entre les sections de la home (replaceState)
  window._updateHomeSection = function (sectionId) {
    const slug = (sectionId && sectionId !== 'landing') ? `/home/${sectionId}` : '/home';
    if (window.location.pathname !== slug) {
      history.replaceState({ page: 'home', section: sectionId }, '', slug);
    }
  };

  // Empile l'URL /p/{slug} pour une page projet/expertise/blog (détail public)
  window._pushPageViewSlug = function (slug) {
    page = 'pageView';
    _syncBodyPage(page);
    if (_suppressPush) return;
    const url = '/p/' + slug;
    if (window.location.pathname !== url) {
      history.pushState({ page: 'pageView', slug }, '', url);
    }
  };

  // L'admin tool n'est accessible qu'en mode desktop — registre partagé avec navigation.js
  // (cf. vue/breakpoints.js, chargé avant ce script).
  function _navigate(key) {
    if (window.ADMIN_ROUTE_KEYS?.has(key) && !window.isAdminAllowed?.()) key = 'home';
    _suppressPush = true;
    try {
      switch (key) {
        case 'home':                  accessHome(); break;
        case 'connexion':             accessConnexion(); break;
        case 'register':              accessRegister(); break;
        case 'userProfile':           accessUserProfile(); break;
        case 'adminTool':             accessAdminTool(); break;
        case 'usersManagement':       accessUsersManagement(); break;
        case 'tagsManagement':        accessTagsManagement(); break;
        case 'mediasManagement':      accessMediasManagement(); break;
        case 'pagesManagement':       accessPagesManagement(); break;
        case 'experiencesManagement': accessExperiencesManagement(); break;
        case 'commentsManagement':    accessCommentsManagement(); break;
        case 'analytics':             accessAnalytics(); break;
        case 'sceneEditor':           accessSceneEditor(); break;
        case 'messagesManagement':    accessMessagesManagement(); break;
      }
    } finally {
      // Ré-activer pushState après la transition (500ms max)
      setTimeout(() => { _suppressPush = false; }, 600);
    }
  }

  // Retour / avance navigateur
  window.addEventListener('popstate', () => {
    const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');

    // Page projet/expertise/blog (détail public)
    if (path.startsWith('p/')) {
      _suppressPush = true;
      window.accessPageView?.(path.slice(2));
      setTimeout(() => { _suppressPush = false; }, 700);
      return;
    }

    // Sous-section home (ex: home/expertise)
    if (path.startsWith('home/')) {
      const section = path.slice(5);
      _suppressPush = true;
      if (page === 'home') {
        window._homeScrollTo?.(section);
      } else {
        accessHome();
        setTimeout(() => window._homeScrollTo?.(section), 600);
      }
      setTimeout(() => { _suppressPush = false; }, 700);
      return;
    }

    const key = _ROUTES[path] ?? 'home';
    _navigate(key);
  });

  // Appelé depuis startSequence() — retourne la page-key (ou objet {page,section}) si deep link
  window._routerInit = function () {
    const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!path || path === 'home') return false;
    if (path.startsWith('home/')) return { page: 'home', section: path.slice(5) };
    if (path.startsWith('p/')) return { page: 'pageView', slug: path.slice(2) };
    return _ROUTES[path] ?? false;
  };

  // Exposé pour startSequence() et popstate home
  window._routerNavigate = function (keyOrObj) {
    if (keyOrObj && typeof keyOrObj === 'object' && keyOrObj.page === 'home') {
      // Deep link vers une section de la home
      _suppressPush = true;
      displayHome();
      page = 'home';
      _syncBodyPage(page);
      const target = keyOrObj.section;
      if (target && target !== 'landing') {
        setTimeout(() => window._homeScrollTo?.(target), 100);
      }
      setTimeout(() => { _suppressPush = false; }, 700);
      return;
    }
    if (keyOrObj && typeof keyOrObj === 'object' && keyOrObj.page === 'pageView') {
      // Deep link direct vers une page projet/expertise/blog
      _suppressPush = true;
      window.accessPageView?.(keyOrObj.slug);
      setTimeout(() => { _suppressPush = false; }, 700);
      return;
    }
    _navigate(keyOrObj);
  };

})();
