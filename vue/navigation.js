document.addEventListener("DOMContentLoaded", () => {
  // TITLES
  TL_HOME = document.querySelector(".homeTitle");
  TL_CONNEXION = document.querySelector(".connexionTitle");
  TL_ADMINTOOL = document.querySelector(".adminToolTitle");
  TL_SETTINGS = document.querySelector(".settingsTitle");
  TL_SCENEEDITOR = document.querySelector(".sceneEditorTitle");
  TL_TAGS = document.querySelector(".tagsTitle");
  TL_MEDIAS = document.querySelector(".mediasTitle");
  TL_PAGES = document.querySelector(".pagesTitle");
  TL_EXPERIENCES = document.querySelector(".experiencesTitle");
  TL_COMMENTS = document.querySelector(".commentsTitle");
  TL_ANALYTICS = document.querySelector(".analyticsTitle");
  TL_PAGEVIEW = document.querySelector(".pageViewCategoryTitle");
  TL_SEARCH = document.querySelector(".searchTitle");
  // CONTENTS
  CNT_HOME = document.getElementById("cntHOME");
  CNT_CONNEXION = document.getElementById("cntCONNEXION");
  CNT_ADMINTOOL = document.getElementById("cntADMINTOOL");
  CNT_SETTINGS = document.getElementById("cntSETTINGS");
  CNT_SCENEEDITOR = document.getElementById("cntSCENEEDITOR");
  CNT_TAGS = document.getElementById("cntTAGS");
  CNT_MEDIAS = document.getElementById("cntMEDIAS");
  CNT_PAGES = document.getElementById("cntPAGES");
  CNT_EXPERIENCES = document.getElementById("cntEXPERIENCES");
  CNT_COMMENTS = document.getElementById("cntCOMMENTS");
  CNT_ANALYTICS = document.getElementById("cntANALYTICS");
  CNT_PAGEVIEW = document.getElementById("cntPAGEVIEW");
  CNT_SEARCH = document.getElementById("cntSEARCH");
  CNT_SECTIONNAV = document.getElementById("sectionNav");
  // BUTTONS & BACKGROUND
  BG_HOME = document.getElementById("backgroundHome");
  document.getElementById("btnPageViewBack")?.addEventListener("click", () => history.back());
  // Indicateurs "scroll down" (un par section, sauf la dernière) — avance vers la section
  // suivante indiquée par data-scroll-target ; texte déjà traduit via [data-en] générique
  // (controller/language.js), le libellé affiché est le nom de LA SECTION SUIVANTE.
  document.querySelectorAll('.scrollDownIndicator[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', () => window._homeScrollTo?.(el.dataset.scrollTarget));
  });
  // Intitulés du menu latéral desktop (lettre par lettre, cf. vue/scroll.js) — ignorés par
  // le système de traduction générique (controller/language.js) car ce ne sont pas de simples
  // éléments texte. Synchronisés ici avec la langue déjà appliquée au chargement, puis à
  // chaque changement de langue.
  document.querySelectorAll('.sectionNavLabel[data-en]').forEach((label) => {
    window._setNavLabelLang?.(label, document.documentElement.lang);
  });
  document.addEventListener('languagechange', (e) => {
    document.querySelectorAll('.sectionNavLabel[data-en]').forEach((label) => {
      window._setNavLabelLang?.(label, e.detail.lang);
    });
  });
});

function titleDisplay(title) {
  const titleTextElements = title.querySelectorAll("span");
  titleTextElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.remove("rotateOutSlow");
      element.style.opacity = 0;
      element.style.transform = "rotateY(90deg)";
      element.classList.add("rotateInSlow");
    }, 75 * index);
  });
}
function titleHide(title) {
  const titleTextElements = title.querySelectorAll("span");
  titleTextElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.remove("rotateInSlow");
      element.classList.add("rotateOutSlow");
      setTimeout(() => {
        element.classList.remove("rotateOutSlow");
        element.style.opacity = 0;
        element.style.transform = "rotateY(90deg)";
      }, 500);
    }, 30 * index);
  });
}

