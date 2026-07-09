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

  <?php require 'templates/admin/scene-editor.php'; ?>

  <?php require 'templates/partials/backgrounds.php'; ?>
  <?php require 'templates/partials/scripts.php'; ?>
</body>

</html>

