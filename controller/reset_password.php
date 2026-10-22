<?php
/**
 * reset_password.php — Applique le nouveau mot de passe si le token est valide.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/db.php';
require_once __DIR__ . '/../model/model_user.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$token    = ProtectInjection($_POST['token'] ?? '');
$password = $_POST['password'] ?? '';

if (!$token) {
    echo json_encode(['success' => false, 'code' => 'MISSING_TOKEN', 'message' => 'Lien invalide.']);
    exit;
}

// Même règle que les formulaires connexion/inscription : 8+ car., 1 majuscule, 1 chiffre.
if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,}$/', $password)) {
    echo json_encode([
        'success' => false,
        'code'    => 'WEAK_PASSWORD',
        'message' => '8 caractères minimum, 1 majuscule, 1 chiffre !',
    ]);
    exit;
}

$user = getUserByResetToken($token);
if (!$user) {
    echo json_encode([
        'success' => false,
        'code'    => 'INVALID_TOKEN',
        'message' => 'Ce lien de réinitialisation est invalide ou expiré.',
    ]);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);
updateUserPassword((int)$user['id'], $hashed);
clearResetToken((int)$user['id']);

echo json_encode(['success' => true, 'code' => 'PASSWORD_RESET', 'message' => 'Mot de passe mis à jour.']);
