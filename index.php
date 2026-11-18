<?php
session_start();
if (isset($_GET['action'])) {
  require_once('controller/controller.php');
  exit;
}

// ── Open Graph / partage — cf. Fonction share : "dans le cas d'un partage de
// page, le cover média devra être utilisé". Les réseaux (Facebook, LinkedIn,
// WhatsApp...) récupèrent ces balises côté serveur en visitant l'URL partagée
// — impossible de s'appuyer sur le rendu JS côté client pour ça.
$scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
$ogMeta = [
  'title'       => 'GC Digital Arts',
  'description' => 'Guillaume Catteau — Designer numérique : expertises, portfolio et blog.',
  'image'       => null,
  'url'         => $scheme . '://' . $host . ($_SERVER['REQUEST_URI'] ?? '/'),
];
$_requestPath = trim(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '', '/');
if (preg_match('#^p/(.+)$#', $_requestPath, $_slugMatch)) {
  try {
    require_once __DIR__ . '/model/db.php';
    require_once __DIR__ . '/model/model_pages.php';
    $_sharedPage = getPageBySlug($_slugMatch[1]);
    if ($_sharedPage && $_sharedPage['is_visible']) {
      $ogMeta['title'] = ($_sharedPage['title_fr'] ?: $_sharedPage['title_en']) . ' — GC Digital Arts';
      $_subtitle = $_sharedPage['subtitle_fr'] ?: ($_sharedPage['subtitle_en'] ?: '');
      if ($_subtitle) $ogMeta['description'] = strip_tags($_subtitle);
      if (!empty($_sharedPage['cover_path'])) {
        $ogMeta['image'] = $scheme . '://' . $host . '/' . ltrim($_sharedPage['cover_path'], '/');
      }
    }
  } catch (\Throwable $e) {
    // Échec silencieux (DB indisponible...) — le site doit toujours charger, retombe sur les meta par défaut.
  }
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>
  <?php require 'templates/partials/head.php'; ?>
</head>

<body class="page-home">
  <!-- ── Rideau de lancement — masque TOUT (scène 3D en cours de chargement, interface non
       initialisée...) jusqu'à ce que la scène 3D soit effectivement chargée ET affichée et
       que le script d'interface ait pu s'exécuter (cf. vue/launch-overlay.js). Style critique
       posé en inline pour un masquage garanti dès le tout premier paint, indépendamment du
       temps de chargement de la feuille de styles externe. Durée minimale réglable depuis
       l'admin tool (Settings → Lancement du site → "Launch delay"). -->
  <div id="launchOverlay" class="launchOverlay" style="position:fixed;inset:0;z-index:999999;background-color:#040508;opacity:1;"></div>
  <script>
    (function () {
      var NAV_START   = performance.now();
      var DEFAULT_MS  = 800;   // repli si le réglage admin n'a pas pu être lu à temps
      var SAFETY_MS   = 10000; // jamais bloqué indéfiniment, même si la scène échoue totalement
      var FETCH_CAP_MS = 1500; // au-delà, on arme avec la valeur par défaut plutôt que d'attendre
      var state = { sceneReady: false, minDelayDone: false, revealed: false, armed: false };

      function reveal() {
        if (state.revealed || !state.sceneReady || !state.minDelayDone) return;
        state.revealed = true;
        var overlay = document.getElementById('launchOverlay');
        if (!overlay) return;
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'opacity 450ms ease';
        overlay.style.opacity = '0';
        setTimeout(function () { overlay.remove(); }, 500);
      }
      window.__gcaCheckLaunchReveal = reveal;

      function armMinDelay(ms) {
        var remaining = Math.max(0, ms - (performance.now() - NAV_START));
        setTimeout(function () { state.minDelayDone = true; reveal(); }, remaining);
      }
      function armOnce(ms) {
        if (state.armed) return;
        state.armed = true;
        armMinDelay(ms);
      }

      // Jamais indéfiniment noir : si la scène ne signale jamais sa fin de chargement
      // (échec réseau total après toutes les tentatives), on révèle quand même après
      // SAFETY_MS plutôt que de condamner la page à un écran noir permanent.
      setTimeout(function () { state.sceneReady = true; reveal(); }, SAFETY_MS);

      window.addEventListener('gca-scene-ready', function () {
        // Deux frames de marge : garantit qu'une image réelle (logo + particules) a bien
        // été peinte avant de lever le rideau, pas seulement que le GLB est "chargé".
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { state.sceneReady = true; reveal(); });
        });
      }, { once: true });

      // Repli si la requête des réglages tarde anormalement (serveur lent, etc.).
      setTimeout(function () { armOnce(DEFAULT_MS); }, FETCH_CAP_MS);

      fetch('controller/controller.php?action=admin_status')
        .then(function (r) { return r.json(); })
        .then(function (json) {
          var delay = (json && json.launchSettings && typeof json.launchSettings.launchDelay === 'number')
            ? json.launchSettings.launchDelay
            : DEFAULT_MS;
          armOnce(delay);
        })
        .catch(function () { armOnce(DEFAULT_MS); });
    })();
  </script>

  <div class="navContainer">
    <?php require 'templates/partials/topbar.php'; ?>
    <?php require 'templates/partials/nav-desktop.php'; ?>
    <?php require 'templates/partials/nav-tablet.php'; ?>
    <?php require 'templates/partials/nav-mobile.php'; ?>
  </div>

  <div class="pageContainer">
    <?php
    // â”€â”€ Pages publiques â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    require 'templates/pages/home.php';
    require 'templates/pages/page-view.php';
    require 'templates/pages/search.php';
    // ── Connexion admin (écran caché, cf. vue/secret-login.js) ─────────────────────────────────────────
    require 'templates/pages/connexion.php';
    // ── Admin ──────────────────────────────────────────────────────────────────────────────────────────
    require 'templates/admin/admintool.php';
    require 'templates/admin/settings.php';
    require 'templates/admin/tags.php';
    require 'templates/admin/medias.php';
    require 'templates/admin/pages.php';
    require 'templates/admin/experiences.php';
    require 'templates/admin/comments.php';
    require 'templates/admin/analytics.php';
    ?>
  </div>

  <!-- ── Navigation sections home — hors pageContainer pour éviter le contexte transform ── -->
  <nav class="sectionNav" id="sectionNav" style="display:none" aria-label="Navigation sections">
    <div class="sectionNavItem sectionNavItem--active" data-target="0" title="Accueil">
      <span class="icon iconHome"></span>
      <span class="sectionNavLabel" data-en="Home"><span>A</span><span>C</span><span>C</span><span>U</span><span>E</span><span>I</span><span>L</span></span>
    </div>
    <div class="sectionNavItem" data-target="1" title="Présentation">
      <span class="icon iconGC"></span>
      <span class="sectionNavLabel" data-en="About"><span>P</span><span>R</span><span>É</span><span>S</span><span>E</span><span>N</span><span>T</span><span>A</span><span>T</span><span>I</span><span>O</span><span>N</span></span>
    </div>
    <div class="sectionNavItem" data-target="2" title="Expertises">
      <span class="icon iconWorks"></span>
      <span class="sectionNavLabel" data-en="Expertise"><span>E</span><span>X</span><span>P</span><span>E</span><span>R</span><span>T</span><span>I</span><span>S</span><span>E</span></span>
    </div>
    <div class="sectionNavItem" data-target="3" title="Portfolio">
      <span class="icon iconPortfolio"></span>
      <span class="sectionNavLabel" data-en="Portfolio"><span>P</span><span>O</span><span>R</span><span>T</span><span>F</span><span>O</span><span>L</span><span>I</span><span>O</span></span>
    </div>
    <div class="sectionNavItem" data-target="4" title="Bio">
      <span class="icon iconBio"></span>
      <span class="sectionNavLabel" data-en="Bio"><span>B</span><span>I</span><span>O</span></span>
    </div>
    <div class="sectionNavItem" data-target="5" title="Gallerie">
      <span class="icon iconGalleries"></span>
      <span class="sectionNavLabel" data-en="Gallery"><span>G</span><span>A</span><span>L</span><span>L</span><span>E</span><span>R</span><span>I</span><span>E</span></span>
    </div>
    <div class="sectionNavItem" data-target="6" title="Blog">
      <span class="icon iconBlog"></span>
      <span class="sectionNavLabel" data-en="Blog"><span>B</span><span>L</span><span>O</span><span>G</span></span>
    </div>
    <div class="sectionNavItem" data-target="7" title="Contact">
      <span class="icon iconContact"></span>
      <span class="sectionNavLabel" data-en="Contact"><span>C</span><span>O</span><span>N</span><span>T</span><span>A</span><span>C</span><span>T</span></span>
    </div>
  </nav>

  <!-- ── Popups globaux — hors pageContainer pour éviter le contexte transform ── -->

  <!-- Confirmation suppression tag -->
  <div class="confirmOverlay" id="tagDeleteConfirm" style="display:none">
    <div class="confirmBox">
      <p class="confirmMsg" lang="FR" data-en="Delete this tag permanently?">Supprimer ce tag définitivement ?</p>
      <div class="confirmActions">
        <div class="btnMedium btnDanger" id="btnConfirmDeleteTag">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Delete">Supprimer</span></div>
        </div>
        <div class="btnMedium" id="btnCancelDeleteTag">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Cancel">Annuler</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Browser d'icônes -->
  <div class="confirmOverlay" id="tagIconBrowser" style="display:none">
    <div class="iconBrowserBox">
      <div class="iconBrowserHeader">
        <span lang="FR" data-en="Choose an icon">Choisir une icône</span>
        <button type="button" class="btnSmall" id="btnCloseIconBrowser">✕</button>
      </div>
      <div class="iconBrowserFolders">
        <button type="button" class="iconFolderBtn iconFolderBtn--active" data-folder="vue/assets/images/icons">Webp</button>
        <button type="button" class="iconFolderBtn" data-folder="vue/assets/images/icons/PNGs">PNG</button>
      </div>
      <div class="iconBrowserGrid" id="tagIconBrowserGrid">
        <!-- Injecté par JS -->
      </div>
    </div>
  </div>

  <!-- ── Expériences : popup confirmation suppression ── -->
  <div class="confirmOverlay" id="expDeleteConfirm" style="display:none">
    <div class="confirmBox">
      <p class="confirmMsg" lang="FR" data-en="Delete this experience permanently?">Supprimer cette expérience définitivement ?</p>
      <div class="confirmActions">
        <div class="btnMedium btnDanger" id="btnConfirmDeleteExp">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Delete">Supprimer</span></div>
        </div>
        <div class="btnMedium" id="btnCancelDeleteExp">
          <div class="btnLabel"><span class="btnText" lang="FR" data-en="Cancel">Annuler</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Expériences : browser de logo ── -->
  <div class="confirmOverlay" id="expLogoBrowser" style="display:none">
    <div class="iconBrowserBox">
      <div class="iconBrowserHeader">
        <span lang="FR" data-en="Choose a logo">Choisir un logo</span>
        <button type="button" class="btnSmall" id="btnCloseExpLogoBrowser">✕</button>
      </div>
      <div class="iconBrowserFolders">
        <button type="button" class="iconFolderBtn iconFolderBtn--active" data-folder="vue/assets/images/icons">Webp</button>
        <button type="button" class="iconFolderBtn" data-folder="vue/assets/images/icons/PNGs">PNG</button>
      </div>
      <div class="iconBrowserGrid" id="expLogoBrowserGrid">
        <!-- Injecté par JS -->
      </div>
    </div>
  </div>

  <?php require 'templates/admin/scene-editor.php'; ?>

  <!-- ── Partage — popup réseaux sociaux (page/section courante), cf. vue/share.js ── -->
  <div class="confirmOverlay" id="shareOverlay" style="display:none">
    <div class="shareBox">
      <div class="shareBoxHeader">
        <span lang="FR" data-en="Where do you want to share?">Où voulez-vous partager ?</span>
        <button type="button" class="btnSmall" id="btnCloseShare">✕</button>
      </div>
      <p class="shareBoxTitle" id="shareBoxTitle"></p>
      <ul class="shareList">
        <li><a class="shareLink" id="shareLinkFacebook" href="#" target="_blank" rel="noopener noreferrer"><span class="icon iconFacebook"></span><span lang="FR" data-en="Facebook">Facebook</span></a></li>
        <li><a class="shareLink" id="shareLinkX" href="#" target="_blank" rel="noopener noreferrer"><span class="icon iconX"></span><span lang="FR" data-en="X (Twitter)">X (Twitter)</span></a></li>
        <li><a class="shareLink" id="shareLinkLinkedin" href="#" target="_blank" rel="noopener noreferrer"><span class="icon iconLinkedin"></span><span lang="FR" data-en="LinkedIn">LinkedIn</span></a></li>
        <li><a class="shareLink" id="shareLinkPinterest" href="#" target="_blank" rel="noopener noreferrer" style="display:none"><span class="icon iconPinterest"></span><span lang="FR" data-en="Pinterest">Pinterest</span></a></li>
        <li><a class="shareLink" id="shareLinkWhatsapp" href="#" target="_blank" rel="noopener noreferrer"><span class="icon iconWhatsapp"></span><span lang="FR" data-en="WhatsApp">WhatsApp</span></a></li>
        <li><a class="shareLink" id="shareLinkEmail" href="#"><span class="icon iconEmail"></span><span lang="FR" data-en="Email">Email</span></a></li>
        <li><button type="button" class="shareLink" id="shareLinkCopy"><span class="icon iconCopy"></span><span id="shareLinkCopyLabel" lang="FR" data-en="Copy link">Copier le lien</span></button></li>
      </ul>
    </div>
  </div>

  <?php require 'templates/partials/backgrounds.php'; ?>
  <?php require 'templates/partials/scripts.php'; ?>
</body>

</html>

