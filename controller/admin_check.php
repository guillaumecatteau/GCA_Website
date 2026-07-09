<?php
/**
 * admin_check.php — Vérifie que l'utilisateur connecté a le droit d'accéder
 * à l'admin tool (rôle vip ou admin).
 *
 * À inclure en tête de chaque contrôleur admin via :
 *   require_once __DIR__ . '/admin_check.php';
 */

if (session_status() === PHP_SESSION_NONE) session_start();

if (
    empty($_SESSION['user']) ||
    !in_array($_SESSION['user']['role'] ?? '', ['vip', 'admin'], true)
) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'code'    => 'FORBIDDEN',
        'message' => 'Accès réservé aux administrateurs.',
    ]);
    exit;
}

/** Vérifie qu'uniquement un admin (pas vip) peut effectuer cette action. */
function requireAdmin(): void
{
    if (($_SESSION['user']['role'] ?? '') !== 'admin') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'code' => 'ADMIN_ONLY']);
        exit;
    }
}

/** Retourne l'id de l'utilisateur connecté. */
function currentUserId(): int
{
    return (int)($_SESSION['user']['id'] ?? 0);
}
