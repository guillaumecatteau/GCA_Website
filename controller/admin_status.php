<?php
/**
 * admin_status.php — Statut public (sans authentification) utilisé par le front
 * pour savoir s'il doit afficher le bouton d'accès direct à l'admin tool
 * (cf. vue/breakpoints.js, vue/navigation.js) :
 *  - en mode "Dev", le bouton est toujours affiché.
 *  - en mode "Production", il ne s'affiche que si l'admin est déjà connecté.
 */
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/../model/model_admin.php';

echo json_encode([
    'success'       => true,
    'devMode'       => isDevMode(),
    'loggedIn'      => !empty($_SESSION['admin']),
    'scrollSettings'=> getScrollSettings(),
    'heroSettings'  => getHeroSettings(),
    'launchSettings'=> getLaunchSettings(),
    'socialLinks'   => getSocialLinksSettings()['socialLinks'],
    'introTimeline' => getIntroTimelineSettings()['introTimeline'],
]);
