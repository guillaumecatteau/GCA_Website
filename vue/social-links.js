// =============================================================================
// SOCIAL LINKS — Application des réglages "Liens sociaux" (admin tool / Settings) aux
// listes d'icônes réseaux sociaux de la navigation (desktop/tablette/mobile).
// =============================================================================
// Chaque lien social de la navigation porte un attribut [data-social="<network>"] (cf.
// templates/partials/nav-desktop.php, nav-tablet.php, nav-mobile.php). Au chargement, on
// applique l'URL configurée (href) et on masque les réseaux désactivés — même pattern que
// window._scrollSettings/_launchSettings (cf. vue/breakpoints.js) : valeurs par défaut
// immédiates, écrasées dès que la requête admin_status répond.
// =============================================================================
(function () {
  'use strict';

  // Défauts = comportement actuel avant cette fonctionnalité (tous les réseaux déjà en dur
  // affichés, sauf Instagram qui est nouveau et n'a pas encore d'URL connue).
  window._socialLinksSettings = {
    artstation: { enabled: true, url: 'https://www.artstation.com/gcdigitalarts' },
    linkedin:   { enabled: true, url: 'https://www.linkedin.com/in/guillaumecatteau/' },
    youtube:    { enabled: true, url: 'https://www.youtube.com/@GuillaumeCatteau' },
    facebook:   { enabled: true, url: 'https://www.facebook.com/guillaume.catteau' },
    x:          { enabled: true, url: 'https://x.com/GC_DigitalArts' },
    instagram:  { enabled: false, url: '' },
  };

  function _applySocialLinks(settings) {
    document.querySelectorAll('[data-social]').forEach((el) => {
      const network = el.dataset.social;
      const data = settings[network];
      if (!data) return;
      if (data.url) el.setAttribute('href', data.url);
      el.style.display = data.enabled ? '' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    _applySocialLinks(window._socialLinksSettings);
    fetch('controller/controller.php?action=admin_status')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success || !json.socialLinks) return;
        window._socialLinksSettings = json.socialLinks;
        _applySocialLinks(window._socialLinksSettings);
      })
      .catch(() => {});
  });
})();
