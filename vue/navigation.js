document.addEventListener("DOMContentLoaded", () => {
  // TITLES
  TL_HOME = document.querySelector(".homeTitle");
  TL_CONNEXION = document.querySelector(".connexionTitle");
  TL_REGISTER = document.querySelector(".registerTitle");
  TL_USERPROFILE = document.querySelector(".userProfileTitle");
  TL_ADMINTOOL = document.querySelector(".adminToolTitle");
  TL_USERSMANAGEMENT = document.querySelector(".usersManagementTitle");
  TL_SCENEEDITOR = document.querySelector(".sceneEditorTitle");
  TL_TAGS = document.querySelector(".tagsTitle");
  TL_MEDIAS = document.querySelector(".mediasTitle");
  TL_PAGES = document.querySelector(".pagesTitle");
  TL_EXPERIENCES = document.querySelector(".experiencesTitle");
  TL_COMMENTS = document.querySelector(".commentsTitle");
  TL_MESSAGES = document.querySelector(".messagesTitle");
  TL_ANALYTICS = document.querySelector(".analyticsTitle");
  TL_PAGEVIEW = document.querySelector(".pageViewCategoryTitle");
  TL_RESETPASSWORD = document.querySelector(".resetPasswordTitle");
  // CONTENTS
  CNT_HOME = document.getElementById("cntHOME");
  CNT_CONNEXION = document.getElementById("cntCONNEXION");
  CNT_REGISTER = document.getElementById("cntREGISTER");
  CNT_USERPROFILE = document.getElementById("cntUSERPROFILE");
  CNT_ADMINTOOL = document.getElementById("cntADMINTOOL");
  CNT_USERSMANAGEMENT = document.getElementById("cntUSERSMANAGEMENT");
  CNT_SCENEEDITOR = document.getElementById("cntSCENEEDITOR");
  CNT_TAGS = document.getElementById("cntTAGS");
  CNT_MEDIAS = document.getElementById("cntMEDIAS");
  CNT_PAGES = document.getElementById("cntPAGES");
  CNT_EXPERIENCES = document.getElementById("cntEXPERIENCES");
  CNT_COMMENTS = document.getElementById("cntCOMMENTS");
  CNT_MESSAGES = document.getElementById("cntMESSAGES");
  CNT_ANALYTICS = document.getElementById("cntANALYTICS");
  CNT_PAGEVIEW = document.getElementById("cntPAGEVIEW");
  CNT_RESETPASSWORD = document.getElementById("cntRESETPASSWORD");
  CNT_SECTIONNAV = document.getElementById("sectionNav");
  // BUTTONS & BACKGROUND
  BG_HOME = document.getElementById("backgroundHome");
  document.getElementById("btnPageViewBack")?.addEventListener("click", () => history.back());
  // Indicateur "scroll down" de la section Landing — avance vers la section suivante
  document.getElementById("scrollDownIndicator")?.addEventListener("click", () => {
    window._homeScrollTo?.("presentation");
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

function displayContent(content, delay) {
  const elementContainer = [...content.children].filter(
    (element) => !element.classList.contains("title")
  );
  const elements = elementContainer.flatMap((container) =>
    [...container.children].filter(
      (child) => child.tagName === "DIV" || child.tagName === "FORM" || child.matches('.btnBackToAdmin, .btnPageBack')
    )
  );
  const animationDelay = delay;
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
      (child) => child.tagName === "DIV" || child.tagName === "FORM" || child.matches('.btnBackToAdmin, .btnPageBack')
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
function displayHome() {
  window.GCABackground?.setPage('home');
  CNT_HOME.style.display = "flex";
  CNT_SECTIONNAV.style.display = "flex";
  displayContent(CNT_HOME, 50);
  // Cards dynamiques des sections Expertises / Portfolio / Blog
  window._loadHomeCards?.();
  // Timeline Expérience / Formation de la section bio
  window._loadBioTimeline?.();
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
  _homeScroller.init();
  // Permet aux modules de contenu dynamique (cards, timeline bio...) de
  // recalculer le scroll interne + la scrollbar une fois leur rendu terminé
  window._refreshSectionScrollUI = () => _homeScroller?.refreshAll();
  if (_targetIdx === 0) { titleDisplay(TL_HOME); hideBackBlurMask(); }
  else { titleDisplay(_homeSectionTitleEl(_targetSection)); displayBackBlurMask(); }

  // Mise à jour du slug + titre de section quand on scrolle — le flou d'arrière-plan est
  // désormais déclenché immédiatement au clic (SectionScroller._applyBackdrop), pas ici.
  let _prevSectionId = _targetIdx === 0 ? 'landing' : _targetSection;
  const _onSectionChange = (e) => {
    window._updateHomeSection?.(e.detail.sectionId);
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
  const _socialItems  = Array.from(document.querySelectorAll('#socialLinksDesktop .btnSocialLateral'));
  staggerReveal(_sectionItems, { delay: 60 });
  staggerReveal(_socialItems,  { delay: 60, startAt: _sectionItems.length });
  // Afficher le label de la section active après que les items soient apparus
  setTimeout(() => {
    const activeItem = CNT_SECTIONNAV.querySelector('.sectionNavItem--active');
    if (activeItem) _navLabelReveal(activeItem.querySelector('.sectionNavLabel'));
  }, _sectionItems.length * 60 + 200);

  // ── Zone hover : afficher/cacher les labels des sections inactives ──────────
  let _labelHideTimer = null;

  const _onNavEnter = () => {
    if (_homeScroller) _homeScroller._labelHoverActive = true;
    clearTimeout(_labelHideTimer);
    // Révéler les labels des items non-actifs
    CNT_SECTIONNAV.querySelectorAll('.sectionNavItem:not(.sectionNavItem--active)').forEach((item) => {
      _navLabelReveal(item.querySelector('.sectionNavLabel'));
    });
  };

  const _onNavLeave = () => {
    // Debounce : attendre avant de cacher (gère les sorties/entrées rapides)
    _labelHideTimer = setTimeout(() => {
      if (_homeScroller) _homeScroller._labelHoverActive = false;
      CNT_SECTIONNAV.querySelectorAll('.sectionNavItem:not(.sectionNavItem--active)').forEach((item) => {
        _navLabelHide(item.querySelector('.sectionNavLabel'), true);
      });
    }, 500);
  };

  CNT_SECTIONNAV.addEventListener('mouseenter', _onNavEnter);
  CNT_SECTIONNAV.addEventListener('mouseleave', _onNavLeave);

  // Stocker les refs pour cleanup propre dans unloadPage
  _homeScroller._cleanupLabels = () => {
    clearTimeout(_labelHideTimer);
    CNT_SECTIONNAV.removeEventListener('mouseenter', _onNavEnter);
    CNT_SECTIONNAV.removeEventListener('mouseleave', _onNavLeave);
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

/////////////// CONNEXION ///////////////
function activateConnexion() {
  connectBtnIdle();
}
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
function displayConnexion() {
  window.GCABackground?.setPage('connexion');
  CNT_CONNEXION.style.display = "flex";
  titleDisplay(TL_CONNEXION);
  displayContent(CNT_CONNEXION, 50);
  setAutofocus(FORM_CONNEXION);
  connexionCheck();
  forgotPasswordCheck();
  activateRegister();
}
/////////////// REGISTER ///////////////
function activateRegister() {
  const buttons = [BTN_REGISTER_CONNEXION];
  buttons.forEach((button) => {
    button.addEventListener("click", accessRegister);
    button.addEventListener("touchend", accessRegister);
  });
}
function accessRegister() {
  if (page !== "register") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayRegister();
      _setPage("register");
    }, 500);
  }
}
function displayRegister() {
  window.GCABackground?.setPage('register');
  CNT_REGISTER.style.display = "flex";
  titleDisplay(TL_REGISTER);
  displayContent(CNT_REGISTER, 50);
  setAutofocus(FORM_REGISTER);
  registerCheck();
}
/////////////// USERPROFILE ///////////////
function activateUserProfile() {
  const buttons = BTN_USERLOG;
  buttons.forEach((button) => {
    button.addEventListener("click", accessUserProfile);
    button.addEventListener("touchend", accessUserProfile);
  });
}
function deactivateUserProfile() {
  const buttons = BTN_USERLOG;
  buttons.forEach((button) => {
    button.removeEventListener("click", accessUserProfile);
    button.removeEventListener("touchend", accessUserProfile);
  });
}
function accessUserProfile() {
  if (page !== "userProfile") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayUserProfile();
      _setPage("userProfile");
    }, 500);
  }
}
function displayUserProfile() {
  window.GCABackground?.setPage('userprofile');
  CNT_USERPROFILE.style.display = "flex";
  titleDisplay(TL_USERPROFILE);
  displayContent(CNT_USERPROFILE, 50);
  window._initUserProfile?.();
}
/////////////// RESET PASSWORD (lien reçu par email, hors intro normale) ///////////////
function accessResetPassword(token) {
  page = "resetPassword";
  displayResetPassword(token);
}
function displayResetPassword(token) {
  window.GCABackground?.setPage('resetpassword');
  CNT_RESETPASSWORD.style.display = "flex";
  titleDisplay(TL_RESETPASSWORD);
  displayContent(CNT_RESETPASSWORD, 50);
  window._initResetPassword?.(token);
}
window.accessResetPassword = accessResetPassword;
/////////////// ADMINTOOL ///////////////
function activateAdminTool() {
  const buttons = BTN_ADMINLOG;
  buttons.forEach((button) => {
    button.addEventListener("click", accessAdminTool);
    button.addEventListener("touchend", accessAdminTool);
  });
}
function deactivateAdminTool() {
  const buttons = BTN_ADMINLOG;
  buttons.forEach((button) => {
    button.removeEventListener("click", accessAdminTool);
    button.removeEventListener("touchend", accessAdminTool);
  });
}
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
  activateUsersManagement();
  activateTagsManagement();
  activateMediasManagement();
  activatePagesManagement();
  activateExperiencesManagement();
  activateCommentsManagement();
  activateMessagesManagement();
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
/////////////// MESSAGES (boîte de réception) ///////////////
function activateMessagesManagement() {
  const btn = document.getElementById('btnMessagesManagement');
  if (!btn) return;
  btn.addEventListener('click',    accessMessagesManagement);
  btn.addEventListener('touchend', accessMessagesManagement);
}
function accessMessagesManagement() {
  if (page !== 'messagesManagement') {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayMessagesManagement(); _setPage('messagesManagement'); }, 501);
  }
}
function displayMessagesManagement() {
  window.GCABackground?.setPage('admintool');
  if (typeof initMessagesManagement === 'function') initMessagesManagement();
  CNT_MESSAGES.style.display = 'flex';
  titleDisplay(TL_MESSAGES);
  displayContent(CNT_MESSAGES, 50);
}
window.accessMessagesManagement = accessMessagesManagement;
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
/////////////// USERSMANAGEMENT ///////////////
function activateUsersManagement() {
    BTN_USERSMANAGEMENT.addEventListener("click", accessUsersManagement);
    BTN_USERSMANAGEMENT.addEventListener("touchend", accessUsersManagement);
  }
