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

const LANGUAGESELECTOR = document.getElementById("languageSelector");
/*
//on click language selector
LANGUAGESELECTOR.addEventListener("click", () => {
  console.log("click");
});

const languageSelectors = document.querySelectorAll(".languageSelector");
languageSelectors.forEach((selector) => {
  selector.addEventListener("click", (e) => {
    const selectedLanguage = e.target.getAttribute("lang");
    document.documentElement.setAttribute("lang", selectedLanguage);
    console.log(selectedLanguage);
  });
});

*/

const BTN_HOME = document.getElementById("#btnHome.btnLateral");
const BTN_PROFIL = document.getElementById("#btnProfil.btnLateral");
const BTN_GAMES = document.getElementById("#btnGames.btnLateral");
const BTN_UXUI = document.getElementById("#btnUxUi.btnLateral");
const BTN_3D = document.getElementById("#btn3D.btnLateral");
const BTN_2D = document.getElementById("#btn2D.btnLateral");
const BTN_VIDEO = document.getElementById("#btnVideo.btnLateral");
const BTN_WEB = document.getElementById("#btnWeb.btnLateral");
const BTN_PIXEL = document.getElementById("#btnPixel.btnLateral");
const BTN_PORTFOLIO = document.getElementById("#btnPortfolio.btnLateral");
const BTN_BLOG = document.getElementById("#btnBlog.btnLateral");
const BTN_BIO = document.getElementById("#btnBio.btnLateral");
const BTN_CONTACT = document.getElementById("#btnContact.btnLateral");
const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR_DESK = document.querySelector(
  "#languageSelector.langSelDesktop"
);
const BTN_HOME_DESK = document.querySelector("#btnHome.btnLateral");
const BTN_PROFIL_DESK = document.querySelector("#btnProfil.btnLateral");
const BTN_GAMES_DESK = document.querySelector("#btnGames.btnLateral");
const BTN_UXUI_DESK = document.querySelector("#btnUxUi.btnLateral");
const BTN_3D_DESK = document.querySelector("#btn3D.btnLateral");
const BTN_2D_DESK = document.querySelector("#btn2D.btnLateral");
const BTN_VIDEO_DESK = document.querySelector("#btnVideo.btnLateral");
const BTN_WEB_DESK = document.querySelector("#btnWeb.btnLateral");
const BTN_PIXEL_DESK = document.querySelector("#btnPixel.btnLateral");
const BTN_PORTFOLIO_DESK = document.querySelector("#btnPortfolio.btnLateral");
const BTN_BLOG_DESK = document.querySelector("#btnBlog.btnLateral");
const BTN_BIO_DESK = document.querySelector("#btnBio.btnLateral");
const BTN_CONTACT_DESK = document.querySelector("#btnContact.btnLateral");
const BTN_ARTSTATION_DESK = document.getElementById("btnArtstationDesktop");
const BTN_LINKEDIN_DESK = document.getElementById("btnLinkedinDesktop");
const BTN_YOUTUBE_DESK = document.getElementById("btnYoutubeDesktop");
const BTN_FACEBOOK_DESK = document.getElementById("btnFacebookDesktop");
const BTN_X_DESK = document.getElementById("btnXDesktop");
const LANGUAGESELECTOR_TABLET = document.querySelector(
  "#languageSelector.langSelTablet"
);
const BTN_HOME_TABLET = document.querySelector("#btnHome.btnTablet");
const BTN_PROFIL_TABLET = document.querySelector("#btnProfil.btnTablet");
const BTN_GAMES_TABLET = document.querySelector("#btnGames.btnTablet");
const BTN_UXUI_TABLET = document.querySelector("#btnUxUi.btnTablet");
const BTN_3D_TABLET = document.querySelector("#btn3D.btnTablet");
const BTN_2D_TABLET = document.querySelector("#btn2D.btnTablet");
const BTN_VIDEO_TABLET = document.querySelector("#btnVideo.btnTablet");
const BTN_WEB_TABLET = document.querySelector("#btnWeb.btnTablet");
const BTN_PIXEL_TABLET = document.querySelector("#btnPixel.btnTablet");
const BTN_PORTFOLIO_TABLET = document.querySelector("#btnPortfolio.btnTablet");
const BTN_BLOG_TABLET = document.querySelector("#btnBlog.btnTablet");
const BTN_BIO_TABLET = document.querySelector("#btnBio.btnTablet");
const BTN_CONTACT_TABLET = document.querySelector("#btnContact.btnTablet");
const BTN_ARTSTATION_TABLET = document.querySelector(
  "#btnArtstation.btnSocialTablet"
);
const BTN_LINKEDIN_TABLET = document.querySelector(
  "#btnLinkedin.btnSocialTablet"
);
const BTN_YOUTUBE_TABLET = document.querySelector(
  "#btnYoutube.btnSocialTablet"
);
const BTN_FACEBOOK_TABLET = document.querySelector(
  "#btnFacebook.btnSocialTablet"
);
const BTN_X_TABLET = document.querySelector("#btnX.btnSocialTablet");
const LANGUAGESELECTOR_MOBILE = document.querySelector(
  "#languageSelector.langSelMobile"
);
const BTN_HOME_MOBILE = document.querySelector("#btnHome.btnMobile");
const BTN_PROFIL_MOBILE = document.querySelector("#btnProfil.btnMobile");
const BTN_GAMES_MOBILE = document.querySelector("#btnGames.btnMobile");
const BTN_UXUI_MOBILE = document.querySelector("#btnUxUi.btnMobile");
const BTN_3D_MOBILE = document.querySelector("#btn3D.btnMobile");
const BTN_2D_MOBILE = document.querySelector("#btn2D.btnMobile");
const BTN_VIDEO_MOBILE = document.querySelector("#btnVideo.btnMobile");
const BTN_WEB_MOBILE = document.querySelector("#btnWeb.btnMobile");
const BTN_PIXEL_MOBILE = document.querySelector("#btnPixel.btnMobile");
const BTN_PORTFOLIO_MOBILE = document.querySelector("#btnPortfolio.btnMobile");
const BTN_BLOG_MOBILE = document.querySelector("#btnBlog.btnMobile");
const BTN_BIO_MOBILE = document.querySelector("#btnBio.btnMobile");
const BTN_CONTACT_MOBILE = document.querySelector("#btnContact.btnMobile");
const BTN_ARTSTATION_MOBILE = document.querySelector(
  "#btnArtstation.btnSocialMobile"
);
const BTN_LINKEDIN_MOBILE = document.querySelector(
  "#btnLinkedin.btnSocialMobile"
);
const BTN_YOUTUBE_MOBILE = document.querySelector(
  "#btnYoutube.btnSocialMobile"
);
const BTN_FACEBOOK_MOBILE = document.querySelector(
  "#btnFacebook.btnSocialMobile"
);
const BTN_X_MOBILE = document.querySelector("#btnX.btnSocialMobile");

