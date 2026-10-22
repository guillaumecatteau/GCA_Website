<?php
/**
 * forgot_password.php — Demande de réinitialisation de mot de passe par email.
 * Répond toujours un succès générique (même si l'email n'existe pas) pour ne
 * jamais révéler si une adresse est enregistrée.
 */
header('Content-Type: application/json');
require_once __DIR__ . '/../model/db.php';
require_once __DIR__ . '/../model/model_user.php';
require_once __DIR__ . '/../model/model_mail.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$mail = ProtectInjection($_POST['mail'] ?? '');

$generic = [
    'success' => true,
    'code'    => 'RESET_EMAIL_SENT',
    'message' => 'Si cette adresse est enregistrée, un email de réinitialisation vient de lui être envoyé.',
];

if (!filter_var($mail, FILTER_VALIDATE_EMAIL)) {
    echo json_encode($generic);
    exit;
}

$user = getUserByMail($mail);
if ($user) {
    $token  = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', time() + 3600); // 1h
    setResetToken($mail, $token, $expiry);

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host   = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $link   = "$scheme://$host/?token=$token";

    sendResetPasswordEmail($user['mail'], $user['firstname'], $link);
}

echo json_encode($generic);
