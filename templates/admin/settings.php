<div class="settingsContent" id="cntSETTINGS" style="display: none">
  <h2 class="title titleTop settingsTitle">
    <span>s</span><span>e</span><span>t</span><span>t</span><span>i</span><span>n</span><span>g</span><span>s</span>
  </h2>
  <div class="basicGrid">
    <div class="mainBlock">

      <!-- ── Lancement du site (rideau noir masquant le chargement de la scène 3D) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Site launch">Lancement du site</span>
        <p class="adminPlaceholder" lang="FR" data-en="A dark screen hides the page until the 3D scene has fully loaded, to prevent it from appearing broken for a few frames. This delay is a minimum duration — it can last longer if the scene takes more time to load.">
          Un écran sombre masque la page tant que la scène 3D n'est pas totalement chargée, pour éviter qu'elle n'apparaisse cassée pendant quelques frames. Ce délai est une durée minimale — il peut être plus long si la scène met davantage de temps à charger.
        </p>

        <div class="cursorGroup">
          <label class="cursorGroupLabel" lang="FR" data-en="Launch delay (ms)">
            Launch delay (ms)
          </label>
          <div class="cursorGroupTrack">
            <input type="range" class="formRange cursorRange" id="settingsLaunchDelay" min="0" max="5000" step="100" />
            <input type="number" class="cursorValue" id="settingsLaunchDelayValue" min="0" max="5000" step="100" />
          </div>
        </div>

        <!-- ── Chronologie d'intro — délai (ms) de révélation de chaque élément d'interface,
             PAR DEVICE, relatif au moment où la scène 3D commence à jouer son état "intro"
             (cf. vue/intro-timeline.js, évènement 'gca-intro-start' — PAS le chargement de la
             page ni le rideau noir ci-dessus). Une colonne désactivée = élément non applicable
             à ce device (ex: icônes latérales = desktop uniquement). ── -->
        <div class="introTimelineBlock">
          <span class="cursorGroupLabel" lang="FR" data-en="Intro timeline (ms per element, since intro start)">
            Chronologie d'intro (ms par élément, depuis le début de l'intro)
          </span>
          <div class="introTimelineTable" id="introTimelineTable">
            <div class="introTimelineRow introTimelineRow--header">
              <span class="introTimelineRowLabel"></span>
              <span class="introTimelineCol" lang="FR" data-en="Desktop">Desktop</span>
              <span class="introTimelineCol" lang="FR" data-en="Tablet">Tablette</span>
              <span class="introTimelineCol" lang="FR" data-en="Mobile">Mobile</span>
            </div>
            <?php
            // [clé, libellé FR, libellé EN, desktop applicable, tablet applicable, mobile applicable]
            $introTimelineRows = [
                ['mainLogo',     'Logo principal',               'Main logo',             true,  true,  false],
                ['lateralIcons', 'Icônes latérales',              'Lateral icons',         true,  false, false],
                ['topInputs',    'Icônes du haut (recherche, langue)', 'Top icons (search, language)', true, false, false],
                ['burgerIcon',   'Icône burger',                  'Burger icon',           false, true,  true],
                ['mainTitle',    'Titre principal',               'Main title',            true,  true,  true],
                ['subtitles',    'Sous-titres défilants',         'Scrolling subtitles',   true,  true,  true],
                ['welcomeText',  'Texte de bienvenue',            'Welcome text',          true,  true,  false],
                ['scrollIcon',   'Icône de scroll',               'Scroll icon',           true,  true,  true],
            ];
            foreach ($introTimelineRows as [$key, $labelFr, $labelEn, $desktopOn, $tabletOn, $mobileOn]):
            ?>
              <div class="introTimelineRow" data-key="<?= $key ?>">
                <span class="introTimelineRowLabel" lang="FR" data-en="<?= htmlspecialchars($labelEn) ?>"><?= htmlspecialchars($labelFr) ?></span>
                <?php foreach ([['desktop', $desktopOn], ['tablet', $tabletOn], ['mobile', $mobileOn]] as [$device, $applicable]): ?>
                  <input
                    type="number"
                    class="formInput introTimelineInput"
                    data-key="<?= $key ?>"
                    data-device="<?= $device ?>"
                    min="0" max="60000" step="50"
                    <?= $applicable ? '' : 'disabled' ?>
                  />
                <?php endforeach; ?>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      </div>

      <!-- ── Navigation home (scroll magnétique entre sections) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Home navigation">Navigation home</span>

        <div class="cursorGroup">
          <label class="cursorGroupLabel" lang="FR" data-en="Hold delay before changing section (ms)">
            Délai d'immobilité avant changement de section (ms)
          </label>
          <div class="cursorGroupTrack">
            <input type="range" class="formRange cursorRange" id="settingsScrollEdgeDelay" min="0" max="5000" step="100" />
            <input type="number" class="cursorValue" id="settingsScrollEdgeDelayValue" min="0" max="5000" step="100" />
          </div>
        </div>

        <div class="cursorGroup">
          <label class="cursorGroupLabel" lang="FR" data-en="Scroll wheel force required">
            Force de molette nécessaire
          </label>
          <div class="cursorGroupTrack">
            <input type="range" class="formRange cursorRange" id="settingsScrollWheelForce" min="1" max="100" step="1" />
            <input type="number" class="cursorValue" id="settingsScrollWheelForceValue" min="1" max="100" step="1" />
          </div>
        </div>

        <div class="cursorGroup">
          <label class="cursorGroupLabel" lang="FR" data-en="Touch swipe force required (tablet/mobile)">
            Force de swipe tactile nécessaire (tablette/mobile)
          </label>
          <div class="cursorGroupTrack">
            <input type="range" class="formRange cursorRange" id="settingsScrollSwipeForce" min="1" max="200" step="1" />
            <input type="number" class="cursorValue" id="settingsScrollSwipeForceValue" min="1" max="200" step="1" />
          </div>
        </div>
      </div>

      <!-- ── Section Accueil (titre principal — taille, position, espacement /
           sous-titres — taille, opacité, taux de prélèvement couleur) — deux colonnes
           distinctes (Titre / Sous-titre), cf. demande explicite ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Home section">Section Accueil</span>

        <div class="heroSectionColumns">
          <div class="heroSectionColumn">
            <span class="heroSectionColumnTitle" lang="FR" data-en="Title">Titre</span>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Main title size (vh)">Taille du titre principal (vh)</label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroTitleVh" min="1" max="15" step="0.1" />
                <input type="number" class="cursorValue" id="settingsHeroTitleVhValue" min="1" max="15" step="0.1" />
              </div>
            </div>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Title vertical position (offset from center)">
                Position verticale du titre (écart au centre)
              </label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroTitleOffset" min="-20" max="20" step="0.1" />
                <input type="number" class="cursorValue" id="settingsHeroTitleOffsetValue" min="-20" max="20" step="0.1" />
              </div>
            </div>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Title letter spacing (px)">Espacement des lettres du titre (px)</label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroLetterSpacing" min="0" max="60" step="1" />
                <input type="number" class="cursorValue" id="settingsHeroLetterSpacingValue" min="0" max="60" step="1" />
              </div>
            </div>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Distance between title and subtitle (vh)">
                Distance entre le titre et le sous-titre (vh)
              </label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroSubtitleDistance" min="0" max="20" step="0.1" />
                <input type="number" class="cursorValue" id="settingsHeroSubtitleDistanceValue" min="0" max="20" step="0.1" />
              </div>
            </div>

            <!-- Position du texte de bienvenue — élément autonome (pas rattaché au groupe
                 titre/sous-titre), % de la hauteur de la section (0 = haut, 100 = bas). ── -->
            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Welcome text vertical position (% of page height)">
                Position verticale du texte de bienvenue (% hauteur de page)
              </label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroWelcomeTextTop" min="0" max="100" step="0.5" />
                <input type="number" class="cursorValue" id="settingsHeroWelcomeTextTopValue" min="0" max="100" step="0.5" />
              </div>
            </div>
          </div>

          <div class="heroSectionColumn">
            <span class="heroSectionColumnTitle" lang="FR" data-en="Subtitle">Sous-titre</span>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Subtitles size (vh)">Taille des sous-titres (vh)</label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroSubtitleVh" min="0.5" max="10" step="0.1" />
                <input type="number" class="cursorValue" id="settingsHeroSubtitleVhValue" min="0.5" max="10" step="0.1" />
              </div>
            </div>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="Subtitle opacity">Opacité du sous-titre</label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroSubtitleOpacity" min="0.05" max="1" step="0.05" />
                <input type="number" class="cursorValue" id="settingsHeroSubtitleOpacityValue" min="0.05" max="1" step="0.05" />
              </div>
            </div>

            <div class="cursorGroup">
              <label class="cursorGroupLabel" lang="FR" data-en="3D scene color sampling rate (ms)">
                Taux de prélèvement de la couleur scène 3D (ms)
              </label>
              <div class="cursorGroupTrack">
                <input type="range" class="formRange cursorRange" id="settingsHeroColorSample" min="16" max="2000" step="16" />
                <input type="number" class="cursorValue" id="settingsHeroColorSampleValue" min="16" max="2000" step="16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Sous-titres défilants (box dédiée, cf. Section Accueil ci-dessus pour les
           réglages de taille/position) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Scrolling subtitles">Sous-titres défilants</span>

        <div class="cursorGroup">
          <label class="cursorGroupLabel" lang="FR" data-en="Display duration per subtitle (ms)">
            Durée d'affichage par sous-titre (ms)
          </label>
          <div class="cursorGroupTrack">
            <input type="range" class="formRange cursorRange" id="settingsHeroSubtitleHold" min="500" max="10000" step="100" />
            <input type="number" class="cursorValue" id="settingsHeroSubtitleHoldValue" min="500" max="10000" step="100" />
          </div>
        </div>

        <div class="entryListContainer" id="heroSubtitlesList">
          <!-- Entrées injectées par JS -->
        </div>
        <!-- Crée directement une entrée vide à éditer sur place dans la liste ci-dessus —
             plus de champs FR/EN préalables ici (cf. demande : "pas besoin de mettre des
             champs à gauche du bouton ajouter, crée simplement une nouvelle entrée"). -->
        <div class="btnMedium settingsTerminalGap" id="btnAddHeroSubtitle">
          <div class="btnLabel">
            <span class="btnText" lang="FR" data-en="Add">Ajouter</span>
          </div>
        </div>
      </div>

    </div>
    <div class="sideBlock">

      <!-- ── Accès admin (gate date de naissance + nom du chat) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Admin access">Accès admin</span>
        <p class="adminPlaceholder" lang="FR" data-en="Enter the date of birth and the name of the first cat to view and edit the admin access.">
          Entrez la date de naissance et le nom du premier chat pour afficher et modifier les accès admin.
        </p>

        <div class="formGroup">
          <label class="formLabel" lang="FR" data-en="Date of birth">Date de naissance</label>
          <div class="settingsDateSelectors">
            <select class="formInput" id="settingsGateDay">
              <option value="">JJ</option>
              <?php for ($d = 1; $d <= 31; $d++): ?>
                <option value="<?= $d ?>"><?= str_pad($d, 2, '0', STR_PAD_LEFT) ?></option>
              <?php endfor; ?>
            </select>
            <select class="formInput" id="settingsGateMonth">
              <option value="">MM</option>
              <?php
              $months = [
                1 => 'Janvier', 2 => 'Février', 3 => 'Mars', 4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
                7 => 'Juillet', 8 => 'Août', 9 => 'Septembre', 10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre',
              ];
              foreach ($months as $num => $label): ?>
                <option value="<?= $num ?>"><?= $label ?></option>
              <?php endforeach; ?>
            </select>
            <select class="formInput" id="settingsGateYear">
              <option value="">AAAA</option>
              <?php for ($y = (int)date('Y'); $y >= 1930; $y--): ?>
                <option value="<?= $y ?>"><?= $y ?></option>
              <?php endfor; ?>
            </select>
          </div>
        </div>

        <div class="formGroup">
          <label class="formLabel" for="settingsGateCatName" lang="FR" data-en="First cat's name">Nom du premier chat</label>
          <input class="formInput" type="text" id="settingsGateCatName" maxlength="100" placeholder="…" />
        </div>

        <div class="btnMedium btnOff settingsTerminalGap" id="btnSettingsVerify">
          <div class="btnLabel">
            <span class="btnText" lang="FR" data-en="Verify">Vérifier</span>
          </div>
        </div>
        <p class="errorMessage" id="settingsGateError" style="display:none" lang="FR" data-en="Incorrect answers.">
          Réponses incorrectes.
        </p>

        <!-- ── Révélé une fois le gate validé ── -->
        <div class="settingsAccessFields" id="settingsAccessFields" style="display:none">
          <div class="formGroup">
            <label class="formLabel" for="settingsAccessMail" lang="FR" data-en="Email">Adresse e-mail</label>
            <input class="formInput" type="text" id="settingsAccessMail" maxlength="150" />
          </div>
          <div class="formGroup">
            <label class="formLabel" for="settingsAccessPassword" lang="FR" data-en="Password">Mot de passe</label>
            <input class="formInput" type="text" id="settingsAccessPassword" maxlength="100" />
          </div>
          <div class="btnMedium btnOff settingsTerminalGap" id="btnSettingsSave">
            <div class="btnLabel">
              <span class="btnText" lang="FR" data-en="Save">Sauvegarder</span>
            </div>
          </div>
          <p class="formMessage" id="settingsSaveMessage" style="display:none"></p>
        </div>
      </div>

      <!-- ── Mode du site (Dev / Production) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Site mode">Mode du site</span>
        <label class="formToggle">
          <input type="checkbox" id="settingsDevModeToggle" />
          <span class="formToggleLabel" lang="FR" data-en="Dev mode">Mode Dev</span>
        </label>
        <p class="adminPlaceholder" lang="FR" data-en="In Dev mode, the admin tool access button is always visible. In Production, it only appears once logged in.">
          En mode Dev, le bouton d'accès à l'admin tool est toujours visible. En Production, il n'apparaît qu'une fois connecté.
        </p>
      </div>

      <!-- ── Liens sociaux (affichage + URL par réseau) — pas de sauvegarde instantanée,
           participe au bouton "Sauvegarder" global en bas du right panel (cf. Task 7) ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Social links">Liens sociaux</span>
        <div class="socialLinksEditor" id="socialLinksEditor">
          <!-- Entrées injectées par JS (une par réseau, cf. SOCIAL_LINKS_NETWORKS) -->
        </div>
      </div>

      <!-- ── Sauvegarde de la base de données — dernière box du right panel avant le
           bouton "Sauvegarder" global (cf. demande : Backup doit précéder immédiatement
           ce bouton, qui doit rester le TOUT dernier élément du panel). Nom IDENTIQUE en
           FR/EN ("Backup DB", cf. demande explicite) — bouton juste "Télécharger"/"Download"
           (pas "Télécharger la sauvegarde", redondant avec le titre de la box). ── -->
      <div class="basicBlock">
        <span class="blockTitle" lang="FR" data-en="Backup DB">Backup DB</span>
        <p class="adminPlaceholder" lang="FR" data-en="Download a full backup (.sql) of the database.">
          Télécharger une sauvegarde complète (.sql) de la base de données.
        </p>
        <a class="btnMedium settingsTerminalGap" id="btnDownloadBackup" href="controller/controller.php?action=admin_backup">
          <div class="btnLabel">
            <span class="icon iconSave"></span>
            <span class="btnText" lang="FR" data-en="Download">Télécharger</span>
          </div>
        </a>
      </div>

      <!-- ── Sauvegarder (bouton global pour tout ce qui ne s'enregistre pas
           instantanément dans ce right panel — sous-titres + liens sociaux — ET pour
           tout le reste des réglages, cf. Task 11 : marque dirty + sauvegarde TOUT en un
           clic). DOIT rester le tout dernier élément du right panel. ── -->
      <div class="btnMedium btnOff settingsTerminalGap" id="btnSettingsSaveAll">
        <div class="btnLabel">
          <span class="btnText" lang="FR" data-en="Save">Sauvegarder</span>
        </div>
      </div>
      <p class="formMessage" id="settingsSaveAllMessage" style="display:none"></p>

    </div>
    <button class="btnBackToAdmin"><span class="icon iconBack"></span></button>
  </div>
</div>