const BTN_BURGER = document.getElementById("btnBurger");
const MENU_TABLETTOP = document.getElementById("menuTabletTop");
const MENU_TABLETRIGHT = document.getElementById("menuTabletRight");
const MENU_MOBILE = document.getElementById("menuMobile");
const MENU_MOBILECONTENT = [
  BTN_HOME_MOBILE,
  BTN_PROFIL_MOBILE,
  BTN_GAMES_MOBILE,
  BTN_UXUI_MOBILE,
  BTN_3D_MOBILE,
  BTN_2D_MOBILE,
  BTN_VIDEO_MOBILE,
  BTN_WEB_MOBILE,
  BTN_PIXEL_MOBILE,
  BTN_PORTFOLIO_MOBILE,
  BTN_BLOG_MOBILE,
  BTN_BIO_MOBILE,
  BTN_CONTACT_MOBILE,
  // BTN_ARTSTATION,
  // BTN_LINKEDIN,
  // BTN_YOUTUBE,
  // BTN_FACEBOOK,
  // BTN_X,
];

function displaySocialIconsTablet() {
  const buttons = [
    BTN_ARTSTATION_TABLET,
    BTN_LINKEDIN_TABLET,
    BTN_YOUTUBE_TABLET,
    BTN_FACEBOOK_TABLET,
    BTN_X_TABLET,
  ];
  const animationDelay = 75;
  buttons.forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "1";
      // icon.style.transformOrigin = "center right";
      icon.classList.add("rotateIn");

      icon.addEventListener(
        "animationend",
        () => {
          icon.classList.remove("rotateIn");
          icon.style.removeProperty("transform");
          icon.style.transformOrigin = "center"; // Réinitialiser après l'animation
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}

function hideSocialIconsTablet() {
  const buttons = [
    BTN_ARTSTATION_TABLET,
    BTN_LINKEDIN_TABLET,
    BTN_YOUTUBE_TABLET,
    BTN_FACEBOOK_TABLET,
    BTN_X_TABLET,
  ];
  const animationDelay = 75;
  buttons.forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "0";
      icon.style.transformOrigin = "right center";
      icon.classList.add("rotateOut");

      icon.addEventListener(
        "animationend",
        () => {
          icon.classList.remove("rotateOut");
          icon.style.removeProperty("transform");
          icon.style.removeProperty("opacity");
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}

function menuTabletDeploy() {
  MENU_TABLETRIGHT.style.height = "1120px";
  MENU_TABLETRIGHT.style.opacity = "1";
  MENU_TABLETTOP.style.width = "400px";
  MENU_TABLETTOP.style.opacity = "1";
  displaySocialIconsTablet();
}

function menuTabletHide() {
  MENU_TABLETRIGHT.style.height = "0";
  MENU_TABLETRIGHT.style.opacity = "0";
  MENU_TABLETTOP.style.width = "0";
  MENU_TABLETTOP.style.opacity = "1";
  hideSocialIconsTablet();
}
function menuMobiletDeploy() {
  MENU_MOBILE.style.height = "100%";
  MENU_MOBILE.style.opacity = "1";
  // mobileLinksDisplay();
  console.log(MENU_MOBILECONTENT);
  let mobileLinks = document.querySelectorAll(".btnMobile");
  mobileLinks.forEach((element, index) => {
    setTimeout(() => {
      // element.classList.add("bounceInTop");
    }, 30 * index);
  });
}
function menuMobiletHide() {
  MENU_MOBILE.style.height = "0";
  MENU_MOBILE.style.opacity = "0";
}

BTN_BURGER.addEventListener("pointerenter", () => {
  BTN_BURGER.style.transform = "scale(1.1)";
});

BTN_BURGER.addEventListener("pointerleave", () => {
  BTN_BURGER.style.transform = "scale(1)";
});

BTN_BURGER.addEventListener("pointerdown", (e) => {
  e.preventDefault(); // évite les glitchs sur mobile
  BTN_BURGER.style.transform = "scale(1.1)";
});

BTN_BURGER.addEventListener("pointerup", () => {
  BTN_BURGER.style.transform = "scale(1)";
});

let menuTabletDeployment = false;
let menuMobileDeployment = false;

BTN_BURGER.addEventListener("click", () => {
  updateUserDevice(); // ← garantit que la variable est toujours à jour au moment du clic

  if (USERDEVICE === "tablet") {
    menuTabletDeployment ? menuTabletHide() : menuTabletDeploy();
    menuTabletDeployment = !menuTabletDeployment;
  }

  if (USERDEVICE === "mobile") {
    menuMobileDeployment ? menuMobiletHide() : menuMobiletDeploy();
    menuMobileDeployment = !menuMobileDeployment;
  }
});

// TOP BAR DISPLAY

function displayMainLogo() {
  MAINLOGO.style.opacity = "1";
  const delayBeforeLetters = 350;

  setTimeout(() => {
    const mainLogoTextElements = document.querySelectorAll(".mainLogoText h2");
    mainLogoTextElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("rotateIn");
      }, 75 * index);
    });
  }, delayBeforeLetters);
}
function displayLanguageSelectorDesktop() {
  LANGUAGESELECTOR_DESK.style.opacity = "1";
}

