// =============================================================================
// INTRO TIMELINE — chronologie admin-configurable de la séquence d'intro de la home
// =============================================================================
// cf. Settings admin tool → "Lancement du site" → tableau "Chronologie d'intro" :
// chaque élément d'interface (logo principal, icônes latérales, titre, sous-titres…) a un
// délai de révélation réglable (ms) PAR DEVICE, relatif à t=0 = le moment où la scène 3D
// commence à JOUER son état "intro" (cf. vue/threejs-background.js, évènement custom
// 'gca-intro-start') — PAS le chargement de la page, ni la levée du rideau noir de lancement
// (cf. vue/breakpoints.js "launchSettings", mécanisme séparé et déjà existant).
//
// API publique (utilisée par controller/start.js, vue/navigation.js, vue/home-hero.js) :
//   window._introTimeline.schedule(key, fn)
//     — Enregistre fn pour être appelée au délai configuré pour "key" sur le device courant.
//       Si l'élément "key" n'est pas applicable à ce device (valeur null, cf. defaults
//       PHP), fn n'est JAMAIS appelée. Peut être appelé AVANT que t=0 ou la config ne
//       soient connus : la mise en attente est gérée en interne.
//
// Ne modifie JAMAIS le contenu de "fn" (l'animation elle-même) — se contente de retarder
// SON appel, cf. demande explicite "ne pas modifier la logique interne des animations".
// =============================================================================
(function () {
  'use strict';

  // Valeurs de repli (identiques aux défauts PHP, cf. model/model_admin.php
  // INTRO_TIMELINE_DEFAULTS) utilisées tant que le fetch admin_status n'a pas répondu.
  const DEFAULT_CONFIG = {
    mainLogo:     { desktop: 2000, tablet: 2000, mobile: null },
    lateralIcons: { desktop: 3600, tablet: null, mobile: null },
    topInputs:    { desktop: 2300, tablet: null, mobile: null },
    burgerIcon:   { desktop: null, tablet: 800,  mobile: 800 },
    mainTitle:    { desktop: 3600, tablet: 3600, mobile: 3600 },
    subtitles:    { desktop: 4500, tablet: 4500, mobile: 4500 },
    welcomeText:  { desktop: 5000, tablet: 5000, mobile: null },
    scrollIcon:   { desktop: 3600, tablet: 3600, mobile: 3600 },
  };

  // Jamais bloqué indéfiniment si l'évènement 'gca-intro-start' n'arrive jamais (scène 3D en
  // échec total) : on démarre quand même la chronologie après ce délai de sécurité, sans quoi
  // logo/nav/titre resteraient masqués pour toujours (même principe que le rideau de
  // lancement, cf. index.php SAFETY_MS).
  const SAFETY_MS = 10000;

  let _config = DEFAULT_CONFIG;
  let _t0 = null;           // performance.now() au moment du t=0 de la chronologie
  let _introStarted = false;
  let _configLoaded = false;
  let _ready = false;
  const _pending = [];      // { key, fn } en attente que _t0 ET _config soient connus

  function _device() {
    if (window.isMobileMode && window.isMobileMode()) return 'mobile';
    if (window.isTabletRange && window.isTabletRange()) return 'tablet';
    return 'desktop';
  }

  function _scheduleOne(key, device, fn) {
    const entry = _config[key];
    const ms = entry ? entry[device] : null;
    if (ms === null || ms === undefined) return; // non applicable à ce device
    const elapsed = performance.now() - _t0;
    const delay = Math.max(0, ms - elapsed);
    setTimeout(fn, delay);
  }

  function _flushPending() {
    const device = _device();
    _pending.forEach(({ key, fn }) => _scheduleOne(key, device, fn));
    _pending.length = 0;
  }

  function _maybeReady() {
    if (_ready || !_introStarted || !_configLoaded) return;
    _ready = true;
    _flushPending();
  }

  function _onIntroStart() {
    if (_introStarted) return;
    _introStarted = true;
    _t0 = performance.now();
    _maybeReady();
  }

  window._introTimeline = {
    schedule(key, fn) {
      if (typeof fn !== 'function') return;
      if (_ready) {
        _scheduleOne(key, _device(), fn);
      } else {
        _pending.push({ key, fn });
      }
    },
  };

  window.addEventListener('gca-intro-start', _onIntroStart, { once: true });

  // Rempli par vue/breakpoints.js (même fetch admin_status que devMode/scrollSettings/
  // launchSettings — évite un appel réseau dupliqué) dès que les réglages publics sont connus.
  window.addEventListener('gca-admin-status-loaded', (e) => {
    if (_configLoaded) return;
    _configLoaded = true;
    if (e.detail && e.detail.introTimeline) _config = e.detail.introTimeline;
    _maybeReady();
  }, { once: true });

  setTimeout(_onIntroStart, SAFETY_MS);
  // Repli symétrique côté config : si le fetch admin_status échoue totalement (jamais
  // d'évènement 'gca-admin-status-loaded'), on démarre quand même avec les valeurs par défaut
  // ci-dessus plutôt que de rester bloqué en attente pour toujours.
  setTimeout(() => {
    if (_configLoaded) return;
    _configLoaded = true;
    _maybeReady();
  }, SAFETY_MS);
})();
