const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR_DESK = document.getElementById(
  "languageSelectorDesktop"
);
const BTN_HOME_DESK = document.getElementById("btnHomeDesktop");
const BTN_PROFIL_DESK = document.getElementById("btnProfilDesktop");
const BTN_GAMES_DESK = document.getElementById("btnGamesDesktop");
const BTN_UXUI_DESK = document.getElementById("btnUxUiDesktop");
const BTN_3D_DESK = document.getElementById("btn3DDesktop");
const BTN_2D_DESK = document.getElementById("btn2DDesktop");
const BTN_VIDEO_DESK = document.getElementById("btnVideoDesktop");
const BTN_WEB_DESK = document.getElementById("btnWebDesktop");
const BTN_PIXEL_DESK = document.getElementById("btnPixelDesktop");
const BTN_PORTFOLIO_DESK = document.getElementById("btnPortfolioDesktop");
const BTN_BLOG_DESK = document.getElementById("btnBlogDesktop");
const BTN_BIO_DESK = document.getElementById("btnBioDesktop");
const BTN_CONTACT_DESK = document.getElementById("btnContactDesktop");
const BTN_ARTSTATION_DESK = document.getElementById("btnArtstationDesktop");
const BTN_LINKEDIN_DESK = document.getElementById("btnLinkedinDesktop");
const BTN_YOUTUBE_DESK = document.getElementById("btnYoutubeDesktop");
const BTN_FACEBOOK_DESK = document.getElementById("btnFacebookDesktop");
const BTN_X_DESK = document.getElementById("btnXDesktop");
const CONNEXIONBOX_DESK = document.getElementById("connexionBoxDesktop");
const BTN_CONNEXION_DESK = document.getElementById("btnConnexionDesktop");
const BTN_CONNEXION_ICON_DESK = document.getElementById(
  "btnConnexionIconDesktop"
);
const BTN_USERLOG_DESK = document.getElementById("btnUserLogDesktop");
const BTN_ADMINLOG_DESK = document.getElementById("btnAdminLogDesktop");
const NAME_USERLOG_DESK = document.getElementById("userNameDesktop");
const NAME_ADMINLOG_DESK = document.getElementById("adminNameDesktop");

let connexionstatus = "offline";
const BTN_CONNEXION = [BTN_CONNEXION_DESK];
const BTN_CONNEXION_ICON = [BTN_CONNEXION_ICON_DESK];
const BTN_USERLOG = [BTN_USERLOG_DESK];
const BTN_ADMINLOG = [BTN_ADMINLOG_DESK];
const NAME_USERLOG = [NAME_USERLOG_DESK];
const NAME_ADMINLOG = [NAME_ADMINLOG_DESK];

function connectBtnIdle() {
  BTN_CONNEXION.forEach((button) => {
    button.addEventListener("pointerenter", () => {
      button.style.transform = "scale(1.5)";
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "scale(1)";
    });
    button.addEventListener("pointerdown", (e) => {
      button.style.transform = "scale(1)";
    });
    button.addEventListener("keydown", (e) => {
      button.style.transform = "scale(1)";
    });
    button.addEventListener("pointerup", (e) => {
      button.style.transform = "scale(1.5)";
      switch (connexionstatus) {
        case "offline":
          accessConnexion();
          break;
        case "online":
          logoutFetch();
          break;
        default:
          break;
      }
    });
    button.addEventListener("keyup", (e) => {
      button.style.transform = "scale(1.5)";
      switch (connexionstatus) {
        case "offline":
          accessConnexion();
          break;
        case "online":
          // Handle online state
          break;
        default:
          // Handle other states
          break;
      }
    });
  });
}
function turnOnLine() {
  connexionstatus = "online";
  BTN_CONNEXION.forEach((button) => {
    button.classList.add("active");
  });
  BTN_CONNEXION_ICON.forEach((icon) => {
    icon.classList.add("onlineStatus");
  });
  setTimeout(() => {
    BTN_CONNEXION_ICON.forEach((icon) => {
      icon.style.transform = "rotateZ(-180deg)";
      icon.classList.remove("onlineStatus");
    });
    console.log("tuned OnLine complete");
  }, 1000);
}
function turnOffLine() {
  connexionstatus = "offline";
  BTN_CONNEXION.forEach((button) => {
    button.classList.remove("active");
  });
  BTN_CONNEXION_ICON.forEach((icon) => {
    icon.classList.add("offlineStatus");
  });
  setTimeout(() => {
    BTN_CONNEXION_ICON.forEach((icon) => {
      icon.style.transform = "rotateZ(0deg)";
      icon.classList.remove("offlineStatus");
    });
    NAME_USERLOG.forEach((name) => {
      name.innerText = "";
    });
    NAME_ADMINLOG.forEach((name) => {
      name.innerText = "";
    });
  }, 1000);
}

