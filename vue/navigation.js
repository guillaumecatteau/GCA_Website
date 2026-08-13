document.addEventListener("DOMContentLoaded", () => {
  // TITLES
  TL_HOME = document.querySelector(".homeTitle");
  TL_PROFILE = document.querySelector(".profileTitle");
  TL_GAMES = document.querySelector(".gamesTitle");
  TL_UXUI = document.querySelector(".uxuiTitle");
  TL_3D = document.querySelector(".title3D");
  TL_2D = document.querySelector(".title2D");
  TL_VIDEO = document.querySelector(".videoTitle");
  TL_WEB = document.querySelector(".webTitle");
  TL_PIXEL = document.querySelector(".pixelTitle");
  TL_PORTFOLIO = document.querySelector(".portfolioTitle");
  TL_BLOG = document.querySelector(".blogTitle");
  TL_BIO = document.querySelector(".bioTitle");
  TL_CONTACT = document.querySelector(".contactTitle");
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
  TL_ANALYTICS = document.querySelector(".analyticsTitle");
  // CONTENTS
  CNT_HOME = document.getElementById("cntHOME");
  CNT_PROFILE = document.getElementById("cntPROFILE");
  CNT_GAMES = document.getElementById("cntGAMES");
  CNT_UXUI = document.getElementById("cntUXUI");
  CNT_3D = document.getElementById("cnt3D");
  CNT_2D = document.getElementById("cnt2D");
  CNT_VIDEO = document.getElementById("cntVIDEO");
  CNT_WEB = document.getElementById("cntWEB");
  CNT_PIXEL = document.getElementById("cntPIXEL");
  CNT_PORTFOLIO = document.getElementById("cntPORTFOLIO");
  CNT_BLOG = document.getElementById("cntBLOG");
  CNT_BIO = document.getElementById("cntBIO");
  CNT_CONTACT = document.getElementById("cntCONTACT");
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
  CNT_ANALYTICS = document.getElementById("cntANALYTICS");
  CNT_SECTIONNAV = document.getElementById("sectionNav");
  // BUTTONS & BACKGROUND
  BTN_HOME_PROFILE = document.getElementById("btnProfileHome");
  BG_HOME = document.getElementById("backgroundHome");
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
  console.log("→ titleHide");
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
      (child) => child.tagName === "DIV" || child.tagName === "FORM"
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
      (child) => child.tagName === "DIV" || child.tagName === "FORM"
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
  buttons.forEach((button) => {
    button.addEventListener("click", accessHome);
    button.addEventListener("touchend", accessHome);
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
function displayHome() {
  window.GCABackground?.setPage('home');
  CNT_HOME.style.display = "flex";
  CNT_SECTIONNAV.style.display = "flex";
  titleDisplay(TL_HOME);
  // Init du scroll magnétique sur les sections de la home
  _homeScroller = new SectionScroller(CNT_HOME, CNT_SECTIONNAV);
  _homeScroller.init();

  // Mise à jour du slug quand on scrolle entre sections
  const _onSectionChange = (e) => window._updateHomeSection?.(e.detail.sectionId);
  CNT_HOME.addEventListener('sectionChange', _onSectionChange);

  // Callback utilisé par le routeur pour scroller vers une section par id
  window._homeScrollTo = (sectionId) => {
    const idx = _homeScroller?.sections.findIndex(s => s.dataset.section === sectionId) ?? -1;
    if (idx > 0) _homeScroller.goTo(idx);
  };
  // Icônes section puis icônes sociales desktop en stagger continu
  const _sectionItems = Array.from(CNT_SECTIONNAV.querySelectorAll('.sectionNavItem'));
  const _socialItems  = Array.from(document.querySelectorAll('#socialLinksDesktop .btnSocialLateral'));
  staggerReveal(_sectionItems, { delay: 60 });
  staggerReveal(_socialItems,  { delay: 60, startAt: _sectionItems.length });
  // Afficher le label de la section active (section 0) après que les items soient apparus
  setTimeout(() => {
    const activeItem = CNT_SECTIONNAV.querySelector('.sectionNavItem--active');
    if (activeItem) _navLabelReveal(activeItem.querySelectorAll('.sectionNavLabel > span'));
  }, _sectionItems.length * 60 + 200);

  // ── Zone hover : afficher/cacher les labels des sections inactives ──────────
  let _labelHideTimer = null;

  const _onNavEnter = () => {
    if (_homeScroller) _homeScroller._labelHoverActive = true;
    clearTimeout(_labelHideTimer);
    // Révéler les labels des items non-actifs
    CNT_SECTIONNAV.querySelectorAll('.sectionNavItem:not(.sectionNavItem--active)').forEach((item) => {
      _navLabelReveal(item.querySelectorAll('.sectionNavLabel > span'));
    });
  };

  const _onNavLeave = () => {
    // Debounce : attendre avant de cacher (gère les sorties/entrées rapides)
    _labelHideTimer = setTimeout(() => {
      if (_homeScroller) _homeScroller._labelHoverActive = false;
      CNT_SECTIONNAV.querySelectorAll('.sectionNavItem:not(.sectionNavItem--active)').forEach((item) => {
        _navLabelHide(item.querySelectorAll('.sectionNavLabel > span'), true);
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

  setTimeout(() => {
    BTN_HOME_PROFILE.style.opacity = "1";
    BTN_HOME_PROFILE.classList.add("moveInBottom");
    BTN_HOME_PROFILE.addEventListener('animationend', () => {
      BTN_HOME_PROFILE.classList.remove('moveInBottom');
    }, { once: true });
  }, 450);

  // Enregistrer /home dans l'historique (notamment pour le chargement initial via startSequence)
  window._setPage?.('home');
}
/////////////// PROFILE ///////////////
function activateProfile() {
  const buttons = [
    BTN_PROFIL_TABLET,
    BTN_PROFIL_MOBILE,
    BTN_HOME_PROFILE,
  ];
  buttons.forEach((button) => {
    button.addEventListener("click", accessProfile);
    button.addEventListener("touchend", accessProfile);
  });
}
function accessProfile() {
  if (page !== "profile") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayProfile();
      _setPage("profile");
    }, 500);
  }
}
function displayProfile() {
  window.GCABackground?.setPage('profile');
  CNT_PROFILE.style.display = "flex";
  titleDisplay(TL_PROFILE);
}
/////////////// GAMES ///////////////
function activateGames() {
  const buttons = [BTN_GAMES_TABLET, BTN_GAMES_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessGames);
    button.addEventListener("touchend", accessGames);
  });
}
function accessGames() {
  if (page !== "games") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayGames();
      _setPage("games");
    }, 500);
  }
}
function displayGames() {
  window.GCABackground?.setPage('games');
  CNT_GAMES.style.display = "flex";
  titleDisplay(TL_GAMES);
}
/////////////// UXUI ///////////////
function activateUxUi() {
  const buttons = [BTN_UXUI_TABLET, BTN_UXUI_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessUxUi);
    button.addEventListener("touchend", accessUxUi);
  });
}
function accessUxUi() {
  if (page !== "uxui") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayUxUi();
      _setPage("uxui");
    }, 500);
  }
}
function displayUxUi() {
  window.GCABackground?.setPage('uxui');
  CNT_UXUI.style.display = "flex";
  titleDisplay(TL_UXUI);
}
/////////////// 3D ///////////////
function activate3d() {
  const buttons = [BTN_3D_TABLET, BTN_3D_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", access3d);
    button.addEventListener("touchend", access3d);
  });
}
function access3d() {
  if (page !== "3d") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      display3d();
      _setPage("3d");
    }, 500);
  }
}
function display3d() {
  window.GCABackground?.setPage('3d');
  CNT_3D.style.display = "flex";
  titleDisplay(TL_3D);
}
/////////////// 2D ///////////////
function activate2d() {
  const buttons = [BTN_2D_TABLET, BTN_2D_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", access2d);
    button.addEventListener("touchend", access2d);
  });
}
function access2d() {
  if (page !== "2d") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      display2d();
      _setPage("2d");
    }, 500);
  }
}
function display2d() {
  window.GCABackground?.setPage('2d');
  CNT_2D.style.display = "flex";
  titleDisplay(TL_2D);
}
/////////////// VIDEO ///////////////
function activateVideo() {
  const buttons = [BTN_VIDEO_TABLET, BTN_VIDEO_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessVideo);
    button.addEventListener("touchend", accessVideo);
  });
}
function accessVideo() {
  if (page !== "video") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayVideo();
      _setPage("video");
    }, 500);
  }
}
function displayVideo() {
  window.GCABackground?.setPage('video');
  CNT_VIDEO.style.display = "flex";
  titleDisplay(TL_VIDEO);
}
/////////////// WEB ///////////////
function activateWeb() {
  const buttons = [BTN_WEB_TABLET, BTN_WEB_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessWeb);
    button.addEventListener("touchend", accessWeb);
  });
}
function accessWeb() {
  if (page !== "web") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayWeb();
      _setPage("web");
    }, 500);
  }
}
function displayWeb() {
  window.GCABackground?.setPage('web');
  CNT_WEB.style.display = "flex";
  titleDisplay(TL_WEB);
}
/////////////// PIXEL ///////////////
function activatePixel() {
  const buttons = [BTN_PIXEL_TABLET, BTN_PIXEL_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessPixel);
    button.addEventListener("touchend", accessPixel);
  });
}
function accessPixel() {
  if (page !== "pixel") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayPixel();
      _setPage("pixel");
    }, 500);
  }
}
function displayPixel() {
  window.GCABackground?.setPage('pixel');
  CNT_PIXEL.style.display = "flex";
  titleDisplay(TL_PIXEL);
}
/////////////// PORTFOLIO ///////////////
function activatePortfolio() {
  const buttons = [
    BTN_PORTFOLIO_TABLET,
    BTN_PORTFOLIO_MOBILE,
  ];
  buttons.forEach((button) => {
    button.addEventListener("click", accessPortfolio);
    button.addEventListener("touchend", accessPortfolio);
  });
}
function accessPortfolio() {
  if (page !== "portfolio") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayPortfolio();
      _setPage("portfolio");
    }, 500);
  }
}
function displayPortfolio() {
  window.GCABackground?.setPage('portfolio');
  CNT_PORTFOLIO.style.display = "flex";
  titleDisplay(TL_PORTFOLIO);
}
/////////////// BLOG ///////////////
function activateBlog() {
  const buttons = [BTN_BLOG_TABLET, BTN_BLOG_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessBlog);
    button.addEventListener("touchend", accessBlog);
  });
}
function accessBlog() {
  if (page !== "blog") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayBlog();
      _setPage("blog");
    }, 500);
  }
}
function displayBlog() {
  window.GCABackground?.setPage('blog');
  CNT_BLOG.style.display = "flex";
  titleDisplay(TL_BLOG);
  displayContent(CNT_BLOG, 50);
}

