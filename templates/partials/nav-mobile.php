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
        <!-- ── Sélecteur de langue — switch FR/EN, remis en haut à droite à côté du logo
             (cf. Interface mobile "menu burger" : retour sur son positionnement précédent
             en bas à gauche) ── -->
        <div class="languageSelector languageSwitchMobile" id="languageSelectorMobile">
          <select id="langMobile" class="languageSwitchMobileNative" aria-hidden="true" tabindex="-1">
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
          <button type="button" class="languageSwitchBtn" id="languageSwitchMobileBtn" role="switch" aria-checked="false" aria-label="FR / EN">
            <span class="languageSwitchOption" data-lang="fr">FR</span>
            <span class="languageSwitchOption" data-lang="en">EN</span>
            <span class="languageSwitchKnob"></span>
          </button>
        </div>
      </div>
      <!-- ── Bouton principaux (sections) + réseaux sociaux : un seul groupe, centré entre le
           bas du logo et le haut du bouton burger (cf. Interface mobile) ── -->
      <div class="mobileMenuNavGroup">
        <ul class="navLinksMobile">
          <li><a class="btnMobile" id="btnHomeMobile"><span class="icon iconHome"></span><span class="linkTextMobile" lang="FR" data-en="Home">Accueil</span></a></li>
          <li><a class="btnMobile" id="btnPresentationMobile"><span class="icon iconGC"></span><span class="linkTextMobile" lang="FR" data-en="About">Présentation</span></a></li>
          <li><a class="btnMobile" id="btnExpertiseMobile"><span class="icon iconWorks"></span><span class="linkTextMobile" lang="FR" data-en="Expertise">Expertises</span></a></li>
          <li><a class="btnMobile" id="btnPortfolioSectionMobile"><span class="icon iconPortfolio"></span><span class="linkTextMobile" lang="FR" data-en="Portfolio">Portfolio</span></a></li>
          <li><a class="btnMobile" id="btnBioSectionMobile"><span class="icon iconBio"></span><span class="linkTextMobile" lang="FR" data-en="Bio">Bio</span></a></li>
          <li><a class="btnMobile" id="btnGallerySectionMobile"><span class="icon iconGalleries"></span><span class="linkTextMobile" lang="FR" data-en="Gallery">Gallerie</span></a></li>
          <li><a class="btnMobile" id="btnBlogSectionMobile"><span class="icon iconBlog"></span><span class="linkTextMobile" lang="FR" data-en="Blog">Blog</span></a></li>
          <li><a class="btnMobile" id="btnContactSectionMobile"><span class="icon iconContact"></span><span class="linkTextMobile" lang="FR" data-en="Contact">Contact</span></a></li>
          <li><button type="button" class="btnMobile btnSearchMobile" id="btnSearchMobile" title="Recherche / Search"><span class="icon iconSearch"></span><span class="linkTextMobile" lang="FR" data-en="Search">Recherche</span></button></li>
        </ul>
        <span class="followMeLabel" lang="FR" data-en="Follow me">Suivez-moi</span>
        <ul class="socialLinksMobile">
          <li><a class="btnMobile btnSocialMobile" id="btnArtstationMobile" data-social="artstation" href="https://www.artstation.com/gcdigitalarts" target="_blank" rel="noopener noreferrer"><span class="icon iconArtstation"></span></a></li>
          <li><a class="btnMobile btnSocialMobile" id="btnLinkedinMobile" data-social="linkedin" href="https://www.linkedin.com/in/guillaumecatteau/" target="_blank" rel="noopener noreferrer"><span class="icon iconLinkedin"></span></a></li>
          <li><a class="btnMobile btnSocialMobile" id="btnYoutubeMobile" data-social="youtube" href="https://www.youtube.com/@GuillaumeCatteau" target="_blank" rel="noopener noreferrer"><span class="icon iconYoutube"></span></a></li>
          <li><a class="btnMobile btnSocialMobile" id="btnFacebookMobile" data-social="facebook" href="https://www.facebook.com/guillaume.catteau" target="_blank" rel="noopener noreferrer"><span class="icon iconFacebook"></span></a></li>
          <li><a class="btnMobile btnSocialMobile" id="btnXMobile" data-social="x" href="https://x.com/GC_DigitalArts" target="_blank" rel="noopener noreferrer"><span class="icon iconX"></span></a></li>
          <li><a class="btnMobile btnSocialMobile" id="btnInstagramMobile" data-social="instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" style="display:none"><span class="icon iconInstagram"></span></a></li>
        </ul>
      </div>
      <!-- ── Partager le site — lien icône+texte, coin inférieur gauche du menu déplié,
           symétrique au bouton burger (coin inférieur droit). Partage toujours l'URL racine
           du site (data-share-url), jamais la page/section courante (à la différence du
           bouton "Partager" de la grille ci-dessus) — cf. vue/share.js (délégation globale
           sur .btnShare). Position fixe, indépendante du flux/scroll interne du menu. ── -->
      <a href="#" class="shareWebsiteLink btnShare" id="btnShareWebsiteMobile"
         data-share-url="<?= htmlspecialchars($scheme . '://' . $host) ?>/"
         data-share-title="GC Digital Arts">
        <span class="icon iconShare"></span>
        <span lang="FR" data-en="Share the website">Partager le site</span>
      </a>
    </div>
  </div>
</div>
