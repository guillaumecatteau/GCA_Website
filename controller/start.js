// --------------------------------------
// DEVICE DETECTION
// --------------------------------------
let userDevice = "desktop";

function updateUserDevice() {
  const USER_AGENT = navigator.userAgent.toLowerCase();

  const IS_IPAD =
    /ipad/.test(USER_AGENT) ||
    (navigator.maxTouchPoints > 1 && /mac/.test(USER_AGENT));

  const IS_ANDROID_TABLET =
    /android/.test(USER_AGENT) && !/mobile/.test(USER_AGENT);

  // Détection basée UNIQUEMENT sur le User Agent et les capacités tactiles
  // La taille de la fenêtre n'affecte pas le device détecté
  if (/mobile|iphone|ipod|android.*mobile/.test(USER_AGENT)) {
    userDevice = "mobile";
  } else if (IS_IPAD || IS_ANDROID_TABLET) {
    userDevice = "tablet";
  } else {
    userDevice = "desktop";
  }
}

updateUserDevice();
// Le resize n'affecte plus la détection du device
// window.addEventListener("resize", updateUserDevice);

// --------------------------------------
// DEVICE → ANIMATION DEVICE MAPPING
// --------------------------------------
function getAnimationDevice() {
  if (userDevice === "desktop") return "desktop";
  return "mobile"; // mobile + tablet → mobile
}
// rendre la fonction accessible globalement
window.getAnimationDevice = getAnimationDevice;


// --------------------------------------
// SEQUENCE D’INTRO
// --------------------------------------

function startSequence() {
  startBackground();

  // Deep link : sauter l'intro et aller directement à la page cible
  const deepPage = window._routerInit?.();
  if (deepPage) {
    setTimeout(() => {
      displayMainLogo();
      displayConnexionBoxDesktop();
      displayLanguageSelectorDesktop();
      displaySearchBoxDesktop();
      activateNavigation();
      window._routerNavigate(deepPage);
    }, 400);
    return;
  }

  // Intro normale — chaque élément révélé est désormais planifié via la chronologie
  // d'intro configurable (cf. vue/intro-timeline.js, Settings admin tool → "Lancement du
  // site"), relative au moment où la scène 3D commence à jouer son état "intro"
  // (évènement 'gca-intro-start', PAS ce DOMContentLoaded). schedule() gère lui-même
  // l'inapplicabilité par device (ex: "mainLogo" n'est pas planifié sur mobile).
  window._introTimeline?.schedule('mainLogo', displayMainLogo);
  window._introTimeline?.schedule('topInputs', () => {
    displayConnexionBoxDesktop();
    displayLanguageSelectorDesktop();
    displaySearchBoxDesktop();
  });
  window._introTimeline?.schedule('burgerIcon', displayBurgerIcon);

  // displayHome() construit IMMÉDIATEMENT (dès que possible) le contenu/scroller de la home —
  // ce sont UNIQUEMENT les révélations visuelles qu'elle contient (titre principal, icônes
  // latérales, icône de scroll) qui sont désormais planifiées individuellement en son sein
  // via la même chronologie (cf. vue/navigation.js). setTimeout(…, 0) plutôt qu'un appel
  // synchrone ici : navigation.js enregistre son propre listener 'DOMContentLoaded' (qui
  // initialise CNT_HOME et les autres références globales qu'utilise displayHome()) APRÈS
  // celui de ce fichier (cf. ordre des <script> dans templates/partials/scripts.php) — un
  // appel synchrone s'exécuterait donc avant cette initialisation.
  setTimeout(() => { displayHome(); }, 0);

  setTimeout(() => {
    activateNavigation();
  }, 7500);
}


document.addEventListener("DOMContentLoaded", startSequence);
