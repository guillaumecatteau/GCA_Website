<?php
// Réglages publics du titre/sous-titre/texte de bienvenue Accueil — rendus EN SSR (plutôt
// que fetchés uniquement en JS, cf. vue/home-hero.js) pour éliminer tout bond visible au
// chargement : les variables CSS ci-dessous (posées en inline style) correspondent aux
// VRAIES valeurs configurées dès le tout premier paint. --home-title-offset-vh et le "top"
// du texte de bienvenue utilisent des unités CSS natives (vh / %) — NATURELLEMENT
// immunisées au zoom navigateur sans le moindre calcul JS, cf. _navigation.scss
// (.homeHeroGroup, .homeWelcomeText) — home-hero.js ne fait plus que RAFFINER le
// positionnement du groupe titre/sous-titre (compensation zoom explicite + plafond de
// largeur), le texte de bienvenue n'a lui plus besoin d'AUCUN JS pour son positionnement.
require_once __DIR__ . '/../../model/model_admin.php';
$_heroSettings = getHeroSettings();
$_heroRefPxPerVh = 1080 / 100; // cf. REFERENCE_HEIGHT dans vue/home-hero.js — garder synchronisé
$_heroInlineVars = sprintf(
  '--home-title-size:%.1fpx;--home-subtitle-size:%.1fpx;--home-title-letter-spacing:%.1fpx;--home-subtitle-distance:%.1fpx;--home-title-offset-vh:%.2fvh;',
  $_heroSettings['titleVh'] * $_heroRefPxPerVh,
  $_heroSettings['subtitleVh'] * $_heroRefPxPerVh,
  $_heroSettings['titleLetterSpacing'],
  $_heroSettings['subtitleDistanceVh'] * $_heroRefPxPerVh,
  $_heroSettings['titleOffsetPct']
);
$_welcomeTextInlineStyle = sprintf('top:%.1f%%;', $_heroSettings['welcomeTextTopPct']);
?>
<div class="homeContent" id="cntHOME" style="display: none">

  <!-- ── Section 0 : Landing ─────────────────────────────────────────── -->
  <div class="section section--active" data-section="landing" id="sectionLanding">
    <!-- ── Groupe titre + sous-titre — un seul ensemble rigide, position:absolute et centré
         horizontalement vis-à-vis de la section globale (cf. demande explicite). Position
         verticale pilotée PAR le réglage "Position du titre" (translateY via
         --home-title-offset-vh, cf. ci-dessus) ; le sous-titre, TOUJOURS positionné
         relativement au titre (jamais en absolu), n'utilise son propre réglage que pour
         définir l'ÉCART (gap) entre les deux (margin-top, cf. _navigation.scss). Mis à
         l'échelle comme un bloc rigide via transform:scale() (cf. vue/home-hero.js,
         _applyHeroScale()) : garantit que l'espacement des lettres, la taille du
         sous-titre et la distance titre/sous-titre conservent TOUJOURS le même ratio entre
         eux (et avec le logo de la scène 3D), quel que soit le redimensionnement de
         fenêtre — et reste IMMUNISÉ au zoom navigateur. ── -->
    <div class="homeHeroGroup" id="homeHeroGroup" style="<?= htmlspecialchars($_heroInlineVars, ENT_QUOTES, 'UTF-8') ?>">
      <h2 class="title titleMain homeTitle">
        <span>D</span><span>i</span><span>g</span><span>i</span><span>t</span>
        <span>a</span><span>l</span><span> </span><span>A</span><span>r</span>
        <span>t</span><span>s</span>
      </h2>
      <h3 class="homeSubtitle" id="homeSubtitle"></h3>
    </div>
    <!-- ── Texte de bienvenue — élément AUTONOME (sibling de #homeHeroGroup, pas un
         enfant) : position verticale propre, réglable depuis Settings (% de la hauteur de
         page, cf. model/model_admin.php "hero_welcome_text_top_pct"), indépendante du
         titre/sous-titre. Centré horizontalement (marges auto, cf. _navigation.scss).
         Simple fondu d'opacité, desktop + tablette uniquement (caché sur mobile, cf.
         _navigation.scss). i18n via lang/data-en, même convention que
         templates/partials/topbar.php. ── -->
    <p class="homeWelcomeText" id="homeWelcomeText" style="<?= htmlspecialchars($_welcomeTextInlineStyle, ENT_QUOTES, 'UTF-8') ?>" lang="FR" data-en="Welcome to my portfolio">
      Bienvenue sur mon portfolio
    </p>
    <div class="scrollDownIndicator" data-scroll-target="presentation" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="About">Présentation</span>
    </div>
  </div>

  <!-- ── Section 1 : Présentation ─────────────────────────────────────── -->
  <div class="section" data-section="presentation" id="sectionPresentation">
    <h2 class="title titleTop sectionPresentationTitle">
      <span>p</span><span>r</span><span>é</span><span>s</span><span>e</span><span>n</span>
      <span>t</span><span>a</span><span>t</span><span>i</span><span>o</span><span>n</span>
    </h2>
    <!-- Contenu custom à définir -->
    <div class="scrollDownIndicator" data-scroll-target="expertise" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Expertise">Expertises</span>
    </div>
  </div>

  <!-- ── Section 2 : Expertises ────────────────────────────────────────── -->
  <div class="section" data-section="expertise" id="sectionExpertise">
    <h2 class="title titleTop sectionExpertiseTitle">
      <span>e</span><span>x</span><span>p</span><span>e</span><span>r</span>
      <span>t</span><span>i</span><span>s</span><span>e</span><span>s</span>
    </h2>
    <div class="sectionCardsGrid" id="expertiseCards">
      <!-- Cards injectées dynamiquement -->
    </div>
    <div class="scrollDownIndicator" data-scroll-target="portfolio" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Portfolio">Portfolio</span>
    </div>
  </div>

  <!-- ── Section 3 : Portfolio ─────────────────────────────────────────── -->
  <div class="section" data-section="portfolio" id="sectionPortfolio">
    <h2 class="title titleTop sectionPortfolioTitle">
      <span>p</span><span>o</span><span>r</span><span>t</span><span>f</span>
      <span>o</span><span>l</span><span>i</span><span>o</span>
    </h2>
    <div class="pfCarousel" id="portfolioCarousel">
      <button type="button" class="pfCarouselArrow pfCarouselArrow--prev" id="btnPortfolioPrev" aria-label="Previous">
        <span class="icon iconPrevious"></span>
      </button>
      <div class="pfCarouselTrack" id="portfolioCarouselTrack">
        <!-- Slots injectés par vue/portfolio-carousel.js -->
      </div>
      <button type="button" class="pfCarouselArrow pfCarouselArrow--next" id="btnPortfolioNext" aria-label="Next">
        <span class="icon iconNext"></span>
      </button>
    </div>
    <div class="scrollDownIndicator" data-scroll-target="bio" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Bio">Bio</span>
    </div>
  </div>

  <!-- ── Section 4 : Bio ───────────────────────────────────────────────── -->
  <!-- Structure identique à une page projet (page-view) : bloc cover en haut,
       contenu texte FR/EN en dessous, + panel gauche Expérience/Formation/Études
       (même structure que l'éditeur d'expériences, en lecture seule). -->
  <div class="section" data-section="bio" id="sectionBio">
    <h2 class="title titleTop sectionBioTitle">
      <span>b</span><span>i</span><span>o</span>
    </h2>
    <div class="basicGrid" id="sectionBioGrid">
      <div class="mainBlock" id="bioTimelineContainer">
        <!-- 3 groupes (Expériences / Formations / Études) injectés par vue/bio-timeline.js -->
      </div>
      <div class="sideBlock">
        <div class="pageViewMain sectionBioMain" id="sectionBioMain">
          <div class="pageViewCover" id="sectionBioCover">
            <!-- Média cover à définir (ex: <img src="..." alt="" />) -->
          </div>
          <div class="pageViewBody">
            <div class="pageViewTextBlock" lang="FR" data-en="Digital designer for over 15 years, I've worked across many different fields: virtual worlds, video games, web design, motion design and 3D animation. This variety of experience taught me to adapt quickly to new tools and constraints, while keeping a consistent creative approach from one project to the next.">Designer num&eacute;rique depuis plus de 15 ans, j&rsquo;ai travaill&eacute; dans des domaines vari&eacute;s&nbsp;: mondes virtuels, jeux vid&eacute;o, web design, motion design et animation 3D. Cette diversit&eacute; d&rsquo;exp&eacute;riences m&rsquo;a appris &agrave; m&rsquo;adapter rapidement &agrave; de nouveaux outils et contraintes, tout en gardant une d&eacute;marche cr&eacute;ative coh&eacute;rente d&rsquo;un projet &agrave; l&rsquo;autre.</div>
            <div class="pageViewTextBlock" lang="FR" data-en="Curious and self-taught, I enjoy exploring new techniques and technologies, always with the same goal in mind: turning an idea into a polished, coherent visual experience.">Curieux et autodidacte, j&rsquo;aime explorer de nouvelles techniques et technologies, toujours avec le m&ecirc;me objectif&nbsp;: transformer une id&eacute;e en une exp&eacute;rience visuelle aboutie et coh&eacute;rente.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="scrollDownIndicator" data-scroll-target="gallery" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Gallery">Gallerie</span>
    </div>
  </div>

  <!-- ── Section 5 : Gallerie — carrousel détaillé dans Section Gallerie (cf. home-gallery.js) ── -->
  <div class="section" data-section="gallery" id="sectionGallery">
    <h2 class="title titleTop sectionGalleryTitle">
      <span>g</span><span>a</span><span>l</span><span>l</span><span>e</span><span>r</span><span>i</span><span>e</span>
    </h2>
    <div class="sectionGalleryContent" id="sectionGalleryContent">
      <div class="galleryFilters" id="galleryFilters">
        <!-- Icônes de filtre (expertises) injectées par vue/home-gallery.js -->
      </div>
      <div class="pfCarousel galleryCarousel" id="galleryCarousel">
        <button type="button" class="pfCarouselArrow pfCarouselArrow--prev" id="btnGalleryPrev" aria-label="Previous">
          <span class="icon iconPrevious"></span>
        </button>
        <div class="pfCarouselTrack" id="galleryCarouselTrack">
          <!-- Slots injectés par vue/home-gallery.js -->
        </div>
        <button type="button" class="pfCarouselArrow pfCarouselArrow--next" id="btnGalleryNext" aria-label="Next">
          <span class="icon iconNext"></span>
        </button>
      </div>
      <div class="galleryDetails" id="galleryDetails">
        <!-- Année / projet / description + icône share injectés par vue/home-gallery.js -->
      </div>
      <div class="galleryThumbsHolder" id="galleryThumbsHolder">
        <!-- Bande de miniatures injectée par vue/home-gallery.js (vue/gallery-common.js) -->
      </div>
    </div>
    <div class="scrollDownIndicator" data-scroll-target="blog" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Blog">Blog</span>
    </div>
  </div>

  <!-- ── Section 6 : Blog ──────────────────────────────────────────────── -->
  <div class="section" data-section="blog" id="sectionBlog">
    <h2 class="title titleTop sectionBlogTitle">
      <span>b</span><span>l</span><span>o</span><span>g</span>
    </h2>
    <div class="sectionCardsGrid" id="blogCards">
      <!-- Cards injectées dynamiquement -->
    </div>
    <div class="scrollDownIndicator" data-scroll-target="contact" title="Scroll down">
      <div class="scrollDownChevrons">
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
        <div class="scrollDownChevron"></div>
      </div>
      <span class="scrollDownText" lang="FR" data-en="Contact">Contact</span>
    </div>
  </div>

  <!-- ── Section 7 : Contact ───────────────────────────────────────────── -->
  <div class="section" data-section="contact" id="sectionContact">
    <h2 class="title titleTop sectionContactTitle">
      <span>c</span><span>o</span><span>n</span><span>t</span><span>a</span>
      <span>c</span><span>t</span>
    </h2>
    <div class="sectionContactLayout">
      <form class="form contactForm" id="formContact" autocomplete="off">
        <div class="formGroup">
          <label class="formLabel" for="inputNameContact" lang="FR" data-en="Last name">Nom</label>
          <input class="formInput" type="text" id="inputNameContact" name="name" maxlength="100" placeholder="Entrez votre nom" data-en-placeholder="Enter your last name" />
          <p class="errorMessage" id="nameErrorTextContact" style="display: none" lang="FR" data-en="Must contain at least 2 characters.">Doit contenir au moins 2 caractères.</p>
          <div class="validationIcons">
            <span class="icon iconValid" id="nameValidContact" style="display: none"></span>
            <span class="icon iconProhibed" id="nameProhibedContact" style="display: none"></span>
          </div>
        </div>
        <div class="formGroup">
          <label class="formLabel" for="inputFirstnameContact" lang="FR" data-en="First name">Prénom</label>
          <input class="formInput" type="text" id="inputFirstnameContact" name="firstname" maxlength="100" placeholder="Entrez votre prénom" data-en-placeholder="Enter your first name" />
          <p class="errorMessage" id="firstnameErrorTextContact" style="display: none" lang="FR" data-en="Must contain at least 2 characters.">Doit contenir au moins 2 caractères.</p>
          <div class="validationIcons">
            <span class="icon iconValid" id="firstnameValidContact" style="display: none"></span>
            <span class="icon iconProhibed" id="firstnameProhibedContact" style="display: none"></span>
          </div>
        </div>
        <div class="formGroup">
          <label class="formLabel" for="inputCompanyContact" lang="FR" data-en="Company (optional)">Compagnie (facultatif)</label>
          <input class="formInput" type="text" id="inputCompanyContact" name="company" maxlength="150" placeholder="Entrez votre compagnie" data-en-placeholder="Enter your company" />
        </div>
        <div class="formGroup">
          <label class="formLabel" for="inputMailContact" lang="FR" data-en="Email address">Adresse e-mail</label>
          <input class="formInput" type="text" id="inputMailContact" name="mail" maxlength="100" placeholder="Entrez votre email" data-en-placeholder="Enter your email" />
          <p class="errorMessage" id="mailErrorTextContact" style="display: none" lang="FR" data-en="Invalid email address!">Adresse email non valide !</p>
          <div class="validationIcons">
            <span class="icon iconValid" id="mailValidContact" style="display: none"></span>
            <span class="icon iconProhibed" id="mailProhibedContact" style="display: none"></span>
          </div>
        </div>
        <div class="formGroup">
          <label class="formLabel" for="inputPhoneContact" lang="FR" data-en="Phone (optional)">Téléphone (facultatif)</label>
          <input class="formInput" type="text" id="inputPhoneContact" name="phone" maxlength="30" placeholder="Entrez votre téléphone" data-en-placeholder="Enter your phone number" />
        </div>
        <div class="formGroup">
          <label class="formLabel" for="inputSubjectContact" lang="FR" data-en="Subject">Sujet</label>
          <input class="formInput" type="text" id="inputSubjectContact" name="subject" maxlength="150" placeholder="Objet de votre message" data-en-placeholder="Subject of your message" />
          <p class="errorMessage" id="subjectErrorTextContact" style="display: none" lang="FR" data-en="Must contain at least 3 characters.">Doit contenir au moins 3 caractères.</p>
          <div class="validationIcons">
            <span class="icon iconValid" id="subjectValidContact" style="display: none"></span>
            <span class="icon iconProhibed" id="subjectProhibedContact" style="display: none"></span>
          </div>
        </div>
        <div class="formGroup formGroup--textarea">
          <label class="formLabel" for="inputMessageContact" lang="FR" data-en="Message">Message</label>
          <textarea class="formTextarea" id="inputMessageContact" name="message" maxlength="2000" rows="5" placeholder="Votre message..." data-en-placeholder="Your message..."></textarea>
          <p class="errorMessage" id="messageErrorTextContact" style="display: none" lang="FR" data-en="Must contain at least 10 characters.">Doit contenir au moins 10 caractères.</p>
          <div class="validationIcons">
            <span class="icon iconValid" id="messageValidContact" style="display: none"></span>
            <span class="icon iconProhibed" id="messageProhibedContact" style="display: none"></span>
          </div>
        </div>
        <div class="btnMedium btnOff" id="btnSendContact">
          <div class="btnLabel">
            <span class="icon iconContact"></span>
            <span class="btnText" lang="FR" data-en="Send">Envoyer</span>
          </div>
        </div>
      </form>
      <div class="messageBox">
        <div class="message" id="messageContactSucces" style="display: none">
          <span>M</span><span>e</span><span>s</span><span>s</span><span>a</span><span>g</span><span>e</span><span> </span><span>e</span><span>n</span><span>v</span><span>o</span><span>y</span><span>é</span><span> </span><span>!</span>
        </div>
        <div class="message" id="messageContactError" style="display: none">
          <span>E</span><span>r</span><span>r</span><span>e</span><span>u</span><span>r</span><span> </span><span>t</span><span>e</span><span>c</span><span>h</span><span>n</span><span>i</span><span>q</span><span>u</span><span>e</span><span>!</span><span> </span><span>R</span><span>é</span><span>e</span><span>s</span><span>s</span><span>a</span><span>y</span><span>e</span><span>z</span>
        </div>
      </div>
    </div>
  </div>

</div>