function displayUserLog() {
  BTN_USERLOG.forEach((button) => {
    button.style.display = "flex";
    button.style.opacity = "0";
    requestAnimationFrame(() => {
      button.style.opacity = "1";
    });
  });
}

function displayAdminLog() {
  BTN_ADMINLOG.forEach((button) => {
    button.style.display = "flex";
    button.style.opacity = "0";
    requestAnimationFrame(() => {
      button.style.opacity = "1";
    });
  });
}

function hideAdminLog() {
  BTN_ADMINLOG.forEach((button) => {
    button.style.opacity = "0";
    setTimeout(() => {
      button.style.display = "none";
    }, 1000);
  });
}
function hideUserLog() {
  BTN_USERLOG.forEach((button) => {
    button.style.opacity = "0";
    setTimeout(() => {
      button.style.display = "none";
    }, 1000);
  });
}

// Menu Tablet
const LANGUAGESELECTOR_TABLET = document.getElementById(
  "languageSelectorTablet"
);
const BTN_HOME_TABLET = document.getElementById("btnHomeTablet");
const BTN_PROFIL_TABLET = document.getElementById("btnProfilTablet");
const BTN_GAMES_TABLET = document.getElementById("btnGamesTablet");
const BTN_UXUI_TABLET = document.getElementById("btnUxUiTablet");
const BTN_3D_TABLET = document.getElementById("btn3DTablet");
const BTN_2D_TABLET = document.getElementById("btn2DTablet");
const BTN_VIDEO_TABLET = document.getElementById("btnVideoTablet");
const BTN_WEB_TABLET = document.getElementById("btnWebTablet");
const BTN_PIXEL_TABLET = document.getElementById("btnPixelTablet");
const BTN_PORTFOLIO_TABLET = document.getElementById("btnPortfolioTablet");
const BTN_BLOG_TABLET = document.getElementById("btnBlogTablet");
const BTN_BIO_TABLET = document.getElementById("btnBioTablet");
const BTN_CONTACT_TABLET = document.getElementById("btnContactTablet");
const BTN_ARTSTATION_TABLET = document.getElementById("btnArtstationTablet");
const BTN_LINKEDIN_TABLET = document.getElementById("btnLinkedinTablet");
const BTN_YOUTUBE_TABLET = document.getElementById("btnYoutubeTablet");
const BTN_FACEBOOK_TABLET = document.getElementById("btnFacebookTablet");
const BTN_X_TABLET = document.getElementById("btnXTablet");
const MENU_TABLETTOP = document.getElementById("menuTabletTop");
const MENU_TABLETRIGHT = document.getElementById("menuTabletRight");
let menuTabletDeployment = false;

