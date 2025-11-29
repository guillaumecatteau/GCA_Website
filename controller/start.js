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
  startBackground(); // Ajout : démarre le background selon le device
  displayMainLogo();

  setTimeout(() => {
    displayConnexionBoxDesktop();
    displayLanguageSelectorDesktop();
  }, 300);

  setTimeout(() => {
    displayLatNav();
  }, 600);

  setTimeout(() => {
    displaySocialIconsDesktop();
  }, 1400);

  setTimeout(() => {
    displayHome();
  }, 1600);

  setTimeout(() => {
    displayLatNavTextStart();
  }, 3000);

  setTimeout(() => {
    hideLatNavTextStart();
  }, 4500);

  setTimeout(() => {
    activateLatNav();
    activateNavigation();
  }, 5500);
}


document.addEventListener("DOMContentLoaded", startSequence);