/////////////// BIO ///////////////
function activateBio() {
  const buttons = [BTN_BIO_TABLET, BTN_BIO_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessBio);
    button.addEventListener("touchend", accessBio);
  });
}
function accessBio() {
  if (page !== "bio") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayBio();
      _setPage("bio");
    }, 500);
  }
}
function displayBio() {
  window.GCABackground?.setPage('bio');
  CNT_BIO.style.display = "flex";
  titleDisplay(TL_BIO);
}
/////////////// CONTACT ///////////////
function activateContact() {
  const buttons = [BTN_CONTACT_TABLET, BTN_CONTACT_MOBILE];
  buttons.forEach((button) => {
    button.addEventListener("click", accessContact);
    button.addEventListener("touchend", accessContact);
  });
}
function accessContact() {
  if (page !== "contact") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayContact();
      _setPage("contact");
    }, 500);
  }
}
function displayContact() {
  window.GCABackground?.setPage('contact');
  CNT_CONTACT.style.display = "flex";
  titleDisplay(TL_CONTACT);
}
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
  displayContent(CNT_REGISTER, 50);
}
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
  activateSceneEditor();
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
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
  requestAnimationFrame(_alignBackBtn);
}

// Positionne le bouton retour à droite du sideBlock visible (les panels cachés ont un rect à zéro)
function _alignBackBtn() {
  const sb = Array.from(document.querySelectorAll('.sideBlock'))
    .find(el => el.getBoundingClientRect().width > 0);
  if (!sb) return;
  const btn = sb.querySelector('.btnBackToAdmin');
  if (!btn) return;
  const r = sb.getBoundingClientRect();
  btn.style.top  = r.top  + 'px';
  btn.style.left = (r.right + 16) + 'px';
}
window.addEventListener('resize', _alignBackBtn);

