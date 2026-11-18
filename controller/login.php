<?php
/**
 * login.php — Connexion admin (utilisateur unique du site, cf. model/model_admin.php).
 * Accessible uniquement via l'écran de connexion caché (code clavier sur la home,
 * desktop uniquement — cf. vue/secret-login.js).
 */
session_start();

require_once('../model/model.php'); // ProtectInjection()
require_once('../model/model_admin.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mail = ProtectInjection($_POST['mail'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!verifyAdminCredentials($mail, $password)) {
        echo json_encode([
            'success' => false,
            'code' => 'INVALID_CREDENTIALS',
            'message' => 'Adresse email ou mot de passe incorrect.'
        ]);
        exit;
    }

    $_SESSION['admin'] = true;

    echo json_encode([
        'success' => true,
        'code'    => 'LOGIN_ADMIN',
        'message' => 'Connexion réussie.',
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}
