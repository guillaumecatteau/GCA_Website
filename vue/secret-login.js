// =============================================================================
// SECRET LOGIN — Accès caché à l'écran de connexion admin
// =============================================================================
// Demande : "Lorsqu'on est sur l'écran d'accueil du site (et uniquement lorsqu'on
// est sur cet écran) un event listener devra être mis en place (uniquement sur la
// version desktop) pour détecter si le code "Neko&Keiko2025" est tapé sur le
// clavier (en moins de 5 secondes à partir du moment où la première lettre est
// entrée). Si cette action est détectée, la page de connexion s'affichera alors."
// =============================================================================
(function () {
  'use strict';

  const SECRET_CODE = 'Neko&Keiko2025';
  const TIMEOUT_MS = 5000;

  let buffer = '';
  let firstKeyAt = 0;

  function reset() {
    buffer = '';
    firstKeyAt = 0;
  }

  function onKeydown(e) {
    // Ignore les modificateurs seuls, et toute saisie dans un champ de formulaire
    // (ne doit jamais interférer avec la frappe normale d'un utilisateur).
    if (e.key.length !== 1) return;
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

    const now = Date.now();
    if (!buffer || now - firstKeyAt > TIMEOUT_MS) {
      buffer = '';
      firstKeyAt = now;
    }
    buffer += e.key;

    // Ne garder que les derniers caractères utiles (évite une accumulation infinie)
    if (buffer.length > SECRET_CODE.length) {
      buffer = buffer.slice(-SECRET_CODE.length);
    }

    if (buffer === SECRET_CODE) {
      reset();
      window.accessConnexion?.();
    }
  }

  // Actif uniquement sur la home, et uniquement en desktop — réévalué à chaque
  // changement de page/section et au resize (cf. vue/breakpoints.js).
  function syncListener() {
    const shouldListen = window.page === 'home' && window.isDesktopMode?.();
    if (shouldListen) {
      document.addEventListener('keydown', onKeydown);
    } else {
      document.removeEventListener('keydown', onKeydown);
      reset();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    syncListener();
    // `page` change à chaque navigation (cf. controller/router.js, vue/navigation.js) —
    // pas d'évènement dédié, on réévalue simplement à intervalle léger.
    setInterval(syncListener, 500);
  });
  window.addEventListener('resize', syncListener);
})();
