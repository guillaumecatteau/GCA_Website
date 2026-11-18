const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR_DESK = document.getElementById("languageSelectorDesktop");
const CONNEXIONBOX_DESK = document.getElementById("connexionBoxDesktop");
const BTN_SEARCH_DESKTOP = document.getElementById("btnSearchDesktop");

// Menu Tablet
const LANGUAGESELECTOR_TABLET = document.getElementById(
  "languageSelectorTablet"
);
const BTN_HOME_TABLET = document.getElementById("btnHomeTablet");
const BTN_PRESENTATION_TABLET = document.getElementById("btnPresentationTablet");
const BTN_EXPERTISE_TABLET = document.getElementById("btnExpertiseTablet");
const BTN_PORTFOLIO_SECTION_TABLET = document.getElementById("btnPortfolioSectionTablet");
const BTN_BIO_SECTION_TABLET = document.getElementById("btnBioSectionTablet");
const BTN_GALLERY_SECTION_TABLET = document.getElementById("btnGallerySectionTablet");
const BTN_BLOG_SECTION_TABLET = document.getElementById("btnBlogSectionTablet");
const BTN_CONTACT_SECTION_TABLET = document.getElementById("btnContactSectionTablet");
const BTN_SHARE_TABLET = document.getElementById("btnShareTablet");
const BTN_SOCIAL_TOGGLE_TABLET = document.getElementById("btnSocialToggleTablet");
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
    BTN_GALLERY_SECTION_TABLET,
    BTN_BLOG_SECTION_TABLET,
    BTN_CONTACT_SECTION_TABLET,
    BTN_SOCIAL_TOGGLE_TABLET,
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
}

