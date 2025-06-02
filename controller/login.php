<?php
session_start();

require_once('../model/db.php');
require_once('../model/model_user.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mail = ProtectInjection($_POST['mail'] ?? '');
    $password = ProtectInjection($_POST['password'] ?? '');

    try {
        $user = getUserByMail($mail);

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => false,
                'code' => 'INVALID_CREDENTIALS',
                'message' => 'Adresse email ou mot de passe incorrect.'
            ]);
            exit;
        }

        // Création de la session utilisateur
        $_SESSION['user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'firstname' => $user['firstname'],
            'mail' => $user['mail'],
            'isAdmin' => $user['isAdmin'],
        ];

        echo json_encode([
            'success' => true,
            'code' => $user['isAdmin'] ? 'LOGIN_ADMIN' : 'LOGIN_SUCCESS',
            'message' => 'Connexion réussie.',
            'firstname' => $user['firstname'],
            'name' => $user['name'],
            'message' => 'Connexion réussie.'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'code' => 'TECH_ERROR',
            'message' => 'Une erreur technique est survenue.'
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
}