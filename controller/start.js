// --------------------------------------
// DEVICE DETECTION
// --------------------------------------
let userDevice = "desktop";

function updateUserDevice() {
  const WIDTH = window.innerWidth;
  const USER_AGENT = navigator.userAgent.toLowerCase();

  const IS_IPAD =
    /ipad/.test(USER_AGENT) ||
    (navigator.maxTouchPoints > 1 && /mac/.test(USER_AGENT));

  const IS_ANDROID_TABLET =
    /android/.test(USER_AGENT) && !/mobile/.test(USER_AGENT);

  if (WIDTH <= 800 || /mobile|iphone|android/.test(USER_AGENT)) {
    userDevice = "mobile";
  } else if (WIDTH <= 1917 || IS_IPAD || IS_ANDROID_TABLET) {
    userDevice = "tablet";
  } else {
    userDevice = "desktop";
  }
}

updateUserDevice();
window.addEventListener("resize", updateUserDevice);

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
  setTimeout(() => {
  displayMainLogo();
  }, 2000);

  setTimeout(() => {
    displayConnexionBoxDesktop();
    displayLanguageSelectorDesktop();
  }, 2300);

  setTimeout(() => {
    displayLatNav();
  }, 2600);

  setTimeout(() => {
    displaySocialIconsDesktop();
  }, 3400);

  setTimeout(() => {
    displayHome();
  }, 3600);

  setTimeout(() => {
    displayLatNavTextStart();
  }, 5000);

  setTimeout(() => {
    hideLatNavTextStart();
  }, 6500);

  setTimeout(() => {
    activateLatNav();
    activateNavigation();
  }, 7500);
}


document.addEventListener("DOMContentLoaded", startSequence);