/////////////// NAVIGATION ///////////////
function activateNavigation() {
  activateHome();
  activateProfile();
  activateGames();
  activateUxUi();
  activate3d();
  activate2d();
  activateVideo();
  activateWeb();
  activatePixel();
  activatePortfolio();
  activateBlog();
  activateBio();
  activateContact();
  activateConnexion();
}

document.addEventListener("DOMContentLoaded", () => {
  // Délégation globale unifiée
  document.addEventListener('click', (e) => {
    // Retour Admin tool
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

function unloadPage() {
  console.log("→ unloadPage : current page =", page);
  switch (page) {
    case "home":
      titleHide(TL_HOME);
      // Nettoyage listeners labels hover + scroller
      if (_homeScroller?._cleanupLabels) _homeScroller._cleanupLabels();
      if (_homeScroller) { _homeScroller.destroy(); _homeScroller = null; }
      // Animer la disparition des icônes section, puis cacher la nav
      staggerHide(CNT_SECTIONNAV.querySelectorAll('.sectionNavItem'), {
        delay: 40, reverse: true, onDone: () => { CNT_SECTIONNAV.style.display = 'none'; }
      });
      BTN_HOME_PROFILE.classList.remove("moveInBottom", "moveOutBottom");
      void BTN_HOME_PROFILE.offsetWidth;
      BTN_HOME_PROFILE.style.opacity = "0";
      BTN_HOME_PROFILE.classList.add("moveOutBottom");
      setTimeout(() => {
        CNT_HOME.style.display = "none";
        BTN_HOME_PROFILE.classList.remove("moveOutBottom");
      }, 500);
      break;
    case "profile":
      titleHide(TL_PROFILE);
      setTimeout(() => {
        CNT_PROFILE.style.display = "none";
      }, 501);
      break;
    case "games":
      titleHide(TL_GAMES);
      setTimeout(() => {
        CNT_GAMES.style.display = "none";
      }, 501);
      break;
    case "uxui":
      titleHide(TL_UXUI);
      setTimeout(() => {
        CNT_UXUI.style.display = "none";
      }, 501);
      break;
    case "3d":
      titleHide(TL_3D);
      setTimeout(() => {
        CNT_3D.style.display = "none";
      }, 501);
      break;
    case "2d":
      titleHide(TL_2D);
      setTimeout(() => {
        CNT_2D.style.display = "none";
      }, 501);
      break;
    case "video":
      titleHide(TL_VIDEO);
      setTimeout(() => {
        CNT_VIDEO.style.display = "none";
      }, 501);
      break;
    case "web":
      titleHide(TL_WEB);
      setTimeout(() => {
        CNT_WEB.style.display = "none";
      }, 501);
      break;
    case "pixel":
      titleHide(TL_PIXEL);
      setTimeout(() => {
        CNT_PIXEL.style.display = "none";
      }, 501);
      break;
    case "portfolio":
      titleHide(TL_PORTFOLIO);
      setTimeout(() => {
        CNT_PORTFOLIO.style.display = "none";
      }, 501);
      break;
    case "blog":
      titleHide(TL_BLOG);
      hideContent(CNT_BLOG, 25);
      setTimeout(() => {
        CNT_BLOG.style.display = "none";
      }, 501);
      break;
    case "bio":
      titleHide(TL_BIO);
      setTimeout(() => {
        CNT_BIO.style.display = "none";
      }, 501);
      break;
    case "contact":
      titleHide(TL_CONTACT);
      setTimeout(() => {
        CNT_CONTACT.style.display = "none";
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
    case "register":
      titleHide(TL_REGISTER);
      hideContent(CNT_REGISTER, 25);
      setTimeout(() => {
        CNT_REGISTER.style.display = "none";
        resetRegisterForm();
        BTN_REGISTER_REGISTER.removeEventListener("click", registerFetch);
        // EYEBTN_PASSWORD_REGISTER.removeEventListener("click", togglePassword);
      }, 501);
      break;
    case "userProfile":
      titleHide(TL_USERPROFILE);
      hideContent(CNT_USERPROFILE, 25);
      setTimeout(() => {
        CNT_USERPROFILE.style.display = "none";
      }, 501);
      break;
    case "adminTool":
      titleHide(TL_ADMINTOOL);
      hideContent(CNT_ADMINTOOL, 25);
      setTimeout(() => {
        CNT_ADMINTOOL.style.display = "none";
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
