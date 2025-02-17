const MAINLOGO = document.getElementById("mainLogo");
const LANGUAGESELECTOR = document.getElementById("languageSelector");
const BTN_HOME = document.getElementById("btnHome");
const BTN_PROFIL = document.getElementById("btnProfil");
const BTN_GAMES = document.getElementById("btnGames");
const BTN_UXUI = document.getElementById("btnUxUi");
const BTN_3D = document.getElementById("btn3D");
const BTN_2D = document.getElementById("btn2D");
const BTN_VIDEO = document.getElementById("btnVideo");
const BTN_WEB = document.getElementById("btnWeb");
const BTN_PIXEL = document.getElementById("btnPixel");
const BTN_PORTFOIOLIO = document.getElementById("btnPortfolio");
const BTN_GALLERIES = document.getElementById("btnGalleries");
const BTN_BLOG = document.getElementById("btnBlog");
const BTN_BIO = document.getElementById("btnBio");
const BTN_CONTACT = document.getElementById("btnContact");
const BTN_ARTSTATION = document.getElementById("btnArtstation");
const BTN_LINKEDIN = document.getElementById("btnLinkedin");
const BTN_YOUTUBE = document.getElementById("btnYoutube");
const BTN_FACEBOOK = document.getElementById("btnFacebook");
const BTN_X = document.getElementById("btnX");
const NAVLINKS = document.querySelector(".navLinks");




function displayMainLogo() {
  return new Promise((resolve) => {
          MAINLOGO.style.opacity = "1";
          MAINLOGO.style.marginLeft = "0";
    setTimeout(() => {
      resolve();
    }, 250);
  });
}
function displayLanguageSelector() {
  return new Promise((resolve) => {
    setTimeout(() => {
      LANGUAGESELECTOR.style.opacity = "1";
      resolve();
    }, 500);
  });
}

function displayLatNavIcons() {
  return new Promise((resolve) => {
    const buttons = [
      BTN_HOME,
      BTN_PROFIL,
      BTN_GAMES,
      BTN_UXUI,
      BTN_3D,
      BTN_2D,
      BTN_VIDEO,
      BTN_WEB,
      BTN_PIXEL,
      BTN_PORTFOIOLIO,
      BTN_GALLERIES,
      BTN_BLOG,
      BTN_BIO,
      BTN_CONTACT,
    ];
    buttons.forEach((button, index) => {
      setTimeout(() => {
        const icon = button.querySelector(".btnLateralIcon");
        icon.style.opacity = "1";
        icon.style.marginLeft = "0";
      }, 30 * index);
    });
    setTimeout(() => {
      resolve();
    }, 1000);
  });}
  function displaySocialIcons() {
    return new Promise((resolve) => {
      const buttons = [
        BTN_ARTSTATION,
        BTN_LINKEDIN,
        BTN_YOUTUBE,
        BTN_FACEBOOK,
        BTN_X,
      ];
      buttons.forEach((button, index) => {
        setTimeout(() => {
          const icon = button.querySelector(".btnLateralIcon");
          icon.style.opacity = "1";
          icon.style.marginLeft = "0";
        }, 30 * index);
      });
      setTimeout(() => {
        resolve();
      }, 1000);
    });}

  function displayLatNavText() {
    return new Promise((resolve) => {
      const buttons = [
        BTN_HOME,
        BTN_PROFIL,
        BTN_GAMES,
        BTN_UXUI,
        BTN_3D,
        BTN_2D,
        BTN_VIDEO,
        BTN_WEB,
        BTN_PIXEL,
        BTN_PORTFOIOLIO,
        BTN_GALLERIES,
        BTN_BLOG,
        BTN_BIO,
        BTN_CONTACT,
      ];
      buttons.forEach((button, index) => {
        setTimeout(function () {
          button.getElementsByTagName("h2")[0].style.opacity = "1";
        }, 30 * index);
      });
      setTimeout(() => {
        resolve();
      }, 500);
    });}
    function hideLatNavText() {
        const buttons = [
          BTN_HOME,
          BTN_PROFIL,
          BTN_GAMES,
          BTN_UXUI,
          BTN_3D,
          BTN_2D,
          BTN_VIDEO,
          BTN_WEB,
          BTN_PIXEL,
          BTN_PORTFOIOLIO,
          BTN_GALLERIES,
          BTN_BLOG,
          BTN_BIO,
          BTN_CONTACT,
        ];
        buttons.forEach((button, index) => {
        setTimeout(function () {
          button.getElementsByTagName("h2")[0].style.opacity = "0";
        }, 30 * index);
        });}
 

async function runSequence() {
  await displayMainLogo();
  
  await displayLatNavIcons();
  BTN_HOME.classList.add("btnActive");
  await displayLatNavText();
  await displaySocialIcons();
  await displayLanguageSelector();
  setTimeout(() => {
    hideLatNavText();
  },2000);
}

runSequence();

NAVLINKS.addEventListener('mouseenter', () => {
  displayLatNavText();
});

NAVLINKS.addEventListener('mouseleave', () => {
  setTimeout(() => {
    hideLatNavText();
  }, 0);
});
