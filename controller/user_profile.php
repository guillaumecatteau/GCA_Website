<?php
/**
 * user_profile.php — Informations du compte de l'utilisateur connecté.
 */
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) session_start();

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'code' => 'NOT_LOGGED_IN']);
    exit;
}

require_once __DIR__ . '/../model/db.php';
require_once __DIR__ . '/../model/model_user.php';

$user = getUserById((int)$_SESSION['user']['id']);
echo json_encode($user
    ? ['success' => true, 'user' => $user]
    : ['success' => false, 'code' => 'NOT_FOUND']
);
