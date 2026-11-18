<?php
/**
 * admin_check.php — Vérifie que l'administrateur (unique utilisateur du site,
 * cf. model/model_admin.php) est connecté avant d'exécuter une action admin.
 *
 * À inclure en tête de chaque contrôleur admin via :
 *   require_once __DIR__ . '/admin_check.php';
 */

require_once __DIR__ . '/../model/model_admin.php';

if (session_status() === PHP_SESSION_NONE) session_start();

// Le "dev mode" (réglable depuis l'écran Settings de l'admin tool) ne fait plus que
// conditionner l'affichage du bouton d'accès direct côté front (cf. vue/breakpoints.js) :
// il continue cependant à servir de bypass d'authentification pratique en local, comme
// c'était le cas auparavant avec l'ancienne constante ADMIN_DEV_MODE.
if (!isDevMode() && empty($_SESSION['admin'])) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'code'    => 'FORBIDDEN',
        'message' => 'Accès réservé à l\'administrateur.',
    ]);
    exit;
}

/** Il n'existe plus qu'un seul rôle admin : conservé pour compatibilité des contrôleurs existants. */
function requireAdmin(): void
{
    // Un seul utilisateur administrateur possible désormais — rien de plus à vérifier
    // au-delà de la garde déjà appliquée ci-dessus.
}
