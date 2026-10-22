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
const BTN_SHARE_TABLET = document.getElementById("btnShareTablet");
const CONNEXIONBOX_TABLET = document.getElementById("connexionBoxTablet");
const BTN_CONNEXION_TABLET = document.getElementById("btnConnexionTablet");
const BTN_CONNEXION_ICON_TABLET = document.getElementById("btnConnexionIconTablet");
const BTN_USERLOG_TABLET = document.getElementById("btnUserLogTablet");
const BTN_ADMINLOG_TABLET = document.getElementById("btnAdminLogTablet");
const NAME_USERLOG_TABLET = document.getElementById("userNameTablet");
const NAME_ADMINLOG_TABLET = document.getElementById("adminNameTablet");
// Enregistrés dans les registres partagés (déclarés plus haut) — connectBtnIdle(),
// turnOnLine()/turnOffLine() et displayUserLog()/displayAdminLog() gèrent alors le bouton
// tablette exactement comme le bouton desktop, sans code dupliqué.
BTN_CONNEXION.push(BTN_CONNEXION_TABLET);
BTN_CONNEXION_ICON.push(BTN_CONNEXION_ICON_TABLET);
BTN_USERLOG.push(BTN_USERLOG_TABLET);
BTN_ADMINLOG.push(BTN_ADMINLOG_TABLET);
NAME_USERLOG.push(NAME_USERLOG_TABLET);
NAME_ADMINLOG.push(NAME_ADMINLOG_TABLET);
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
    BTN_SHARE_TABLET,
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
    BTN_SHARE_TABLET,
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
// Barre haute tablette (se déplie vers la gauche) — connexion (+ nom d'utilisateur) et
// sélecteur de langue uniquement (les réseaux sociaux n'y figurent plus).
function displayConnexionBoxTablet() {
  LANGUAGESELECTOR_TABLET.style.opacity = "1";
  CONNEXIONBOX_TABLET.style.opacity = "1";
}
function hideConnexionBoxTablet() {
  LANGUAGESELECTOR_TABLET.style.opacity = "0";
  CONNEXIONBOX_TABLET.style.opacity = "0";
}
function menuTabletDeploy() {
  // Hauteur calculée dynamiquement (nombre d'items variable) plutôt qu'une valeur fixe :
  // une valeur codée en dur pour l'ancienne liste de 13 items laissait un vide béant avec
  // les 8 items actuels (icônes non alignées, fond du menu bien plus grand que son contenu).
  MENU_TABLETRIGHT.style.height = 'auto';
  const _natural = MENU_TABLETRIGHT.scrollHeight;
  // Plafonnée à l'espace réellement disponible sous le container (jusqu'au bas de l'écran,
  // avec une petite marge) : sans ça, sur un écran court, le contenu (liens + bouton
  // Partager) pouvait dépasser du viewport et pousser le bouton Partager hors champ,
  // invisible et inatteignable. La liste de liens (.navLinksTablet) peut scroller en
  // interne si besoin (cf. _main-nav.scss) pendant que le bouton Partager reste ancré
  // en bas grâce à margin-top:auto.
  const _containerTop = MENU_TABLETRIGHT.getBoundingClientRect().top;
  const _available = Math.max(0, window.innerHeight - _containerTop - 16);
  const _target = Math.min(_natural, _available);
  MENU_TABLETRIGHT.style.height = '0px';
  void MENU_TABLETRIGHT.offsetHeight; // force reflow avant l'animation
  requestAnimationFrame(() => {
    MENU_TABLETRIGHT.style.height = _target + 'px';
  });
  MENU_TABLETRIGHT.style.opacity = "1";
  MENU_TABLETTOP.style.width = "400px";
  MENU_TABLETTOP.style.opacity = "1";
  displayNavLinksTablet();
  displayConnexionBoxTablet();
}
function menuTabletHide() {
  MENU_TABLETRIGHT.style.opacity = "0";
  hideNavLinksTablet();
  hideConnexionBoxTablet();
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
const BTN_ARTSTATION_MOBILE = document.getElementById("btnArtstationMobile");
const BTN_LINKEDIN_MOBILE = document.getElementById("btnLinkedinMobile");
const BTN_YOUTUBE_MOBILE = document.getElementById("btnYoutubeMobile");
const BTN_FACEBOOK_MOBILE = document.getElementById("btnFacebookMobile");
const BTN_X_MOBILE = document.getElementById("btnXMobile");
const FOLLOWME_LABEL_MOBILE = document.querySelector(".followMeLabel");
const BTN_SHARE_MOBILE = document.getElementById("btnShareMobile");
const MENU_MOBILE = document.getElementById("menuMobile");
const CONNEXIONBOX_MOBILE = document.getElementById("connexionBoxMobile");
const BTN_CONNEXION_MOBILE = document.getElementById("btnConnexionMobile");
const BTN_CONNEXION_ICON_MOBILE = document.getElementById("btnConnexionIconMobile");
const BTN_USERLOG_MOBILE = document.getElementById("btnUserLogMobile");
const BTN_ADMINLOG_MOBILE = document.getElementById("btnAdminLogMobile");
const NAME_USERLOG_MOBILE = document.getElementById("userNameMobile");
const NAME_ADMINLOG_MOBILE = document.getElementById("adminNameMobile");
// Même registre partagé que pour la tablette : connectBtnIdle(), turnOnLine()/turnOffLine()
// et displayUserLog()/displayAdminLog() gèrent alors ce bouton automatiquement.
BTN_CONNEXION.push(BTN_CONNEXION_MOBILE);
BTN_CONNEXION_ICON.push(BTN_CONNEXION_ICON_MOBILE);
BTN_USERLOG.push(BTN_USERLOG_MOBILE);
BTN_ADMINLOG.push(BTN_ADMINLOG_MOBILE);
NAME_USERLOG.push(NAME_USERLOG_MOBILE);
NAME_ADMINLOG.push(NAME_ADMINLOG_MOBILE);
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
    BTN_SHARE_MOBILE,
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
    BTN_SHARE_MOBILE,
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
  FOLLOWME_LABEL_MOBILE.style.opacity = "1";
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
  FOLLOWME_LABEL_MOBILE.style.opacity = "0";
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
// Icône connexion (+ nom d'utilisateur) — entre la rangée du haut et la grille de nav.
function displayConnexionBoxMobile() {
  CONNEXIONBOX_MOBILE.style.opacity = "1";
}
function hideConnexionBoxMobile() {
  CONNEXIONBOX_MOBILE.style.opacity = "0";
}
function menuMobiletDeploy() {
  MENU_MOBILE.style.height = "100%";
  MENU_MOBILE.style.opacity = "1";
  LANGUAGESELECTOR_MOBILE.style.opacity = "1";
  displayConnexionBoxMobile();
  displayNavLinksMobile();
  setTimeout(() => {
    displaySocialIconsMobile();
  }, 500);
}
function menuMobiletHide() {
  hideSocialIconsMobile();
  hideConnexionBoxMobile();
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

// Timers de l'animation burgerDeploy()/burgerRetract() en cours — annulés avant chaque
// nouvel appel pour que les deux fonctions restent sûres même en cas de ré-entrée (le
// verrou _burgerAnimating ci-dessous empêche déjà ça côté bouton, mais une sélection de
// lien dans le menu mobile ferme aussi le burger par un autre chemin).
let _burgerTimers = [];
function _clearBurgerTimers() {
  _burgerTimers.forEach((id) => clearTimeout(id));
  _burgerTimers = [];
}
function _burgerTimeout(fn, delay) {
  const id = setTimeout(fn, delay);
  _burgerTimers.push(id);
  return id;
}

function burgerDeploy() {
  _clearBurgerTimers();
  BURGERBARS.forEach((bar, index) => {
    bar.style.width = "6px";
    bar.style.backgroundColor = "#ffffff";
    _burgerTimeout(() => {
      switch (bar) {
        case BURGERBARTOP:
          BURGERBARTOP.style.left = "0";
          break;
        case BURGERBARMIDDLE:
          BURGERBARMIDDLE.style.left = `calc(50% - 3px)`;
          break;
        case BURGERBARBOTTOM:
          // left (pas right) : même ancrage que les deux autres barres, cf. _main-nav.scss —
          // position équivalente (bord droit du container) exprimée en left.
          BURGERBARBOTTOM.style.left = `calc(100% - 6px)`;
          break;
      }
    }, index * 75);
  });
  BTN_BURGER.style.height = "40px";
  BTN_BURGER.style.width = "40px";
  _burgerTimeout(() => {
    BURGERBARS.forEach((bar, index) => {
      _burgerTimeout(() => {
        bar.style.height = "100%";
        bar.style.top = `calc(50% - 21px)`;
        bar.style.backgroundColor = "#b4b4b5";
      }, index * 75);
    });
  }, 300);
}
function burgerRetract() {
  _clearBurgerTimers();
  BURGERBARS.forEach((bar, index) => {
    _burgerTimeout(() => {
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
          BURGERBARBOTTOM.style.left = `calc(100% - 6px)`;
          BURGERBARBOTTOM.style.top = `calc(100% - 6px)`;
          break;
      }
    }, index * 75);
    _burgerTimeout(() => {
      BTN_BURGER.style.height = "40px";
      BTN_BURGER.style.width = "100%";
      BURGERBARS.forEach((bar, index) => {
        _burgerTimeout(() => {
          bar.style.width = "40px";
          bar.style.backgroundColor = "#b4b4b5";
          _burgerTimeout(() => {
            switch (bar) {
              case BURGERBARTOP:
                BURGERBARTOP.style.left = `calc(50% - 21px)`;
                break;
              case BURGERBARMIDDLE:
                BURGERBARMIDDLE.style.left = `calc(50% - 21px)`;
                break;
              case BURGERBARBOTTOM:
                BURGERBARBOTTOM.style.left = `calc(50% - 21px)`;
                break;
            }
          }, 0);
        }, index * 75);
      });
    }, 300);
  });
}

// Verrou anti-clics rapides : tant qu'une ouverture/fermeture est en cours, tout nouvel
// appel au bouton est ignoré — sans ça, des clics répétés (souris ou clavier) empilaient
// des chaînes de setTimeout concurrentes qui finissaient par laisser les barres/panneaux
// dans un état d'affichage incohérent. La durée couvre la plus longue des séquences
// déclenchées (menuMobiletHide : 1200ms).
const BURGER_ANIM_LOCK_MS = 1200;
let _burgerAnimating = false;

function handleBurgerToggle() {
  if (_burgerAnimating) return;
  _burgerAnimating = true;
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
    _burgerAnimating = false;
  }, BURGER_ANIM_LOCK_MS);
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