function displayContent(content, delay, onDone) {
  const elementContainer = [...content.children].filter(
    (element) => !element.classList.contains("title")
  );
  const elements = elementContainer.flatMap((container) =>
    [...container.children].filter(
      (child) =>
        (child.tagName === "DIV" || child.tagName === "FORM" || child.matches('.btnBackToAdmin, .btnPageBack')) &&
        // #homeHeroGroup gère lui-même son opacité/position (cf. vue/home-hero.js,
        // _applyHeroScale()) via un "transform" inline (translate + scale, immunité zoom) —
        // l'animation CSS moveInBottomFast/moveOutBottomFast remplace ENTIÈREMENT la
        // propriété "transform" pendant sa durée (comportement standard des keyframes
        // CSS), écrasant ce centrage/cette échelle et provoquant un saut visuel suivi
        // d'une disparition au mauvais endroit (cf. bug rapporté). Avant le passage de
        // .homeTitle/.homeSubtitle en enfants de ce wrapper <div>, ils étaient des <h2>/
        // <h3> qui ne correspondaient PAS à ce filtre (DIV/FORM uniquement) : exclusion
        // explicite ici pour restaurer ce même comportement (jamais animé par ce système
        // générique de transition de page).
        !child.classList.contains("homeHeroGroup")
    )
  );
  const animationDelay = delay;
  if (elements.length === 0) { onDone?.(); return; }
  elements.forEach((element, index) => {
    element.classList.remove("moveOutBottomFast");
    element.style.opacity = "0";
    // Force un reflow pour enregistrer cet état initial
    void element.offsetHeight;
    setTimeout(() => {
      element.classList.add("moveInBottomFast");
      element.addEventListener(
        "animationend",
        () => {
          element.classList.remove("moveInBottomFast");
          element.style.opacity = "1";
          if (index === elements.length - 1) onDone?.();
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}

function hideContent(content, delay) {
  const elementContainer = [...content.children].filter(
    (element) => !element.classList.contains("title")
  );
  const elements = elementContainer.flatMap((container) =>
    [...container.children].filter(
      (child) =>
        (child.tagName === "DIV" || child.tagName === "FORM" || child.matches('.btnBackToAdmin, .btnPageBack')) &&
        // cf. displayContent() ci-dessus pour l'explication complète de cette exclusion.
        !child.classList.contains("homeHeroGroup")
    )
  );

  const animationDelay = delay;

  elements.reverse().forEach((element, index) => {
    element.classList.remove("moveInBottomFast");
    element.style.opacity = "0";
    element.classList.add("moveOutBottomFast");
    // Force un reflow ici aussi
    void element.offsetHeight;
    setTimeout(() => {
      element.addEventListener(
        "animationend",
        () => {
          element.classList.remove("moveOutBottomFast");
          element.style.opacity = "0";
        },
        { once: true }
      );
    }, animationDelay * index);
  });
}

let page = "home";
let _homeScroller = null; // instance SectionScroller actuelle

/////////////// HOME ///////////////
function activateHome() {
  const buttons = [BTN_HOME_TABLET, BTN_HOME_MOBILE];
  // Scrolle vers la section "landing" (pas juste accessHome, qui ne fait rien une fois déjà
  // sur la home dans une autre section — sinon le bouton Accueil devient inutilisable après
  // la première navigation vers une section).
  buttons.forEach((button) => {
    button.addEventListener("click", () => accessHomeSection("landing"));
    button.addEventListener("touchend", () => accessHomeSection("landing"));
  });
}
function accessHome() {
  if (page !== "home") {
    hideBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayHome();
      _setPage("home");
    }, 500);
  }
}
// Accès à une section de la home (tablette/mobile miroir des items de #sectionNav desktop) —
// retourne d'abord à la home si on est ailleurs, puis scrolle (même logique que le popstate
// /home/{section} du routeur).
function accessHomeSection(sectionId) {
  if (page === "home") {
    window._homeScrollTo?.(sectionId);
  } else {
    accessHome();
    setTimeout(() => window._homeScrollTo?.(sectionId), 600);
  }
}
function _activateSectionButtons(buttons, sectionId) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => accessHomeSection(sectionId));
    button.addEventListener("touchend", () => accessHomeSection(sectionId));
  });
}
function activatePresentation() {
  _activateSectionButtons([BTN_PRESENTATION_TABLET, BTN_PRESENTATION_MOBILE], "presentation");
}
function activateExpertiseSection() {
  _activateSectionButtons([BTN_EXPERTISE_TABLET, BTN_EXPERTISE_MOBILE], "expertise");
}
function activatePortfolioSection() {
  _activateSectionButtons([BTN_PORTFOLIO_SECTION_TABLET, BTN_PORTFOLIO_SECTION_MOBILE], "portfolio");
}
function activateBioSection() {
  _activateSectionButtons([BTN_BIO_SECTION_TABLET, BTN_BIO_SECTION_MOBILE], "bio");
}
function activateGallerySection() {
  _activateSectionButtons([BTN_GALLERY_SECTION_TABLET, BTN_GALLERY_SECTION_MOBILE], "gallery");
}
function activateBlogSection() {
  _activateSectionButtons([BTN_BLOG_SECTION_TABLET, BTN_BLOG_SECTION_MOBILE], "blog");
}
function activateContactSection() {
  _activateSectionButtons([BTN_CONTACT_SECTION_TABLET, BTN_CONTACT_SECTION_MOBILE], "contact");
}
// Titre custom d'une section home (landing exclue — géré via TL_HOME)
function _homeSectionTitleEl(sectionId) {
  if (!sectionId || sectionId === 'landing') return null;
  return CNT_HOME.querySelector(`.section[data-section="${sectionId}"] > h2.title`);
}
// Chargement progressif du contenu dynamique d'une section home — une section n'est
// chargée que la première fois qu'elle devient active (cf. demande : seule la home/landing
// est prioritaire au lancement, le reste se charge au fil de la navigation).
let _bioTimelineLoaded = false;
let _portfolioCarouselLoaded = false;
function _ensureHomeSectionLoaded(sectionId) {
  if (sectionId === 'bio' && !_bioTimelineLoaded) {
    _bioTimelineLoaded = true;
    window._loadBioTimeline?.();
    return;
  }
  if (sectionId === 'portfolio' && !_portfolioCarouselLoaded) {
    _portfolioCarouselLoaded = true;
    window._initPortfolioCarousel?.();
    return;
  }
  if (sectionId === 'gallery') {
    window._initGallerySection?.();
    return;
  }
  window._loadHomeCardsForSection?.(sectionId);
}
// Bouton actif du menu burger mobile/tablette (section actuellement affichée sur la home) —
// reçoit le glow externe pulsant (cf. .btnMobile--active / .btnTablet--active,
// _main-nav.scss). Un seul point de vérité, mis à jour à chaque changement de section (cf.
// _onSectionChange plus bas) et à l'affichage initial de la home.
const _MOBILE_SECTION_BTN_MAP = {
  landing: 'btnHomeMobile',
  presentation: 'btnPresentationMobile',
  expertise: 'btnExpertiseMobile',
  portfolio: 'btnPortfolioSectionMobile',
  bio: 'btnBioSectionMobile',
  gallery: 'btnGallerySectionMobile',
  blog: 'btnBlogSectionMobile',
  contact: 'btnContactSectionMobile',
};
const _TABLET_SECTION_BTN_MAP = {
  landing: 'btnHomeTablet',
  presentation: 'btnPresentationTablet',
  expertise: 'btnExpertiseTablet',
  portfolio: 'btnPortfolioSectionTablet',
  bio: 'btnBioSectionTablet',
  gallery: 'btnGallerySectionTablet',
  blog: 'btnBlogSectionTablet',
  contact: 'btnContactSectionTablet',
};
function _updateMobileActiveButton(sectionId) {
  document.querySelectorAll('.btnMobile--active').forEach((b) => b.classList.remove('btnMobile--active'));
  document.querySelectorAll('.btnTablet--active').forEach((b) => b.classList.remove('btnTablet--active'));
  const id = _MOBILE_SECTION_BTN_MAP[sectionId];
  const btn = id && document.getElementById(id);
  if (btn) btn.classList.add('btnMobile--active');
  const tabletId = _TABLET_SECTION_BTN_MAP[sectionId];
  const tabletBtn = tabletId && document.getElementById(tabletId);
  if (tabletBtn) tabletBtn.classList.add('btnTablet--active');
}
// Exposé pour SectionScroller._transition (vue/scroll.js) : l'ancien point d'entrée unique,
// l'évènement 'sectionChange', ne se déclenche qu'à la TOUTE FIN de la transition de scroll
// (cf. _dispatchChange, appelé après this.duration) — l'état actif mobile/tablette accusait
// donc un retard perceptible par rapport au clic, contrairement à l'icône desktop
// (#sectionNav, mise à jour immédiatement via _updateNav()). Appelé désormais directement et
// immédiatement depuis _transition(), au même instant que _updateNav() (cf. Interface
// tablette : "un bouton doit être actif dès qu'on clique dessus").
window._updateMobileActiveButton = _updateMobileActiveButton;

