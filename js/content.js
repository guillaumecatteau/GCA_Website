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

  // BUTTONS & BACKGROUND
  BTN_HOME_PROFILE = document.getElementById("btnProfileHome");
  BG_HOME = document.getElementById("backgroundHome");
});

function titleDisplay(title) {
  const titleTextElements = title.querySelectorAll("span");
  console.log("→ titleReveal");
  titleTextElements.forEach((element, index) => {
    setTimeout(() => {
      element.classList.remove("rotateOutSlow");
      // Force état de départ avant animation
      element.style.opacity = 0;
      element.style.transform = "rotateY(90deg)";

      // Lancer l'animation
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

      // Nettoyage après animation
      setTimeout(() => {
        element.classList.remove("rotateOutSlow");
        element.style.opacity = 0;
        element.style.transform = "rotateY(90deg)";
      }, 600); // doit correspondre à la durée de l'animation rotateOutSlow
    }, 30 * index);
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
    unloadPage();
    setTimeout(() => {
      displayHome();
      page = "home";
    }, 950);
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
function displayProfile() {
  CNT_PROFILE.style.display = "flex";
  titleDisplay(TL_PROFILE);
}
/////////////// GAMES ///////////////
function displayGames() {
  CNT_GAMES.style.display = "flex";
  titleDisplay(TL_GAMES);
}
/////////////// UXUI ///////////////
function displayUxUi() {
  CNT_UXUI.style.display = "flex";
  titleDisplay(TL_UXUI);
}
/////////////// 3D ///////////////
function display3d() {
  CNT_3D.style.display = "flex";
  titleDisplay(TL_3D);
}
/////////////// 2D ///////////////
function display2d() {
  CNT_2D.style.display = "flex";
  titleDisplay(TL_2D);
}
/////////////// VIDEO ///////////////
function displayVideo() {
  CNT_VIDEO.style.display = "flex";
  titleDisplay(TL_VIDEO);
}
/////////////// WEB ///////////////
function displayWeb() {
  CNT_WEB.style.display = "flex";
  titleDisplay(TL_WEB);
}
/////////////// PIXEL ///////////////
function displayPixel() {
  CNT_PIXEL.style.display = "flex";
  titleDisplay(TL_PIXEL);
}
/////////////// PORTFOLIO ///////////////
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
    unloadPage();
    setTimeout(() => {
      displayBlog();
      page = "blog";
    }, 950);
  }
}
function displayBlog() {
  CNT_BLOG.style.display = "flex";
  titleDisplay(TL_BLOG);
}
/////////////// BIO ///////////////
function displayBio() {
  CNT_BIO.style.display = "flex";
  titleDisplay(TL_BIO);
}
/////////////// CONTACT ///////////////
function displayContact() {
  CNT_CONTACT.style.display = "flex";
  titleDisplay(TL_CONTACT);
}
/////////////// NAVIGATION ///////////////
function activateNavigation() {
  activateHome();
  activateBlog();
}

document.addEventListener("DOMContentLoaded", () => {});

// function elementOut(element, exitClass, duration = 800) {
//   element.classList.remove("moveInBottom", "moveOutBottom");
//   void element.offsetWidth;
//   element.classList.add(exitClass);

//   setTimeout(() => {
//     element.classList.remove(exitClass);
//   }, duration);
// }
function unloadPage() {
  console.log("→ unloadPage : current page =", page);
  switch (page) {
    case "home":
  titleHide(TL_HOME);
  BTN_HOME_PROFILE.classList.remove("moveInBottom", "moveOutBottom");
  void BTN_HOME_PROFILE.offsetWidth;
  BTN_HOME_PROFILE.style.opacity = "0"; // visible pour l'animer
  BTN_HOME_PROFILE.classList.add("moveOutBottom");

  setTimeout(() => {
    CNT_HOME.style.display = "none";
    BTN_HOME_PROFILE.style.opacity = "0"; // cacher pour la suite
    BTN_HOME_PROFILE.classList.remove("moveOutBottom");
  }, 900);
  break;
    case "profile":
      titleHide(TL_PROFILE);
      setTimeout(() => {
        CNT_PROFILE.style.display = "none";
      }, 900);
      break;
    case "games":
      titleHide(TL_GAMES);
      setTimeout(() => {
        CNT_GAMES.style.display = "none";
      }, 900);
      break;
    case "uxui":
      titleHide(TL_UXUI);
      setTimeout(() => {
        CNT_UXUI.style.display = "none";
      }, 900);
      break;
    case "3d":
      titleHide(TL_3D);
      setTimeout(() => {
        CNT_3D.style.display = "none";
      }, 900);
      break;
    case "2d":
      titleHide(TL_2D);
      setTimeout(() => {
        CNT_2D.style.display = "none";
      }, 900);
      break;
    case "video":
      titleHide(TL_VIDEO);
      setTimeout(() => {
        CNT_VIDEO.style.display = "none";
      }, 900);
      break;
    case "web":
      titleHide(TL_WEB);
      setTimeout(() => {
        CNT_WEB.style.display = "none";
      }, 900);
      break;
    case "pixel":
      titleHide(TL_PIXEL);
      setTimeout(() => {
        CNT_PIXEL.style.display = "none";
      }, 900);
      break;
    case "portfolio":
      titleHide(TL_PORTFOLIO);
      setTimeout(() => {
        CNT_PORTFOLIO.style.display = "none";
      }, 900);
      break;
    case "blog":
      titleHide(TL_BLOG);
      setTimeout(() => {
        CNT_BLOG.style.display = "none";
      }, 900);
      break;
    case "bio":
      titleHide(TL_BIO);
      setTimeout(() => {
        CNT_BIO.style.display = "none";
      }, 900);
      break;
    case "contact":
      titleHide(TL_CONTACT);
      setTimeout(() => {
        CNT_CONTACT.style.display = "none";
      }, 900);
      break;
    default:
      break;
  }
}
