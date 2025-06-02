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

/////////////// HOME ///////////////
function activateHome() {
  const buttons = [BTN_HOME_DESK, BTN_HOME_TABLET, BTN_HOME_MOBILE];
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
      page = "home";
    }, 500);
  }
}
function displayHome() {
  CNT_HOME.style.display = "flex";
  titleDisplay(TL_HOME);
  setTimeout(() => {
    BTN_HOME_PROFILE.style.opacity = "1";
    BTN_HOME_PROFILE.classList.add("moveInBottom");
  }, 450);
}
/////////////// PROFILE ///////////////
function activateProfile() {
  const buttons = [
    BTN_PROFIL_DESK,
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
      page = "profile";
    }, 500);
  }
}
function displayProfile() {
  CNT_PROFILE.style.display = "flex";
  titleDisplay(TL_PROFILE);
}
/////////////// GAMES ///////////////
function activateGames() {
  const buttons = [BTN_GAMES_DESK, BTN_GAMES_TABLET, BTN_GAMES_MOBILE];
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
      page = "games";
    }, 500);
  }
}
function displayGames() {
  CNT_GAMES.style.display = "flex";
  titleDisplay(TL_GAMES);
}
/////////////// UXUI ///////////////
function activateUxUi() {
  const buttons = [BTN_UXUI_DESK, BTN_UXUI_TABLET, BTN_UXUI_MOBILE];
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
      page = "uxui";
    }, 500);
  }
}
function displayUxUi() {
  CNT_UXUI.style.display = "flex";
  titleDisplay(TL_UXUI);
}
/////////////// 3D ///////////////
function activate3d() {
  const buttons = [BTN_3D_DESK, BTN_3D_TABLET, BTN_3D_MOBILE];
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
      page = "3d";
    }, 500);
  }
}
function display3d() {
  CNT_3D.style.display = "flex";
  titleDisplay(TL_3D);
}
/////////////// 2D ///////////////
function activate2d() {
  const buttons = [BTN_2D_DESK, BTN_2D_TABLET, BTN_2D_MOBILE];
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
      page = "2d";
    }, 500);
  }
}
function display2d() {
  CNT_2D.style.display = "flex";
  titleDisplay(TL_2D);
}
/////////////// VIDEO ///////////////
function activateVideo() {
  const buttons = [BTN_VIDEO_DESK, BTN_VIDEO_TABLET, BTN_VIDEO_MOBILE];
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
      page = "video";
    }, 500);
  }
}
function displayVideo() {
  CNT_VIDEO.style.display = "flex";
  titleDisplay(TL_VIDEO);
}
/////////////// WEB ///////////////
function activateWeb() {
  const buttons = [BTN_WEB_DESK, BTN_WEB_TABLET, BTN_WEB_MOBILE];
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
      page = "web";
    }, 500);
  }
}
function displayWeb() {
  CNT_WEB.style.display = "flex";
  titleDisplay(TL_WEB);
}
/////////////// PIXEL ///////////////
function activatePixel() {
  const buttons = [BTN_PIXEL_DESK, BTN_PIXEL_TABLET, BTN_PIXEL_MOBILE];
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
      page = "pixel";
    }, 500);
  }
}
function displayPixel() {
  CNT_PIXEL.style.display = "flex";
  titleDisplay(TL_PIXEL);
}
/////////////// PORTFOLIO ///////////////
function activatePortfolio() {
  const buttons = [
    BTN_PORTFOLIO_DESK,
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
      page = "portfolio";
    }, 500);
  }
}
function displayPortfolio() {
  CNT_PORTFOLIO.style.display = "flex";
  titleDisplay(TL_PORTFOLIO);
}
/////////////// BLOG ///////////////
function activateBlog() {
  const buttons = [BTN_BLOG_DESK, BTN_BLOG_TABLET, BTN_BLOG_MOBILE];
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
      page = "blog";
    }, 500);
  }
}
function displayBlog() {
  CNT_BLOG.style.display = "flex";
  titleDisplay(TL_BLOG);
  displayContent(CNT_BLOG, 50);
}

/////////////// BIO ///////////////
function activateBio() {
  const buttons = [BTN_BIO_DESK, BTN_BIO_TABLET, BTN_BIO_MOBILE];
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
      page = "bio";
    }, 500);
  }
}
function displayBio() {
  CNT_BIO.style.display = "flex";
  titleDisplay(TL_BIO);
}
/////////////// CONTACT ///////////////
function activateContact() {
  const buttons = [BTN_CONTACT_DESK, BTN_CONTACT_TABLET, BTN_CONTACT_MOBILE];
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
      page = "contact";
    }, 500);
  }
}
function displayContact() {
  CNT_CONTACT.style.display = "flex";
  titleDisplay(TL_CONTACT);
}
/////////////// CONNEXION ///////////////
function activateConnexion() {
  connectBtnIdle();
  // buttons.forEach((button) => {
  //   button.addEventListener("click", accessConnexion);
  //   button.addEventListener("touchend", accessConnexion);
  // });
}
function accessConnexion() {
  if (page !== "connexion") {
    displayBackBlurMask();
    unloadPage();
    setTimeout(() => {
      displayConnexion();
      page = "connexion";
    }, 500);
  }
}
function displayConnexion() {
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
      page = "register";
    }, 500);
  }
}
function displayRegister() {
  CNT_REGISTER.style.display = "flex";
  titleDisplay(TL_REGISTER);
  displayContent(CNT_REGISTER, 50);
  setAutofocus(FORM_REGISTER);
  registerCheck();
}

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

document.addEventListener("DOMContentLoaded", () => {});

function unloadPage() {
  console.log("→ unloadPage : current page =", page);
  switch (page) {
    case "home":
      titleHide(TL_HOME);
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
    default:
      break;
  }
}