function displayHome() {
  window.GCABackground?.setPage('home');
  CNT_HOME.style.display = "flex";
  CNT_SECTIONNAV.style.display = "flex";
  // Chargement progressif : seule la section réellement affichée (landing en priorité, ou la
  // section ciblée par un deep-link) déclenche son chargement de contenu dynamique — les autres
  // ne sont chargées qu'au moment où l'utilisateur les atteint (cf. _ensureHomeSectionLoaded,
  // branché sur l'évènement 'sectionChange' plus bas). Maximise la vitesse de lancement du site :
  // seuls l'interface et la section d'accueil sont prioritaires au chargement initial.
  // Formulaire de contact (section Contact) — lié une seule fois, cf. form_validation.js
  window.contactCheck?.();
  // Init du scroll magnétique sur les sections de la home — repositionné
  // directement sur la section ciblée par l'URL (ex: /home/portfolio) pour
  // éviter un flash de la section "landing" avant la transition animée.
  const _pathMatch = window.location.pathname.replace(/^\/+|\/+$/g, '').match(/^home\/(.+)$/);
  const _targetSection = _pathMatch ? _pathMatch[1] : null;
  const _targetIdx = _targetSection
    ? Math.max(0, Array.from(CNT_HOME.querySelectorAll('.section')).findIndex(s => s.dataset.section === _targetSection))
    : 0;
  _homeScroller = new SectionScroller(CNT_HOME, CNT_SECTIONNAV);
  _homeScroller.current = _targetIdx;
  // Le label actif ne doit pas se masquer tout seul pendant la séquence d'intro (cf. plus
  // bas, _onIntroPartDone le fera lui-même une fois celle-ci terminée).
  _homeScroller._suppressActiveAutoHide = true;
  _homeScroller.init();
  // Permet aux modules de contenu dynamique (cards, timeline bio...) de
  // recalculer le scroll interne + la scrollbar une fois leur rendu terminé
  window._refreshSectionScrollUI = () => _homeScroller?.refreshAll();
  if (_targetIdx === 0) {
    hideBackBlurMask();
    // Révélation du titre principal planifiée via la chronologie d'intro configurable (cf.
    // Settings admin tool, vue/intro-timeline.js) — seul le MOMENT de l'appel change, jamais
    // titleDisplay() lui-même. Le cas d'un deep-link direct vers une sous-section (branche
    // "else" ci-dessous) reste immédiat : l'intro est déjà court-circuitée dans ce cas
    // (cf. controller/start.js, chemin "Deep link").
    window._introTimeline?.schedule('mainTitle', () => titleDisplay(TL_HOME));
  }
  else { titleDisplay(_homeSectionTitleEl(_targetSection)); displayBackBlurMask(); }
  _ensureHomeSectionLoaded(_targetIdx === 0 ? 'landing' : _targetSection);
  _updateMobileActiveButton(_targetIdx === 0 ? 'landing' : _targetSection);

  // Mise à jour du slug + titre de section quand on scrolle — le flou d'arrière-plan est
  // désormais déclenché immédiatement au clic (SectionScroller._applyBackdrop), pas ici.
  let _prevSectionId = _targetIdx === 0 ? 'landing' : _targetSection;
  const _onSectionChange = (e) => {
    window._updateHomeSection?.(e.detail.sectionId);
    _ensureHomeSectionLoaded(e.detail.sectionId);
    _updateMobileActiveButton(e.detail.sectionId);
    if (e.detail.sectionId !== _prevSectionId) {
      const prevTitle = _prevSectionId === 'landing' ? TL_HOME : _homeSectionTitleEl(_prevSectionId);
      const nextTitle = e.detail.sectionId === 'landing' ? TL_HOME : _homeSectionTitleEl(e.detail.sectionId);
      if (prevTitle && prevTitle !== nextTitle) titleHide(prevTitle);
      if (nextTitle) titleDisplay(nextTitle);
      _prevSectionId = e.detail.sectionId;
    }
  };
  CNT_HOME.addEventListener('sectionChange', _onSectionChange);

  // Callback utilisé par le routeur pour scroller vers une section par id (idx 0 = landing/Accueil
  // inclus, sinon le bouton "Accueil" ne fait plus rien une fois qu'on a navigué vers une section)
  window._homeScrollTo = (sectionId) => {
    const idx = _homeScroller?.sections.findIndex(s => s.dataset.section === sectionId) ?? -1;
    if (idx >= 0) _homeScroller.goTo(idx);
  };
  // Icônes section puis icônes sociales desktop en stagger continu
  const _sectionItems = Array.from(CNT_SECTIONNAV.querySelectorAll('.sectionNavItem'));
  const _socialItems  = Array.from(document.querySelectorAll('#socialLinksDesktop .socialLinksDesktopItem'));
  // Pré-masquage immédiat (avant planification via la chronologie d'intro) — ces éléments
  // sont opacity:1 par défaut en CSS tant qu'aucune révélation stagger n'a tourné (cf.
  // .sectionNavItem/.socialLinksDesktopItem), donc sans ce pré-masquage ils resteraient
  // visibles en pleine opacité pendant toute l'attente du délai "lateralIcons" configuré.
  _sectionItems.forEach((el) => { el.style.opacity = '0'; });
  _socialItems.forEach((el) => { el.style.opacity = '0'; });

  // ── Séquence d'apparition initiale ──────────────────────────────────────────
  // Au lancement du site, TOUS les intitulés de section doivent devenir visibles (chacun dès
  // que SA PROPRE icône a terminé son apparition — jamais pendant, sinon conflit visuel entre
  // le flip de l'icône et celui du label) et le rester tant que le reste de l'interface et du
  // menu d'accueil n'ont pas eux-mêmes terminé leur apparition. Ce n'est qu'une fois les TROIS
  // séquences suivantes terminées (contenu de la home — dont le dernier élément est l'icône de
  // scroll — + icônes de section + icônes sociales) que les intitulés jouent leur disparition
  // en cascade, à partir de la section active.
  let _introPartsPending = 3;
  const _onIntroPartDone = () => {
    _introPartsPending -= 1;
    if (_introPartsPending === 0) {
      _homeScroller._suppressActiveAutoHide = false;
      if (!_homeScroller._labelHoverActive) {
        _navLabelCascadeHide(_sectionItems, _homeScroller.current);
      }
    }
  };
  displayContent(CNT_HOME, 50, _onIntroPartDone);
  // Démarrage de la cascade désormais planifié via la chronologie d'intro configurable
  // ("lateralIcons", desktop uniquement — schedule() ne fait rien sur tablette/mobile, cf.
  // vue/intro-timeline.js) au lieu d'un appel immédiat — staggerReveal()/_navLabelReveal()
  // eux-mêmes restent entièrement inchangés.
  window._introTimeline?.schedule('lateralIcons', () => {
    staggerReveal(_sectionItems, {
      delay: 60,
      onEach: (el) => _navLabelReveal(el.querySelector('.sectionNavLabel')),
      onDone: _onIntroPartDone,
    });
    staggerReveal(_socialItems, { delay: 60, startAt: _sectionItems.length, onDone: _onIntroPartDone });
  });

  // ── Zone hover : afficher/cacher les labels en cascade à partir du curseur ──
  // Chaque item déclenche sa propre cascade de révélation (le sien d'abord, puis les
  // suivants par vagues en s'éloignant de lui dans les deux sens) ; à la sortie de la zone,
  // la cascade de disparition repart du DERNIER item survolé, dans le même ordre.
  //
  // La disparition ne doit JAMAIS se déclencher tant que le curseur reste quelque part dans
  // la zone globale occupée par l'ensemble des entrées (y compris les minuscules interstices
  // entre deux items consécutifs) : un mouseleave posé directement sur #sectionNav ne
  // convient pas, car ce conteneur a pointer-events:none (seuls les items l'ont en pointer-
  // events:auto, cf. règle .sectionNav ci-dessus) — passer d'un item à l'autre par
  // l'interstice qui les sépare fait alors "sortir" puis "rentrer" du conteneur aux yeux du
  // navigateur (le hit-test retombe sur ce qu'il y a derrière), déclenchant un aller-retour
  // mouseleave/mouseenter parasite qui pouvait, si le curseur s'immobilisait pile dans cet
  // interstice, faire disparaître les libellés alors que le curseur est toujours visuellement
  // au milieu de la colonne de nav. On calcule donc plutôt un rectangle englobant l'ensemble
  // des items (mis à jour à chaque entrée) et on surveille le curseur via mousemove.
  let _labelHideTimer = null;
  let _lastHoveredIndex = _homeScroller.current;
  let _navZoneRect = null;

  function _computeNavZoneRect() {
    if (!_sectionItems.length) return null;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    _sectionItems.forEach((item) => {
      const r = item.getBoundingClientRect();
      left   = Math.min(left, r.left);
      top    = Math.min(top, r.top);
      right  = Math.max(right, r.right);
      bottom = Math.max(bottom, r.bottom);
    });
    return { left, top, right, bottom };
  }

  function _isInsideNavZone(x, y) {
    if (!_navZoneRect) return false;
    return x >= _navZoneRect.left && x <= _navZoneRect.right
        && y >= _navZoneRect.top  && y <= _navZoneRect.bottom;
  }

  const _onItemEnter = (index) => {
    _homeScroller._labelHoverActive = true;
    _lastHoveredIndex = index;
    clearTimeout(_labelHideTimer);
    _labelHideTimer = null;
    _resetIdleTimer();
    _navZoneRect = _computeNavZoneRect();
    _navLabelCascadeReveal(_sectionItems, index);
  };

  const _onNavZoneMouseMove = (e) => {
    if (!_homeScroller._labelHoverActive) return;
    if (_isInsideNavZone(e.clientX, e.clientY)) {
      clearTimeout(_labelHideTimer);
      _labelHideTimer = null;
      return;
    }
    if (_labelHideTimer) return; // déjà programmé
    // Debounce : attendre avant de cacher (gère les sorties/entrées rapides)
    _labelHideTimer = setTimeout(() => {
      _homeScroller._labelHoverActive = false;
      _navLabelCascadeHide(_sectionItems, _lastHoveredIndex);
    }, 500);
  };

  // Un handler distinct par item (fermeture sur son index) — conservé pour un retrait propre
  // dans _cleanupLabels (les éléments de #sectionNav persistent en DOM d'une visite de la
  // home à l'autre, display:none seulement ; sans retrait explicite, les listeners
  // s'accumuleraient à chaque nouvelle navigation vers la home).
  const _itemEnterHandlers = _sectionItems.map((item, index) => {
    const handler = () => _onItemEnter(index);
    item.addEventListener('mouseenter', handler);
    return { item, handler };
  });
  document.addEventListener('mousemove', _onNavZoneMouseMove, { passive: true });

  // ── Inactivité : réaffiche les intitulés après 10s sans interaction ─────────
  // Repart toujours de la section active, puis suit le même effet de cascade. Se referme
  // de lui-même après quelques secondes si l'utilisateur ne survole pas la nav entre-temps.
  let _idleTimer = null;
  let _idleRevealHideTimer = null;
  const IDLE_DELAY_MS = 10000;
  function _resetIdleTimer() {
    clearTimeout(_idleTimer);
    _idleTimer = setTimeout(() => {
      if (_homeScroller._labelHoverActive) return;
      _navLabelCascadeReveal(_sectionItems, _homeScroller.current);
      clearTimeout(_idleRevealHideTimer);
      _idleRevealHideTimer = setTimeout(() => {
        if (!_homeScroller._labelHoverActive) {
          _navLabelCascadeHide(_sectionItems, _homeScroller.current);
        }
      }, 2600);
    }, IDLE_DELAY_MS);
  }
  const _onActivity = () => _resetIdleTimer();
  ['mousemove', 'keydown', 'wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
    document.addEventListener(evt, _onActivity, { passive: true });
  });
  _resetIdleTimer();

  // Stocker les refs pour cleanup propre dans unloadPage
  _homeScroller._cleanupLabels = () => {
    clearTimeout(_labelHideTimer);
    clearTimeout(_idleTimer);
    clearTimeout(_idleRevealHideTimer);
    ['mousemove', 'keydown', 'wheel', 'touchstart', 'pointerdown'].forEach((evt) => {
      document.removeEventListener(evt, _onActivity);
    });
    document.removeEventListener('mousemove', _onNavZoneMouseMove);
    _itemEnterHandlers.forEach(({ item, handler }) => item.removeEventListener('mouseenter', handler));
    CNT_HOME.removeEventListener('sectionChange', _onSectionChange);
    window._homeScrollTo = null;
  };

  // Enregistrer /home dans l'historique (notamment pour le chargement initial via startSequence)
  window._setPage?.('home');
}
/////////////// PAGE VIEW (détail public projet/expertise/blog) ///////////////
function accessPageView(slug) {
  if (page === "pageView" && _currentPageViewSlug === slug) return;
  if (page !== "pageView") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayPageView(slug); }, 500);
  } else {
    // Changement de page en restant en pageView : même effet de déchargement/chargement
    titleHide(TL_PAGEVIEW);
    hideContent(CNT_PAGEVIEW, 25);
    window._unloadPageView?.();
    setTimeout(() => { displayPageView(slug); }, 500);
  }
}
function displayPageView(slug) {
  window.GCABackground?.setPage('pageView');
  CNT_PAGEVIEW.style.display = "flex";
  displayContent(CNT_PAGEVIEW, 50);
  _currentPageViewSlug = slug;
  page = "pageView";
  window._pushPageViewSlug?.(slug);
  window._loadPageView?.(slug);
}
window.accessPageView = accessPageView;

