function identifyUserDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  let USERDEVICE = 'desktop';

  // Détection des tablettes (iPad et autres)
  const isIpad = /ipad/.test(userAgent) || (navigator.maxTouchPoints > 1 && /mac/.test(userAgent));
  const isAndroidTablet = /android/.test(userAgent) && !/mobile/.test(userAgent);
  
  if (isIpad || isAndroidTablet) {
      USERDEVICE = 'tablet';
  } else if (/mobile|android|iphone/.test(userAgent)) {
      USERDEVICE = 'mobile';
  }

  return USERDEVICE;
}

const USERDEVICE = identifyUserDevice();
console.log("User Device :", USERDEVICE);


const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR = document.getElementById("languageSelector");
const BTN_HOME = document.getElementById("btnHome");
const BTN_PROFIL = document.getElementById("btnProfil");
const BTN_GAMES = document.getElementById("btnGames");
const BTN_UXUI = document.getElementById("btnUxUi");
const BTN_3D = document.getElementById("btn3D");
const BTN_2D = document.getElementById("btn2D");
const BTN_VIDEO = document.getElementById("btnVideo");
const BTN_WEB = document.getElementById("btnWeb");
const BTN_PIXEL = document.getElementById("btnPixel");
const BTN_PORTFOLIO = document.getElementById("btnPortfolio");
const BTN_BLOG = document.getElementById("btnBlog");
const BTN_BIO = document.getElementById("btnBio");
const BTN_CONTACT = document.getElementById("btnContact");
const BTN_ARTSTATION = document.getElementById("btnArtstation");
const BTN_LINKEDIN = document.getElementById("btnLinkedin");
const BTN_YOUTUBE = document.getElementById("btnYoutube");
const BTN_FACEBOOK = document.getElementById("btnFacebook");
const BTN_X = document.getElementById("btnX");
const BTN_BURGER = document.getElementById("btnBurger");
const MENU_TABLETTOP = document.getElementById("menuTabletTop");
const MENU_TABLETRIGHT = document.getElementById("menuTabletRight");
const MENU_MOBILE = document.getElementById("menuMobile");


let menuTabletDeployment=false;
let menuMobileDeployment=false;

function menuTabletDeploy() {
  MENU_TABLETRIGHT.style.height = "1120px";
  MENU_TABLETRIGHT.style.opacity = "1";
  MENU_TABLETTOP.style.width = "400px";
  MENU_TABLETTOP.style.opacity = "1";
}
function menuTabletHide() {
  MENU_TABLETRIGHT.style.height = "0";
  MENU_TABLETRIGHT.style.opacity = "0";
  MENU_TABLETTOP.style.width = "0";
  MENU_TABLETTOP.style.opacity = "1";
}
function menuMobiletDeploy() {
  MENU_MOBILE.style.height = "100%";
  MENU_MOBILE.style.opacity = "1";
}
function menuMobiletHide() {
  MENU_MOBILE.style.height = "0";
  MENU_MOBILE.style.opacity = "0";
}

BTN_BURGER.addEventListener("mouseover", function () {
  BTN_BURGER.style.transform = "scale(1.1)";
});
BTN_BURGER.addEventListener("mouseout", function () {
  BTN_BURGER.style.transform = "scale(1)";
});
BTN_BURGER.addEventListener("touchstart", function (e) {
  e.preventDefault();
  BTN_BURGER.style.transform = "scale(1.1)";
});
BTN_BURGER.addEventListener("touchend", function () {
  BTN_BURGER.style.transform = "scale(1)";
});
BTN_BURGER.addEventListener("click", function () {
  
  if (menuTabletDeployment===true) {
    menuTabletHide();
    menuTabletDeployment=false;
  } else {
  menuTabletDeploy();
  menuTabletDeployment=true;
}
  if (menuMobileDeployment===true) {
    menuMobiletHide();
    menuMobileDeployment=false;
  } else {
  menuMobiletDeploy();
  menuMobileDeployment=true;
}
});




// TOP BAR DISPLAY

function displayMainLogo() {
          MAINLOGO.style.opacity = "1";
          MAINLOGO.style.marginLeft = "0";
}
function displayLanguageSelector() {
      LANGUAGESELECTOR.style.opacity = "1";
}

// DESKTOP NAV DISPLAY

const NAVLINKS = document.querySelector(".navLinks");
function displayLatNavIcons() {
    const buttons = [
      BTN_HOME,
      BTN_PROFIL,
      BTN_GAMES,
      BTN_UXUI,
      BTN_3D,
      BTN_2D,
      BTN_VIDEO,
      BTN_WEB,
      BTN_PIXEL,
      BTN_PORTFOLIO,
      BTN_BLOG,
      BTN_BIO,
      BTN_CONTACT,
    ];
    buttons.forEach((button, index) => {
      setTimeout(() => {
        const icon = button.querySelector(".icon");
        icon.style.opacity = "1";
        icon.style.marginLeft = "0";
      }, 30 * index);
    });
  }
  function displaySocialIcons() {
      const buttons = [
        BTN_ARTSTATION,
        BTN_LINKEDIN,
        BTN_YOUTUBE,
        BTN_FACEBOOK,
        BTN_X,
      ];
      buttons.forEach((button, index) => {
        setTimeout(() => {
          const icon = button.querySelector(".icon");
          icon.style.opacity = "1";
          icon.style.marginLeft = "0";
        }, 30 * index);
      });
    }

  function displayLatNavText() {
      const buttons = [
        BTN_HOME,
        BTN_PROFIL,
        BTN_GAMES,
        BTN_UXUI,
        BTN_3D,
        BTN_2D,
        BTN_VIDEO,
        BTN_WEB,
        BTN_PIXEL,
        BTN_PORTFOLIO,
        BTN_BLOG,
        BTN_BIO,
        BTN_CONTACT,
      ];
      buttons.forEach((button, index) => {
        setTimeout(function () {
          button.getElementsByTagName("h2")[0].style.opacity = "1";
        }, 30 * index);
      });
    }
    function hideLatNavText() {
        const buttons = [
          BTN_HOME,
          BTN_PROFIL,
          BTN_GAMES,
          BTN_UXUI,
          BTN_3D,
          BTN_2D,
          BTN_VIDEO,
          BTN_WEB,
          BTN_PIXEL,
          BTN_PORTFOLIO,
          BTN_BLOG,
          BTN_BIO,
          BTN_CONTACT,
        ];
        buttons.forEach((button, index) => {
        setTimeout(function () {
          button.getElementsByTagName("h2")[0].style.opacity = "0";
        }, 30 * index);
        });}
 

function runSequence() {
  displayMainLogo();
  
  displayLatNavIcons();
  BTN_HOME.classList.add("btnActive");
  displayLatNavText();
  displaySocialIcons();
  displayLanguageSelector();
  setTimeout(() => {
    hideLatNavText();
  },2000);
}

runSequence();

NAVLINKS.addEventListener('mouseenter', displayLatNavText);
NAVLINKS.addEventListener('mouseleave', () => setTimeout(hideLatNavText, 0));