// DESKTOP NAV DISPLAY

const NAVLINKS = document.querySelector(".navLinks");

function displayLatNav() {
  const buttons = [
    BTN_HOME_DESK,
    BTN_PROFIL_DESK,
    BTN_GAMES_DESK,
    BTN_UXUI_DESK,
    BTN_3D_DESK,
    BTN_2D_DESK,
    BTN_VIDEO_DESK,
    BTN_WEB_DESK,
    BTN_PIXEL_DESK,
    BTN_PORTFOLIO_DESK,
    BTN_BLOG_DESK,
    BTN_BIO_DESK,
    BTN_CONTACT_DESK,
  ];
  const animationDelay = 75;
  const animationStartDelay = 1050;

  setTimeout(() => {
    buttons.forEach((button, index) => {
      const icon = button.querySelector(".icon");
      setTimeout(() => {
        button.style.opacity = "1";
        icon.classList.add("rotateIn");
        icon.addEventListener(
          "animationend",
          () => {
            icon.classList.remove("rotateIn");
            icon.style.removeProperty("transform");
            icon.style.removeProperty("opacity");
            icon.style.transformOrigin = "center";
          },
          { once: true }
        );
      }, animationDelay * index);
    });
  }, animationStartDelay);

  const lateralButtons = document.querySelectorAll(".btnLateral");
  lateralButtons.forEach((button) => {
    const icon = button.querySelector(".icon");
    button.addEventListener("mousedown", () => button.classList.add("pressed"));
    button.addEventListener("mouseup", () =>
      button.classList.replace("pressed", "clicked")
    );
    button.addEventListener("click", () => {
      lateralButtons.forEach((otherButton) => {
        if (otherButton !== button) {
          otherButton.classList.remove("clicked", "pressed");
        }
      });
    });
  });
}