/////////////// SEARCH (recherche du site) ///////////////
function activateSearchNav() {
  const buttons = [
    document.getElementById('btnSearchDesktop'),
    document.getElementById('btnSearchTablet'),
    document.getElementById('btnSearchMobile'),
  ].filter(Boolean);
  buttons.forEach((button) => {
    button.addEventListener('click', accessSearch);
    button.addEventListener('touchend', accessSearch);
  });
}
function accessSearch() {
  if (page !== "search") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displaySearch(); _setPage("search"); }, 500);
  }
}
window.accessSearch = accessSearch;
function displaySearch() {
  window.GCABackground?.setPage('search');
  CNT_SEARCH.style.display = "flex";
  titleDisplay(TL_SEARCH);
  displayContent(CNT_SEARCH, 50);
  window._focusSearchInput?.();
}

/////////////// CONNEXION ///////////////
// Plus de bouton de connexion visible : l'écran n'est accessible que via le code
// clavier secret saisi sur la home (desktop uniquement, cf. vue/secret-login.js).
function accessConnexion() {
  if (page !== "connexion") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayConnexion();
      _setPage("connexion");
    }, 500);
  }
}
window.accessConnexion = accessConnexion;
function displayConnexion() {
  window.GCABackground?.setPage('connexion');
  CNT_CONNEXION.style.display = "flex";
  titleDisplay(TL_CONNEXION);
  displayContent(CNT_CONNEXION, 50);
  setAutofocus(FORM_CONNEXION);
  connexionCheck();
}
/////////////// ADMIN TOOL (accès direct + logout) ///////////////
function activateAdminDirectAccess() {
  const btn = document.getElementById('btnDirectAdmin');
  if (btn) {
    btn.addEventListener('click', accessAdminTool);
    btn.addEventListener('touchend', accessAdminTool);
  }
  const logoutBtn = document.getElementById('btnAdminLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.logoutFetch?.());
    logoutBtn.addEventListener('touchend', () => window.logoutFetch?.());
  }
}
/////////////// ADMINTOOL ///////////////
function accessAdminTool() {
  if (!window.isAdminAllowed?.()) { accessHome(); return; }
  if (page !== "adminTool") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayAdminTool();
      _setPage("adminTool");
    }, 501);
  }
}
function displayAdminTool() {
  window.GCABackground?.setPage('admintool');
  CNT_ADMINTOOL.style.display = "flex";
  titleDisplay(TL_ADMINTOOL);
  displayContent(CNT_ADMINTOOL, 50);
  activateSettingsManagement();
  activateTagsManagement();
  activateMediasManagement();
  activatePagesManagement();
  activateExperiencesManagement();
  activateCommentsManagement();
  activateSceneEditor();
  // Masquer le bouton d'accès à l'admin pendant qu'on y est
  const adminBtn = document.getElementById('btnDirectAdmin');
  if (adminBtn) adminBtn.style.visibility = 'hidden';
}
/////////////// SCENEEDITOR ///////////////
function activateSceneEditor() {
  const btn = document.getElementById('btnSceneEditor');
  if (!btn) return;
  btn.addEventListener("click",    accessSceneEditor);
  btn.addEventListener("touchend", accessSceneEditor);
}
function accessSceneEditor() {
  if (page !== "sceneEditor") {
    hideBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displaySceneEditor();
      _setPage("sceneEditor");
    }, 501);
  }
}
function displaySceneEditor() {
  window.GCABackground?.setPage('admintool');
  window.GCABackground?.setEditorMode(true);
  CNT_SCENEEDITOR.classList.add('se-visible');
  titleDisplay(TL_SCENEEDITOR);
  initSceneEditor();
}
/////////////// TAGS ///////////////
function activateTagsManagement() {
  const btn = document.getElementById('btnTagsManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessTagsManagement);
  btn.addEventListener('touchend', accessTagsManagement);
}
function accessTagsManagement() {
  if (page !== 'tagsManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayTagsManagement(); _setPage('tagsManagement'); }, 501);
  }
}
function displayTagsManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initTagsManagement === 'function') initTagsManagement();
  CNT_TAGS.style.display = 'flex';
  titleDisplay(TL_TAGS);
  displayContent(CNT_TAGS, 50);
}
/////////////// MEDIAS ///////////////
function activateMediasManagement() {
  const btn = document.getElementById('btnMediasManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessMediasManagement);
  btn.addEventListener('touchend', accessMediasManagement);
}
function accessMediasManagement() {
  if (page !== 'mediasManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayMediasManagement(); _setPage('mediasManagement'); }, 501);
  }
}
function displayMediasManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initMediasManagement === 'function') initMediasManagement();
  CNT_MEDIAS.style.display = 'flex';
  titleDisplay(TL_MEDIAS);
  displayContent(CNT_MEDIAS, 50);
}
/////////////// PAGES ///////////////
function activatePagesManagement() {
  const btn = document.getElementById('btnPagesManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessPagesManagement);
  btn.addEventListener('touchend', accessPagesManagement);
}
function accessPagesManagement() {
  if (page !== 'pagesManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayPagesManagement(); _setPage('pagesManagement'); }, 501);
  }
}
function displayPagesManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initPagesManagement === 'function') initPagesManagement();
  CNT_PAGES.style.display = 'flex';
  titleDisplay(TL_PAGES);
  displayContent(CNT_PAGES, 50);
}
/////////////// EXPERIENCES ///////////////
function activateExperiencesManagement() {
  const btn = document.getElementById('btnExperiencesManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessExperiencesManagement);
  btn.addEventListener('touchend', accessExperiencesManagement);
}
function accessExperiencesManagement() {
  if (page !== 'experiencesManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayExperiencesManagement(); _setPage('experiencesManagement'); }, 501);
  }
}
function displayExperiencesManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initExperiencesManagement === 'function') initExperiencesManagement();
  CNT_EXPERIENCES.style.display = 'flex';
  titleDisplay(TL_EXPERIENCES);
  displayContent(CNT_EXPERIENCES, 50);
}
/////////////// COMMENTS ///////////////
function activateCommentsManagement() {
  const btn = document.getElementById('btnCommentsManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessCommentsManagement);
  btn.addEventListener('touchend', accessCommentsManagement);
}
function accessCommentsManagement() {
  if (page !== 'commentsManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayCommentsManagement(); _setPage('commentsManagement'); }, 501);
  }
}
function displayCommentsManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initCommentsManagement === 'function') initCommentsManagement();
  CNT_COMMENTS.style.display = 'flex';
  titleDisplay(TL_COMMENTS);
  displayContent(CNT_COMMENTS, 50);
}
/////////////// ANALYTICS ///////////////
function activateAnalytics() {
  const btn = document.getElementById('btnAnalytics');
  if (!btn) return;
  btn.addEventListener('click',    accessAnalytics);
  btn.addEventListener('touchend', accessAnalytics);
}
function accessAnalytics() {
  if (page !== 'analytics') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayAnalytics(); _setPage('analytics'); }, 501);
  }
}
function displayAnalytics() {
  window.GCABackground?.setPage('admintool');
  CNT_ANALYTICS.style.display = 'flex';
  titleDisplay(TL_ANALYTICS);
  displayContent(CNT_ANALYTICS, 50);
}
/////////////// SETTINGS (remplace l'ancienne gestion des utilisateurs) ///////////////
function activateSettingsManagement() {
  const btn = document.getElementById('btnSettingsManagement');
  if (!btn) return;
  btn.addEventListener("click", accessSettingsManagement);
  btn.addEventListener("touchend", accessSettingsManagement);
}
function accessSettingsManagement() {
  if (page !== "settingsManagement") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displaySettingsManagement(); _setPage("settingsManagement"); }, 501);
  }
}
function displaySettingsManagement() {
  window.GCABackground?.setPage('settingsmanagement');
  window._initSettingsManagement?.();
  CNT_SETTINGS.style.display = "flex";
  titleDisplay(TL_SETTINGS);
  displayContent(CNT_SETTINGS, 50);
}

