<?php
session_start();
if (isset($_GET['action'])) {
  require_once('controller/controller.php');
  exit;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="vue/assets/css/reset.css" />
  <link rel="stylesheet" href="vue/assets/css/style.css" />
  <link rel="stylesheet" href="vue/assets/css/backgrounds.css" />
  <link rel="stylesheet" href="vue/assets/css/mainNav.css" />
  <link rel="stylesheet" href="vue/assets/css/icons.css" />
  <link rel="stylesheet" href="vue/assets/css/navigation.css" />
  <link rel="stylesheet" href="vue/assets/css/animations.css" />
  <link rel="stylesheet" href="vue/assets/css/admintool.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Audiowide&family=Sarala:wght@400;700&display=swap"
    rel="stylesheet" />
  <title>GC Digital Arts</title>
</head>

<body>
  <div class="navContainer">
    <div class="topBar">
      <a href="index.html" class="mainLogo" id="mainLogo">
        <h1>Guillaume Catteau</h1>
        <h2 class="mainLogoText">
          <span>D</span>
          <span>i</span>
          <span>g</span>
          <span>i</span>
          <span>t</span>
          <span>a</span>
          <span>l</span>
          <span></span>
          <span>D</span>
          <span>e</span>
          <span>s</span>
          <span>i</span>
          <span>g</span>
          <span>n</span>
          <span>e</span>
          <span>r</span>
        </h2>
      </a>
      <div class="topBarDesktop">
        <div class="connexionBox" id="connexionBoxDesktop">
          <a class="btnUserLog" id="btnUserLogDesktop" style="display: none">
            <span class="icon iconUser"></span>
            <?php if (isset($_SESSION['user'])): ?>
              <span class="btnUserLogText" id="userNameDesktop">
                <?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?>
              </span>
            <?php endif; ?>
          </a>
          <a class="btnAdminLog" id="btnAdminLogDesktop" style="display: none">
            <span class="icon iconAdmin"></span>
            <?php if (isset($_SESSION['user'])): ?>
              <span class="btnUserLogText" id="adminNameDesktop">
                <?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?>
              </span>
            <?php endif; ?>
          </a>
          <a class="btnConnexion" id="btnConnexionDesktop">
            <span class="icon iconConnect" id="btnConnexionIconDesktop"></span>
          </a>
        </div>
        <div class="languageSelector" id="languageSelectorDesktop">
          <select id="lang">
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <div class="topBarContent">
        <nav class="tabletMenuTop" id="menuTabletTop">
          <ul class="socialLinksTablet">
            <li>
              <a class="btnSocialTablet" id="btnArtstationTablet" href="https://www.artstation.com/gcdigitalarts"
                target="_blank" rel="noopener noreferrer" title="A compléter">
                <span class="icon iconRoundArtstation"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialTablet" id="btnLinkedinTablet" href="https://www.linkedin.com/in/guillaumecatteau/"
                target="_blank" rel="noopener noreferrer" title="A compléter">
                <span class="icon iconRoundLinkedin"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialTablet" id="btnYoutubeTablet" href="https://www.youtube.com/@GuillaumeCatteau"
                target="_blank" rel="noopener noreferrer" title="A compléter">
                <span class="icon iconRoundYoutube"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialTablet" id="btnFacebookTablet" href="https://www.facebook.com/guillaume.catteau"
                target="_blank" rel="noopener noreferrer" title="A compléter">
                <span class="icon iconRoundFacebook"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialTablet" id="btnXTablet" href="https://x.com/GC_DigitalArts" target="_blank"
                rel="noopener noreferrer" title="A compléter">
                <span class="icon iconRoundX"></span>
              </a>
            </li>
          </ul>
          <div class="languageSelector" id="languageSelectorTablet">
            <select id="langTablet">
              <option value="fr">FR</option>
              <option value="en">EN</option>
            </select>
          </div>
        </nav>
      </div>
      <div class="burgerContainer">
        <div class="burgerMenu" id="btnBurger">
          <div class="burgerBar" id="burgerBarTop"></div>
          <div class="burgerBar" id="burgerBarMiddle"></div>
          <div class="burgerBar" id="burgerBarBottom"></div>
        </div>
      </div>
    </div>
    <div class="navDesktop">
      <div class="navLeft">
        <nav class="mainNavContainerDesktop">
          <ul class="navLinks">
            <li>
              <a class="btnLateral" id="btnHomeDesktop">
                <span class="icon iconHome"></span>
                <span class="linkText" lang="FR" data-en="Home">Accueil</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnProfilDesktop">
                <div class="icon iconProfil"></div>
                <span class="linkText" lang="FR" data-en="Profile">Profil</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnGamesDesktop">
                <div class="icon iconGames"></div>
                <span class="linkText" lang="FR" data-en="Games">Jeux</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnUxUiDesktop">
                <span class="icon iconUx"></span>
                <span class="linkText" lang="FR" data-en="Ux/Ui">Ux/Ui</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btn3DDesktop">
                <span class="icon icon3d"></span>
                <span class="linkText" lang="FR" data-en="3d">3d</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btn2DDesktop">
                <span class="icon icon2d"></span>
                <span class="linkText" lang="FR" data-en="2d">2d</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnVideoDesktop">
                <span class="icon iconVideo"></span>
                <span class="linkText" lang="FR" data-en="Video">Vidéo</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnWebDesktop">
                <span class="icon iconWeb"></span>
                <span class="linkText" lang="FR" data-en="Web">Web</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnPixelDesktop">
                <span class="icon iconPixel"></span>
                <span class="linkText" lang="FR" data-en="Pixel">Pixel</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnPortfolioDesktop">
                <span class="icon iconPortfolio"></span>
                <span class="linkText" lang="FR" data-en="Portfolio">Portfolio</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnBlogDesktop">
                <span class="icon iconBlog"></span>
                <span class="linkText" lang="FR" data-en="Blog">Blog</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnBioDesktop">
                <span class="icon iconBio"></span>
                <span class="linkText" lang="FR" data-en="Bio">Bio</span>
              </a>
            </li>
            <li>
              <a class="btnLateral" id="btnContactDesktop">
                <span class="icon iconContact"></span>
                <span class="linkText" lang="FR" data-en="Contact">Contact</span>
              </a>
            </li>
          </ul>
          <ul class="socialLinksDesktop">
            <li>
              <a class="btnSocialLateral" id="btnArtstationDesktop" href="https://www.artstation.com/gcdigitalarts"
                target="_blank" rel="noopener noreferrer">
                <span class="icon iconRoundArtstation"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialLateral" id="btnLinkedinDesktop" href="https://www.linkedin.com/in/guillaumecatteau/"
                target="_blank" rel="noopener noreferrer">
                <span class="icon iconRoundLinkedin"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialLateral" id="btnYoutubeDesktop" href="https://www.youtube.com/@GuillaumeCatteau"
                target="_blank" rel="noopener noreferrer">
                <span class="icon iconRoundYoutube"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialLateral" id="btnFacebookDesktop" href="https://www.facebook.com/guillaume.catteau"
                target="_blank" rel="noopener noreferrer">
                <span class="icon iconRoundFacebook"></span>
              </a>
            </li>
            <li>
              <a class="btnSocialLateral" id="btnXDesktop" href="https://x.com/GC_DigitalArts" target="_blank"
                rel="noopener noreferrer">
                <span class="icon iconRoundX"></span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div class="navRight"></div>
    </div>
    <div class="navTablet">
      <div class="mainNavContainerTablet" id="menuTabletRight">
        <ul class="navLinksTablet">
          <li>
            <a class="btnTablet" id="btnHomeTablet">
              <span class="icon iconHome"></span>
              <span class="linkTextTablet" lang="FR" data-en="Home">Accueil</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnProfilTablet">
              <span class="icon iconProfil"></span>
              <span class="linkTextTablet" lang="FR" data-en="Profile">Profil</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnGamesTablet">
              <span class="icon iconGames"></span>
              <span class="linkTextTablet" lang="FR" data-en="Games">Jeux</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnUxUiTablet">
              <span class="icon iconUx"></span>
              <span class="linkTextTablet" lang="FR" data-en="Ux/Ui">Ux/Ui</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btn3DTablet">
              <span class="icon icon3d"></span>
              <span class="linkTextTablet" lang="FR" data-en="3d">3d</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btn2DTablet">
              <span class="icon icon2d"></span>
              <span class="linkTextTablet" lang="FR" data-en="2d">2d</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnVideoTablet">
              <span class="icon iconVideo"></span>
              <span class="linkTextTablet" lang="FR" data-en="Video">Vidéo</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnWebTablet">
              <span class="icon iconWeb"></span>
              <span class="linkTextTablet" lang="FR" data-en="Web">Web</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnPixelTablet">
              <span class="icon iconPixel"></span>
              <span class="linkTextTablet" lang="FR" data-en="Pixel">Pixel</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnPortfolioTablet">
              <span class="icon iconPortfolio"></span>
              <span class="linkTextTablet" lang="FR" data-en="Portfolio">Portfolio</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnBlogTablet">
              <span class="icon iconBlog"></span>
              <span class="linkTextTablet" lang="FR" data-en="Blog">Blog</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnBioTablet">
              <span class="icon iconBio"></span>
              <span class="linkTextTablet" lang="FR" data-en="Bio">Bio</span>
            </a>
          </li>
          <li>
            <a class="btnTablet" id="btnContactTablet">
              <span class="icon iconContact"></span>
              <span class="linkTextTablet" lang="FR" data-en="Contact">Contact</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
    <div class="navMobile">
      <div class="mainNavContainerMobile" id="menuMobile">
        <div class="languageSelector" id="languageSelectorMobile">
          <select id="langMobile">
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
        <ul class="navLinksMobile">
          <li>
            <a class="btnMobile" id="btnHomeMobile">
              <span class="icon iconHome"></span>
              <span class="linkTextMobile" lang="FR" data-en="Home">Accueil</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnProfilMobile">
              <span class="icon iconProfil"></span>
              <span class="linkTextMobile" lang="FR" data-en="Profile">Profil</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnGamesMobile">
              <span class="icon iconGames"></span>
              <span class="linkTextMobile" lang="FR" data-en="Games">Jeux</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnUxUiMobile">
              <span class="icon iconUx"></span>
              <span class="linkTextMobile" lang="FR" data-en="Ux/Ui">Ux/Ui</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btn3DMobile">
              <span class="icon icon3d"></span>
              <span class="linkTextMobile" lang="FR" data-en="3d">3d</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btn2DMobile">
              <span class="icon icon2d"></span>
              <span class="linkTextMobile" lang="FR" data-en="2d">2d</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnVideoMobile">
              <span class="icon iconVideo"></span>
              <span class="linkTextMobile" lang="FR" data-en="Video">Vidéo</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnWebMobile">
              <span class="icon iconWeb"></span>
              <span class="linkTextMobile" lang="FR" data-en="Web">Web</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnPixelMobile">
              <span class="icon iconPixel"></span>
              <span class="linkTextMobile" lang="FR" data-en="Pixel">Pixel</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnPortfolioMobile">
              <span class="icon iconPortfolio"></span>
              <span class="linkTextMobile" lang="FR" data-en="Portfolio">Portfolio</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnBlogMobile">
              <span class="icon iconBlog"></span>
              <span class="linkTextMobile" lang="FR" data-en="Blog">Blog</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnBioMobile">
              <span class="icon iconBio"></span>
              <span class="linkTextMobile" lang="FR" data-en="Bio">Bio</span>
            </a>
          </li>
          <li>
            <a class="btnMobile" id="btnContactMobile">
              <span class="icon iconContact"></span>
              <span class="linkTextMobile" lang="FR" data-en="Contact">Contact</span>
            </a>
          </li>
        </ul>
        <ul class="socialLinksMobile">
          <li>
            <a class="btnSocialMobile" id="btnArtstationMobile" href="index.html">
              <span class="icon iconArtstation"></span>
            </a>
          </li>
          <li>
            <a class="btnSocialMobile" id="btnLinkedinMobile" href="index.html">
              <span class="icon iconLinkedin"></span>
            </a>
          </li>
          <li>
            <a class="btnSocialMobile" id="btnYoutubeMobile" href="index.html">
              <span class="icon iconYoutube"></span>
            </a>
          </li>
          <li>
            <a class="btnSocialMobile" id="btnFacebookMobile" href="index.html">
              <span class="icon iconFacebook"></span>
            </a>
          </li>
          <li>
            <a class="btnSocialMobile" id="btnXMobile" href="index.html">
              <span class="icon iconX"></span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div class="pageContainer">
    <div class="homeContent" id="cntHOME" style="display: none">
      <h2 class="title titleMain homeTitle">
        <span>D</span>
        <span>i</span>
        <span>g</span>
        <span>i</span>
        <span>t</span>
        <span>a</span>
        <span>l</span>
        <span></span>
        <span>A</span>
        <span>r</span>
        <span>t</span>
        <span>s</span>
      </h2>
      <div class="btnMedium" id="btnProfileHome">
        <div class="btnLabel" id="">
          <span class="icon iconProfil"></span>
          <span class="btnText" lang="FR" data-en="Profile">Profil</span>
        </div>
      </div>
    </div>
    <div class="profileContent" id="cntPROFILE" style="display: none">
      <h2 class="title titleTop profileTitle">
        <span>p</span>
        <span>r</span>
        <span>o</span>
        <span>f</span>
        <span>i</span>
        <span>l</span>
        <span>e</span>
      </h2>
    </div>
    <div class="gamesContent" id="cntGAMES" style="display: none">
      <h2 class="title titleTop gamesTitle">
        <span>g</span>
        <span>a</span>
        <span>m</span>
        <span>e</span>
        <span>s</span>
      </h2>
    </div>
    <div class="uxuiContent" id="cntUXUI" style="display: none">
      <h2 class="title titleTop uxuiTitle">
        <span>u</span>
        <span>x</span>
        <span>/</span>
        <span>u</span>
        <span>i</span>
      </h2>
    </div>
    <div class="content3D" id="cnt3D" style="display: none">
      <h2 class="title titleTop title3D">
        <span>3</span>
        <span>d</span>
      </h2>
    </div>
    <div class="content2D" id="cnt2D" style="display: none">
      <h2 class="title titleTop title2D">
        <span>2</span>
        <span>d</span>
      </h2>
    </div>
    <div class="videoContent" id="cntVIDEO" style="display: none">
      <h2 class="title titleTop videoTitle">
        <span>v</span>
        <span>i</span>
        <span>d</span>
        <span>e</span>
        <span>o</span>
      </h2>
    </div>
    <div class="webContent" id="cntWEB" style="display: none">
      <h2 class="title titleTop webTitle">
        <span>w</span>
        <span>e</span>
        <span>b</span>
      </h2>
    </div>
    <div class="pixelContent" id="cntPIXEL" style="display: none">
      <h2 class="title titleTop pixelTitle">
        <span>p</span>
        <span>i</span>
        <span>x</span>
        <span>e</span>
        <span>l</span>
      </h2>
    </div>
    <div class="portfolioContent" id="cntPORTFOLIO" style="display: none">
      <h2 class="title titleTop portfolioTitle">
        <span>p</span>
        <span>o</span>
        <span>r</span>
        <span>t</span>
        <span>f</span>
        <span>o</span>
        <span>l</span>
        <span>i</span>
        <span>o</span>
      </h2>
    </div>
    <div class="blogContent" id="cntBLOG" style="display: none">
      <h2 class="title titleTop blogTitle">
        <span>B</span>
        <span>l</span>
        <span>o</span>
        <span>g</span>
      </h2>
      <div class="gridBlog">
        <div class="blurPopup blogItemBig blog1" id="blog1"></div>
        <div class="blurPopup blogItemBig blog2" id="blog2"></div>
        <div class="blurPopup blogItemMed blog3" id="blog3"></div>
        <div class="blurPopup blogItemMed blog4" id="blog4"></div>
        <div class="blurPopup blogItemMed blog5" id="blog5"></div>
        <div class="blurPopup blogItemSmall blog6" id="blog6"></div>
        <div class="blurPopup blogItemSmall blog7" id="blog7"></div>
        <div class="blurPopup blogItemSmall blog8" id="blog8"></div>
        <div class="blurPopup blogItemSmall blog9" id="blog9"></div>
        <div class="BlogFiltersBox" id="blogFilters"></div>
        <div class="blurPopup socialFeed" id="blogSocialFeed"></div>
      </div>
    </div>
    <div class="bioContent" id="cntBIO" style="display: none">
      <h2 class="title titleTop bioTitle">
        <span>B</span>
        <span>i</span>
        <span>o</span>
      </h2>
    </div>
    <div class="contactContent" id="cntCONTACT" style="display: none">
      <h2 class="title titleTop contactTitle">
        <span>c</span>
        <span>o</span>
        <span>n</span>
        <span>t</span>
        <span>a</span>
        <span>c</span>
        <span>t</span>
      </h2>
    </div>
    <!-- <div class="projectContent" id="cntPROJECT" style="display: none"></div> -->
    <div class="connexionContent" id="cntCONNEXION" style="display: none">
      <h2 class="title titleTop connexionTitle">
        <span>C</span>
        <span>o</span>
        <span>n</span>
        <span>n</span>
        <span>e</span>
        <span>x</span>
        <span>i</span>
        <span>o</span>
        <span>n</span>
      </h2>
      <div class="formContainer">
        <form action="" method="POST" class="form" id="formConnexion">
          <div class="formGroup">
            <label for="inputMailConnexion">Adresse e-mail :</label>
            <input type="text" id="inputMailConnexion" name="mail" size="30" maxlength="100"
              placeholder="Entrez votre mail" autofocus />
            <p class="errorMessage" id="mailErrorTextConnexion" style="display: none">
              Adresse email non valide !
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="mailValidConnexion" style="display: none"></span>
              <span class="icon iconProhibed" id="mailProhibedConnexion" style="display: none"></span>
            </div>
          </div>
          <div class="formGroup">
            <label for="inputPasswordConnexion">Mot de passe :</label>
            <input type="password" id="inputPasswordConnexion" name="password" maxlength="16"
              placeholder="Entrez votre mot de passe" required="" />
            <p class="errorMessage" id="passwordErrorTextConnexion" style="display: none">
              8 caractères minimum, 1 majuscule, 1 chiffre !
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="passwordValidConnexion" style="display: none"></span>
              <span class="icon iconProhibed" id="passwordProhibedConnexion" style="display: none"></span>
            </div>
            <button class="eyeButton" id="passwordEyeConnexion">
              <span class="icon iconEyeClosed"></span>
              <span class="icon iconEye" style="display: none"></span>
            </button>
          </div>
          <div class="checkboxGroup">
            <input type="checkbox" id="rememberMeConnexion" name="remember" />
            <label for="rememberMeConnexion"> Se souvenir de moi </label>
          </div>
          <div class="btnMedium btnOff" id="btnLoginConnexion">
            <div class="btnLabel" id="">
              <span class="icon iconConnect"></span>
              <span class="btnText" lang="FR" data-en="Connexion">Connexion</span>
            </div>
          </div>
          <div class="linkClickGroup">
            <span class="linkClickText" id="btnForgottenConnexion" lang="FR" data-en="forgotten password ?">Mot de passe
              oublié
              ?</span>
            <div class="linkClickCombo">
              <p class="introLinkClickText" lang="FR" data-en="No account yet ?">Pas encore de compte ?</p>
              <span class="linkClickText" id="btnRegisterConnexion" lang="FR" data-en="Register now!">Inscrivez-vous
                !</span>
            </div>
          </div>
        </form>
        <div class="messageBox">
          <div class="message" id="messageLoginSuccess" style="display: none">
            <span>C</span>
            <span>o</span>
            <span>n</span>
            <span>n</span>
            <span>e</span>
            <span>x</span>
            <span>i</span>
            <span>o</span>
            <span>n</span>
            <span> </span>
            <span>r</span>
            <span>é</span>
            <span>u</span>
            <span>s</span>
            <span>s</span>
            <span>i</span>
            <span>e</span>
            <span>!</span>
          </div>
          <div class="message" id="messageLoginError" style="display: none">
            <span>L</span>
            <span>o</span>
            <span>g</span>
            <span>i</span>
            <span>n</span>
            <span> </span>
            <span>i</span>
            <span>n</span>
            <span>c</span>
            <span>o</span>
            <span>r</span>
            <span>r</span>
            <span>e</span>
            <span>c</span>
            <span>t</span>
            <span>!</span>
          </div>
          <div class="message" id="messageLoginTechnicalError" style="display: none">
            <span>E</span>
            <span>r</span>
            <span>r</span>
            <span>e</span>
            <span>u</span>
            <span>r</span>
            <span> </span>
            <span>t</span>
            <span>e</span>
            <span>c</span>
            <span>h</span>
            <span>n</span>
            <span>i</span>
            <span>q</span>
            <span>u</span>
            <span>e</span>
            <span>!</span>
            <span> </span>
            <span>R</span>
            <span>é</span>
            <span>e</span>
            <span>s</span>
            <span>s</span>
            <span>a</span>
            <span>y</span>
            <span>e</span>
            <span>z</span>
          </div>
        </div>
      </div>
    </div>
    <div class="registerContent" id="cntREGISTER" style="display: none">
      <h2 class="title titleTop registerTitle">
        <span>i</span>
        <span>n</span>
        <span>s</span>
        <span>c</span>
        <span>r</span>
        <span>i</span>
        <span>p</span>
        <span>t</span>
        <span>i</span>
        <span>o</span>
        <span>n</span>
      </h2>
      <div class="formContainer">
        <form action="" method="POST" class="form" id="formRegister">
          <div class="formGroup">
            <label for="inputNameRegister">Nom :</label>
            <input type="text" id="inputNameRegister" name="name" size="30" maxlength="100"
              placeholder="Entrez votre nom" autofocus />
            <p class="errorMessage" id="nameErrorTextRegister" style="display: none">
              Doit contenir au moins 2 caractères.
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="nameValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="nameProhibedRegister" style="display: none"></span>
            </div>
          </div>
          <div class="formGroup">
            <label for="inputFirstnameRegister">Prénom :</label>
            <input type="text" id="inputFirstnameRegister" name="firstname" size="30" maxlength="100"
              placeholder="Entrez votre prénom" />
            <p class="errorMessage" id="firstnameErrorTextRegister" style="display: none">
              Doit contenir au moins 2 caractères.
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="firstnameValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="firstnameProhibedRegister" style="display: none"></span>
            </div>
          </div>
          <div class="formGroup">
            <label for="inputMailRegister">Adresse e-mail :</label>
            <input type="text" id="inputMailRegister" name="mail" size="30" maxlength="100"
              placeholder="Entrez votre mail" />
            <p class="errorMessage" id="mailErrorTextRegister" style="display: none">
              Adresse email non valide !
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="mailValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="mailProhibedRegister" style="display: none"></span>
            </div>
          </div>
          <div class="formGroup">
            <label for="inputPasswordRegister">Mot de passe :</label>
            <input type="password" id="inputPasswordRegister" name="password" maxlength="16"
              placeholder="Entrez votre mot de passe" required="" />
            <p class="errorMessage" id="passwordErrorTextRegister" style="display: none">
              8 caractères minimum, 1 majuscule, 1 chiffre !
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="passwordValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="passwordProhibedRegister" style="display: none"></span>
            </div>
            <button class="eyeButton" id="passwordEyeRegister">
              <span class="icon iconEyeClosed"></span>
              <span class="icon iconEye" style="display: none"></span>
            </button>
          </div>
          <div class="formGroup">
            <label for="inputQuestionARegister">Couleur favorite ?</label>
            <input type="text" id="inputQuestionARegister" name="questionA" size="100" maxlength="100"
              placeholder="Entrez votre réponse" />
            <p class="errorMessage" id="questionAErrorTextRegister" style="display: none">
              Doit contenir au moins 2 caractères.
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="questionAValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="questionAProhibedRegister" style="display: none"></span>
            </div>
          </div>
          <div class="formGroup">
            <label for="inputQuestionBRegister">Plat préféré ?</label>
            <input type="text" id="inputQuestionBRegister" name="questionB" size="100" maxlength="100"
              placeholder="Entrez votre réponse" />
            <p class="errorMessage" id="questionBErrorTextRegister" style="display: none">
              Doit contenir au moins 2 caractères.
            </p>
            <div class="validationIcons">
              <span class="icon iconValid" id="questionBValidRegister" style="display: none"></span>
              <span class="icon iconProhibed" id="questionBProhibedRegister" style="display: none"></span>
            </div>
          </div>
          <div class="checkboxGroup">
            <input type="checkbox" id="mailingRegister" name="remember" />
            <label for="mailingRegister">Recevoir les newsletters</label>
          </div>
          <div class="btnMedium btnOff" id="btnRegisterRegister">
            <div class="btnLabel" id="">
              <span class="icon iconInscription"></span>
              <span class="btnText" lang="FR" data-en="Register">S'inscrire</span>
            </div>
          </div>
        </form>
        <div class="messageBox">
          <div class="message" id="messageRegisterSucces" style="display: none">
            <span>I</span>
            <span>N</span>
            <span>s</span>
            <span>c</span>
            <span>r</span>
            <span>i</span>
            <span>p</span>
            <span>t</span>
            <span>i</span>
            <span>o</span>
            <span>n</span>
            <span> </span>
            <span>r</span>
            <span>é</span>
            <span>u</span>
            <span>s</span>
            <span>s</span>
            <span>i</span>
            <span>e</span>
            <span>!</span>
          </div>
          <div class="message" id="messageRegisterError" style="display: none">
            <span>E</span>
            <span>r</span>
            <span>r</span>
            <span>e</span>
            <span>u</span>
            <span>r</span>
            <span> </span>
            <span>t</span>
            <span>e</span>
            <span>c</span>
            <span>h</span>
            <span>n</span>
            <span>i</span>
            <span>q</span>
            <span>u</span>
            <span>e</span>
            <span>!</span>
            <span> </span>
            <span>R</span>
            <span>é</span>
            <span>e</span>
            <span>s</span>
            <span>s</span>
            <span>a</span>
            <span>y</span>
            <span>e</span>
            <span>z</span>
          </div>
          <div class="message" id="messageRegisterErrorMail" style="display: none">
            <span>E</span>
            <span>m</span>
            <span>a</span>
            <span>i</span>
            <span>l</span>
            <span> </span>
            <span>d</span>
            <span>é</span>
            <span>j</span>
            <span>à</span>
            <span> </span>
            <span>e</span>
            <span>n</span>
            <span>r</span>
            <span>e</span>
            <span>g</span>
            <span>i</span>
            <span>s</span>
            <span>t</span>
            <span>r</span>
            <span>é</span>
          </div>
        </div>
      </div>

    </div>
    <div class="userProfileContent" id="cntUSERPROFILE" style="display: none">
      <h2 class="title titleTop userProfileTitle">
        <span>m</span>
        <span>o</span>
        <span>n</span>
        <span> </span>
        <span>c</span>
        <span>o</span>
        <span>m</span>
        <span>p</span>
        <span>t</span>
        <span>e</span>
      </h2>
      <div class="centerContent">
        <div class="userMenuContainer">
          <div class="userMenuMainIcon iconUser"></div>
          <div class="btnMedium btnOff" id="btnEditUserInfo">
            <div class="btnLabel" id="">
              <span class="icon iconSettings"></span>
              <span class="btnText" lang="FR" data-en="Edit">Modifier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="adminToolContent" id="cntADMINTOOL" style="display: none">
      <h2 class="title titleTop adminToolTitle">
        <span>g</span>
        <span>e</span>
        <span>s</span>
        <span>t</span>
        <span>i</span>
        <span>o</span>
        <span>n</span>
        <span> </span>
        <span>a</span>
        <span>d</span>
        <span>m</span>
        <span>i</span>
        <span>n</span>
      </h2>
      <div class="centerContent">
        <div class="userMenuContainer">
          <div class="userMenuMainIcon iconAdmin"></div>
          <div class="btnMedium btnLarge btnOff" id="btnContenCreation">
            <div class="btnLabel" id="">
              <span class="icon iconContentCreation"></span>
              <span class="btnText" lang="FR" data-en="Content creation">Création contenu</span>
            </div>
          </div>
          <div class="btnMedium btnLarge btnOff" id="btnContenManagement">
            <div class="btnLabel" id="">
              <span class="icon iconContentManagement"></span>
              <span class="btnText" lang="FR" data-en="Content management">Gestion contenu</span>
            </div>
          </div>
          <div class="btnMedium btnLarge btnOff" id="btnImagesManagement">
            <div class="btnLabel" id="">
              <span class="icon iconPortfolio"></span>
              <span class="btnText" lang="FR" data-en="Images management">Gestion images</span>
            </div>
          </div>
          <div class="btnMedium btnLarge" id="btnUsersManagement">
            <div class="btnLabel" id="">
              <span class="icon iconUsersManagement"></span>
              <span class="btnText" lang="FR" data-en="Users management">Gestion utilisateurs</span>
            </div>
          </div>
          <div class="btnMedium btnLarge btnOff" id="btnCommentsManagement">
            <div class="btnLabel" id="">
              <span class="icon iconCommentsManagement"></span>
              <span class="btnText" lang="FR" data-en="Comments management">Gestion commentaires</span>
            </div>
          </div>
          <div class="btnMedium btnLarge btnOff" id="btnAnalytics">
            <div class="btnLabel" id="">
              <span class="icon iconAnalytics"></span>
              <span class="btnText" lang="FR" data-en="Analytics">Statistiques</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="usersManagementContent" id="cntUSERSMANAGEMENT" style="display: none">
      <h2 class="title titleTop usersManagementTitle">
        <span>g</span>
        <span>e</span>
        <span>s</span>
        <span>t</span>
        <span>i</span>
        <span>o</span>
        <span>n</span>
        <span> </span>
        <span>u</span>
        <span>t</span>
        <span>i</span>
        <span>l</span>
        <span>i</span>
        <span>s</span>
        <span>a</span>
        <span>t</span>
        <span>e</span>
        <span>u</span>
        <span>r</span>
        <span>s</span>
      </h2>
      <div class="basicGrid">
        <div class="mainBlock">
          <div class="entryListContainer" id="usersListContainer">
            <div class="entryBlock entryFilters" id="userEntryFilters">
              <div class="entryTop">
                <div class="entryUserInfosContainer">
                  <div class="entryIdContainer">
                    <span class="filtersTXT" id="userFilterId">ID</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT"> </span>
                  </div>
                  <div class="entryNameContainer">
                    <span class="filtersTXT" id="userFilterName">Name</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT"> </span>
                  </div>
                  <div class="entryFirstNameContainer">
                    <span class="filtersTXT" id="userFilterFirstname">Firstname</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT"> </span>
                  </div>
                  <div class="entryMailContainer">
                    <span class="filtersTXT" id="userFilteremail">email</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT"> </span>
                  </div>
                  <div class="entrySubscriptionContainer">
                    <span class="filtersTXT" id="subscription">subscription</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT"> </span>
                  </div>
                  <div class="entryIsAdminContainer">
                    <span class="filtersTXT" id="userFilterIsAdmin">is Admin</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="entryBlock" id="userEntryTemplate" style="display: none;">
              <div class="entryTop">
                <div class="entryUserInfosContainer">
                  <div class="entryIdContainer">
                    <span class="entryTXT" id="userInfoID">#######</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT">-</span>
                  </div>
                  <div class="entryNameContainer">
                    <span class="entryTXTupper" id="userInfoName">Username</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT">-</span>
                  </div>
                  <div class="entryFirstNameContainer">
                    <span class="entryTXTupper" id="userInfoFirstname">UserFirstname</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT">-</span>
                  </div>
                  <div class="entryMailContainer">
                    <span class="entryTXT" id="userInfoMail">usernameandfirstname@gmail.com</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT">-</span>
                  </div>
                  <div class="entrySubscriptionContainer">
                    <span class="entryTXT" id="userInfoSubscription">2025-01-01</span>
                  </div>
                  <div class="entrySeparatorContainer">
                    <span class="entryTXT">-</span>
                  </div>
                  <div class="entryIsAdminContainer">
                    <span class="entryTXTupper" id="userInfoIsAdmin">Admin</span>
                  </div>
                </div>
                <a class="btnEntrySettings" id="btnUserEntrySettings">
                  <span class="icon iconSettings" id="btnEntrySettingsIcon"></span>
                </a>
              </div>
              <div class="entrySettingsBox">
                <form class="entryUserForm" action="" method="POST" class="form" id="formUpdateUser">
                  <div class="formGroup">
                    <input type="text" id="inputUpdateName" name="inputUpdateName" maxlength="50"
                      placeholder="User name" />
                  </div>
                  <div class="formGroup">
                    <input type="text" id="inputUpdateFirstName" name="inputUpdateFirstName" maxlength="50"
                      placeholder="User firstname" />
                  </div>
                  <div class="formGroup">
                    <input type="text" id="inputUpdateMail" name="inputUpdateMail" maxlength="254"
                      placeholder="User email" />
                  </div>
                  <div class="checkboxGroup">
                    <input type="checkbox" id="inputUpdateIsAdmin" name="inputUpdateIsAdmin" />
                    <label for="inputUpdateIsAdmin">Is admin</label>
                  </div>
                </form>
                <div class="entryBtnBox" id="boxUpdateUser">
                  <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdate">
                    <div class="btnMedium" id="btnDeleteUser">
                      <div class="btnLabel" id="">
                        <span class="icon iconDelete"></span>
                        <span class="btnText" lang="FR" data-en="Delete">Supprimer</span>
                      </div>
                    </div>
                    <div class="btnMedium btnOff" id="btnSaveUser">
                      <div class="btnLabel" id="">
                        <span class="icon iconSave"></span>
                        <span class="btnText" lang="FR" data-en="Save">Sauvegarder</span>
                      </div>
                    </div>
                  </div>
                  <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdateComplete" style="display: none;">
                    <span class="entryBtnBoxMessage" lang="FR" data-en="User updated">Utilisateur mis à jour</span>
                  </div>
                  <div class="entryBtnBoxContent" id="entryBtnBoxContentUpdateError" style="display: none;">
                    <span class="entryBtnBoxMessage" lang="FR" data-en="An error has occured, try again !">Une erreur
                      est survenue, réessayez !</span>
                  </div>
                  <div class="entryBtnBoxContent" id="entryBtnBoxContentDelete" style="display: none;">
                    <span class="entryBtnBoxMessage" lang="FR" data-en="Permanently delete ?">Supprimer définitivement
                      ?</span>
                    <div class="btnMedium btnSmall" id="btnDeleteEntryDeny">
                      <div class="btnLabel" id="">
                        <span class="icon iconDeny"></span>
                      </div>
                    </div>
                    <div class="btnMedium btnSmall" id="btnDeleteEntryValidation">
                      <div class="btnLabel" id="">
                        <span class="icon iconValid"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="sideBlock">
          <div class="basicBlock" id="userSearchBlock">
            <span class="blockTitle" lang="FR" data-en="Search">Recherche<br>utilisateurs</span>
            <!-- <div class="formContainerLateral"> -->
            <form class="formContainerLateral" classaction="" method="POST" class="form" id="formRegister">
              <div class="idSearchBox">
                <div class="formGroup">
                  <label for="inputSearchUserIdA">From</label>
                  <input type="text" id="inputSearchUserIdA" name="inputSearchUserIdA" maxlength="10"
                    placeholder="User ID" />
                </div>
                <div class="formGroup">
                  <label for="inputSearchUserIdB">To</label>
                  <input type="text" id="inputSearchUserIdB" name="inputSearchUserIdB" maxlength="10"
                    placeholder="User ID" />
                </div>
              </div>
              <div class="formGroup">
                <input type="text" id="inputSearchUserName" name="inputSearchUserName" maxlength="30"
                  placeholder="User name" />
              </div>
              <div class="formGroup">
                <input type="text" id="inputSearchUserFirstname" name="inputSearchUserFirstname" maxlength="30"
                  placeholder="User firstname" />
              </div>
              <div class="formGroup">
                <input type="text" id="inputSearchUserMail" name="inputSearchUserMail" maxlength="30"
                  placeholder="User mail" />
              </div>
              <div class="formGroup">
                <input type="date" id="inputSearchUserSubscription" name="inputSearchUserubscription" maxlength="30"
                  placeholder="User mail" />
              </div>
              <div class="idSearchBox">
                <div class="checkboxGroup">
                  <input type="checkbox" id="inputSearchIsAdmin" name="inputSearchIsAdmin" />
                  <label for="searchIsAdmin">Is admin</label>
                </div>
                <div class="checkboxGroup">
                  <input type="checkbox" id="inputSearchNewsletter" name="inputSearchNewsletter" />
                  <label for="searchIsAdmin">Newsletter</label>
                </div>
              </div>
            </form>
            <!-- <div class="messageBox">
                <div class="message" id="messageRegisterSucces" style="display: none">
                  <span>I</span>
                  <span>N</span>
                  <span>s</span>
                  <span>c</span>
                  <span>r</span>
                  <span>i</span>
                  <span>p</span>
                  <span>t</span>
                  <span>i</span>
                  <span>o</span>
                  <span>n</span>
                  <span> </span>
                  <span>r</span>
                  <span>é</span>
                  <span>u</span>
                  <span>s</span>
                  <span>s</span>
                  <span>i</span>
                  <span>e</span>
                  <span>!</span>
                </div>
                <div class="message" id="messageRegisterError" style="display: none">
                  <span>E</span>
                  <span>r</span>
                  <span>r</span>
                  <span>e</span>
                  <span>u</span>
                  <span>r</span>
                  <span> </span>
                  <span>t</span>
                  <span>e</span>
                  <span>c</span>
                  <span>h</span>
                  <span>n</span>
                  <span>i</span>
                  <span>q</span>
                  <span>u</span>
                  <span>e</span>
                  <span>!</span>
                  <span> </span>
                  <span>R</span>
                  <span>é</span>
                  <span>e</span>
                  <span>s</span>
                  <span>s</span>
                  <span>a</span>
                  <span>y</span>
                  <span>e</span>
                  <span>z</span>
                </div>
                <div class="message" id="messageRegisterErrorMail" style="display: none">
                  <span>E</span>
                  <span>m</span>
                  <span>a</span>
                  <span>i</span>
                  <span>l</span>
                  <span> </span>
                  <span>d</span>
                  <span>é</span>
                  <span>j</span>
                  <span>à</span>
                  <span> </span>
                  <span>e</span>
                  <span>n</span>
                  <span>r</span>
                  <span>e</span>
                  <span>g</span>
                  <span>i</span>
                  <span>s</span>
                  <span>t</span>
                  <span>r</span>
                  <span>é</span>
                </div>
              </div> -->
            <!-- </div> -->
            <div class="btnMedium" id="btnUsersSearch">
              <div class="btnLabel" id="">
                <span class="icon iconSearch"></span>
                <span class="btnText" lang="FR" data-en="Search">Chercher</span>
              </div>
            </div>
          </div>
          <div class="basicBlock" id="uploadUsersBlock">
            <span class="blockTitle" lang="FR" data-en="Search">Upload<br>utilisateurs</span>
            <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserList">
              <div class="btnMedium" id="btnUploadUserList">
                <div class="btnLabel" id="">
                  <span class="icon iconUploadList"></span>
                  <span class="btnText" lang="FR" data-en="Upload">Uploader</span>
                </div>
              </div>
            </div>
            <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserListComplete" style="display: none;">
              <span class="entryBtnBoxMessage" lang="FR" data-en="User list uploaded !">Liste utilisateurs uploadée
                !</span>
            </div>
            <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserError" style="display: none;">
              <span class="entryBtnBoxMessage" lang="FR" data-en="Technical error. Try again !">Erreur technique.
                Reessayez !</span>
            </div>
            <div class="entryBtnBoxContent" id="entryBtnBoxUploadUserFormatError" style="display: none;">
              <span class="entryBtnBoxMessage" lang="FR" data-en="Entries are not in the right format !">Les entrées ne
                sont pas au bon format !</span>
            </div>
            <input type="file" id="inputUploadUserCSV" accept=".csv" style="display: none;" />
            <p class="blockSubTxt">Utilisez un doc formaté CSV</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
  <div class="backgroundsContainer">
    <div class="topBarBackground"></div>
    <div class="backgrounds">
      <div class="backgMotif" id="backgMotif"></div>
      <div class="backgBlur" id="backgBlur"></div>
      <div class="backgroundHome" id="backgroundHome">
        <img src="vue/assets/images/Backgrounds/bck_homeLight1080.png" alt="background" />
      </div>
    </div>
  </div>
</body>
<script src="controller/language.js" defer></script>
<script src="vue/interface.js" defer></script>
<script src="vue/backgrounds.js" defer></script>
<script src="vue/form_validation.js" defer></script>

<script src="vue/navigation.js" defer></script>
<script src="vue/admintool.js" defer></script>
<script src="controller/start.js" defer></script>

</html>