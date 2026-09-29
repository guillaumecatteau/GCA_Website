const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR_DESK = document.getElementById("languageSelectorDesktop");
const CONNEXIONBOX_DESK = document.getElementById("connexionBoxDesktop");
const BTN_CONNEXION_DESK = document.getElementById("btnConnexionDesktop");
const BTN_CONNEXION_ICON_DESK = document.getElementById("btnConnexionIconDesktop");
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
    // Le scale hover est géré intégralement par CSS (.btnConnexion > .icon hover)
    // Plus de manipulation inline de style.transform ici
    button.addEventListener("pointerup", (e) => {
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
      switch (connexionstatus) {
        case "offline":
          accessConnexion();
          break;
        case "online":
          // Handle online state
          break;
        default:
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
const BTN_PRESENTATION_TABLET = document.getElementById("btnPresentationTablet");
const BTN_EXPERTISE_TABLET = document.getElementById("btnExpertiseTablet");
const BTN_PORTFOLIO_SECTION_TABLET = document.getElementById("btnPortfolioSectionTablet");
const BTN_BIO_SECTION_TABLET = document.getElementById("btnBioSectionTablet");
const BTN_BLOG_SECTION_TABLET = document.getElementById("btnBlogSectionTablet");
const BTN_CONTACT_SECTION_TABLET = document.getElementById("btnContactSectionTablet");
const BTN_SITEMAP_TABLET = document.getElementById("btnSitemapTablet");
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
    BTN_PRESENTATION_TABLET,
    BTN_EXPERTISE_TABLET,
    BTN_PORTFOLIO_SECTION_TABLET,
    BTN_BIO_SECTION_TABLET,
    BTN_BLOG_SECTION_TABLET,
    BTN_CONTACT_SECTION_TABLET,
    BTN_SITEMAP_TABLET,
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
    BTN_PRESENTATION_TABLET,
    BTN_EXPERTISE_TABLET,
    BTN_PORTFOLIO_SECTION_TABLET,
    BTN_BIO_SECTION_TABLET,
    BTN_BLOG_SECTION_TABLET,
    BTN_CONTACT_SECTION_TABLET,
    BTN_SITEMAP_TABLET,
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
  // Hauteur calculée dynamiquement (nombre d'items variable) plutôt qu'une valeur fixe :
  // une valeur codée en dur pour l'ancienne liste de 13 items laissait un vide béant avec
  // les 8 items actuels (icônes non alignées, fond du menu bien plus grand que son contenu).
  MENU_TABLETRIGHT.style.height = 'auto';
  const _target = MENU_TABLETRIGHT.scrollHeight;
  MENU_TABLETRIGHT.style.height = '0px';
  void MENU_TABLETRIGHT.offsetHeight; // force reflow avant l'animation
  requestAnimationFrame(() => {
    MENU_TABLETRIGHT.style.height = _target + 'px';
  });
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
const BTN_PRESENTATION_MOBILE = document.getElementById("btnPresentationMobile");
const BTN_EXPERTISE_MOBILE = document.getElementById("btnExpertiseMobile");
const BTN_PORTFOLIO_SECTION_MOBILE = document.getElementById("btnPortfolioSectionMobile");
const BTN_BIO_SECTION_MOBILE = document.getElementById("btnBioSectionMobile");
const BTN_BLOG_SECTION_MOBILE = document.getElementById("btnBlogSectionMobile");
const BTN_CONTACT_SECTION_MOBILE = document.getElementById("btnContactSectionMobile");
const BTN_SITEMAP_MOBILE = document.getElementById("btnSitemapMobile");
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
    BTN_PRESENTATION_MOBILE,
    BTN_EXPERTISE_MOBILE,
    BTN_PORTFOLIO_SECTION_MOBILE,
    BTN_BIO_SECTION_MOBILE,
    BTN_BLOG_SECTION_MOBILE,
    BTN_CONTACT_SECTION_MOBILE,
    BTN_SITEMAP_MOBILE,
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
    BTN_PRESENTATION_MOBILE,
    BTN_EXPERTISE_MOBILE,
    BTN_PORTFOLIO_SECTION_MOBILE,
    BTN_BIO_SECTION_MOBILE,
    BTN_BLOG_SECTION_MOBILE,
    BTN_CONTACT_SECTION_MOBILE,
    BTN_SITEMAP_MOBILE,
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

// =============================================================================
// STAGGER ANIMATION UTILITIES — système d'animation réutilisable
// =============================================================================
// Usage :
//   staggerReveal(elements, { delay, animation, startAt, reverse, onDone })
//   staggerHide  (elements, { delay, animation, startAt, reverse, onDone })
//
// elements  : Array, NodeList ou sélecteur CSS string
// delay     : ms entre chaque élément (défaut 60)
// animation : classe CSS liée à un @keyframes (défaut 'rotateIn'/'rotateOut')
// startAt   : décalage initial en nb d'éléments — permet de CHAÎNER deux groupes
//             sans pause (ex: sociales après section icons = startAt: sectionItems.length)
// reverse   : inverse l'ordre de la séquence
// onDone    : callback appelé après le dernier élément
//
// Pattern interne :
//   1. Masquer tous les éléments (opacity 0 inline) — évite flash de l'état CSS initial
//   2. Stagger : ajouter la classe animation avec setTimeout(delay * (startAt + i))
//   3. animationend : retirer la classe + retirer l'opacity inline (le CSS reprend)
// =============================================================================

/**
 * Anime l'apparition en stagger d'une liste d'éléments.
 */
function staggerReveal(elements, { delay = 60, animation = 'rotateIn', startAt = 0, reverse = false, onDone } = {}) {
  const els = typeof elements === 'string'
    ? Array.from(document.querySelectorAll(elements))
    : Array.from(elements);
  if (reverse) els.reverse();
  if (els.length === 0) { onDone?.(); return; }
  els.forEach(el => { el.style.opacity = '0'; });
  els.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add(animation);
      el.addEventListener('animationend', () => {
        el.classList.remove(animation);
        // Fixer opacity:1 inline pour que les éléments restent visibles même si
        // leur CSS de base dit opacity:0 (ex: .btnSocialLateral qui démarre caché)
        el.style.opacity = '1';
        if (i === els.length - 1) onDone?.();
      }, { once: true });
    }, delay * (startAt + i));
  });
}

/**
 * Anime la disparition en stagger d'une liste d'éléments.
 * Après animationend, opacity: 0 est appliqué inline sur chaque élément.
 */
function staggerHide(elements, { delay = 60, animation = 'rotateOut', startAt = 0, reverse = false, onDone } = {}) {
  const els = typeof elements === 'string'
    ? Array.from(document.querySelectorAll(elements))
    : Array.from(elements);
  if (reverse) els.reverse();
  if (els.length === 0) { onDone?.(); return; }
  els.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add(animation);
      el.addEventListener('animationend', () => {
        el.classList.remove(animation);
        el.style.opacity = '0';
        if (i === els.length - 1) onDone?.();
      }, { once: true });
    }, delay * (startAt + i));
  });
}

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

// DESKTOP NAV SUPPRIMÉE — à reconstruire