// Feedback tactile/souris + fermeture du menu au choix d'un lien — lié UNE SEULE FOIS au
// chargement (et non à chaque ouverture du menu dans displayNavLinksTablet ci-dessus) :
// sans ça, les mêmes éléments .btnTablet accumulaient un nouveau jeu de listeners à chaque
// ouverture, ce qui pouvait appliquer/retirer les classes pressedTablet/clickedTablet
// plusieurs fois pour un seul clic une fois le menu rouvert quelques fois — cf. bug
// "certains éléments deviennent plus gros en se désactivant" (cf. Interface tablette, même
// classe de bug déjà corrigée côté mobile). pointerdown/pointerup/pointercancel/pointerleave
// (plutôt que pointerdown/touchend, qui ne se déclenche jamais pour un clic souris) assure
// un comportement fiable aussi bien tactile qu'à la souris.
(function () {
  const tabletButtons = document.querySelectorAll(".btnTablet");
  const release = (button) => {
    if (!button.classList.contains("pressedTablet")) return;
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
    // PAS de fermeture auto au clic ici (revenu en arrière, cf. Interface tablette, prompt
    // suivant : "ne referme plus automatiquement le menu après avoir cliqué sur quelque
    // chose, j'ai changé d'avis") — la fermeture auto est désormais basée UNIQUEMENT sur
    // l'inactivité (10s), cf. _resetTabletAutoCloseTimer() plus bas.
  };
  tabletButtons.forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.classList.add("pressedTablet");
    });
    button.addEventListener("pointerup", () => release(button));
    button.addEventListener("pointercancel", () => button.classList.remove("pressedTablet"));
    button.addEventListener("pointerleave", () => button.classList.remove("pressedTablet"));
  });
})();
function hideNavLinksTablet() {
  const buttons = [
    BTN_HOME_TABLET,
    BTN_PRESENTATION_TABLET,
    BTN_EXPERTISE_TABLET,
    BTN_PORTFOLIO_SECTION_TABLET,
    BTN_BIO_SECTION_TABLET,
    BTN_GALLERY_SECTION_TABLET,
    BTN_BLOG_SECTION_TABLET,
    BTN_CONTACT_SECTION_TABLET,
    BTN_SOCIAL_TOGGLE_TABLET,
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
// Barre haute tablette (se déplie vers la gauche) — icône recherche + sélecteur de langue
// (plus de connexion visible côté tablette, cf. Redéfinition des utilisateurs).
function menuTabletDeploy() {
  // Hauteur toujours étirée jusqu'à l'espace disponible sous le container (jusqu'au bas de
  // l'écran, avec la même marge que les autres bords — 16px) : le groupe social/partager
  // (margin-top:auto, cf. _main-nav.scss) doit atteindre le bas de l'écran quelle que soit
  // la hauteur réelle de la liste de liens au-dessus (cf. Interface tablette). Si le
  // contenu dépasse malgré tout (écran très court), .navLinksTablet reste scrollable en
  // interne (flex-shrink + overflow-y:auto).
  const _containerTop = MENU_TABLETRIGHT.getBoundingClientRect().top;
  const _target = Math.max(0, window.innerHeight - _containerTop - 16);
  MENU_TABLETRIGHT.style.height = '0px';
  void MENU_TABLETRIGHT.offsetHeight; // force reflow avant l'animation
  requestAnimationFrame(() => {
    MENU_TABLETRIGHT.style.height = _target + 'px';
  });
  MENU_TABLETRIGHT.style.opacity = "1";
  MENU_TABLETTOP.style.width = "400px";
  // L'opacité de l'icône recherche ET du sélecteur de langue est portée par CE SEUL
  // opacity, sur leur conteneur commun #menuTabletTop (pas de toggle séparé sur
  // LANGUAGESELECTOR_TABLET, cf. menuTabletHide() ci-dessous : l'icône recherche n'avait
  // ALORS aucun contrôle d'opacité propre et dépendait du setTimeout différé de 1000ms
  // sur #menuTabletTop, alors que le sélecteur de langue disparaissait immédiatement —
  // les deux doivent suivre EXACTEMENT le même rythme que le reste du cycle d'ouverture/
  // fermeture, cf. Interface tablette).
  MENU_TABLETTOP.style.opacity = "1";
  displayNavLinksTablet();
}
function menuTabletHide() {
  MENU_TABLETRIGHT.style.opacity = "0";
  hideNavLinksTablet();
  // Immédiat (même rythme que MENU_TABLETRIGHT et le reste du menu) — seul le
  // rétrécissement de largeur (purement cosmétique, pour libérer l'espace occupé) reste
  // différé de 1000ms ci-dessous.
  MENU_TABLETTOP.style.opacity = "0";
  setTimeout(() => {
    MENU_TABLETRIGHT.style.height = "0";
    MENU_TABLETTOP.style.width = "0";
  }, 1000);
}
// Menu Mobile
const LANGUAGESELECTOR_MOBILE = document.getElementById(
  "languageSelectorMobile"
);
const BTN_SHARE_WEBSITE_MOBILE = document.getElementById("btnShareWebsiteMobile");
const BTN_HOME_MOBILE = document.getElementById("btnHomeMobile");
const BTN_PRESENTATION_MOBILE = document.getElementById("btnPresentationMobile");
const BTN_EXPERTISE_MOBILE = document.getElementById("btnExpertiseMobile");
const BTN_PORTFOLIO_SECTION_MOBILE = document.getElementById("btnPortfolioSectionMobile");
const BTN_BIO_SECTION_MOBILE = document.getElementById("btnBioSectionMobile");
const BTN_GALLERY_SECTION_MOBILE = document.getElementById("btnGallerySectionMobile");
const BTN_BLOG_SECTION_MOBILE = document.getElementById("btnBlogSectionMobile");
const BTN_CONTACT_SECTION_MOBILE = document.getElementById("btnContactSectionMobile");
const BTN_ARTSTATION_MOBILE = document.getElementById("btnArtstationMobile");
const BTN_LINKEDIN_MOBILE = document.getElementById("btnLinkedinMobile");
const BTN_YOUTUBE_MOBILE = document.getElementById("btnYoutubeMobile");
const BTN_FACEBOOK_MOBILE = document.getElementById("btnFacebookMobile");
const BTN_X_MOBILE = document.getElementById("btnXMobile");
const FOLLOWME_LABEL_MOBILE = document.querySelector(".followMeLabel");
const BTN_SEARCH_MOBILE = document.getElementById("btnSearchMobile");
const MENU_MOBILE = document.getElementById("menuMobile");
let menuMobileDeployment = false;
function displayNavLinksMobile() {
  const buttons = [
    BTN_HOME_MOBILE,
    BTN_PRESENTATION_MOBILE,
    BTN_EXPERTISE_MOBILE,
    BTN_PORTFOLIO_SECTION_MOBILE,
    BTN_BIO_SECTION_MOBILE,
    BTN_GALLERY_SECTION_MOBILE,
    BTN_BLOG_SECTION_MOBILE,
    BTN_CONTACT_SECTION_MOBILE,
    BTN_SEARCH_MOBILE,
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
}

// Feedback tactile + fermeture du menu au choix d'un lien — lié UNE SEULE FOIS au chargement
// (et non à chaque ouverture du menu dans displayNavLinksMobile) : sans ça, les mêmes
// éléments .btnMobile accumulaient un nouveau jeu de listeners à chaque ouverture, ce qui
// déclenchait menuMobiletHide()/burgerRetract() en double dès la deuxième ouverture et
// laissait le bouton burger dans un état d'animation incohérent (cf. bug "le bouton ne
// rouvre pas le menu après avoir visité une section").
(function () {
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
      // Ferme en passant par handleBurgerToggle() (même verrou anti-course que le bouton
      // burger lui-même) — un appel direct à menuMobiletHide()/burgerRetract() ici
      // contournait le verrou _burgerAnimating et le lock pointer-events du bouton : un tap
      // rapide sur le burger juste après la sélection d'un lien pouvait alors démarrer une
      // nouvelle animation d'ouverture AVANT la fin de celle de fermeture encore en cours,
      // laissant les barres dans un état visuel incohérent (cf. bug "le burger ne rouvre pas
      // le menu du premier coup après avoir navigué depuis l'intérieur").
      if (menuMobileDeployment) {
        handleBurgerToggle();
      }
    });
  });
})();
function hideNavLinksMobile() {
  const buttons = [
    BTN_HOME_MOBILE,
    BTN_PRESENTATION_MOBILE,
    BTN_EXPERTISE_MOBILE,
    BTN_PORTFOLIO_SECTION_MOBILE,
    BTN_BIO_SECTION_MOBILE,
    BTN_GALLERY_SECTION_MOBILE,
    BTN_BLOG_SECTION_MOBILE,
    BTN_CONTACT_SECTION_MOBILE,
    BTN_SEARCH_MOBILE,
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
// Plus de connexion visible côté mobile (cf. Redéfinition des utilisateurs).
function menuMobiletDeploy() {
  MENU_MOBILE.style.height = "100%";
  MENU_MOBILE.style.opacity = "1";
  LANGUAGESELECTOR_MOBILE.style.opacity = "1";
  if (BTN_SHARE_WEBSITE_MOBILE) {
    BTN_SHARE_WEBSITE_MOBILE.style.opacity = "1";
    BTN_SHARE_WEBSITE_MOBILE.style.pointerEvents = "auto";
  }
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
    if (BTN_SHARE_WEBSITE_MOBILE) {
      BTN_SHARE_WEBSITE_MOBILE.style.opacity = "0";
      BTN_SHARE_WEBSITE_MOBILE.style.pointerEvents = "none";
    }
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

// Révélation du bouton burger (tablette/mobile uniquement) — simple fondu, piloté par la
// chronologie d'intro configurable (cf. controller/start.js, vue/intro-timeline.js). Masqué
// par défaut via opacity:0 en scss (cf. _main-nav.scss, @include wide-header) tant que cette
// fonction n'a pas été appelée.
function displayBurgerIcon() {
  if (BTN_BURGER) BTN_BURGER.style.opacity = "1";
}

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
      _stopTabletAutoCloseTimer();
    }
    if (menuMobileDeployment) {
      menuMobiletHide();
      menuMobileDeployment = false;
    }
  } else {
    burgerDeploy(); // Animation d'ouverture
    menuTabletDeploy();
    menuTabletDeployment = true;
    _resetTabletAutoCloseTimer();
    menuMobiletDeploy();
    menuMobileDeployment = true;
  }

  setTimeout(() => {
    BTN_BURGER.style.pointerEvents = "auto";
    _burgerAnimating = false;
  }, BURGER_ANIM_LOCK_MS);
}