function displaySocialIconsDesktop() {
  const buttons = [
    BTN_ARTSTATION_DESK,
    BTN_LINKEDIN_DESK,
    BTN_YOUTUBE_DESK,
    BTN_FACEBOOK_DESK,
    BTN_X_DESK,
  ];
  const animationDelay = 75;
  buttons.forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "1";
      icon.classList.add("rotateIn");
      icon.addEventListener(
        "animationend",
        () => {
          icon.classList.remove("rotateIn");
          icon.style.removeProperty("transform");
          icon.style.removeProperty("opacity");
          icon.style.transformOrigin = "center";
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}

function displayLatNavTextStart() {
  const buttons = [
    BTN_HOME_DESK,
    BTN_PROFIL_DESK,
    BTN_GAMES_DESK,
    BTN_UXUI_DESK,
    BTN_3D_DESK,
    BTN_2D_DESK,
    BTN_VIDEO_DESK,
    BTN_WEB_DESK,
    BTN_PIXEL_DESK,
    BTN_PORTFOLIO_DESK,
    BTN_BLOG_DESK,
    BTN_BIO_DESK,
    BTN_CONTACT_DESK,
  ];
  buttons.forEach((button, index) => {
    setTimeout(function () {
      button.getElementsByTagName("h2")[0].style.opacity = "1";
    }, 50 * index);
  });
}
function hideLatNavTextStart() {
  const buttons = [
    BTN_HOME_DESK,
    BTN_PROFIL_DESK,
    BTN_GAMES_DESK,
    BTN_UXUI_DESK,
    BTN_3D_DESK,
    BTN_2D_DESK,
    BTN_VIDEO_DESK,
    BTN_WEB_DESK,
    BTN_PIXEL_DESK,
    BTN_PORTFOLIO_DESK,
    BTN_BLOG_DESK,
    BTN_BIO_DESK,
    BTN_CONTACT_DESK,
  ];
  buttons.forEach((button, index) => {
    setTimeout(function () {
      button.getElementsByTagName("h2")[0].style.opacity = "0";
    }, 30 * index);
  });
}

function startSequence() {
  displayMainLogo();
  setTimeout(() => {
    displayLatNav();
  }, 600);
  setTimeout(() => {
    displaySocialIconsDesktop();
  }, 2750);
  setTimeout(() => {
    displayLatNavTextStart();
  }, 3250);
  setTimeout(() => {
    displayLanguageSelectorDesktop();
  }, 4000);
  setTimeout(() => {
    hideLatNavTextStart();
  }, 6000);

  // BTN_HOME.classList.add("btnActive");
  // displayLatNavText();

  // setTimeout(() => {
  //   hideLatNavText();
  // },2000);
}

startSequence();

NAVLINKS.addEventListener("mouseenter", displayLatNavTextStart);
NAVLINKS.addEventListener("mouseleave", () =>
  setTimeout(hideLatNavTextStart, 0)
);
