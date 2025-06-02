<?php
session_start();

// Détruit toutes les variables de session
$_SESSION = [];

// Supprime le cookie de session si utilisé
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Détruit la session
session_destroy();

// Répond au front
echo json_encode([
    'success' => true,
    'message' => 'Déconnexion réussie.'
]);