function displayNavLinksTablet() {
  const buttons = [
    BTN_HOME_TABLET,
    BTN_PROFIL_TABLET,
    BTN_GAMES_TABLET,
    BTN_UXUI_TABLET,
    BTN_3D_TABLET,
    BTN_2D_TABLET,
    BTN_VIDEO_TABLET,
    BTN_WEB_TABLET,
    BTN_PIXEL_TABLET,
    BTN_PORTFOLIO_TABLET,
    BTN_BLOG_TABLET,
    BTN_BIO_TABLET,
    BTN_CONTACT_TABLET,
  ];
  const animationDelay = 50;

  buttons.forEach((button, index) => {
    setTimeout(() => {
      button.style.opacity = "1";
      button.classList.add("rotateIn");
      button.addEventListener(
        "animationend",
        () => {
          button.classList.remove("rotateIn");
          button.style.removeProperty("transform");
        },
        { once: true }
      );
    }, animationDelay * index);
  });

  const tabletButtons = document.querySelectorAll(".btnTablet");
  tabletButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.classList.add("pressedTablet");
    });
    button.addEventListener("touchend", (event) => {
      event.preventDefault();
      tabletButtons.forEach((otherButton) => {
        if (
          otherButton !== button &&
          (otherButton.classList.contains("clickedTablet") ||
            otherButton.classList.contains("pressedTablet"))
        ) {
          otherButton.classList.remove("clickedTablet");
          otherButton.classList.remove("pressedTablet");
        }
      });
      button.classList.replace("pressedTablet", "clickedTablet");
    });
  });
}
function hideNavLinksTablet() {
  const buttons = [
    BTN_HOME_TABLET,
    BTN_PROFIL_TABLET,
    BTN_GAMES_TABLET,
    BTN_UXUI_TABLET,
    BTN_3D_TABLET,
    BTN_2D_TABLET,
    BTN_VIDEO_TABLET,
    BTN_WEB_TABLET,
    BTN_PIXEL_TABLET,
    BTN_PORTFOLIO_TABLET,
    BTN_BLOG_TABLET,
    BTN_BIO_TABLET,
    BTN_CONTACT_TABLET,
  ];
  const animationDelay = 50;

  buttons.reverse().forEach((button, index) => {
    setTimeout(() => {
      button.style.opacity = "0";
      button.classList.add("rotateOut");
      button.addEventListener(
        "animationend",
        () => {
          button.classList.remove("rotateOut");
          button.style.removeProperty("transform");
          button.style.removeProperty("opacity");
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}
function displaySocialIconsTablet() {
  const buttons = [
    BTN_ARTSTATION_TABLET,
    BTN_LINKEDIN_TABLET,
    BTN_YOUTUBE_TABLET,
    BTN_FACEBOOK_TABLET,
    BTN_X_TABLET,
  ];
  const animationDelay = 75;
  LANGUAGESELECTOR_TABLET.style.opacity = "1";
  buttons.reverse().forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "1";
      icon.style.transformOrigin = "right center";
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
  setTimeout(() => {
    LANGUAGESELECTOR_TABLET.style.opacity = "0";
  }, 300);
}
function menuTabletDeploy() {
  MENU_TABLETRIGHT.style.height = "1120px";
  MENU_TABLETRIGHT.style.opacity = "1";
  MENU_TABLETTOP.style.width = "400px";
  MENU_TABLETTOP.style.opacity = "1";
  displayNavLinksTablet();
  displaySocialIconsTablet();
}
function menuTabletHide() {
  MENU_TABLETRIGHT.style.opacity = "0";
  hideNavLinksTablet();
  hideSocialIconsTablet();
  setTimeout(() => {
    MENU_TABLETRIGHT.style.height = "0";
    MENU_TABLETTOP.style.width = "0";
    MENU_TABLETTOP.style.opacity = "0";
  }, 1000);
}
// Menu Mobile
const LANGUAGESELECTOR_MOBILE = document.getElementById(
  "languageSelectorMobile"
);
const BTN_HOME_MOBILE = document.getElementById("btnHomeMobile");
const BTN_PROFIL_MOBILE = document.getElementById("btnProfilMobile");
const BTN_GAMES_MOBILE = document.getElementById("btnGamesMobile");
const BTN_UXUI_MOBILE = document.getElementById("btnUxUiMobile");
const BTN_3D_MOBILE = document.getElementById("btn3DMobile");
const BTN_2D_MOBILE = document.getElementById("btn2DMobile");
const BTN_VIDEO_MOBILE = document.getElementById("btnVideoMobile");
const BTN_WEB_MOBILE = document.getElementById("btnWebMobile");
const BTN_PIXEL_MOBILE = document.getElementById("btnPixelMobile");
const BTN_PORTFOLIO_MOBILE = document.getElementById("btnPortfolioMobile");
const BTN_BLOG_MOBILE = document.getElementById("btnBlogMobile");
const BTN_BIO_MOBILE = document.getElementById("btnBioMobile");
const BTN_CONTACT_MOBILE = document.getElementById("btnContactMobile");
const BTN_ARTSTATION_MOBILE = document.getElementById("btnArtstationMobile");
const BTN_LINKEDIN_MOBILE = document.getElementById("btnLinkedinMobile");
const BTN_YOUTUBE_MOBILE = document.getElementById("btnYoutubeMobile");
const BTN_FACEBOOK_MOBILE = document.getElementById("btnFacebookMobile");
const BTN_X_MOBILE = document.getElementById("btnXMobile");
const MENU_MOBILE = document.getElementById("menuMobile");
let menuMobileDeployment = false;
function displayNavLinksMobile() {
  const buttons = [
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
  ];
  const animationDelay = 50;

  buttons.forEach((button, index) => {
    setTimeout(() => {
      button.style.opacity = "1";
      button.classList.add("rotateIn");
      button.addEventListener(
        "animationend",
        () => {
          button.classList.remove("rotateIn");
          button.style.removeProperty("transform");
          // button.style.transformOrigin = "center";
        },
        { once: true }
      );
    }, animationDelay * index);
  });

  const mobileButtons = document.querySelectorAll(".btnMobile");
  mobileButtons.forEach((button) => {
    button.addEventListener("touchstart", (event) => {
      event.preventDefault();
      button.classList.add("pressedMobile");
    });
    button.addEventListener("touchend", (event) => {
      event.preventDefault();
      mobileButtons.forEach((otherButton) => {
        if (
          otherButton !== button &&
          (otherButton.classList.contains("clickedMobile") ||
            otherButton.classList.contains("pressedMobile"))
        ) {
          otherButton.classList.remove("clickedMobile");
          otherButton.classList.remove("pressedMobile");
        }
      });
      button.classList.replace("pressedMobile", "clickedMobile");
      menuMobiletHide();
      burgerRetract();
      setTimeout(() => {
        menuMobileDeployment = false;
      }, 750);
    });
  });
}
function hideNavLinksMobile() {
  const buttons = [
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
  ];
  const animationDelay = 50;

  buttons.reverse().forEach((button, index) => {
    setTimeout(() => {
      button.style.opacity = "0";
      // button.style.transformOrigin = "right center";
      button.classList.add("rotateOut");
      button.addEventListener(
        "animationend",
        () => {
          button.classList.remove("rotateOut");
          button.style.removeProperty("transform");
          button.style.removeProperty("opacity");
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}
function displaySocialIconsMobile() {
  const buttons = [
    BTN_ARTSTATION_MOBILE,
    BTN_LINKEDIN_MOBILE,
    BTN_YOUTUBE_MOBILE,
    BTN_FACEBOOK_MOBILE,
    BTN_X_MOBILE,
  ];
  const animationDelay = 50;
  buttons.reverse().forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "1";
      // icon.style.transformOrigin = "right center";
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
function hideSocialIconsMobile() {
  const buttons = [
    BTN_ARTSTATION_MOBILE,
    BTN_LINKEDIN_MOBILE,
    BTN_YOUTUBE_MOBILE,
    BTN_FACEBOOK_MOBILE,
    BTN_X_MOBILE,
  ];
  const animationDelay = 50;
  buttons.forEach((button, index) => {
    const icon = button.querySelector(".icon");
    setTimeout(() => {
      button.style.opacity = "0";
      // icon.style.transformOrigin = "right center";
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
function menuMobiletDeploy() {
  MENU_MOBILE.style.height = "100%";
  MENU_MOBILE.style.opacity = "1";
  LANGUAGESELECTOR_MOBILE.style.opacity = "1";
  displayNavLinksMobile();
  setTimeout(() => {
    displaySocialIconsMobile();
  }, 500);
}
function menuMobiletHide() {
  hideSocialIconsMobile();
  setTimeout(() => {
    hideNavLinksMobile();
  }, 100);
  setTimeout(() => {
    MENU_MOBILE.style.opacity = "0";
    LANGUAGESELECTOR_MOBILE.style.opacity = "0";
  }, 500);
  setTimeout(() => {
    MENU_MOBILE.style.height = "0%";
  }, 1200);
}
// Menu Buger
const BTN_BURGER = document.getElementById("btnBurger");
const BURGERBARTOP = document.getElementById("burgerBarTop");
const BURGERBARMIDDLE = document.getElementById("burgerBarMiddle");
const BURGERBARBOTTOM = document.getElementById("burgerBarBottom");
const BURGERBARS = [BURGERBARTOP, BURGERBARMIDDLE, BURGERBARBOTTOM];

function burgerDeploy() {
  BURGERBARS.forEach((bar, index) => {
    bar.style.width = "6px";
    bar.style.backgroundColor = "#ffffff";
    setTimeout(() => {
      switch (bar) {
        case BURGERBARTOP:
          BURGERBARTOP.style.left = "0";
          break;
        case BURGERBARMIDDLE:
          BURGERBARMIDDLE.style.left = `calc(50% - 3px)`;
          break;
        case BURGERBARBOTTOM:
          BURGERBARBOTTOM.style.right = `calc(0 - 0px)`;
          break;
      }
    }, index * 75);
  });
  BTN_BURGER.style.height = "40px";
  BTN_BURGER.style.width = "40px";
  setTimeout(() => {
    BURGERBARS.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.height = "100%";
        bar.style.top = `calc(50% - 21px)`;
        bar.style.backgroundColor = "#b4b4b5";
      }, index * 75);
    });
  }, 300);
}
function burgerRetract() {
  BURGERBARS.forEach((bar, index) => {
    setTimeout(() => {
      bar.style.height = "6px";
      switch (bar) {
        case BURGERBARTOP:
          BURGERBARTOP.style.left = "0";
          break;
        case BURGERBARMIDDLE:
          BURGERBARMIDDLE.style.left = `calc(50% - 3px)`;
          BURGERBARMIDDLE.style.top = `calc(50% - 3px)`;
          break;
        case BURGERBARBOTTOM:
          BURGERBARBOTTOM.style.right = `calc(0 - 0px)`;
          BURGERBARBOTTOM.style.top = `calc(100% - 6px)`;
          break;
      }
    }, index * 75);
    setTimeout(() => {
      BTN_BURGER.style.height = "40px";
      BTN_BURGER.style.width = "100%";
      BURGERBARS.forEach((bar, index) => {
        setTimeout(() => {
          bar.style.width = "40px";
          bar.style.backgroundColor = "#b4b4b5";
          setTimeout(() => {
            switch (bar) {
              case BURGERBARTOP:
                BURGERBARTOP.style.left = `calc(50% - 21px)`;
                break;
              case BURGERBARMIDDLE:
                BURGERBARMIDDLE.style.left = `calc(50% - 21px)`;
                break;
              case BURGERBARBOTTOM:
                BURGERBARBOTTOM.style.right = `calc(0% - 0px)`;
                break;
            }
          });
        }, index * 75);
      });
    }, 300);
  });
}
function handleBurgerToggle() {
  BTN_BURGER.style.pointerEvents = "none";
  BTN_BURGER.style.transform = "scale(1)";
  if (menuTabletDeployment || menuMobileDeployment) {
    burgerRetract(); // Animation de fermeture
    if (menuTabletDeployment) {
      menuTabletHide();
      menuTabletDeployment = false;
    }
    if (menuMobileDeployment) {
      menuMobiletHide();
      menuMobileDeployment = false;
    }
  } else {
    burgerDeploy(); // Animation d'ouverture
    menuTabletDeploy();
    menuTabletDeployment = true;
    menuMobiletDeploy();
    menuMobileDeployment = true;
  }
  setTimeout(() => {
    BTN_BURGER.style.pointerEvents = "auto";
  }, 800);
}

BTN_BURGER.addEventListener("pointerenter", () => {
  BTN_BURGER.style.transform = "scale(1.2)";
});
BTN_BURGER.addEventListener("pointerleave", () => {
  BTN_BURGER.style.transform = "scale(1)";
});
BTN_BURGER.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  BTN_BURGER.style.transform = "scale(0.8)";
  BURGERBARS.forEach((bar, index) => {
    setTimeout(() => {
      bar.style.backgroundColor = "#ffffff";
    }, index * 75);
  });
});
BTN_BURGER.addEventListener("pointerup", handleBurgerToggle);
BTN_BURGER.addEventListener("keydown", (e) => {
  if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    BTN_BURGER.style.transform = "scale(0.8)";
  }
});
BTN_BURGER.addEventListener("keyup", (e) => {
  if (e.code === "Enter" || e.code === "Space") {
    handleBurgerToggle();
  }
});

// TOP BAR DISPLAY

function displayMainLogo() {
  MAINLOGO.style.opacity = "1";
  const delayBeforeLetters = 350;

  setTimeout(() => {
    const mainLogoTextElements =
      document.querySelectorAll(".mainLogoText span");
    mainLogoTextElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add("rotateIn");
      }, 75 * index);
    });
  }, delayBeforeLetters);
}
function displayConnexionBoxDesktop() {
  CONNEXIONBOX_DESK.style.opacity = "1";
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
function activateLatNav() {
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
    const icon = button.querySelector("span");
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
      button.querySelector(".linkText").style.opacity = "1";
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
      button.querySelector(".linkText").style.opacity = "0";
    }, 30 * index);
  });
}
NAVLINKS.addEventListener("mouseenter", displayLatNavTextStart);
NAVLINKS.addEventListener("mouseleave", () =>
  setTimeout(hideLatNavTextStart, 0)
);
