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
      <!-- Accès direct admin tool — visible en mode Dev, ou une fois connecté en mode Production
           (cf. vue/breakpoints.js, vue/navigation.js : window._devMode / window._isLoggedInAdmin) -->
      <a class="btnDirectAdmin" id="btnDirectAdmin" title="Admin tool" style="display:none">
        <span class="icon iconAdmin"></span>
      </a>
    </div>
    <!-- Recherche du site — juste à gauche du sélecteur de langue (cf. Recherche du site) -->
    <button type="button" class="btnSearchDesktop" id="btnSearchDesktop" title="Recherche / Search">
      <span class="icon iconSearch"></span>
    </button>
    <div class="languageSelector" id="languageSelectorDesktop">
      <select id="lang" class="languageSwitchMobileNative" aria-hidden="true" tabindex="-1">
        <option value="fr">FR</option>
        <option value="en">EN</option>
      </select>
      <button type="button" class="languageSwitchBtn" id="languageSwitchDesktopBtn" role="switch" aria-checked="false" aria-label="FR / EN">
        <span class="languageSwitchOption" data-lang="fr">FR</span>
        <span class="languageSwitchOption" data-lang="en">EN</span>
        <span class="languageSwitchKnob"></span>
      </button>
    </div>
  </div>
  <div class="topBarContent">
    <nav class="tabletMenuTop" id="menuTabletTop">
      <!-- Recherche du site — même position relative que le desktop, à gauche du sélecteur de langue -->
      <button type="button" class="btnSearchTablet" id="btnSearchTablet" title="Recherche / Search">
        <span class="icon iconSearch"></span>
      </button>
      <div class="languageSelector" id="languageSelectorTablet">
        <select id="langTablet" class="languageSwitchMobileNative" aria-hidden="true" tabindex="-1">
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
        <button type="button" class="languageSwitchBtn" id="languageSwitchTabletBtn" role="switch" aria-checked="false" aria-label="FR / EN">
          <span class="languageSwitchOption" data-lang="fr">FR</span>
          <span class="languageSwitchOption" data-lang="en">EN</span>
          <span class="languageSwitchKnob"></span>
        </button>
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
