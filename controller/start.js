let USERDEVICE = "desktop";

function updateUserDevice() {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  const isIpad =
    /ipad/.test(userAgent) ||
    (navigator.maxTouchPoints > 1 && /mac/.test(userAgent));
  const isAndroidTablet =
    /android/.test(userAgent) && !/mobile/.test(userAgent);

  if (width <= 800 || /mobile|iphone|android/.test(userAgent)) {
    USERDEVICE = "mobile";
  } else if (width <= 1917 || isIpad || isAndroidTablet) {
    USERDEVICE = "tablet";
  } else {
    USERDEVICE = "desktop";
  }
}

updateUserDevice();

window.addEventListener("resize", updateUserDevice);

function startSequence() {
  displayMainLogo();
  setTimeout(() => {
    displayConnexionBoxDesktop()
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
  activateLatNav()
  activateNavigation()
  }, 5500);
}

document.addEventListener("DOMContentLoaded", startSequence);