function deactivateUsersManagement() {
    BTN_USERSMANAGEMENT.removeEventListener("click", accessUsersManagement);
    BTN_USERSMANAGEMENT.removeEventListener("touchend", accessUsersManagement);
  };

function accessUsersManagement() {
  if (page !== "usersManagement") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => { displayUsersManagement(); _setPage("usersManagement"); }, 501);
  }
}
function displayUsersManagement() {
  window.GCABackground?.setPage('usersmanagement');
  initUsersManagement();
  CNT_USERSMANAGEMENT.style.display = "flex";
  titleDisplay(TL_USERSMANAGEMENT);
  displayContent(CNT_USERSMANAGEMENT, 50);
}

/////////////// NAVIGATION ///////////////
function activateNavigation() {
  activateHome();
  activateConnexion();
  // Miroir tablette/mobile des sections du menu latéral desktop (#sectionNav)
  activatePresentation();
  activateExpertiseSection();
  activatePortfolioSection();
  activateBioSection();
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

  // Dev — accès direct à l'admin tool sans authentification
  const devAdminBtn = document.getElementById('btnDirectAdmin');
  if (devAdminBtn) devAdminBtn.addEventListener('click', () => accessAdminTool());
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
      // Icônes sociales puis icônes section disparaissent en stagger (ordre inverse de l'apparition), puis on cache la nav
      const _socialItemsOut = Array.from(document.querySelectorAll('#socialLinksDesktop .btnSocialLateral'));
      staggerHide(_socialItemsOut, { delay: 40, reverse: true });
      staggerHide(CNT_SECTIONNAV.querySelectorAll('.sectionNavItem'), {
        delay: 40, reverse: true, startAt: _socialItemsOut.length, onDone: () => { CNT_SECTIONNAV.style.display = 'none'; }
      });
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
    case "connexion":
      titleHide(TL_CONNEXION);
      hideContent(CNT_CONNEXION, 25);
      setTimeout(() => {
        CNT_CONNEXION.style.display = "none";
        resetLoginForm();
        BTN_LOGIN_CONNEXION.removeEventListener("click", loginFetch);
        FORM_FORGOT_PASSWORD.style.display = "none";
        FORM_CONNEXION.style.display = "flex";
        MSG_FORGOTPASSWORD.style.display = "none";
        INPUT_MAIL_FORGOTPASSWORD.value = "";
      }, 501);
      break;
    case "register":
      titleHide(TL_REGISTER);
      hideContent(CNT_REGISTER, 25);
      setTimeout(() => {
        CNT_REGISTER.style.display = "none";
        resetRegisterForm();
        BTN_REGISTER_REGISTER.removeEventListener("click", registerFetch);
      }, 501);
      break;
    case "userProfile":
      titleHide(TL_USERPROFILE);
      hideContent(CNT_USERPROFILE, 25);
      setTimeout(() => {
        CNT_USERPROFILE.style.display = "none";
      }, 501);
      break;
    case "resetPassword":
      titleHide(TL_RESETPASSWORD);
      hideContent(CNT_RESETPASSWORD, 25);
      setTimeout(() => {
        CNT_RESETPASSWORD.style.display = "none";
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
    case "usersManagement":
      titleHide(TL_USERSMANAGEMENT);
      hideContent(CNT_USERSMANAGEMENT, 25);
      deactivateUsersManagement();
      setTimeout(() => { CNT_USERSMANAGEMENT.style.display = "none"; }, 501);
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
    case "messagesManagement":
      titleHide(TL_MESSAGES);
      hideContent(CNT_MESSAGES, 25);
      setTimeout(() => { CNT_MESSAGES.style.display = "none"; }, 501);
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
      setTimeout(() => {
        CNT_SCENEEDITOR.classList.remove('se-visible');
      }, 501);
      break;
    default:
      break;
  }
}