// ── Fermeture automatique du menu tablette après 10s d'inactivité ───────────────────────
// Remplace l'ancienne fermeture au clic sur un bouton de section (cf. Interface tablette,
// prompt précédent : "ne referme plus automatiquement le menu après avoir cliqué sur
// quelque chose, j'ai changé d'avis" — fermeture auto désormais basée UNIQUEMENT sur
// l'inactivité, 10s sans aucune interaction à l'intérieur du menu, panneau latéral comme
// barre haute recherche/langue).
const TABLET_AUTO_CLOSE_MS = 10000;
let _tabletAutoCloseTimer = null;

function _resetTabletAutoCloseTimer() {
  clearTimeout(_tabletAutoCloseTimer);
  if (!menuTabletDeployment) return;
  _tabletAutoCloseTimer = setTimeout(() => {
    if (menuTabletDeployment) handleBurgerToggle();
  }, TABLET_AUTO_CLOSE_MS);
}

function _stopTabletAutoCloseTimer() {
  clearTimeout(_tabletAutoCloseTimer);
  _tabletAutoCloseTimer = null;
}

["pointerdown", "touchstart", "keydown"].forEach((evt) => {
  document.addEventListener(
    evt,
    (event) => {
      if (!menuTabletDeployment) return;
      const target = event.target;
      if (
        (MENU_TABLETRIGHT && MENU_TABLETRIGHT.contains(target)) ||
        (MENU_TABLETTOP && MENU_TABLETTOP.contains(target))
      ) {
        _resetTabletAutoCloseTimer();
      }
    },
    { passive: true }
  );
});

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
function staggerReveal(elements, { delay = 60, animation = 'rotateIn', startAt = 0, reverse = false, onDone, onEach } = {}) {
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
        // Idem pour pointer-events : certains éléments (ex: .btnSocialLateral) sont
        // pointer-events:none par défaut en CSS tant qu'ils ne sont pas révélés (cf. bug
        // "icônes invisibles mais cliquables" sur les pages où cette révélation ne se
        // déclenche jamais) — on les réactive explicitement ici, une fois réellement visibles.
        el.style.pointerEvents = 'auto';
        // Callback appelé individuellement dès QUE CET élément a terminé sa propre
        // révélation (ex : ne démarrer l'apparition du libellé de nav qu'une fois l'icône
        // du même item entièrement apparue — jamais pendant, sinon conflit visuel).
        onEach?.(el, i);
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
        el.style.pointerEvents = 'none'; // cf. staggerReveal — redevient non cliquable une fois masqué
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
// Révélé en même temps que le sélecteur de langue (cf. startSequence()) — bouton de recherche
// du site, juste à gauche de ce dernier (cf. Recherche du site).
function displaySearchBoxDesktop() {
  if (BTN_SEARCH_DESKTOP) BTN_SEARCH_DESKTOP.style.opacity = "1";
}

// DESKTOP NAV SUPPRIMÉE — à reconstruire

// =============================================================================
// Icône sociale dépliante (desktop bas-gauche + tablette bas de menu) — cf. Global homepage
// et navigation. Cliquer dessus la fait passer à 50% d'opacité et déroule les icônes de
// réseaux sociaux au-dessus d'elle (position absolute : ne modifie jamais le flux/
// positionnement des éléments autour). Se replie seule si le curseur ne survole pas la zone
// dépliée pendant 10 secondes. Factorisé pour les deux instances (desktop + tablette) —
// mêmes classes CSS, mêmes comportements, cf. _main-nav.scss.
// =============================================================================
(function () {
  const PAIRS = [
    { toggleId: 'btnSocialToggle', panelId: 'socialExpandPanel' },
    // fixedAnchor : le panneau tablette est imbriqué dans .mainNavContainerTablet, qui a
    // obligatoirement overflow:hidden (nécessaire pour l'animation de collapse hauteur
    // 0→N px du menu, cf. _main-nav.scss) — un position:absolute s'y faisait donc rogner
    // dès qu'il dépassait la boîte du conteneur, empêchant tout déploiement visible (cf.
    // Interface tablette : "les icônes des réseaux sociaux ne se déplient pas"). Positionné
    // en fixed (coordonnées calculées au clic depuis la position réelle du bouton), il
    // échappe à ce clipping comme le fait nativement la version desktop (dont le conteneur
    // n'a pas cet overflow:hidden).
    { toggleId: 'btnSocialToggleTablet', panelId: 'socialExpandPanelTablet', fixedAnchor: true },
  ];
  const closers = [];

  PAIRS.forEach(({ toggleId, panelId, fixedAnchor }) => {
    const toggle = document.getElementById(toggleId);
    const panel  = document.getElementById(panelId);
    if (!toggle || !panel) return;

    let open = false;
    let closeTimer = null;
    let _trackRAF = null;
    const AUTO_CLOSE_MS = 10000;

    function startCloseTimer() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(closePanel, AUTO_CLOSE_MS);
    }

    function openPanel() {
      open = true;
      if (fixedAnchor) {
        _repositionFixed();
        // Le bouton toggle peut encore être en train de se déplacer (menu tablette qui
        // termine son animation d'ouverture, cf. menuTabletDeploy() — transition height
        // 0.5s) au moment précis du clic : un calcul figé une seule fois pouvait alors
        // ancrer le panneau sur une position transitoire, pas la position finale réelle du
        // bouton (cf. Interface tablette : "les icônes sociales ne se déplient pas" —
        // en réalité dépliées mais mal positionnées, donc invisibles/hors champ). On
        // retrace sa position à chaque frame tant que le panneau reste ouvert : coût
        // négligeable (un seul getBoundingClientRect/frame) et s'arrête de lui-même à la
        // fermeture.
        const trackStart = performance.now();
        const track = () => {
          if (!open) return;
          _repositionFixed();
          // Borné à 700ms (> les 500ms de transition de .mainNavContainerTablet, cf.
          // _main-nav.scss) : largement suffisant pour couvrir la fin d'une éventuelle
          // animation d'ouverture du menu encore en cours, sans laisser tourner une boucle
          // rAF pour rien pendant toute la durée d'ouverture du panneau (jusqu'à 10s).
          if (performance.now() - trackStart < 700) {
            _trackRAF = requestAnimationFrame(track);
          }
        };
        cancelAnimationFrame(_trackRAF);
        _trackRAF = requestAnimationFrame(track);
      }
      panel.classList.add('socialExpandPanel--open');
      toggle.classList.add('btnSocialToggle--active');
      startCloseTimer();
    }

    // Recalcule la position fixe depuis le bouton — appelé en continu pendant que le panneau
    // est ouvert (cf. ci-dessus) ET sur resize (cf. plus bas) : sur certains navigateurs
    // mobiles, window.innerHeight varie en cours de session (barre d'adresse qui se
    // rétracte...), ce qui décale la position déjà calculée si elle n'est jamais rafraîchie.
    function _repositionFixed() {
      const r = toggle.getBoundingClientRect();
      panel.style.position = 'fixed';
      panel.style.left     = `${r.left + r.width / 2}px`;
      panel.style.bottom   = `${window.innerHeight - r.top + 8}px`;
      panel.style.top      = 'auto';
    }

    function closePanel() {
      open = false;
      cancelAnimationFrame(_trackRAF);
      clearTimeout(closeTimer);
      panel.classList.remove('socialExpandPanel--open');
      toggle.classList.remove('btnSocialToggle--active');
    }

    toggle.addEventListener('click', () => {
      if (open) closePanel(); else openPanel();
    });

    if (fixedAnchor) {
      window.addEventListener('resize', () => { if (open) _repositionFixed(); });
    }

    panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    panel.addEventListener('mouseleave', () => { if (open) startCloseTimer(); });

    closers.push(closePanel);
  });

  // Fermeture systématique en quittant la home (évite un panneau resté ouvert,
  // invisible, qui se rouvrirait déplié au prochain affichage de la home).
  window._closeSocialPanel = () => closers.forEach((close) => close());
})();



