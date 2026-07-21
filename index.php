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
  <?php require 'templates/partials/head.php'; ?>
</head>

<body>
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
    require 'templates/pages/profile.php';
    require 'templates/pages/games.php';
    require 'templates/pages/uxui.php';
    require 'templates/pages/3d.php';
    require 'templates/pages/2d.php';
    require 'templates/pages/video.php';
    require 'templates/pages/web.php';
    require 'templates/pages/pixel.php';
    require 'templates/pages/portfolio.php';
    require 'templates/pages/blog.php';
    require 'templates/pages/bio.php';
    require 'templates/pages/contact.php';
    // â”€â”€ Compte utilisateur â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    require 'templates/pages/connexion.php';
    require 'templates/pages/register.php';
    require 'templates/pages/userprofile.php';
    // ── Admin ──────────────────────────────────────────────────────────────────────────────────────────
    require 'templates/admin/admintool.php';
    require 'templates/admin/users.php';
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
    <div class="sectionNavItem sectionNavItem--active" data-target="0" title="Landing">
      <span class="icon iconGC"></span>
    </div>
    <div class="sectionNavItem" data-target="1" title="Présentation">
      <span class="icon iconBio"></span>
    </div>
    <div class="sectionNavItem" data-target="2" title="Expertises">
      <span class="icon iconExpertise"></span>
    </div>
    <div class="sectionNavItem" data-target="3" title="Portfolio">
      <span class="icon iconPortfolio"></span>
    </div>
    <div class="sectionNavItem" data-target="4" title="Bio">
      <span class="icon iconProfil"></span>
    </div>
    <div class="sectionNavItem" data-target="5" title="Blog">
      <span class="icon iconBlog"></span>
    </div>
    <div class="sectionNavItem" data-target="6" title="Contact">
      <span class="icon iconContact"></span>
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

  <?php require 'templates/admin/scene-editor.php'; ?>

  <!-- ── Bouton debug strokes (dev only) ── -->
  <button id="debugToggleBtn" title="Toggle debug strokes" style="
    position:fixed; bottom:16px; right:16px; z-index:9999;
    width:36px; height:36px; border-radius:50%;
    background:rgba(20,20,30,0.85); border:1px solid rgba(255,255,255,0.15);
    color:rgba(255,255,255,0.4); font-size:14px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:opacity .2s, border-color .2s; opacity:0.5;
  ">⬡</button>
  <script>
    (function(){
      var btn = document.getElementById('debugToggleBtn');
      var on  = false;
      btn.addEventListener('click', function(){
        on = !on;
        document.body.classList.toggle('debug-visible', on);
        btn.style.borderColor = on ? 'rgba(255,80,80,0.8)' : 'rgba(255,255,255,0.15)';
        btn.style.color       = on ? 'rgba(255,80,80,0.9)' : 'rgba(255,255,255,0.4)';
        btn.style.opacity     = on ? '1' : '0.5';
      });
    })();
  </script>

  <?php require 'templates/partials/backgrounds.php'; ?>
  <?php require 'templates/partials/scripts.php'; ?>
</body>

</html>