/////////////// NAVIGATION ///////////////
function activateNavigation() {
  activateHome();
  activateAdminDirectAccess();
  activateSearchNav();
  // Miroir tablette/mobile des sections du menu latéral desktop (#sectionNav)
  activatePresentation();
  activateExpertiseSection();
  activatePortfolioSection();
  activateBioSection();
  activateGallerySection();
  activateBlogSection();
  activateContactSection();
}

document.addEventListener("DOMContentLoaded", () => {
  // Délégation globale unifiée
  document.addEventListener('click', (e) => {
    // Retour Admin tool
    if (e.target.closest('#btnExitEditMode'))  { /* géré par son propre listener */ return; }
    if (e.target.closest('#btnAdminBackHome'))  { accessHome();      return; }
    if (e.target.closest('.btnBackToAdmin')) { accessAdminTool(); return; }

    // Switch FR/EN pour les champs bilingues
    const langBtn = e.target.closest('.langBtn');
    if (langBtn) {
      const group = langBtn.closest('.langGroup');
      if (group) {
        const lang = langBtn.dataset.lang;
        group.querySelectorAll('.langBtn').forEach(b => b.classList.toggle('langBtn--active', b === langBtn));
        group.querySelectorAll('.langField').forEach(f => {
          f.classList.toggle('langField--visible', f.dataset.lang === lang);
        });
      }
    }
  });
});

