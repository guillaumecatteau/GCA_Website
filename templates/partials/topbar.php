<div class="topBar">
  <a href="/" class="mainLogo" id="mainLogo">
    <h1>Guillaume Catteau</h1>
    <h2 class="mainLogoText">
      <span>D</span><span>i</span><span>g</span><span>i</span><span>t</span>
      <span>a</span><span>l</span><span> </span><span>D</span><span>e</span>
      <span>s</span><span>i</span><span>g</span><span>n</span><span>e</span><span>r</span>
    </h2>
  </a>
  <div class="topBarDesktop">
    <div class="connexionBox" id="connexionBoxDesktop">
      <a class="btnUserLog" id="btnUserLogDesktop" style="display: none">
        <span class="icon iconUser"></span>
        <span class="btnUserLogText" id="userNameDesktop"><?php if (isset($_SESSION['user'])): ?><?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?><?php endif; ?></span>
      </a>
      <a class="btnAdminLog" id="btnAdminLogDesktop" style="display: none">
        <span class="icon iconAdmin"></span>
        <span class="btnUserLogText" id="adminNameDesktop"><?php if (isset($_SESSION['user'])): ?><?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?><?php endif; ?></span>
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
        <li><a class="btnSocialTablet" id="btnArtstationTablet" href="https://www.artstation.com/gcdigitalarts" target="_blank" rel="noopener noreferrer"><span class="icon iconRoundArtstation"></span></a></li>
        <li><a class="btnSocialTablet" id="btnLinkedinTablet" href="https://www.linkedin.com/in/guillaumecatteau/" target="_blank" rel="noopener noreferrer"><span class="icon iconRoundLinkedin"></span></a></li>
        <li><a class="btnSocialTablet" id="btnYoutubeTablet" href="https://www.youtube.com/@GuillaumeCatteau" target="_blank" rel="noopener noreferrer"><span class="icon iconRoundYoutube"></span></a></li>
        <li><a class="btnSocialTablet" id="btnFacebookTablet" href="https://www.facebook.com/guillaume.catteau" target="_blank" rel="noopener noreferrer"><span class="icon iconRoundFacebook"></span></a></li>
        <li><a class="btnSocialTablet" id="btnXTablet" href="https://x.com/GC_DigitalArts" target="_blank" rel="noopener noreferrer"><span class="icon iconRoundX"></span></a></li>
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
