<div class="navMobile">
  <div class="mainNavContainerMobile" id="menuMobile">
    <div class="mobileMenuInner">
      <div class="mobileMenuTopRow">
        <a href="/" class="mainLogo" id="mainLogoMobile">
          <h1>Guillaume Catteau</h1>
          <h2 class="mainLogoText">
            <span>D</span><span>i</span><span>g</span><span>i</span><span>t</span>
            <span>a</span><span>l</span><span> </span><span>D</span><span>e</span>
            <span>s</span><span>i</span><span>g</span><span>n</span><span>e</span><span>r</span>
          </h2>
        </a>
        <div class="languageSelector" id="languageSelectorMobile">
          <select id="langMobile">
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
      <div class="connexionBoxMobile" id="connexionBoxMobile">
        <a class="btnUserLog" id="btnUserLogMobile" style="display: none">
          <span class="icon iconUser"></span>
          <span class="btnUserLogText" id="userNameMobile"><?php if (isset($_SESSION['user'])): ?><?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?><?php endif; ?></span>
        </a>
        <a class="btnAdminLog" id="btnAdminLogMobile" style="display: none">
          <span class="icon iconUser"></span>
          <span class="btnUserLogText" id="adminNameMobile"><?php if (isset($_SESSION['user'])): ?><?= htmlspecialchars($_SESSION['user']['firstname']) . ' ' . htmlspecialchars($_SESSION['user']['name']) ?><?php endif; ?></span>
        </a>
        <a class="btnConnexion" id="btnConnexionMobile">
          <span class="icon iconConnect" id="btnConnexionIconMobile"></span>
        </a>
      </div>
      <ul class="navLinksMobile">
        <li><a class="btnMobile" id="btnHomeMobile"><span class="icon iconGC"></span><span class="linkTextMobile" lang="FR" data-en="Home">Accueil</span></a></li>
        <li><a class="btnMobile" id="btnPresentationMobile"><span class="icon iconBio"></span><span class="linkTextMobile" lang="FR" data-en="About">Présentation</span></a></li>
        <li><a class="btnMobile" id="btnExpertiseMobile"><span class="icon iconExpertise"></span><span class="linkTextMobile" lang="FR" data-en="Expertise">Expertises</span></a></li>
        <li><a class="btnMobile" id="btnPortfolioSectionMobile"><span class="icon iconPortfolio"></span><span class="linkTextMobile" lang="FR" data-en="Portfolio">Portfolio</span></a></li>
        <li><a class="btnMobile" id="btnBioSectionMobile"><span class="icon iconProfil"></span><span class="linkTextMobile" lang="FR" data-en="Bio">Bio</span></a></li>
        <li><a class="btnMobile" id="btnBlogSectionMobile"><span class="icon iconBlog"></span><span class="linkTextMobile" lang="FR" data-en="Blog">Blog</span></a></li>
        <li><a class="btnMobile" id="btnContactSectionMobile"><span class="icon iconContact"></span><span class="linkTextMobile" lang="FR" data-en="Contact">Contact</span></a></li>
        <li><button type="button" class="btnMobile btnShare" id="btnShareMobile" title="Partager / Share"><span class="icon iconShare"></span><span class="linkTextMobile" lang="FR" data-en="Share">Partager</span></button></li>
      </ul>
      <span class="followMeLabel" lang="FR" data-en="Follow me">Suivez-moi</span>
      <ul class="socialLinksMobile">
        <li><a class="btnSocialMobile" id="btnArtstationMobile" href="https://www.artstation.com/gcdigitalarts" target="_blank" rel="noopener noreferrer"><span class="icon iconArtstation"></span></a></li>
        <li><a class="btnSocialMobile" id="btnLinkedinMobile" href="https://www.linkedin.com/in/guillaumecatteau/" target="_blank" rel="noopener noreferrer"><span class="icon iconLinkedin"></span></a></li>
        <li><a class="btnSocialMobile" id="btnYoutubeMobile" href="https://www.youtube.com/@GuillaumeCatteau" target="_blank" rel="noopener noreferrer"><span class="icon iconYoutube"></span></a></li>
        <li><a class="btnSocialMobile" id="btnFacebookMobile" href="https://www.facebook.com/guillaume.catteau" target="_blank" rel="noopener noreferrer"><span class="icon iconFacebook"></span></a></li>
        <li><a class="btnSocialMobile" id="btnXMobile" href="https://x.com/GC_DigitalArts" target="_blank" rel="noopener noreferrer"><span class="icon iconX"></span></a></li>
      </ul>
    </div>
  </div>
</div>