// Éjecte vers la home si la fenêtre repasse sous le seuil desktop pendant qu'on est dans
// l'admin tool (ex: resize/rotation) — l'admin tool ne doit jamais rester affiché hors desktop.
// Registre des pages admin partagé avec controller/router.js (cf. vue/breakpoints.js).
window.addEventListener('resize', () => {
  if (window.ADMIN_ROUTE_KEYS?.has(page) && !window.isAdminAllowed?.()) accessHome();
});

function unloadPage() {
  switch (page) {
    case "home": {
      titleHide(TL_HOME);
      // Titre de la section active (hors landing, déjà géré ci-dessus)
      const _activeSection = CNT_HOME.querySelector('.section--active')?.dataset?.section;
      if (_activeSection && _activeSection !== 'landing') titleHide(_homeSectionTitleEl(_activeSection));
      hideContent(CNT_HOME, 25);
      // Nettoyage listeners labels hover + scroller
      if (_homeScroller?._cleanupLabels) _homeScroller._cleanupLabels();
      if (_homeScroller) { _homeScroller.destroy(); _homeScroller = null; }
      window._closeSocialPanel?.();
      // Icônes sociales puis icônes section disparaissent en stagger (ordre inverse de l'apparition), puis on cache la nav
      const _socialItemsOut = Array.from(document.querySelectorAll('#socialLinksDesktop .socialLinksDesktopItem'));
      staggerHide(_socialItemsOut, { delay: 40, reverse: true });
      staggerHide(CNT_SECTIONNAV.querySelectorAll('.sectionNavItem'), {
        delay: 40, reverse: true, startAt: _socialItemsOut.length,
      });
      // display:none à échéance fixe (500ms, comme CNT_HOME juste en dessous) plutôt que dans
      // le onDone du stagger : avec ~12 items à 40ms d'écart + durée d'animation CSS, le dernier
      // animationend pouvait arriver après qu'un accessHome() rapide ait déjà ré-affiché la nav
      // (displayHome() lui-même planifié à 500ms) — ce onDone tardif écrasait alors
      // CNT_SECTIONNAV.style.display en 'none' APRÈS son ré-affichage, laissant la navigation
      // latérale invisible en revenant sur la home (ex: après avoir visité l'admin tool).
      setTimeout(() => {
        CNT_SECTIONNAV.style.display = 'none';
      }, 500);
      setTimeout(() => {
        CNT_HOME.style.display = "none";
      }, 500);
      break;
    }
    case "pageView":
      titleHide(TL_PAGEVIEW);
      hideContent(CNT_PAGEVIEW, 25);
      window._unloadPageView?.();
      setTimeout(() => {
        CNT_PAGEVIEW.style.display = "none";
      }, 501);
      break;
    case "search":
      titleHide(TL_SEARCH);
      hideContent(CNT_SEARCH, 25);
      setTimeout(() => {
        CNT_SEARCH.style.display = "none";
      }, 501);
      break;
    case "connexion":
      titleHide(TL_CONNEXION);
      hideContent(CNT_CONNEXION, 25);
      setTimeout(() => {
        CNT_CONNEXION.style.display = "none";
        resetLoginForm();
        BTN_LOGIN_CONNEXION.removeEventListener("click", loginFetch);
      }, 501);
      break;
    case "adminTool":
      titleHide(TL_ADMINTOOL);
      hideContent(CNT_ADMINTOOL, 25);
      setTimeout(() => {
        CNT_ADMINTOOL.style.display = "none";
        // Réafficher le bouton d'accès admin
        const adminBtn = document.getElementById('btnDirectAdmin');
        if (adminBtn) adminBtn.style.visibility = '';
      }, 501);
      break;
    case "settingsManagement":
      titleHide(TL_SETTINGS);
      hideContent(CNT_SETTINGS, 25);
      setTimeout(() => { CNT_SETTINGS.style.display = "none"; }, 501);
      break;
    case "tagsManagement":
      titleHide(TL_TAGS);
      hideContent(CNT_TAGS, 25);
      setTimeout(() => { CNT_TAGS.style.display = "none"; }, 501);
      break;
    case "mediasManagement":
      titleHide(TL_MEDIAS);
      hideContent(CNT_MEDIAS, 25);
      setTimeout(() => { CNT_MEDIAS.style.display = "none"; }, 501);
      break;
    case "pagesManagement":
      titleHide(TL_PAGES);
      hideContent(CNT_PAGES, 25);
      setTimeout(() => { CNT_PAGES.style.display = "none"; }, 501);
      break;
    case "experiencesManagement":
      titleHide(TL_EXPERIENCES);
      hideContent(CNT_EXPERIENCES, 25);
      setTimeout(() => { CNT_EXPERIENCES.style.display = "none"; }, 501);
      break;
    case "commentsManagement":
      titleHide(TL_COMMENTS);
      hideContent(CNT_COMMENTS, 25);
      setTimeout(() => { CNT_COMMENTS.style.display = "none"; }, 501);
      break;
    case "analytics":
      titleHide(TL_ANALYTICS);
      hideContent(CNT_ANALYTICS, 25);
      setTimeout(() => { CNT_ANALYTICS.style.display = "none"; }, 501);
      break;
    case "sceneEditor":
      titleHide(TL_SCENEEDITOR);
      hideBackBlurMask();
      window.GCABackground?.setEditorMode(false);
      window.GCABackground?.setCameraViewOverride?.(null);
      document.querySelectorAll('.seViewBtn.seToolBtn--active').forEach(b => b.classList.remove('seToolBtn--active'));
      setTimeout(() => {
        CNT_SCENEEDITOR.classList.remove('se-visible');
      }, 501);
      break;
    default:
      break;
  }
}
