<?php
session_start();
header('Content-Type: application/json');  // << important !

require_once('../model/db.php');
require_once('../model/model_user.php');

// Vérification si l'utilisateur est admin
if (!isset($_SESSION['user']) || !$_SESSION['user']['isAdmin']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé.']);
    exit;
}

try {
    $users = getAllUsers(); // pas d'argument car dans model_user.php tu utilises $bdd globalement

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des utilisateurs.'
    ]);
}